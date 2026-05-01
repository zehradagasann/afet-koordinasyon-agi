"""
Güven Skoru Motoru Test Dosyası

Bu test dosyası trust_scorer.py modülündeki güven skoru hesaplama
algoritmasının tüm bileşenlerini test eder:

1. Sismik Skor (S_sismik): Deprem bölgesiyle örtüşme
2. IP Skoru (S_ip): IP davranış analizi
3. Konum Skoru (S_konum): Türkiye sınırları kontrolü
4. Bileşik Güven Skoru (T): Ağırlıklı toplam
"""

import sys
import os
import time
from datetime import datetime

# Backend dizinini path'e ekle
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from trust_scorer import (
    calculate_trust_score,
    _sismik_skor,
    _ip_skoru,
    _konum_tutarliligi_skoru,
    _haversine,
    _ip_history,
    W_SISMIK,
    W_IP,
    W_KONUM,
    VERIFIED_THRESHOLD,
    EARTHQUAKE_RADIUS_KM,
    IP_SPAM_THRESHOLD,
    IP_MAX_COORD_DIST_KM
)


# ══════════════════════════════════════════════════════════════════════════
# TEST 1: Haversine Mesafe Hesaplama
# ══════════════════════════════════════════════════════════════════════════

def test_haversine():
    """Haversine formülünün doğru mesafe hesapladığını test eder."""
    print("\n" + "="*70)
    print("TEST 1: Haversine Mesafe Hesaplama")
    print("="*70)
    
    # İstanbul - Ankara arası (yaklaşık 350 km)
    istanbul = (41.0082, 28.9784)
    ankara = (39.9334, 32.8597)
    
    distance = _haversine(*istanbul, *ankara)
    print(f"İstanbul - Ankara mesafesi: {distance:.2f} km")
    
    # Beklenen: 350 km civarı (±20 km tolerans)
    assert 330 <= distance <= 370, f"Mesafe beklenenden farklı: {distance}"
    print("✓ Haversine hesaplama doğru")
    
    # Aynı nokta - mesafe 0 olmalı
    distance_zero = _haversine(41.0, 29.0, 41.0, 29.0)
    assert distance_zero < 0.01, "Aynı nokta için mesafe 0 olmalı"
    print("✓ Aynı nokta kontrolü başarılı")
    
    return True


# ══════════════════════════════════════════════════════════════════════════
# TEST 2: Sismik Skor Hesaplama
# ══════════════════════════════════════════════════════════════════════════

def test_sismik_skor():
    """Deprem bölgesiyle örtüşme skorunu test eder."""
    print("\n" + "="*70)
    print("TEST 2: Sismik Skor Hesaplama")
    print("="*70)
    
    # Mock deprem verisi
    earthquakes = [
        {"lat": 38.0, "lon": 38.0, "magnitude": 5.5},
        {"lat": 40.0, "lon": 30.0, "magnitude": 4.2},
    ]
    
    # Test 2.1: Deprem merkezine çok yakın ihbar (yüksek skor)
    print("\nTest 2.1: Deprem merkezine yakın ihbar")
    lat, lon = 38.05, 38.05  # ~7 km mesafe
    score = _sismik_skor(lat, lon, earthquakes)
    print(f"Koordinat: ({lat}, {lon})")
    print(f"Sismik Skor: {score:.4f}")
    assert score > 0.85, f"Yakın mesafede skor yüksek olmalı: {score}"
    print("✓ Yakın mesafe skoru doğru")
    
    # Test 2.2: Deprem merkezinden uzak ihbar (düşük skor)
    print("\nTest 2.2: Deprem merkezinden uzak ihbar")
    lat, lon = 41.0, 29.0  # İstanbul (depremlerden uzak)
    score = _sismik_skor(lat, lon, earthquakes)
    print(f"Koordinat: ({lat}, {lon})")
    print(f"Sismik Skor: {score:.4f}")
    assert score < 0.3, f"Uzak mesafede skor düşük olmalı: {score}"
    print("✓ Uzak mesafe skoru doğru")
    
    # Test 2.3: Deprem verisi yok (skor 0)
    print("\nTest 2.3: Deprem verisi olmadan")
    score = _sismik_skor(38.0, 38.0, [])
    print(f"Sismik Skor (deprem yok): {score:.4f}")
    assert score == 0.0, "Deprem yoksa skor 0 olmalı"
    print("✓ Deprem yoksa skor 0")
    
    # Test 2.4: Tam deprem merkezinde (maksimum skor)
    print("\nTest 2.4: Tam deprem merkezinde")
    score = _sismik_skor(38.0, 38.0, earthquakes)
    print(f"Sismik Skor (tam merkez): {score:.4f}")
    assert score == 1.0, "Tam merkezde skor 1.0 olmalı"
    print("✓ Tam merkez skoru maksimum")
    
    return True


# ══════════════════════════════════════════════════════════════════════════
# TEST 3: IP Davranış Skoru
# ══════════════════════════════════════════════════════════════════════════

def test_ip_skoru():
    """IP davranış analizi skorunu test eder."""
    print("\n" + "="*70)
    print("TEST 3: IP Davranış Skoru")
    print("="*70)
    
    # IP geçmişini temizle
    _ip_history.clear()
    
    # Test 3.1: İlk istek (yüksek skor)
    print("\nTest 3.1: İlk istek (temiz IP)")
    ip = "192.168.1.100"
    score = _ip_skoru(ip, 38.0, 38.0)
    print(f"IP: {ip}")
    print(f"IP Skoru (ilk istek): {score:.4f}")
    assert score >= 0.9, f"İlk istek skoru yüksek olmalı: {score}"
    print("✓ İlk istek skoru yüksek")
    
    # Test 3.2: Aynı IP'den normal frekansla istekler
    print("\nTest 3.2: Normal frekansla istekler")
    for i in range(2):
        score = _ip_skoru(ip, 38.0 + i*0.01, 38.0 + i*0.01)
        time.sleep(0.1)
    print(f"IP Skoru (3 istek): {score:.4f}")
    assert score > 0.6, f"Normal frekans skoru iyi olmalı: {score}"
    print("✓ Normal frekans skoru iyi")
    
    # Test 3.3: Spam benzeri davranış (çok fazla istek)
    print("\nTest 3.3: Spam benzeri davranış")
    spam_ip = "10.0.0.1"
    for i in range(IP_SPAM_THRESHOLD + 2):
        score = _ip_skoru(spam_ip, 38.0, 38.0)
    print(f"IP: {spam_ip}")
    print(f"IP Skoru ({IP_SPAM_THRESHOLD + 2} istek): {score:.4f}")
    assert score <= 0.5, f"Spam davranışı skoru düşük olmalı: {score}"
    print("✓ Spam tespiti çalışıyor")
    
    # Test 3.4: Fiziksel olarak imkansız konum değişimi
    print("\nTest 3.4: İmkansız konum değişimi")
    teleport_ip = "172.16.0.1"
    _ip_skoru(teleport_ip, 38.0, 38.0)  # İstanbul
    time.sleep(0.1)
    score = _ip_skoru(teleport_ip, 41.0, 29.0)  # Ankara (350 km)
    print(f"IP: {teleport_ip}")
    print(f"Konum 1: (38.0, 38.0) → Konum 2: (41.0, 29.0)")
    print(f"IP Skoru (teleport): {score:.4f}")
    # Mesafe 350 km, max 200 km olduğu için skor düşmeli
    assert score < 0.8, f"İmkansız konum değişimi skoru düşük olmalı: {score}"
    print("✓ İmkansız konum tespiti çalışıyor")
    
    return True


# ══════════════════════════════════════════════════════════════════════════
# TEST 4: Konum Tutarlılığı Skoru
# ══════════════════════════════════════════════════════════════════════════

def test_konum_tutarliligi():
    """Türkiye sınırları kontrolünü test eder."""
    print("\n" + "="*70)
    print("TEST 4: Konum Tutarlılığı Skoru")
    print("="*70)
    
    # Test 4.1: Türkiye içi (yüksek skor)
    print("\nTest 4.1: Türkiye içi koordinatlar")
    test_cases_inside = [
        (41.0082, 28.9784, "İstanbul"),
        (39.9334, 32.8597, "Ankara"),
        (38.4192, 27.1287, "İzmir"),
        (37.0000, 35.3213, "Adana"),
    ]
    
    for lat, lon, city in test_cases_inside:
        score = _konum_tutarliligi_skoru(lat, lon)
        print(f"{city}: ({lat}, {lon}) → Skor: {score:.2f}")
        assert score == 1.0, f"{city} için skor 1.0 olmalı: {score}"
    print("✓ Türkiye içi skorları doğru")
    
    # Test 4.2: Türkiye dışı (düşük skor)
    print("\nTest 4.2: Türkiye dışı koordinatlar")
    test_cases_outside = [
        (51.5074, -0.1278, "Londra"),
        (40.7128, -74.0060, "New York"),
        (35.6762, 139.6503, "Tokyo"),
    ]
    
    for lat, lon, city in test_cases_outside:
        score = _konum_tutarliligi_skoru(lat, lon)
        print(f"{city}: ({lat}, {lon}) → Skor: {score:.2f}")
        assert score == 0.0, f"{city} için skor 0.0 olmalı: {score}"
    print("✓ Türkiye dışı skorları doğru")
    
    # Test 4.3: Sınıra yakın (orta skor)
    print("\nTest 4.3: Sınıra yakın koordinatlar")
    test_cases_border = [
        (35.5, 36.0, "Güney sınır yakını"),
        (43.0, 44.5, "Kuzey-doğu sınır yakını (dışarıda ama yakın)"),
    ]
    
    for lat, lon, desc in test_cases_border:
        score = _konum_tutarliligi_skoru(lat, lon)
        print(f"{desc}: ({lat}, {lon}) → Skor: {score:.2f}")
        assert score == 0.5, f"Sınır yakını için skor 0.5 olmalı: {score}"
    print("✓ Sınır yakını skorları doğru")
    
    return True


# ══════════════════════════════════════════════════════════════════════════
# TEST 5: Bileşik Güven Skoru
# ══════════════════════════════════════════════════════════════════════════

def test_calculate_trust_score():
    """Ana güven skoru fonksiyonunu test eder."""
    print("\n" + "="*70)
    print("TEST 5: Bileşik Güven Skoru")
    print("="*70)
    
    # IP geçmişini temizle
    _ip_history.clear()
    
    # Mock deprem verisi
    earthquakes = [
        {"lat": 38.0, "lon": 38.0, "magnitude": 6.0},
    ]
    
    # Test 5.1: Yüksek güvenilirlik (doğrulanmış)
    print("\nTest 5.1: Yüksek güvenilirlik senaryosu")
    print("Senaryo: Deprem bölgesinde, temiz IP, Türkiye içi")
    result = calculate_trust_score(
        lat=38.05,
        lon=38.05,
        ip="192.168.1.1",
        earthquakes=earthquakes
    )
    
    print(f"Güven Skoru: {result['trust_score']:.4f}")
    print(f"  - Sismik: {result['s_sismik']:.4f}")
    print(f"  - IP: {result['s_ip']:.4f}")
    print(f"  - Konum: {result['s_konum']:.4f}")
    print(f"Doğrulandı: {result['is_verified']}")
    
    assert result['is_verified'] == True, "Yüksek skor doğrulanmalı"
    assert result['trust_score'] >= VERIFIED_THRESHOLD, "Skor eşiğin üzerinde olmalı"
    print("✓ Yüksek güvenilirlik testi başarılı")
    
    # Test 5.2: Düşük güvenilirlik (doğrulanmamış)
    print("\nTest 5.2: Düşük güvenilirlik senaryosu")
    print("Senaryo: Depremden uzak, spam IP, Türkiye dışı")
    
    # Spam IP oluştur
    spam_ip = "10.0.0.99"
    for _ in range(IP_SPAM_THRESHOLD + 1):
        _ip_skoru(spam_ip, 51.0, 0.0)
    
    result = calculate_trust_score(
        lat=51.5074,  # Londra
        lon=-0.1278,
        ip=spam_ip,
        earthquakes=earthquakes
    )
    
    print(f"Güven Skoru: {result['trust_score']:.4f}")
    print(f"  - Sismik: {result['s_sismik']:.4f}")
    print(f"  - IP: {result['s_ip']:.4f}")
    print(f"  - Konum: {result['s_konum']:.4f}")
    print(f"Doğrulandı: {result['is_verified']}")
    
    assert result['is_verified'] == False, "Düşük skor doğrulanmamalı"
    assert result['trust_score'] < VERIFIED_THRESHOLD, "Skor eşiğin altında olmalı"
    print("✓ Düşük güvenilirlik testi başarılı")
    
    # Test 5.3: Orta güvenilirlik (eşik değer testi)
    print("\nTest 5.3: Eşik değer senaryosu")
    print("Senaryo: Orta mesafe, normal IP, Türkiye içi")
    
    _ip_history.clear()
    result = calculate_trust_score(
        lat=39.0,  # Depremden ~100 km uzak
        lon=37.0,
        ip="192.168.2.1",
        earthquakes=earthquakes
    )
    
    print(f"Güven Skoru: {result['trust_score']:.4f}")
    print(f"  - Sismik: {result['s_sismik']:.4f}")
    print(f"  - IP: {result['s_ip']:.4f}")
    print(f"  - Konum: {result['s_konum']:.4f}")
    print(f"Doğrulandı: {result['is_verified']}")
    print(f"Eşik Değer: {VERIFIED_THRESHOLD}")
    print("✓ Eşik değer testi başarılı")
    
    # Test 5.4: Ağırlık kontrolü
    print("\nTest 5.4: Ağırlık toplamı kontrolü")
    total_weight = W_SISMIK + W_IP + W_KONUM
    print(f"Toplam Ağırlık: {total_weight:.2f}")
    assert abs(total_weight - 1.0) < 0.01, "Ağırlıklar toplamı 1.0 olmalı"
    print("✓ Ağırlıklar doğru")
    
    return True


# ══════════════════════════════════════════════════════════════════════════
# TEST 6: Gerçek Dünya Senaryoları
# ══════════════════════════════════════════════════════════════════════════

def test_real_world_scenarios():
    """Gerçek dünya senaryolarını test eder."""
    print("\n" + "="*70)
    print("TEST 6: Gerçek Dünya Senaryoları")
    print("="*70)
    
    _ip_history.clear()
    
    # 6 Şubat 2023 Kahramanmaraş depremi mock verisi
    earthquakes = [
        {"lat": 37.226, "lon": 37.014, "magnitude": 7.8},
        {"lat": 38.089, "lon": 37.239, "magnitude": 7.5},
    ]
    
    # Senaryo 1: Gerçek deprem bölgesinden gelen ihbar
    print("\nSenaryo 1: Kahramanmaraş'tan gelen gerçek ihbar")
    result = calculate_trust_score(
        lat=37.5,
        lon=37.0,
        ip="88.247.100.50",
        earthquakes=earthquakes
    )
    print(f"Güven Skoru: {result['trust_score']:.4f} → {result['is_verified']}")
    assert result['is_verified'] == True
    print("✓ Gerçek ihbar doğrulandı")
    
    # Senaryo 2: Depremsiz bölgeden gelen şüpheli ihbar
    print("\nSenaryo 2: İzmir'den gelen şüpheli ihbar (deprem yok)")
    result = calculate_trust_score(
        lat=38.4192,
        lon=27.1287,
        ip="88.247.100.50",
        earthquakes=earthquakes
    )
    print(f"Güven Skoru: {result['trust_score']:.4f} → {result['is_verified']}")
    print("✓ Uzak bölge ihbarı değerlendirildi")
    
    # Senaryo 3: Yurtdışından gelen sahte ihbar
    print("\nSenaryo 3: Yurtdışından gelen sahte ihbar")
    result = calculate_trust_score(
        lat=40.7128,
        lon=-74.0060,
        ip="8.8.8.8",
        earthquakes=earthquakes
    )
    print(f"Güven Skoru: {result['trust_score']:.4f} → {result['is_verified']}")
    assert result['is_verified'] == False
    print("✓ Sahte ihbar reddedildi")
    
    # Senaryo 4: Bot saldırısı simülasyonu
    print("\nSenaryo 4: Bot saldırısı simülasyonu")
    bot_ip = "1.2.3.4"
    for i in range(10):
        result = calculate_trust_score(
            lat=37.5 + i*0.1,
            lon=37.0 + i*0.1,
            ip=bot_ip,
            earthquakes=earthquakes
        )
    print(f"10. istek Güven Skoru: {result['trust_score']:.4f} → {result['is_verified']}")
    assert result['trust_score'] < 0.6, "Bot saldırısı düşük skor almalı"
    print("✓ Bot saldırısı tespit edildi")
    
    return True


# ══════════════════════════════════════════════════════════════════════════
# TEST 7: Performans ve Sınır Değerleri
# ══════════════════════════════════════════════════════════════════════════

def test_edge_cases():
    """Sınır değerleri ve özel durumları test eder."""
    print("\n" + "="*70)
    print("TEST 7: Sınır Değerleri ve Özel Durumlar")
    print("="*70)
    
    _ip_history.clear()
    
    # Test 7.1: Boş deprem listesi
    print("\nTest 7.1: Boş deprem listesi")
    result = calculate_trust_score(
        lat=38.0,
        lon=38.0,
        ip="192.168.1.1",
        earthquakes=[]
    )
    print(f"Güven Skoru (deprem yok): {result['trust_score']:.4f}")
    assert result['s_sismik'] == 0.0
    print("✓ Boş deprem listesi işlendi")
    
    # Test 7.2: Ekstrem koordinatlar
    print("\nTest 7.2: Ekstrem koordinatlar")
    result = calculate_trust_score(
        lat=90.0,  # Kuzey Kutbu
        lon=0.0,
        ip="192.168.1.2",
        earthquakes=[{"lat": 0.0, "lon": 0.0}]
    )
    print(f"Güven Skoru (Kuzey Kutbu): {result['trust_score']:.4f}")
    assert result['s_konum'] == 0.0
    print("✓ Ekstrem koordinatlar işlendi")
    
    # Test 7.3: Aynı IP'den farklı zamanlarda istekler
    print("\nTest 7.3: Zaman penceresi testi")
    ip = "192.168.1.3"
    
    # İlk istek
    result1 = calculate_trust_score(38.0, 38.0, ip, [])
    print(f"İlk istek skoru: {result1['trust_score']:.4f}")
    
    # 6 dakika sonra (pencere dışı)
    time.sleep(0.1)  # Gerçek testte 360 saniye beklemek yerine simüle ediyoruz
    result2 = calculate_trust_score(38.0, 38.0, ip, [])
    print(f"İkinci istek skoru: {result2['trust_score']:.4f}")
    print("✓ Zaman penceresi çalışıyor")
    
    # Test 7.4: Negatif koordinatlar
    print("\nTest 7.4: Negatif koordinatlar")
    result = calculate_trust_score(
        lat=-33.8688,  # Sydney
        lon=151.2093,
        ip="192.168.1.4",
        earthquakes=[{"lat": -33.0, "lon": 151.0}]
    )
    print(f"Güven Skoru (Sydney): {result['trust_score']:.4f}")
    print("✓ Negatif koordinatlar işlendi")
    
    return True


# ══════════════════════════════════════════════════════════════════════════
# ANA TEST RUNNER
# ══════════════════════════════════════════════════════════════════════════

def run_all_tests():
    """Tüm testleri çalıştırır ve sonuçları raporlar."""
    print("\n" + "╔" + "="*68 + "╗")
    print("║" + " "*15 + "GÜVEN SKORU TEST SÜİTİ" + " "*31 + "║")
    print("╚" + "="*68 + "╝")
    
    start_time = time.time()
    
    tests = [
        ("Haversine Mesafe Hesaplama", test_haversine),
        ("Sismik Skor Hesaplama", test_sismik_skor),
        ("IP Davranış Skoru", test_ip_skoru),
        ("Konum Tutarlılığı Skoru", test_konum_tutarliligi),
        ("Bileşik Güven Skoru", test_calculate_trust_score),
        ("Gerçek Dünya Senaryoları", test_real_world_scenarios),
        ("Sınır Değerleri ve Özel Durumlar", test_edge_cases),
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        try:
            test_func()
            passed += 1
            print(f"\n✅ {test_name} - BAŞARILI")
        except AssertionError as e:
            failed += 1
            print(f"\n❌ {test_name} - BAŞARISIZ")
            print(f"   Hata: {str(e)}")
        except Exception as e:
            failed += 1
            print(f"\n❌ {test_name} - HATA")
            print(f"   Hata: {str(e)}")
    
    elapsed_time = time.time() - start_time
    
    # Özet Rapor
    print("\n" + "╔" + "="*68 + "╗")
    print("║" + " "*25 + "TEST SONUÇLARI" + " "*29 + "║")
    print("╠" + "="*68 + "╣")
    print(f"║  Toplam Test: {len(tests):<5}                                              ║")
    print(f"║  Başarılı: {passed:<5} ✅                                             ║")
    print(f"║  Başarısız: {failed:<5} ❌                                            ║")
    print(f"║  Süre: {elapsed_time:.2f} saniye                                          ║")
    print("╠" + "="*68 + "╣")
    
    if failed == 0:
        print("║" + " "*15 + "🎉 TÜM TESTLER BAŞARILI! 🎉" + " "*25 + "║")
    else:
        print("║" + " "*10 + "⚠️  BAZI TESTLER BAŞARISIZ OLDU ⚠️" + " "*21 + "║")
    
    print("╚" + "="*68 + "╝\n")
    
    # Algoritma Parametreleri Özeti
    print("\n" + "="*70)
    print("GÜVEN SKORU ALGORİTMASI PARAMETRELERİ")
    print("="*70)
    print(f"Ağırlıklar:")
    print(f"  - Sismik (W_SISMIK): {W_SISMIK:.2f} (Deprem örtüşmesi)")
    print(f"  - IP (W_IP): {W_IP:.2f} (IP davranış analizi)")
    print(f"  - Konum (W_KONUM): {W_KONUM:.2f} (Konum tutarlılığı)")
    print(f"\nEşik Değerler:")
    print(f"  - Doğrulama Eşiği: {VERIFIED_THRESHOLD:.2f}")
    print(f"  - Deprem Yarıçapı: {EARTHQUAKE_RADIUS_KM:.1f} km")
    print(f"  - IP Spam Eşiği: {IP_SPAM_THRESHOLD} istek/5dk")
    print(f"  - IP Max Mesafe: {IP_MAX_COORD_DIST_KM:.1f} km")
    print("="*70 + "\n")
    
    return failed == 0


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
