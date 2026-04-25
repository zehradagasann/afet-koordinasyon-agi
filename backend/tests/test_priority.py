import pytest
from datetime import datetime, timezone, timedelta
from services.priority import calculate_priority_with_context

def test_priority_base_score_only():
    """Bağlam olmadan sadece temel puan ve zaman faktörünü test eder."""
    # Yeni bir talep (zaman beklemesi 0)
    now = datetime.now(timezone.utc)
    res = calculate_priority_with_context("barinma", now)
    
    assert res["need_type"] == "barinma"
    assert res["context_bonus"] == 0
    assert len(res["applied_bonuses"]) == 0
    # Barınma taban puanı 50. Bekleme yoksa direkt 50 üzerinden Pydantic oranlı dönebilir
    # Max skor 1000, 50 -> 50 / 1000 * 100 = 5.0
    assert 4.0 <= res["final_score"] <= 6.0


def test_priority_with_cold_weather_and_no_vehicles():
    """Çadır talebi, soğuk hava ve araç yok senaryosu."""
    # 2 saat beklemiş bir talep
    created_at = datetime.now(timezone.utc) - timedelta(hours=2)
    res = calculate_priority_with_context(
        need_type="barinma",
        created_at=created_at,
        temperature_celsius=-5,
        vehicles_within_radius=0
    )
    
    # 30 (soğuk) * 1.5 (barınma soğuk hava çarpanı) = 45 bonus
    # 20 (araç yok)
    # Toplam context bonus: 65
    assert res["context_bonus"] == 65.0
    assert len(res["applied_bonuses"]) == 2
    
    bonus_names = [b["name"] for b in res["applied_bonuses"]]
    assert "soguk_hava" in bonus_names
    assert "arac_yok" in bonus_names
    
    # Zaman ekstrası ile base score ~5 civarı, + 65 bonus = ~70 civarı olmalı
    assert res["final_score"] > 65.0


def test_priority_night_and_rain():
    """Gece ve yağışlı hava operasyonu (medikal)."""
    now = datetime.now(timezone.utc)
    res = calculate_priority_with_context(
        need_type="medikal",
        created_at=now,
        is_raining=True,
        is_night=True
    )
    
    # Medikal için yağış çarpanı yok (1.0). Yağış bonusu = 10
    # Gece operasyonu = 5
    # Toplam: 15
    assert res["context_bonus"] == 15.0
    assert len(res["applied_bonuses"]) == 2
    
    bonus_names = [b["name"] for b in res["applied_bonuses"]]
    assert "yagisli_hava" in bonus_names
    assert "gece_vakti" in bonus_names

def test_priority_score_max_cap():
    """Puanın 100'ü geçmeyeceğini doğrular."""
    created_at = datetime.now(timezone.utc) - timedelta(hours=200) # Çok uzun beklemiş
    res = calculate_priority_with_context(
        need_type="arama_kurtarma", # Yüksek taban
        created_at=created_at,
        temperature_celsius=-10,
        vehicles_within_radius=0
    )
    
    assert res["final_score"] <= 100.0
