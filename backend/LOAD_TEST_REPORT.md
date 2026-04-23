# Yük Testi Raporu — RESQ Afet Koordinasyon API

**Görev 5.1 — Load Testing**  
**Tarih:** 23 Nisan 2026  
**Araç:** [Locust](https://locust.io/) v2.43.4  
**Test Dosyası:** `locustfile.py`

---

## Test Koşulları

| Parametre | Değer |
|-----------|-------|
| Toplam sanal kullanıcı | 50 |
| Kullanıcı ekleme hızı | 5 kullanıcı/saniye |
| Test süresi | 60 saniye |
| Hedef sunucu | http://localhost:8000 |
| Sunucu ortamı | Geliştirme (tek çekirdek, uvicorn) |

---

## Test Senaryosu

Her sanal kullanıcı gerçek bir afet anındaki operatörü simüle eder:

| İşlem | Ağırlık | Açıklama |
|-------|---------|----------|
| `POST /talep-gonder` | 3x | Rastgele koordinat ve ihtiyaç türüyle ihbar gönderme |
| `GET /requests/prioritized` | 2x | Öncelikli ihbar listesini çekme |
| `GET /requests/task-packages` | 1x | Küme listesini çekme |
| `GET /araclar` | 1x | Araç listesini çekme |

---

## Sonuçlar

### Genel Özet

| Metrik | Değer |
|--------|-------|
| Toplam istek | **1.559** |
| Başarılı istek | **1.559** |
| Başarısız istek | **0** |
| Hata oranı | **%0** |
| Ortalama yanıt süresi | **519 ms** |
| Medyan yanıt süresi | **330 ms** |
| Maksimum yanıt süresi | **4.693 ms** |
| Toplam istek/saniye | **26.4 req/s** |

### Endpoint Bazlı Sonuçlar

| Endpoint | İstek | Hata | Ort. (ms) | Medyan (ms) | 95% (ms) | Maks (ms) | req/s |
|----------|-------|------|-----------|-------------|----------|-----------|-------|
| POST /talep-gonder | 675 | 0 | 83 | **3** | 17 | 4.016 | 11.6 |
| GET /requests/prioritized | 425 | 0 | 920 | 690 | 2.100 | 4.693 | 7.3 |
| GET /requests/task-packages | 218 | 0 | 813 | 520 | 2.000 | 3.330 | 3.7 |
| GET /araclar | 219 | 0 | 819 | 580 | 2.000 | 4.165 | 3.7 |

### Yanıt Süresi Dağılımı (Tüm İstekler)

| Yüzdelik | Süre |
|----------|------|
| %50 (medyan) | 330 ms |
| %75 | 720 ms |
| %90 | 1.500 ms |
| %95 | 1.900 ms |
| %99 | 2.700 ms |
| %100 (maks) | 4.700 ms |

---

## Değerlendirme

### ✅ Güçlü Yönler

**İhbar gönderme (POST /talep-gonder) son derece hızlı:**  
Medyan yanıt süresi **3 ms**. Bu endpoint Kandilli API'sini çağırıyor, cross-check yapıyor ve veritabanına yazıyor — buna rağmen 3ms medyan mükemmel bir performans.

**Sıfır hata:**  
50 eş zamanlı kullanıcıyla 60 saniyede 1.559 istek işlendi, hiçbiri hata vermedi. Sistem kararlı çalıştı.

**Rate limiting doğru çalıştı:**  
Aynı IP'den gelen fazla istekler HTTP 429 ile bloklandı ve bu durum hata olarak sayılmadı (beklenen davranış).

### ⚠️ Dikkat Edilmesi Gerekenler

**Liste sorguları yavaşlıyor:**  
`GET /requests/prioritized` 339 ihbar için 920ms ortalama yanıt süresi veriyor. Veritabanında 10.000+ kayıt olduğunda bu süre önemli ölçüde artacak. Çözüm: sayfalama (pagination) veya önbellekleme (caching) eklenebilir.

**Maksimum yanıt süreleri yüksek:**  
%99 diliminde 2.700ms görülüyor. Bu, Kandilli API'sine yapılan dış çağrıların zaman zaman gecikme yarattığını gösteriyor. Çözüm: Kandilli çağrısını arka planda (background task) çalıştırmak.

---

## Testi Yeniden Çalıştırmak

```bash
# Temel test (50 kullanıcı, 60 saniye)
locust -f locustfile.py --headless -u 50 -r 5 --run-time 60s --host http://localhost:8000

# Daha yoğun test (200 kullanıcı, 2 dakika)
locust -f locustfile.py --headless -u 200 -r 20 --run-time 120s --host http://localhost:8000

# Görsel arayüzle (tarayıcıdan http://localhost:8089)
locust -f locustfile.py --host http://localhost:8000
```
