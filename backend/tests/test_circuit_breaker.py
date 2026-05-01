"""
Circuit Breaker Test Dosyası

Bu test dosyası live_earthquake_data.py modülündeki Circuit Breaker
implementasyonunun tüm durum geçişlerini test eder.
"""

import sys
import os
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from live_earthquake_data import CircuitBreaker, CircuitState


def test_initial_state():
    """Circuit Breaker başlangıç durumunu test eder."""
    print("\n" + "="*70)
    print("TEST 1: Başlangıç Durumu")
    print("="*70)
    
    cb = CircuitBreaker(failure_threshold=3, recovery_timeout=60, success_threshold=1)
    
    print(f"Başlangıç Durumu: {cb.state.value}")
    print(f"call_allowed(): {cb.call_allowed()}")
    
    assert cb.state == CircuitState.CLOSED, "Başlangıç durumu CLOSED olmalı"
    assert cb.call_allowed() == True, "CLOSED durumunda çağrıya izin verilmeli"
    assert cb.failure_count == 0, "Başlangıçta hata sayısı 0 olmalı"
    
    print("✓ Başlangıç durumu doğru: CLOSED")
    return True


def test_closed_to_open_transition():
    """CLOSED → OPEN geçişini test eder."""
    print("\n" + "="*70)
    print("TEST 2: CLOSED → OPEN Geçişi")
    print("="*70)
    
    cb = CircuitBreaker(failure_threshold=3, recovery_timeout=2, success_threshold=1)
    
    print(f"Başlangıç: {cb.state.value}")
    
    # 1. hata
    cb.record_failure()
    print(f"1. hata sonrası: {cb.state.value}, failure_count={cb.failure_count}")
    assert cb.state == CircuitState.CLOSED, "1 hata sonrası hala CLOSED olmalı"
    
    # 2. hata
    cb.record_failure()
    print(f"2. hata sonrası: {cb.state.value}, failure_count={cb.failure_count}")
    assert cb.state == CircuitState.CLOSED, "2 hata sonrası hala CLOSED olmalı"
    
    # 3. hata - eşik aşıldı
    cb.record_failure()
    print(f"3. hata sonrası: {cb.state.value}, failure_count={cb.failure_count}")
    assert cb.state == CircuitState.OPEN, "3 hata sonrası OPEN olmalı"
    assert cb.call_allowed() == False, "OPEN durumunda çağrıya izin verilmemeli"
    
    print("✓ CLOSED → OPEN geçişi başarılı (3 ardışık hata)")
    return True


def test_open_blocks_calls():
    """OPEN durumunda çağrıların engellendiğini test eder."""
    print("\n" + "="*70)
    print("TEST 3: OPEN Durumunda Çağrı Engelleme")
    print("="*70)
    
    cb = CircuitBreaker(failure_threshold=3, recovery_timeout=2, success_threshold=1)
    
    # Devreyi aç
    for _ in range(3):
        cb.record_failure()
    
    print(f"Durum: {cb.state.value}")
    print(f"call_allowed(): {cb.call_allowed()}")
    
    assert cb.state == CircuitState.OPEN, "Durum OPEN olmalı"
    assert cb.call_allowed() == False, "Çağrıya izin verilmemeli"
    
    print("✓ OPEN durumunda çağrılar engelleniyor")
    return True


def test_open_to_half_open_transition():
    """OPEN → HALF_OPEN geçişini test eder."""
    print("\n" + "="*70)
    print("TEST 4: OPEN → HALF_OPEN Geçişi")
    print("="*70)
    
    cb = CircuitBreaker(failure_threshold=3, recovery_timeout=2, success_threshold=1)
    
    # Devreyi aç
    for _ in range(3):
        cb.record_failure()
    
    print(f"Başlangıç: {cb.state.value}")
    assert cb.state == CircuitState.OPEN
    
    # Bekleme süresinden önce
    print(f"Bekleme öncesi call_allowed(): {cb.call_allowed()}")
    assert cb.call_allowed() == False, "Bekleme süresi dolmadan izin verilmemeli"
    
    # Bekleme süresi
    print(f"2 saniye bekleniyor...")
    time.sleep(2.1)
    
    # Bekleme sonrası
    print(f"Bekleme sonrası call_allowed(): {cb.call_allowed()}")
    print(f"Yeni durum: {cb.state.value}")
    
    assert cb.state == CircuitState.HALF_OPEN, "Bekleme sonrası HALF_OPEN olmalı"
    assert cb.call_allowed() == True, "HALF_OPEN'da test isteğine izin verilmeli"
    
    print("✓ OPEN → HALF_OPEN geçişi başarılı (60s bekleme sonrası)")
    return True


def test_half_open_to_closed_transition():
    """HALF_OPEN → CLOSED geçişini test eder."""
    print("\n" + "="*70)
    print("TEST 5: HALF_OPEN → CLOSED Geçişi")
    print("="*70)
    
    cb = CircuitBreaker(failure_threshold=3, recovery_timeout=2, success_threshold=1)
    
    # Devreyi aç ve HALF_OPEN'a geçir
    for _ in range(3):
        cb.record_failure()
    time.sleep(2.1)
    cb.call_allowed()  # HALF_OPEN'a geçiş
    
    print(f"Başlangıç: {cb.state.value}")
    assert cb.state == CircuitState.HALF_OPEN
    
    # Başarılı istek
    cb.record_success()
    print(f"Başarılı istek sonrası: {cb.state.value}")
    
    assert cb.state == CircuitState.CLOSED, "Başarılı istek sonrası CLOSED olmalı"
    assert cb.call_allowed() == True, "CLOSED durumunda çağrıya izin verilmeli"
    
    print("✓ HALF_OPEN → CLOSED geçişi başarılı (başarılı test isteği)")
    return True


def test_half_open_to_open_transition():
    """HALF_OPEN → OPEN geçişini test eder (başarısız test)."""
    print("\n" + "="*70)
    print("TEST 6: HALF_OPEN → OPEN Geçişi (Başarısız Test)")
    print("="*70)
    
    cb = CircuitBreaker(failure_threshold=3, recovery_timeout=2, success_threshold=1)
    
    # Devreyi aç ve HALF_OPEN'a geçir
    for _ in range(3):
        cb.record_failure()
    time.sleep(2.1)
    cb.call_allowed()  # HALF_OPEN'a geçiş
    
    print(f"Başlangıç: {cb.state.value}")
    assert cb.state == CircuitState.HALF_OPEN
    
    # Başarısız test isteği
    cb.record_failure()
    print(f"Başarısız test sonrası: {cb.state.value}")
    
    assert cb.state == CircuitState.OPEN, "Başarısız test sonrası tekrar OPEN olmalı"
    assert cb.call_allowed() == False, "OPEN durumunda çağrıya izin verilmemeli"
    
    print("✓ HALF_OPEN → OPEN geçişi başarılı (başarısız test isteği)")
    return True


def test_success_resets_failure_count():
    """Başarılı isteklerin hata sayacını sıfırladığını test eder."""
    print("\n" + "="*70)
    print("TEST 7: Başarılı İstek Hata Sayacını Sıfırlar")
    print("="*70)
    
    cb = CircuitBreaker(failure_threshold=3, recovery_timeout=2, success_threshold=1)
    
    # 2 hata
    cb.record_failure()
    cb.record_failure()
    print(f"2 hata sonrası failure_count: {cb.failure_count}")
    assert cb.failure_count == 2
    
    # Başarılı istek
    cb.record_success()
    print(f"Başarılı istek sonrası failure_count: {cb.failure_count}")
    assert cb.failure_count == 0, "Başarılı istek hata sayacını sıfırlamalı"
    assert cb.state == CircuitState.CLOSED, "Durum CLOSED kalmalı"
    
    print("✓ Başarılı istek hata sayacını sıfırladı")
    return True


def test_full_cycle():
    """Tam döngüyü test eder: CLOSED → OPEN → HALF_OPEN → CLOSED."""
    print("\n" + "="*70)
    print("TEST 8: Tam Döngü (CLOSED → OPEN → HALF_OPEN → CLOSED)")
    print("="*70)
    
    cb = CircuitBreaker(failure_threshold=3, recovery_timeout=2, success_threshold=1)
    
    # 1. CLOSED
    print(f"1. Başlangıç: {cb.state.value}")
    assert cb.state == CircuitState.CLOSED
    
    # 2. CLOSED → OPEN (3 hata)
    for i in range(3):
        cb.record_failure()
        print(f"   Hata {i+1}: {cb.state.value}")
    assert cb.state == CircuitState.OPEN
    print(f"2. 3 hata sonrası: {cb.state.value}")
    
    # 3. OPEN → HALF_OPEN (bekleme)
    time.sleep(2.1)
    cb.call_allowed()
    print(f"3. 2s bekleme sonrası: {cb.state.value}")
    assert cb.state == CircuitState.HALF_OPEN
    
    # 4. HALF_OPEN → CLOSED (başarılı test)
    cb.record_success()
    print(f"4. Başarılı test sonrası: {cb.state.value}")
    assert cb.state == CircuitState.CLOSED
    
    print("✓ Tam döngü başarıyla tamamlandı")
    return True


def run_all_tests():
    """Tüm testleri çalıştırır ve sonuçları raporlar."""
    print("\n" + "╔" + "="*68 + "╗")
    print("║" + " "*15 + "CIRCUIT BREAKER TEST SÜİTİ" + " "*27 + "║")
    print("╚" + "="*68 + "╝")
    
    start_time = time.time()
    
    tests = [
        ("Başlangıç Durumu", test_initial_state),
        ("CLOSED → OPEN Geçişi", test_closed_to_open_transition),
        ("OPEN Durumunda Çağrı Engelleme", test_open_blocks_calls),
        ("OPEN → HALF_OPEN Geçişi", test_open_to_half_open_transition),
        ("HALF_OPEN → CLOSED Geçişi", test_half_open_to_closed_transition),
        ("HALF_OPEN → OPEN Geçişi", test_half_open_to_open_transition),
        ("Başarılı İstek Hata Sayacını Sıfırlar", test_success_resets_failure_count),
        ("Tam Döngü", test_full_cycle),
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
    
    # Circuit Breaker Parametreleri
    print("\n" + "="*70)
    print("CIRCUIT BREAKER PARAMETRELERİ")
    print("="*70)
    print(f"Failure Threshold: 3 (ardışık hata)")
    print(f"Recovery Timeout: 60 saniye")
    print(f"Success Threshold: 1 (başarılı test)")
    print("\nDurum Geçişleri:")
    print("  CLOSED → OPEN: 3 ardışık hata")
    print("  OPEN → HALF_OPEN: 60 saniye bekleme")
    print("  HALF_OPEN → CLOSED: 1 başarılı test")
    print("  HALF_OPEN → OPEN: Başarısız test")
    print("="*70 + "\n")
    
    return failed == 0


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
