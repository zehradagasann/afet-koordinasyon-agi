# Sistem Mimarisi ve Veri Akışı

> **Makale Bölümü III — Mimari ve Veri Akışı**

---

## Genel Mimari

```
┌─────────────────────────────────────────────────────────────────────┐
│                        RESQ SİSTEM MİMARİSİ                         │
└─────────────────────────────────────────────────────────────────────┘

  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────┐
  │   Vatandaş   │    │  Kriz Merkezi│    │   Saha Ekibi / Araç      │
  │  (Mobil/Web) │    │  (Dashboard) │    │   (Bildirim Alıcısı)     │
  └──────┬───────┘    └──────┬───────┘    └────────────┬─────────────┘
         │                   │                          │
         │ POST /talep-gonder│ GET /requests/prioritized│
         │                   │ POST /assign-vehicle     │
         ▼                   ▼                          │
  ┌─────────────────────────────────────────────────────────────────┐
  │                    FASTAPI BACKEND (Python)                      │
  │                                                                  │
  │  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
  │  │  Rate Limiter   │  │  Trust Scorer    │  │ Circuit Breaker│  │
  │  │  (Görev 4.1)    │  │  (Güven Skoru)   │  │  (Hata Tolerans│  │
  │  │  3 istek/dk/IP  │  │  T = w1*S_sismik │  │  CLOSED/OPEN/  │  │
  │  └────────┬────────┘  │  + w2*S_ip       │  │  HALF_OPEN)    │  │
  │           │           │  + w3*S_konum    │  └───────┬────────┘  │
  │           │           └────────┬─────────┘          │           │
  │           │                    │                     │           │
  │           ▼                    ▼                     ▼           │
  │  ┌──────────────────────────────────────────────────────────┐   │
  │  │              İHBAR İŞLEME PIPELINE                        │   │
  │  │  1. Rate limit kontrolü (IP bazlı)                        │   │
  │  │  2. Güven skoru hesapla (sismik + IP + konum)             │   │
  │  │  3. is_verified ata (T >= 0.50 → True)                    │   │
  │  │  4. Veritabanına kaydet                                    │   │
  │  │  5. WebSocket ile tüm istemcilere bildir                   │   │
  │  └──────────────────────────────────────────────────────────┘   │
  │                                                                  │
  │  ┌──────────────────┐  ┌──────────────────┐                     │
  │  │ Priority Engine  │  │ DBSCAN Clustering│                     │
  │  │ P = S_base +     │  │ 500m yarıçap     │                     │
  │  │ (S_base*λ*t/M)   │  │ → Görev Paketleri│                     │
  │  │ * (1 + C_i)      │  └──────────────────┘                     │
  │  └──────────────────┘                                            │
  └──────────────────────────────┬──────────────────────────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
  ┌───────────────────┐  ┌──────────────┐  ┌──────────────────────┐
  │  PostgreSQL       │  │ Kandilli API │  │  USGS API            │
  │  (Supabase)       │  │ (Deprem Veri)│  │  (5.0+ Depremler)    │
  │                   │  │ TTL Cache    │  │  Son 3 ay            │
  │  disaster_requests│  │ 60 saniye    │  └──────────────────────┘
  │  relief_vehicles  │  └──────────────┘
  │  clusters         │
  │  app_users        │
  └───────────────────┘
```

---

## Veri Akışı — İhbar Gönderme

```
Kullanıcı
   │
   │ POST /talep-gonder
   │ { latitude, longitude, need_type }
   ▼
┌─────────────────────────────────────────────────────┐
│ 1. RATE LIMITER                                      │
│    IP başına 3 istek/dk kontrolü                     │
│    Aşıldı → HTTP 429 (DUR)                           │
│    Geçti  → devam                                    │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│ 2. CIRCUIT BREAKER + TTL CACHE                       │
│    Cache geçerli (< 60s) → bellekten oku             │
│    CB OPEN → cache'den dön                           │
│    CB CLOSED/HALF_OPEN → Kandilli API'ye git         │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│ 3. GÜVEN SKORU HESAPLA                               │
│                                                      │
│    S_sismik = max(0, 1 - d_min / 50km)               │
│    S_ip     = 0.5*S_frekans + 0.5*S_mesafe           │
│    S_konum  = Türkiye sınırı kontrolü                │
│                                                      │
│    T = 0.60*S_sismik + 0.25*S_ip + 0.15*S_konum     │
│                                                      │
│    T >= 0.50 → is_verified = True                    │
│    T <  0.50 → is_verified = False (şüpheli)         │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│ 4. VERİTABANINA KAYDET                               │
│    PostgreSQL (Supabase)                             │
│    disaster_requests tablosu                         │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│ 5. WEBSOCKET BİLDİRİMİ                               │
│    Bağlı tüm istemcilere NEW_REQUEST eventi          │
└─────────────────────────────────────────────────────┘
                       │
                       ▼
                   Kullanıcıya
                   HTTP 200 + ihbar detayı
```

---

## Güven Skoru Algoritması

```
T(r) = w₁ · S_sismik + w₂ · S_ip + w₃ · S_konum

Ağırlıklar:
  w₁ = 0.60  (sismik örtüşme — en kritik parametre)
  w₂ = 0.25  (IP davranış analizi)
  w₃ = 0.15  (konum tutarlılığı)

Parametreler:

  S_sismik:
    d_min = min{ haversine(ihbar, deprem_i) | i ∈ depremler }
    S_sismik = max(0, 1 - d_min / 50)

  S_ip:
    S_frekans = max(0, 1 - (n-1) / 5)   [n = son 5dk istek sayısı]
    S_mesafe  = max(0, 1 - d_max / 200)  [d_max = IP'nin max koordinat sapması]
    S_ip = 0.5 · S_frekans + 0.5 · S_mesafe

  S_konum:
    1.0  → Türkiye sınırları içinde
    0.5  → Sınıra ±1° yakın
    0.0  → Türkiye dışı

Karar:
  T ≥ 0.50 → is_verified = True  (doğrulandı)
  T < 0.50 → is_verified = False (şüpheli)
```

---

## Circuit Breaker Durum Makinesi

```
                    ┌─────────────────────────────┐
                    │                             │
              Başarı│                             │Başarı
                    ▼                             │
         ┌──────────────────┐                    │
         │                  │  3 ardışık hata    │
    ────▶│     CLOSED       │──────────────────▶ │
         │  (Normal çalışma)│                    │
         │                  │                    ▼
         └──────────────────┘         ┌──────────────────┐
                                      │                  │
                                      │      OPEN        │
                                      │  (60s bekleme)   │
                                      │                  │
                                      └────────┬─────────┘
                                               │
                                               │ 60 saniye sonra
                                               ▼
                                    ┌──────────────────┐
                                    │                  │
                                    │   HALF_OPEN      │──── Hata ────┐
                                    │  (Test isteği)   │              │
                                    │                  │              ▼
                                    └──────────────────┘         (OPEN'a dön)
```

---

## Teknoloji Yığını

| Katman | Teknoloji | Amaç |
|--------|-----------|------|
| API Framework | FastAPI (Python) | Asenkron HTTP + WebSocket |
| Veritabanı | PostgreSQL (Supabase) | Kalıcı veri depolama |
| ORM | SQLAlchemy | DB soyutlama katmanı |
| Coğrafi Analiz | PostGIS | Mekansal sorgular |
| Kümeleme | scikit-learn DBSCAN | İhbar gruplama |
| Geocoding | geopy (Nominatim) | Koordinat → Adres |
| Frontend | React + Vite | Kriz merkezi arayüzü |
| Harita | Leaflet + React-Leaflet | Coğrafi görselleştirme |
| Yük Testi | Locust | Performans ölçümü |
