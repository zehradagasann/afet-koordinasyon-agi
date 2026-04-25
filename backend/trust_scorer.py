"""
Güven Skoru Motoru — Trust Scoring Engine

Makale Bölümü III: Güven Skoru Algoritmasının Matematiksel Modeli

Bir ihbarın güvenilirliğini üç parametreye göre ağırlıklı olarak hesaplar:

  T(r) = w1 * S_sismik + w2 * S_ip + w3 * S_konum

  - S_sismik : Kandilli/USGS deprem verisiyle coğrafi örtüşme skoru  (0.0 – 1.0)
  - S_ip     : IP davranış analizi skoru                              (0.0 – 1.0)
  - S_konum  : Konum tutarlılığı skoru                                (0.0 – 1.0)

  Ağırlıklar: w1=0.60, w2=0.25, w3=0.15  (toplam = 1.0)

Sonuç 0.0–1.0 arasında bir float. 0.5 ve üzeri → is_verified=True.
"""

import math
import time
import logging
from collections import defaultdict

logger = logging.getLogger(__name__)

# ── Ağırlık Katsayıları ────────────────────────────────────────────────────
W_SISMIK  = 0.60   # Deprem bölgesiyle coğrafi örtüşme (en kritik)
W_IP      = 0.25   # IP davranış analizi
W_KONUM   = 0.15   # Konum tutarlılığı

# ── Eşik Değerleri ────────────────────────────────────────────────────────
VERIFIED_THRESHOLD   = 0.50   # Bu puanın üzeri → doğrulandı
EARTHQUAKE_RADIUS_KM = 50.0   # Deprem merkezine maksimum mesafe

# ── IP Davranış Analizi Parametreleri ─────────────────────────────────────
IP_WINDOW_SECONDS    = 300    # 5 dakikalık pencere
IP_SPAM_THRESHOLD    = 5      # Bu sayının üzerinde istek → spam şüphesi
IP_MAX_COORD_DIST_KM = 200.0  # Aynı IP'den gelen koordinatlar arası max mesafe

# Bellek içi IP geçmişi: { "ip": [(timestamp, lat, lon), ...] }
_ip_history: dict[str, list[tuple]] = defaultdict(list)


# ── Yardımcı: Haversine Mesafesi ──────────────────────────────────────────

def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """İki koordinat arasındaki küresel mesafeyi km cinsinden döner."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dlon / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# ── Parametre 1: Sismik Skor ──────────────────────────────────────────────

def _sismik_skor(lat: float, lon: float, earthquakes: list) -> float:
    """
    İhbar koordinatının deprem bölgesiyle örtüşme skoru.

    Formül:
        d_min = min(haversine(ihbar, deprem_i)) for all i
        S_sismik = max(0, 1 - d_min / R_max)

    d_min = 0  → S_sismik = 1.0 (tam örtüşme)
    d_min = R_max → S_sismik = 0.0 (hiç örtüşme yok)
    """
    if not earthquakes:
        return 0.0

    min_dist = float("inf")
    for eq in earthquakes:
        eq_lat = eq.get("lat") or eq.get("latitude")
        eq_lon = eq.get("lon") or eq.get("longitude")
        if eq_lat and eq_lon:
            d = _haversine(lat, lon, float(eq_lat), float(eq_lon))
            if d < min_dist:
                min_dist = d

    score = max(0.0, 1.0 - min_dist / EARTHQUAKE_RADIUS_KM)
    return round(score, 4)


# ── Parametre 2: IP Davranış Skoru ────────────────────────────────────────

def _ip_skoru(ip: str, lat: float, lon: float) -> float:
    """
    IP adresinin davranış analizi skoru.

    İki alt kontrol:
    a) Frekans analizi: Son 5 dakikada bu IP'den kaç istek geldi?
       Çok fazla istek → spam şüphesi → skor düşer.

    b) Konum tutarlılığı: Bu IP'den daha önce gelen koordinatlar
       şimdiki koordinata ne kadar yakın?
       Fiziksel olarak imkânsız mesafeler → skor düşer.

    Formül:
        S_frekans = max(0, 1 - (n - 1) / IP_SPAM_THRESHOLD)
        S_mesafe  = max(0, 1 - d_max / IP_MAX_COORD_DIST_KM)
        S_ip      = 0.5 * S_frekans + 0.5 * S_mesafe
    """
    now = time.time()
    window_start = now - IP_WINDOW_SECONDS

    # Eski kayıtları temizle
    _ip_history[ip] = [
        (ts, lt, ln) for ts, lt, ln in _ip_history[ip]
        if ts > window_start
    ]

    recent = _ip_history[ip]

    # a) Frekans skoru
    n = len(recent)
    s_frekans = max(0.0, 1.0 - max(0, n - 1) / IP_SPAM_THRESHOLD)

    # b) Konum tutarlılığı skoru
    if recent:
        max_dist = max(
            _haversine(lat, lon, lt, ln)
            for _, lt, ln in recent
        )
        s_mesafe = max(0.0, 1.0 - max_dist / IP_MAX_COORD_DIST_KM)
    else:
        s_mesafe = 1.0  # İlk istek — şüphe yok

    s_ip = 0.5 * s_frekans + 0.5 * s_mesafe

    # Mevcut isteği geçmişe ekle
    _ip_history[ip].append((now, lat, lon))

    logger.debug(
        f"IP skoru: ip={ip} n={n} s_frekans={s_frekans:.2f} "
        f"s_mesafe={s_mesafe:.2f} s_ip={s_ip:.2f}"
    )
    return round(s_ip, 4)


# ── Parametre 3: Konum Tutarlılığı Skoru ─────────────────────────────────

def _konum_tutarliligi_skoru(lat: float, lon: float) -> float:
    """
    Koordinatın Türkiye sınırları içinde olup olmadığını kontrol eder.

    Türkiye bounding box:
        Enlem:  36.0° – 42.5° K
        Boylam: 26.0° – 45.0° D

    Sınır içi → 1.0, dışı → 0.0
    Sınıra yakın (±1°) → kısmi skor (0.5)
    """
    TR_LAT_MIN, TR_LAT_MAX = 36.0, 42.5
    TR_LON_MIN, TR_LON_MAX = 26.0, 45.0
    MARGIN = 1.0  # Sınır toleransı (derece)

    in_lat = TR_LAT_MIN <= lat <= TR_LAT_MAX
    in_lon = TR_LON_MIN <= lon <= TR_LON_MAX

    if in_lat and in_lon:
        return 1.0

    # Sınıra yakın mı?
    near_lat = (TR_LAT_MIN - MARGIN) <= lat <= (TR_LAT_MAX + MARGIN)
    near_lon = (TR_LON_MIN - MARGIN) <= lon <= (TR_LON_MAX + MARGIN)

    if near_lat and near_lon:
        return 0.5

    return 0.0


# ── Ana Fonksiyon ─────────────────────────────────────────────────────────

def calculate_trust_score(
    lat: float,
    lon: float,
    ip: str,
    earthquakes: list,
) -> dict:
    """
    Bir ihbar için bileşik güven skoru hesaplar.

    Formül:
        T(r) = w1 * S_sismik + w2 * S_ip + w3 * S_konum
             = 0.60 * S_sismik + 0.25 * S_ip + 0.15 * S_konum

    Returns:
        {
            "trust_score": float,       # 0.0 – 1.0
            "is_verified": bool,        # trust_score >= 0.50
            "s_sismik": float,
            "s_ip": float,
            "s_konum": float,
        }
    """
    s_sismik = _sismik_skor(lat, lon, earthquakes)
    s_ip     = _ip_skoru(ip, lat, lon)
    s_konum  = _konum_tutarliligi_skoru(lat, lon)

    trust_score = (
        W_SISMIK * s_sismik +
        W_IP     * s_ip     +
        W_KONUM  * s_konum
    )
    trust_score = round(trust_score, 4)
    is_verified = trust_score >= VERIFIED_THRESHOLD

    logger.info(
        f"Güven skoru: T={trust_score:.3f} "
        f"(sismik={s_sismik:.2f} ip={s_ip:.2f} konum={s_konum:.2f}) "
        f"→ is_verified={is_verified}"
    )

    return {
        "trust_score": trust_score,
        "is_verified": is_verified,
        "s_sismik": s_sismik,
        "s_ip": s_ip,
        "s_konum": s_konum,
    }
