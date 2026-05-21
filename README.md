<div align="center">

# 🆘 RESQ
### Real-time Emergency Safety & Coordination System

*Gerçek Zamanlı Afet Güvenlik ve Koordinasyon Sistemi*

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Async-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+PostGIS-336791?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Expo](https://img.shields.io/badge/Expo_SDK-54-000020?style=flat-square&logo=expo)](https://expo.dev)
[![License](https://img.shields.io/badge/Lisans-MIT-22c55e?style=flat-square)](LICENSE)

**500 kullanıcılı stres testinde POST hata oranı %100 → %0.37'ye düştü (270× iyileştirme)**

[Kurulum](#-kurulum) · [Özellikler](#-özellikler) · [Algoritmalar](#-algoritmalar) · [Ekran Görüntüleri](#-ekran-görüntüleri) · [Makale](#-akademik-makale) · [Ekip](#-ekip)

</div>

---

## 🎯 Nedir?

RESQ; afetle ilk anda karşılaşan vatandaşlardan, koordinatörlere ve saha ekiplerine uzanan **üç katmanlı bir kriz yönetim platformudur.**

| Kullanıcı | Arayüz | Görev |
|---|---|---|
| 🧑‍💻 Koordinatör | React Web Paneli | Kümeleri yönet, araç gönder, haritayı izle |
| 🙋 Gönüllü | React Web Paneli | Aktif talepleri gör, harita görünümü |
| 📱 Afetzede | React Native Mobil | 4 adımda yardım talebi oluştur |

Sistem gelen ihbarları **güven skoru algoritmasıyla** filtreler, doğrulanmış istekleri **DBSCAN ile coğrafi kümelere** dönüştürür ve koordinatöre **MCDM ile en uygun aracı** otomatik önerir.

---

## 🚀 Kurulum

### Docker ile (Önerilen)

```bash
git clone https://github.com/BilalAbic/afet-koordinasyon-agi.git
cd afet-koordinasyon-agi
cp .env.example .env          # .env dosyasını düzenle

docker-compose up -d
```

| Servis | Adres |
|---|---|
| 🌐 Web Paneli | http://localhost:5173 |
| ⚙️ Backend API | http://localhost:8000 |
| 📖 Swagger Docs | http://localhost:8000/docs |

```bash
docker-compose logs -f        # logları izle
docker-compose down -v        # durdur ve temizle
```

### Manuel Kurulum

<details>
<summary>Adım adım göster</summary>

**Gereksinimler:** Python 3.11+, Node.js 18+, PostgreSQL 14+ (PostGIS)

```bash
# 1 — Backend
cd backend
pip install -r requirements.txt
cp ../.env.example ../.env
uvicorn main:app --reload     # http://localhost:8000

# 2 — Web Paneli
cd kriz-paneli
npm install && npm run dev    # http://localhost:5173

# 3 — Mobil Uygulama
cd mobile
npm install
npx expo start                # Expo Go ile QR okut
```

**`.env` içeriği:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/afet_koordinasyon
SECRET_KEY=uretim-ortaminda-guclu-bir-anahtar-kullan
```

> Detaylı kurulum: [backend/README.md](backend/README.md) · [Docker Rehberi](DOCKER_SETUP.md)

</details>

---

## ✨ Özellikler

- **🔐 4 Rol RBAC** — Vatandaş (yalnızca mobil), Gönüllü, Koordinatör, Yönetici — JWT (HS256, 7 günlük)
- **📡 Gerçek Zamanlı WebSocket** — Koordinatör panelinde canlı güncelleme
- **📴 Çevrimdışı Mod** — Mobil uygulama NetInfo ile talepleri kuyruğa alır, bağlantı gelince senkronize eder
- **🗺️ Reverse Geocoding** — geopy / Nominatim koordinatları okunabilir adrese çevirir
- **📊 Sphere Standartları** — Stok yeterliliği Sphere El Kitabı minimumlarına göre hesaplanır (15 L/kişi/gün)
- **🌡️ Bağlamsal Bonuslar** — Soğuk (<0°C) +30 pt, aşırı sıcak (>35°C) +15 pt, araç yok +20 pt

---

## 🧠 Algoritmalar

### 1 — Güven Skoru T(r)

Her ihbar işleme hattına girmeden önce 0–1 arasında puanlanır:

```
T(r) = 0.60·S_seismic + 0.25·S_ip + 0.15·S_loc

  S_seismic  = max(0, 1 − d_min/50)         Kandilli son 24s deprem mesafesi (km)
  S_ip       = 0.5·S_freq + 0.5·S_dist      spam & koordinat sıçrama tespiti
  S_loc      = 1.0 / 0.5 / 0.0             TR içi / ±1° tampon / dışarı

  Eşik: T(r) ≥ 0.50  →  is_verified = True
```

### 2 — Dinamik Önceliklendirme P(t)

```
P(t) = S_base + (S_base · λ · t / M) · (1 + C_i)    λ = 1.5
```

Puan zamanla büyür; kuyruk açlığını önler. Yangın (M=1s) hızla, gıda (M=168s) yavaş tırmanır.

### 3 — DBSCAN Kümeleme

```
ε = 500 m  →  500/6.371.000 rad    minPts = 2    metrik = Haversine (BallTree)
```

### 4 — MCDM Araç Seçimi

```
Puan = 0.40·aciliyet + 0.27·mesafe + 0.18·stok + 0.15·hız
ETA  = (Haversine_km × 1.2) / hız × 60  [dakika]
```

### 5 — Circuit Breaker (Kandilli Observatory API)

```
KAPALI ──3 hata──► AÇIK ──60s──► YARI_AÇIK ──başarı──► KAPALI
                     └── TTL önbellekli sismik veri (60s) ──┘
```

---

## 📊 Yük Testi Sonuçları

| Senaryo | Kullanıcı | POST Hata Oranı | Medyan | Sonuç |
|---|---|---|---|---|
| Normal yük | 50 | %0 | 3 ms | ✅ Kararlı |
| Stres — v1 | 500 | **%100** | 4.100 ms | ❌ Çöktü |
| Stres — v2 | 500 | **%0.37** | 2.100 ms | ✅ 270× iyileştirme |

Araç: [Locust v2.43.4](https://locust.io) — **Optimizasyon:** Kandilli API'si için TTL önbellek (60s) + veritabanı bağlantı havuzu.

---

## 📸 Ekran Görüntüleri

<details>
<summary><b>🖥️ Koordinatör Web Paneli</b></summary>
<br>

| Ana Dashboard | Küme Yönetimi |
|---|---|
| ![Dashboard](ss/Koordinatör/web_coordinator_dashboard.png) | ![Kümeler](ss/Koordinatör/web_coordinator_clusters.png) |
| KPI metrikleri & AI yönlendirme uyarısı | DBSCAN çıktısı, tek tıkla araç gönderme |

| Taktik Harita | Doğrulanmamış Kuyruk | Araçlar |
|---|---|---|
| ![Harita](ss/Koordinatör/web_coordinator_map.png) | ![Doğrulanmamış](ss/Koordinatör/web_coordinator_unverified.png) | ![Araçlar](ss/Koordinatör/web_coordinator_vehicles.png) |

</details>

<details>
<summary><b>🙋 Gönüllü Web Paneli</b></summary>
<br>

| Dashboard | Harita Görünümü |
|---|---|
| ![Gönüllü Dashboard](ss/Gönüllü/web_volunteer_dashboard.png) | ![Gönüllü Harita](ss/Gönüllü/web_volunteer_map.png) |

</details>

<details>
<summary><b>📱 Mobil Uygulama (Afetzede)</b></summary>
<br>

| Ana Ekran | GPS — Adım 1/4 | İhtiyaç Tipi — Adım 3/4 | Talep Takibi |
|---|---|---|---|
| ![Ana](ss/afetzede/mobile_home.jpeg) | ![GPS](ss/afetzede/mobile_gps_step1.jpeg) | ![İhtiyaç](ss/afetzede/mobile_need_type_step3.jpeg) | ![Takip](ss/afetzede/mobile_request_tracking.jpeg) |

*Web paneline giren vatandaşlar mobil uygulamaya yönlendirilir:*

![Yönlendirme](ss/afetzede/web_citizen_redirect.png)

</details>

---

## 📄 Akademik Makale

Bu sistem, IEEE konferans makalesi olarak hazırlandı.

> **Başlık:** *RESQ: A Multi-Layer Trust Verification and Spatial Clustering Architecture for Real-Time Disaster Coordination*
> **Kurum:** Fırat Üniversitesi, Yazılım Mühendisliği Bölümü, 2026

📥 **[RESQ_IEEE_MAKALE.docx](RESQ_IEEE_MAKALE.docx)** — IEEE A4 formatında tam makale

---

## 📁 Proje Yapısı

```
afet-koordinasyon-agi/
├── 📂 backend/            # FastAPI backend — API, servisler, modeller, testler
├── 📂 kriz-paneli/        # React 18 + Leaflet — Koordinatör & Gönüllü web paneli
├── 📂 mobile/             # React Native + Expo 54 — Afetzede mobil uygulaması
├── 📂 ss/                 # Arayüz ekran görüntüleri (role ve ekrana göre)
├── 📄 RESQ_IEEE_MAKALE.docx  # IEEE konferans makalesi
├── 🐳 docker-compose.yml
└── 📋 .env.example
```

---

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| **API** | FastAPI (Python 3.11) · Async · JWT/RBAC · WebSocket |
| **Veritabanı** | PostgreSQL 14 + PostGIS · SQLAlchemy |
| **ML / Coğrafi** | scikit-learn DBSCAN · geopy · Haversine |
| **Web Paneli** | React 18 · Leaflet · Vite · TailwindCSS |
| **Mobil** | React Native · Expo SDK 54 · Zustand · TanStack Query |
| **DevOps** | Docker Compose · Locust (yük testi) |

---

## 📚 Dokümantasyon

| Döküman | Açıklama |
|---|---|
| [backend/README.md](backend/README.md) | Backend kurulum ve kullanım detayları |
| [backend/docs/API.md](backend/docs/API.md) | Tüm endpoint'ler ve örnekler |
| [backend/docs/DATABASE_SCHEMA.md](backend/docs/DATABASE_SCHEMA.md) | ER diyagramı ve ilişkiler |
| [backend/docs/ARCHITECTURE.md](backend/docs/ARCHITECTURE.md) | Mimari detaylar |
| [kriz-paneli/README.md](kriz-paneli/README.md) | Web paneli kurulumu |
| [mobile/README.md](mobile/README.md) | Mobil uygulama kurulumu |
| [DOCKER_SETUP.md](DOCKER_SETUP.md) | Docker ile hızlı başlangıç |
| [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md) | Production deployment rehberi |

---

## 👥 Ekip

| İsim | Rol |
|---|---|
| **Zehra Dağaşan** | Frontend & Proje Yöneticisi |
| **Perihan Çelikoğlu** | Backend Geliştirici |
| **Bilal Abiç** | Backend & Mobil Geliştirici |
| **Mustafa Bite** | Backend Geliştirici |
| **Muhammet Baykara** | Danışman — Fırat Üniversitesi |

---

## 🤝 Katkıda Bulunma

```bash
git checkout -b feature/özellik-adı
git commit -m "feat: Yeni özellik ekle"
git push origin feature/özellik-adı
# → Pull Request aç
```

---

<div align="center">

📝 MIT Lisansı · Fırat Üniversitesi Yazılım Mühendisliği · 2026

</div>
