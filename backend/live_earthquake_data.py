"""
Kandilli ve USGS Deprem Veri Servisi

Makale Bölümü III: Hata Tolerans Mekanizmaları — Circuit Breaker Pattern

Circuit Breaker üç durumda çalışır:
  CLOSED   → Normal. İstekler API'ye gider.
  OPEN     → Hata eşiği aşıldı. İstekler engellenir, cache döner.
  HALF_OPEN → Bekleme süresi doldu. Test isteği atılır.
             Başarılı → CLOSED, Başarısız → OPEN (süre sıfırlanır).

Ek olarak TTL Cache: Başarılı veri 60 saniye bellekte tutulur.
500 eş zamanlı kullanıcıda bile Kandilli'ye tek istek gider.
"""

import requests
import logging
import time
from datetime import datetime, timedelta
from enum import Enum

logger = logging.getLogger(__name__)

# ── TTL Cache ──────────────────────────────────────────────────────────────
CACHE_TTL_SECONDS = 60

_last_known_cache: list = []
_cache_timestamp: float = 0.0


# ── Circuit Breaker ────────────────────────────────────────────────────────

class CircuitState(Enum):
    CLOSED    = "CLOSED"     # Normal çalışma
    OPEN      = "OPEN"       # Devre açık — istekler engellendi
    HALF_OPEN = "HALF_OPEN"  # Test modu


class CircuitBreaker:
    """
    Kandilli API için Circuit Breaker implementasyonu.

    Parametreler:
        failure_threshold  : CLOSED → OPEN geçişi için gereken ardışık hata sayısı
        recovery_timeout   : OPEN durumunda bekleme süresi (saniye)
        success_threshold  : HALF_OPEN → CLOSED geçişi için gereken başarı sayısı
    """

    def __init__(
        self,
        failure_threshold: int = 3,
        recovery_timeout: int = 60,
        success_threshold: int = 1,
    ):
        self.failure_threshold  = failure_threshold
        self.recovery_timeout   = recovery_timeout
        self.success_threshold  = success_threshold

        self.state              = CircuitState.CLOSED
        self.failure_count      = 0
        self.success_count      = 0
        self.last_failure_time  = 0.0

    def call_allowed(self) -> bool:
        """Bu anda API çağrısına izin var mı?"""
        if self.state == CircuitState.CLOSED:
            return True

        if self.state == CircuitState.OPEN:
            elapsed = time.time() - self.last_failure_time
            if elapsed >= self.recovery_timeout:
                self._transition(CircuitState.HALF_OPEN)
                logger.info("Circuit Breaker: OPEN → HALF_OPEN (test isteği atılacak)")
                return True
            return False

        # HALF_OPEN: tek test isteğine izin ver
        return True

    def record_success(self) -> None:
        """Başarılı API çağrısını kaydet."""
        if self.state == CircuitState.HALF_OPEN:
            self.success_count += 1
            if self.success_count >= self.success_threshold:
                self._transition(CircuitState.CLOSED)
                logger.info("Circuit Breaker: HALF_OPEN → CLOSED (API normale döndü)")
        elif self.state == CircuitState.CLOSED:
            self.failure_count = 0  # Başarı → hata sayacını sıfırla

    def record_failure(self) -> None:
        """Başarısız API çağrısını kaydet."""
        self.failure_count    += 1
        self.last_failure_time = time.time()
        self.success_count     = 0

        if self.state == CircuitState.CLOSED:
            if self.failure_count >= self.failure_threshold:
                self._transition(CircuitState.OPEN)
                logger.warning(
                    f"Circuit Breaker: CLOSED → OPEN "
                    f"({self.failure_count} ardışık hata, "
                    f"{self.recovery_timeout}s bekleniyor)"
                )
        elif self.state == CircuitState.HALF_OPEN:
            self._transition(CircuitState.OPEN)
            logger.warning("Circuit Breaker: HALF_OPEN → OPEN (test isteği başarısız)")

    def _transition(self, new_state: CircuitState) -> None:
        self.state         = new_state
        self.failure_count = 0
        self.success_count = 0


# Kandilli API için global Circuit Breaker instance
_kandilli_cb = CircuitBreaker(
    failure_threshold=3,   # 3 ardışık hata → devre açılır
    recovery_timeout=60,   # 60 saniye sonra test isteği
    success_threshold=1,   # 1 başarı → devre kapanır
)


def get_circuit_breaker_status() -> dict:
    """Circuit Breaker'ın mevcut durumunu döner (monitoring için)."""
    return {
        "state": _kandilli_cb.state.value,
        "failure_count": _kandilli_cb.failure_count,
        "last_failure_ago_seconds": (
            int(time.time() - _kandilli_cb.last_failure_time)
            if _kandilli_cb.last_failure_time > 0 else None
        ),
    }


# ── Ana Fonksiyon ─────────────────────────────────────────────────────────

def get_last_24h_earthquakes() -> list:
    """
    Kandilli API'den son 24 saatin deprem verilerini çeker.

    Katmanlı koruma:
    1. TTL Cache  — 60 saniye geçerliyse API'ye gitme, bellekten dön.
    2. Circuit Breaker — Devre açıksa API'ye gitme, cache'den dön.
    3. Fallback   — Hata olursa son bilinen cache'i dön.
    """
    global _last_known_cache, _cache_timestamp

    now = time.time()

    # Katman 1: TTL Cache kontrolü
    if _last_known_cache and (now - _cache_timestamp) < CACHE_TTL_SECONDS:
        logger.debug(
            f"Cache hit — Kandilli API atlandı "
            f"({int(now - _cache_timestamp)}s önce güncellendi)"
        )
        return _last_known_cache

    # Katman 2: Circuit Breaker kontrolü
    if not _kandilli_cb.call_allowed():
        logger.warning(
            f"Circuit Breaker OPEN — Kandilli API engellendi "
            f"(durum: {_kandilli_cb.state.value})"
        )
        return _last_known_cache

    # Kandilli'ye istek at
    url = "https://api.orhanaydogdu.com.tr/deprem/kandilli/live"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        _kandilli_cb.record_success()

    except requests.exceptions.Timeout:
        _kandilli_cb.record_failure()
        logger.warning(
            f"Kandilli API zaman aşımı — "
            f"CB durumu: {_kandilli_cb.state.value}, "
            f"son bilinen veri kullanılıyor."
        )
        return _last_known_cache

    except requests.exceptions.ConnectionError:
        _kandilli_cb.record_failure()
        logger.warning(
            f"Kandilli API bağlantı hatası — "
            f"CB durumu: {_kandilli_cb.state.value}, "
            f"son bilinen veri kullanılıyor."
        )
        return _last_known_cache

    except requests.exceptions.HTTPError as e:
        _kandilli_cb.record_failure()
        logger.warning(
            f"Kandilli API HTTP hatası ({e}) — "
            f"CB durumu: {_kandilli_cb.state.value}, "
            f"son bilinen veri kullanılıyor."
        )
        return _last_known_cache

    except Exception as e:
        _kandilli_cb.record_failure()
        logger.warning(
            f"Kandilli API beklenmeyen hata ({e}) — "
            f"CB durumu: {_kandilli_cb.state.value}, "
            f"son bilinen veri kullanılıyor."
        )
        return _last_known_cache

    # Veriyi işle
    earthquakes = []
    for eq in data.get("result", []):
        time_str = eq.get("date_time") or eq.get("date")
        if not time_str:
            continue
        try:
            eq_time = datetime.strptime(time_str, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            continue
        if eq_time <= datetime.now() - timedelta(hours=24):
            continue
        coords = eq.get("geojson", {}).get("coordinates", [])
        if len(coords) < 2:
            continue
        try:
            mag = float(eq.get("mag") or eq.get("magnitude") or 0)
        except (TypeError, ValueError):
            mag = 0.0

        earthquakes.append({
            "lat": float(coords[1]),
            "lon": float(coords[0]),
            "mag": mag,
            "title": eq.get("title", ""),
            "date_time": time_str,
            "is_major": mag >= 5.0,
        })

    earthquakes.sort(key=lambda x: (not x["is_major"], x["date_time"]), reverse=False)

    if earthquakes:
        _last_known_cache = earthquakes
        _cache_timestamp  = now
        logger.info(
            f"Kandilli cache güncellendi: {len(earthquakes)} deprem, "
            f"{sum(1 for e in earthquakes if e['is_major'])} tanesi büyük (5.0+)."
        )

    return earthquakes


def get_major_earthquakes_last_3_months() -> list:
    """
    USGS API'den son 3 ayda Türkiye'de gerçekleşen 5.0+ büyüklüğündeki depremleri çeker.
    En yeniden eskiye sıralı döner.
    API çökerse boş liste döner, uygulama çökmez.
    """
    from datetime import timezone
    from_date = (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")
    to_date   = datetime.now().strftime("%Y-%m-%d")

    url = (
        "https://earthquake.usgs.gov/fdsnws/event/1/query"
        f"?format=geojson"
        f"&starttime={from_date}&endtime={to_date}"
        f"&minmagnitude=5.0"
        f"&minlatitude=36&maxlatitude=42"
        f"&minlongitude=26&maxlongitude=45"
        f"&orderby=time"
    )

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
    except requests.exceptions.Timeout:
        logger.warning("USGS API zaman aşımı.")
        return []
    except requests.exceptions.ConnectionError:
        logger.warning("USGS API bağlantı hatası.")
        return []
    except Exception as e:
        logger.warning(f"USGS API beklenmeyen hata: {e}")
        return []

    results = []
    for feature in data.get("features", []):
        props  = feature.get("properties", {})
        coords = feature.get("geometry", {}).get("coordinates", [])
        if len(coords) < 2:
            continue
        ts_ms  = props.get("time")
        eq_time = (
            datetime.fromtimestamp(ts_ms / 1000, tz=timezone.utc)
            .strftime("%Y-%m-%d %H:%M:%S")
            if ts_ms else ""
        )
        results.append({
            "lat":      float(coords[1]),
            "lon":      float(coords[0]),
            "mag":      float(props.get("mag") or 0),
            "title":    props.get("place", ""),
            "date_time": eq_time,
            "is_major": True,
            "source":   "usgs",
        })

    logger.info(f"Son 3 ayda 5.0+ deprem: {len(results)} adet (USGS)")
    return results
