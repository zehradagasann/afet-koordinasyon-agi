"""
Güven Skoru ve Rate Limiter Entegrasyon Testi

Bu test, trust_scorer.py ve rate_limiter.py modüllerinin
birlikte çalışmasını ve tutarlılığını doğrular.
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from trust_scorer import (
    IP_WINDOW_SECONDS as TRUST_WINDOW,
    IP_SPAM_THRESHOLD as TRUST_THRESHOLD
)
from rate_limiter import (
    MAX_REQUESTS as RATE_MAX,
    WINDOW_SECONDS as RATE_WINDOW
)


def test_rate_limit_trust_scorer_sync():
    """
    Rate Limiter ve Trust Scorer parametrelerinin senkronize olduğunu test eder.
    """
    print("\n" + "="*70)
    print("ENTEGRASYON TESTİ: Rate Limiter ↔ Trust Scorer Senkronizasyonu")
    print("="*70)
    
    print("\n📊 Parametre Karşılaştırması:")
    print(f"  Rate Limiter:")
    print(f"    - Zaman Penceresi: {RATE_WINDOW} saniye ({RATE_WINDOW/60:.1f} dakika)")
    print(f"    - Maksimum İstek: {RATE_MAX} istek")
    print(f"    - Dakikada Limit: {RATE_MAX / (RATE_WINDOW/60):.1f} istek/dk")
    
    print(f"\n  Trust Scorer:")
    print(f"    - Zaman Penceresi: {TRUST_WINDOW} saniye ({TRUST_WINDOW/60:.1f} dakika)")
    print(f"    - Spam Eşiği: {TRUST_THRESHOLD} istek")
    print(f"    - Dakikada Limit: {TRUST_THRESHOLD / (TRUST_WINDOW/60):.1f} istek/dk")
    
    # Test 1: Zaman pencereleri aynı mı?
    print("\n✓ Test 1: Zaman Penceresi Kontrolü")
    if RATE_WINDOW == TRUST_WINDOW:
        print(f"  ✅ Zaman pencereleri eşit: {RATE_WINDOW} saniye")
    else:
        print(f"  ⚠️  Zaman pencereleri farklı!")
        print(f"     Rate Limiter: {RATE_WINDOW}s, Trust Scorer: {TRUST_WINDOW}s")
    
    # Test 2: İstek limitleri aynı mı?
    print("\n✓ Test 2: İstek Limiti Kontrolü")
    if RATE_MAX == TRUST_THRESHOLD:
        print(f"  ✅ İstek limitleri eşit: {RATE_MAX} istek")
    else:
        print(f"  ⚠️  İstek limitleri farklı!")
        print(f"     Rate Limiter: {RATE_MAX}, Trust Scorer: {TRUST_THRESHOLD}")
    
    # Test 3: Dakikada limit kontrolü
    print("\n✓ Test 3: Dakikada Limit Kontrolü")
    rate_per_min = RATE_MAX / (RATE_WINDOW / 60)
    trust_per_min = TRUST_THRESHOLD / (TRUST_WINDOW / 60)
    
    if abs(rate_per_min - trust_per_min) < 0.01:
        print(f"  ✅ Dakikada limitler eşit: {rate_per_min:.1f} istek/dk")
    else:
        print(f"  ⚠️  Dakikada limitler farklı!")
        print(f"     Rate Limiter: {rate_per_min:.1f} istek/dk")
        print(f"     Trust Scorer: {trust_per_min:.1f} istek/dk")
    
    # Sonuç
    print("\n" + "="*70)
    if (RATE_WINDOW == TRUST_WINDOW and 
        RATE_MAX == TRUST_THRESHOLD):
        print("✅ ENTEGRASYON TESTİ BAŞARILI!")
        print("   Rate Limiter ve Trust Scorer tamamen senkronize.")
        return True
    else:
        print("⚠️  ENTEGRASYON TESTİ UYARISI!")
        print("   Parametreler farklı ama sistem çalışabilir.")
        return False


def test_behavior_consistency():
    """
    İki modülün davranış tutarlılığını test eder.
    """
    print("\n" + "="*70)
    print("ENTEGRASYON TESTİ: Davranış Tutarlılığı")
    print("="*70)
    
    print("\n📋 Senaryo Analizi:")
    
    # Senaryo 1: Normal kullanıcı
    print("\n1️⃣  Normal Kullanıcı (3 istek/dakika)")
    print(f"   Rate Limiter: {'✅ Geçer' if 3 <= RATE_MAX else '❌ Engellenir'}")
    print(f"   Trust Scorer: {'✅ İyi skor' if 3 <= TRUST_THRESHOLD else '⚠️  Düşük skor'}")
    
    # Senaryo 2: Hızlı kullanıcı
    print("\n2️⃣  Hızlı Kullanıcı (4 istek/dakika)")
    print(f"   Rate Limiter: {'✅ Geçer' if 4 <= RATE_MAX else '❌ Engellenir (HTTP 429)'}")
    print(f"   Trust Scorer: {'✅ İyi skor' if 4 <= TRUST_THRESHOLD else '⚠️  Düşük skor'}")
    
    # Senaryo 3: Spam şüphesi
    print("\n3️⃣  Spam Şüphesi (5+ istek/dakika)")
    print(f"   Rate Limiter: {'✅ Geçer' if 5 <= RATE_MAX else '❌ Engellenir (HTTP 429)'}")
    print(f"   Trust Scorer: {'✅ İyi skor' if 5 <= TRUST_THRESHOLD else '⚠️  Düşük skor (spam tespiti)'}")
    
    print("\n" + "="*70)
    print("✅ DAVRANIŞSAL TUTARLILIK ANALİZİ TAMAMLANDI")
    print("="*70)
    
    return True


def test_recommended_configuration():
    """
    Önerilen konfigürasyonu test eder.
    """
    print("\n" + "="*70)
    print("ENTEGRASYON TESTİ: Önerilen Konfigürasyon")
    print("="*70)
    
    RECOMMENDED_WINDOW = 60  # 1 dakika
    RECOMMENDED_LIMIT = 3    # 3 istek
    
    print(f"\n📌 Önerilen Standart:")
    print(f"   - Zaman Penceresi: {RECOMMENDED_WINDOW} saniye (1 dakika)")
    print(f"   - İstek Limiti: {RECOMMENDED_LIMIT} istek")
    print(f"   - Dakikada: {RECOMMENDED_LIMIT} istek/dk")
    
    print(f"\n🔍 Mevcut Konfigürasyon:")
    rate_match = (RATE_WINDOW == RECOMMENDED_WINDOW and RATE_MAX == RECOMMENDED_LIMIT)
    trust_match = (TRUST_WINDOW == RECOMMENDED_WINDOW and TRUST_THRESHOLD == RECOMMENDED_LIMIT)
    
    print(f"   Rate Limiter: {'✅ Önerilen standarda uygun' if rate_match else '⚠️  Farklı'}")
    print(f"   Trust Scorer: {'✅ Önerilen standarda uygun' if trust_match else '⚠️  Farklı'}")
    
    if rate_match and trust_match:
        print("\n✅ SİSTEM ÖNERİLEN STANDARDA UYGUN!")
        print("   Her iki modül de 1 dakikada 3 istek standardını kullanıyor.")
        return True
    else:
        print("\n⚠️  SİSTEM ÖNERİLEN STANDARTTAN FARKLI")
        if not rate_match:
            print(f"   Rate Limiter: {RATE_WINDOW}s / {RATE_MAX} istek")
        if not trust_match:
            print(f"   Trust Scorer: {TRUST_WINDOW}s / {TRUST_THRESHOLD} istek")
        return False


def run_all_integration_tests():
    """Tüm entegrasyon testlerini çalıştırır."""
    print("\n" + "╔" + "="*68 + "╗")
    print("║" + " "*10 + "GÜVEN SKORU ENTEGRASYON TEST SÜİTİ" + " "*24 + "║")
    print("╚" + "="*68 + "╝")
    
    results = []
    
    # Test 1: Parametre senkronizasyonu
    results.append(("Parametre Senkronizasyonu", test_rate_limit_trust_scorer_sync()))
    
    # Test 2: Davranış tutarlılığı
    results.append(("Davranış Tutarlılığı", test_behavior_consistency()))
    
    # Test 3: Önerilen konfigürasyon
    results.append(("Önerilen Konfigürasyon", test_recommended_configuration()))
    
    # Özet
    print("\n" + "╔" + "="*68 + "╗")
    print("║" + " "*25 + "TEST SONUÇLARI" + " "*29 + "║")
    print("╠" + "="*68 + "╣")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ BAŞARILI" if result else "⚠️  UYARI"
        print(f"║  {test_name:<40} {status:<20} ║")
    
    print("╠" + "="*68 + "╣")
    print(f"║  Toplam: {total}  |  Başarılı: {passed}  |  Uyarı: {total - passed}" + " "*30 + "║")
    print("╠" + "="*68 + "╣")
    
    if passed == total:
        print("║" + " "*15 + "🎉 TÜM TESTLER BAŞARILI! 🎉" + " "*25 + "║")
    else:
        print("║" + " "*10 + "⚠️  BAZI TESTLER UYARI VERDİ ⚠️" + " "*25 + "║")
    
    print("╚" + "="*68 + "╝\n")
    
    return passed == total


if __name__ == "__main__":
    success = run_all_integration_tests()
    sys.exit(0 if success else 1)
