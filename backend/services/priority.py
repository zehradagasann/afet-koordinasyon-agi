"""
Dinamik Önceliklendirme Servisi
Zaman sönümleme (Time Decay / DPS) formülü ile öncelik hesaplama
"""
import math
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# 1) Statik Taban Puanları (S_base) — 0-100 arası (Aciliyet başlangıç değeri)
# ---------------------------------------------------------------------------
BASE_SCORES = {
    "arama_kurtarma": 100,
    "medikal":         95,
    "yangin":          90,
    "enkaz":           80,
    "su":              60,
    "barinma":         50,
    "gida":            40,
    "is_makinesi":     35,
    "ulasim":          25,
}

# ---------------------------------------------------------------------------
# 2) Ağırlık Katsayıları (C_i) — Sistemin genelindeki etki katsayısı
# ---------------------------------------------------------------------------
WEIGHT_COEFFICIENTS = {
    "arama_kurtarma": 0.25,
    "medikal":        0.20,
    "yangin":         0.15,
    "enkaz":          0.12,
    "su":             0.09,
    "barinma":        0.07,
    "gida":           0.06,
    "is_makinesi":    0.04,
    "ulasim":         0.02,
}

# ---------------------------------------------------------------------------
# 3) Maksimum Tolerans Süreleri (M) — saat cinsinden
# ---------------------------------------------------------------------------
MAX_TOLERANCE_HOURS = {
    "arama_kurtarma": 6,
    "medikal":        2,
    "yangin":         1,
    "enkaz":          12,
    "su":             72,    # Dehidrasyon (~3 gün)
    "barinma":        48,
    "gida":           168,   # Açlık (~7 gün)
    "is_makinesi":    24,
    "ulasim":         24,
}

TIME_SENSITIVITY_LAMBDA = 1.5
DEFAULT_BASE_SCORE = 50
DEFAULT_WEIGHT = 0.05
DEFAULT_MAX_TOLERANCE = 24


# ---------------------------------------------------------------------------
# 4) Bağlamsal Bonuslar (Sprint 5.6 — Kalibrasyon)
# Final 0-100 skoruna mutlak puan olarak eklenir, tavan 100'de kapanır.
# ---------------------------------------------------------------------------
CONTEXT_BONUSES = {
    "soguk_hava": 30,        # Sıcaklık 0°C altında ise (donma riski)
    "asiri_sicak": 15,       # Sıcaklık 35°C üzerinde ise
    "arac_yok": 20,          # Belirlenen yarıçapta uygun araç yoksa
    "yagisli_hava": 10,      # Yağış varsa (barınma/ulaşım için)
    "gece_vakti": 5,         # Gece operasyonu zorluğu
}

# Yakınlık eşiği (km) — bu mesafe içinde araç yoksa "arac_yok" bonusu uygulanır
VEHICLE_PROXIMITY_THRESHOLD_KM = 10.0

# İhtiyaç tipi başına ek bağlamsal etki çarpanı
# Örn: barınma talebi soğuk havada katlanmalı önemli olur (1.5x)
NEED_CONTEXT_MULTIPLIERS = {
    "barinma": {"soguk_hava": 1.5, "yagisli_hava": 1.5},
    "medikal": {"soguk_hava": 1.2, "asiri_sicak": 1.2},
    "su":      {"asiri_sicak": 1.5},
    "gida":    {"soguk_hava": 1.1},
}


def calculate_dynamic_priority(need_type: str, created_at: datetime) -> float:
    """
    Zaman sönümleme (Time Decay / DPS) formülü ile dinamik öncelik puanını hesaplar.
    
    Formül: P_dynamic(t) = S_base + (S_base * λ * (t / M)) * (1 + C_i)
    
    Kuyruk açlığını (queue starvation) önlemek için bekleyen ihbarların puanını zamanla artırır.
    
    Args:
        need_type: İhtiyaç tipi (arama_kurtarma, medikal, vb.)
        created_at: İhbar oluşturulma zamanı
    
    Returns:
        Dinamik öncelik puanı (0-100 arası)
    """
    need = need_type.lower()
    base_score = BASE_SCORES.get(need, DEFAULT_BASE_SCORE)
    weight = WEIGHT_COEFFICIENTS.get(need, DEFAULT_WEIGHT)
    max_tolerance = MAX_TOLERANCE_HOURS.get(need, DEFAULT_MAX_TOLERANCE)

    now = datetime.now(timezone.utc)
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)

    wait_seconds = (now - created_at).total_seconds()
    wait_hours = max(wait_seconds / 3600, 0)

    time_ratio = wait_hours / max_tolerance
    time_bonus = (base_score * TIME_SENSITIVITY_LAMBDA * time_ratio) * (1 + weight)

    # Arka plan tavan puan sınırı (1000)
    MAX_POSSIBLE_SCORE = 1000.0
    raw_score = min(base_score + time_bonus, MAX_POSSIBLE_SCORE)

    # Kullanıcıya (Frontend) 100 üzerinden %'lik skor dön (0-100 skalası)
    scaled_score = (raw_score / MAX_POSSIBLE_SCORE) * 100.0

    return round(scaled_score, 1)


def calculate_priority_with_context(
    need_type: str,
    created_at: datetime,
    temperature_celsius: float | None = None,
    vehicles_within_radius: int | None = None,
    is_raining: bool = False,
    is_night: bool = False,
) -> dict:
    """
    Bağlamsal bonuslar uygulanmış dinamik öncelik hesaplar.

    Sprint 5.6: Çadır talebi + sıcaklık 0°C altı + bölgede araç yok → +50 puan
    gibi kompleks senaryoları test etmek için.

    Args:
        need_type: İhtiyaç tipi
        created_at: İhbar oluşturulma zamanı
        temperature_celsius: Bölge sıcaklığı (°C). None ise bonus uygulanmaz.
        vehicles_within_radius: Yakındaki araç sayısı. 0 ise "arac_yok" bonusu.
        is_raining: Yağış var mı?
        is_night: Gece operasyonu mu?

    Returns:
        {
          "base_score": float,
          "context_bonus": float,
          "applied_bonuses": [str, ...],
          "final_score": float (0-100, tavan 100)
        }
    """
    base_score = calculate_dynamic_priority(need_type, created_at)
    need_key = need_type.lower()
    multipliers = NEED_CONTEXT_MULTIPLIERS.get(need_key, {})

    applied: list[dict] = []
    bonus_total = 0.0

    if temperature_celsius is not None:
        if temperature_celsius < 0:
            mult = multipliers.get("soguk_hava", 1.0)
            value = CONTEXT_BONUSES["soguk_hava"] * mult
            bonus_total += value
            applied.append({
                "name": "soguk_hava",
                "value": round(value, 1),
                "detail": f"Sıcaklık {temperature_celsius}°C (donma riski)"
            })
        elif temperature_celsius > 35:
            mult = multipliers.get("asiri_sicak", 1.0)
            value = CONTEXT_BONUSES["asiri_sicak"] * mult
            bonus_total += value
            applied.append({
                "name": "asiri_sicak",
                "value": round(value, 1),
                "detail": f"Sıcaklık {temperature_celsius}°C (aşırı sıcak)"
            })

    if vehicles_within_radius is not None and vehicles_within_radius == 0:
        value = CONTEXT_BONUSES["arac_yok"]
        bonus_total += value
        applied.append({
            "name": "arac_yok",
            "value": value,
            "detail": f"{VEHICLE_PROXIMITY_THRESHOLD_KM} km içinde uygun araç bulunamadı"
        })

    if is_raining:
        mult = multipliers.get("yagisli_hava", 1.0)
        value = CONTEXT_BONUSES["yagisli_hava"] * mult
        bonus_total += value
        applied.append({
            "name": "yagisli_hava",
            "value": round(value, 1),
            "detail": "Yağışlı hava koşulları"
        })

    if is_night:
        value = CONTEXT_BONUSES["gece_vakti"]
        bonus_total += value
        applied.append({
            "name": "gece_vakti",
            "value": value,
            "detail": "Gece operasyonu (görüş zorluğu)"
        })

    final_score = min(base_score + bonus_total, 100.0)

    return {
        "need_type": need_key,
        "base_score": round(base_score, 1),
        "context_bonus": round(bonus_total, 1),
        "applied_bonuses": applied,
        "final_score": round(final_score, 1),
    }
