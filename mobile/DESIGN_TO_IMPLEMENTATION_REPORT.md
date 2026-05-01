# RESQ Mobile - Tasarım & Uygulama Uyum Raporu

**Tarih**: 2026-05-01  
**Hazırlayan**: Claude Code  
**Durum**: ✅ HAZIR - İmplementasyona Başlayabiliriz

---

## 📊 Yönetici Özeti

✅ **Tasarımlar Teknoloji Stack'e Uyumlu**  
✅ **Backend Rol Sistemi Tasarımlarla Eşleşiyor**  
✅ **9 Ekranın Tamamı Vatandaş (Citizen) Rolü İçin Tasarlandı**  
✅ **İlk Aşama Planlaması Tamamlandı - Başlamaya Hazırız**

---

## 🔍 Tasarım Analizi

### Tasarım Dosyaları (9 Ekran)

| # | Dosya Adı | Ekran Tipi | Rol | Amaç | Uyum |
|---|-----------|-----------|-----|------|------|
| 1 | 01-Harita-Arama-Bilgilendirme | Dashboard | Citizen | Harita, konum arama, durum bilgisi | ✅ |
| 2 | 02-Konum-Tespit-Onay | Talep | Citizen | GPS konum doğrulama, konum seçimi | ✅ |
| 3 | 03-Kisi-Sayisi-Secimi | Form | Citizen | Talep girişi - kişi sayısı | ✅ |
| 4 | 04-Güvenlik-Durumu-AFAD | Status | Citizen | Kendi durumunu görme, AFAD senkronizasyonu | ✅ |
| 5 | 05-Bilgilendirme-Paneli | Info Modal | Halk | Acil durum bilgileri, uyarılar, durum paneli | ✅ |
| 6 | 06-Yardim-Istiyorum-SOS | Action | Citizen | Acil SOS çağrısı | ✅ |
| 7 | 07-İhbar-Listesi | List | Citizen | Kendi taleplerinizin listesi | ✅ |
| 8 | 08-İhbar-Detay-Görsel-Ekleme | Detail+Media | Citizen | Talep detayı, fotoğraf/ses ekleme | ✅ |
| 9 | 09-İhtiyac-Türü-Seçimi | Form | Citizen | Talep girişi - ihtiyaç tipi seçimi | ✅ |

### Tasarım Akışı Analizi

```
Vatandaş Login
    ↓
Dashboard (Harita View)
    ├─ Durum Bilgisi Görmek
    │   └─ 05-Bilgilendirme-Paneli
    │
    └─ Yeni Talep Oluşturmak
        ↓
        06-Yardim-Istiyorum-SOS (Hızlı SOS)
        ↓ VEYA
        02-Konum-Tespit-Onay (Konum Seçimi)
        ↓
        03-Kisi-Sayisi-Secimi (Kişi Sayısı)
        ↓
        09-İhtiyac-Türü-Seçimi (İhtiyaç Tipi)
        ↓
        08-İhbar-Detay-Görsel-Ekleme (Medya Ekleme - Opsiyonel)
        ↓
        Talep Kaydedilir (Backend'e gönderilir)
        ↓
        07-İhbar-Listesi (Taleplerim Listesi)
        ↓
        04-Güvenlik-Durumu-AFAD (Durumu Takip Et)
```

---

## 🗄️ Backend Rol Sistemi

### Tanımlı Roller (Backend)

Kaynak: `backend/docs/DATABASE_SCHEMA.md` (Satır 37)

| Rol | ID | Tanım | Tasarımda Kullanılıyor |
|-----|----|----|---|
| **citizen** | citizen | Vatandaş - Talep oluşturur | ✅ ÇOK (9 ekranın tamamı) |
| **volunteer** | volunteer | Gönüllü - Saha görevlisi | ❌ Değil (bu tasarımda) |
| **coordinator** | coordinator | Koordinatör - Görev atama | ❌ Değil (bu tasarımda) |
| **admin** | admin | Admin - Sistem yöneticisi | ❌ Değil (bu tasarımda) |

**Sonuç**: Tasarımlar **100% Citizen Rolü** için yapılmış ✅

---

## 🔐 API Entegrasyon Kontrol Listesi

### Authentication (Hazır ✅)
```
POST   /auth/register      - Vatandaş kayıt (role: "citizen")
POST   /auth/login         - Giriş
GET    /auth/me            - Profil bilgisi
```

### Request/Talep Oluşturma (Hazır ✅)
```
POST   /requests           - Yeni talep oluştur
  Body: {
    latitude: float,
    longitude: float,
    need_type: string,
    person_count: int,
    description?: string
  }

Response: {
  id: UUID,
  status: "pending",
  created_at: timestamp,
  is_verified: boolean
}
```

### Task Packages / Kümeler (Hazır ✅)
```
GET    /requests/prioritized    - Ön3,0004 talepler
GET    /requests/task-packages  - Tüm kümeler
```

### Durumu Takip (Hazır ✅)
```
GET    /requests/{id}      - Talep detayı
PATCH  /requests/{id}/status - Durum güncelleme
```

---

## 📱 Teknoloji Uyumluluğu

### Design System Match ✅

**Renkler (Tasarımdan)**:
- Primary Red: #E63946 ✅
- Orange: #FF6B6B ✅
- White: #FFFFFF ✅
- Dark: #1a1a1a ✅

**NativeWind Tailwind Uyumluluğu**: ✅
```typescript
// Tasarımda kırmızı buton:
<Button className="bg-red-600 text-white px-4 py-2 rounded-2xl">
  SONRAKI
</Button>
```

**Responsiveness**: ✅
- İPhone: 375px (test edilecek)
- Android: 360px+ (test edilecek)

---

## 🚀 İmplementasyon Hazırlığı

### Phase 1: Foundation (Hafta 1-2) - BAŞLAMAK İÇİN HAZIR

**Modüller**:
1. ✅ **Auth Module** (login/register)
   - Frontend: Login/Register formu
   - Backend: Hazır (POST /auth/register, POST /auth/login)
   - Tasarımda: Başlangıç (login > 01-Harita)

2. ✅ **Location Module** (konum seçimi)
   - Frontend: Harita + location picker
   - Backend: Hazır (coğrafi konum desteği)
   - Tasarımda: 02-Konum-Tespit-Onay

3. ✅ **Request Module** (talep oluşturma)
   - Frontend: Multi-step form
   - Backend: Hazır (POST /requests)
   - Tasarımda: 03, 09, 08 ekranlar

### Ekran Geliştirme Sırası (Tavsiye)

1. **Week 1**
   - Login/Register (Auth)
   - Dashboard (Map)
   - Location Picker

2. **Week 2**
   - Create Request Form (Multi-step)
   - Request List

3. **Week 3**
   - Request Detail
   - Media Upload (Photos/Audio)
   - Integration Testing

---

## 📋 Kontrol Listesi - İlk Adım

### ✅ Tamamlanan
- [x] Proje yapısı kuruldu (Expo + TypeScript)
- [x] 6 Modüle ayrıldı (Auth, Location, Request, Vehicle, Alert, Profile)
- [x] Teknoloji stack belirlendi
- [x] API entegrasyon guide yazıldı
- [x] Ekran mimarileri tasarlandı
- [x] Backend rolleri doğrulandı

### 🚀 HEMEN BAŞLANACAK (Week 1)

- [ ] **Auth Module Kodlaması**
  - Login Form Component
  - Register Form Component
  - Zustand authStore
  - Axios API client setup
  - Route Guards

- [ ] **Location Module Başlangıcı**
  - Map View Component
  - Location Picker UI
  - GPS integration (Expo Location)
  - Person Count Input

- [ ] **Setup & Configuration**
  - Tailwind/NativeWind config
  - ESLint + Prettier setup
  - TanStack Query client
  - Environment variables

---

## 🎯 Başlangıç Komutu (İlk Adım)

```bash
cd mobile

# 1. Environment setup
cp .env.example .env.local
# Düzenle: EXPO_PUBLIC_API_URL=http://localhost:8000/api

# 2. Start dev server
npm run start

# 3. Test on Android
npm run android

# 4. OR Test on web (development easier)
npm run web
```

---

## ⚠️ Önemli Notlar

### 1. Rol Seçimi
Tasarımlar **sadece citizen rolü** için yapılmış. Register screen'inde:
```typescript
// Citizen rolünü varsayılan olarak seç
const role = "citizen"  // Sabit
```

### 2. Backend vs Frontend Rolleri
- Backend: 4 rol (citizen, volunteer, coordinator, admin)
- Tasarımlar: Sadece citizen (talep oluşturma)
- **Gelecek Phase'ler**: Coordinator ve volunteer UI'ları (farklı tasarımlar gerekecek)

### 3. Rate Limiting
Backend'de rate limiter var:
```python
# routers/requests.py
_: None = Depends(check_rate_limit)
```
Frontend'de bunu dikkate al (hızlı talep oluşturmaya karşı korunmalı)

### 4. Verification Status
Her talep doğrulanmamış (is_verified: false) başlar:
- Deprem bölgesine yakınlık kontrol edilir
- Coordinator onaylar
- UI bunu göstermeli

---

## 📞 Sorular & Cevaplar

**S: Neden sadece citizen tasarımlanmış?**  
C: Mobil uygulama genel vatandaş kullanıcılar için. Coordinator/Admin kriz-paneli (web) kullanacak.

**S: Volunteer ne zaman?**  
C: Gelecek phase'de. Şu anda volunteer UI tasarımı yok.

**S: Fotoğraf yükleme nasıl?**  
C: React Native Image Picker + Expo API. Backend'de multipart/form-data endpoint hazır.

**S: Offline desteği?**  
C: TanStack Query automatic (cache + refetch). AsyncStorage draft'ları saklar.

**S: Push notifications?**  
C: Şimdilik devre dışı (arka planda bekleyen). FCM entegrasyonu Phase 3'te.

---

## 🎬 ŞİMDİ NE YAPACAĞIZ?

### Hemen Başlayacak: **Auth Module + Location Module**

```
1. Auth Form Components
   ├─ LoginForm.tsx
   ├─ RegisterForm.tsx (role: citizen otomatik)
   ├─ RoleSelector.tsx (gizli/devre dışı - citizen only)
   └─ useAuth hook

2. Location Module
   ├─ MapView.tsx
   ├─ LocationPicker.tsx
   ├─ useLocation hook
   └─ GPS integration

3. API Client
   ├─ Axios instance
   ├─ Interceptors (token handling)
   └─ Services (authService, locationService)

4. Zustand Stores
   ├─ authStore
   ├─ locationStore
   └─ uiStore
```

**Beklenen Zaman**: 3-4 gün (1 hafta)

---

## ✅ Onay & İmza

**Tasarımlar Hazır**: ✅ Evet, 100% citizen rolü için  
**Backend Uyumlu**: ✅ Evet, tüm API endpoint'leri hazır  
**Teknoloji Stack Uyumlu**: ✅ Evet, Expo + React Query + Zustand perfect match  
**İmplementasyona Hazır**: ✅ **EVET - BAŞLAYABILIRIZ**

---

## 📚 Sonraki Adımlar

1. **OK Veriniz** ("Başlayalım" demeniz yeterli)
2. **Auth Module Kodlaması Başlansın**
3. **Günlük Progress Raporları**
4. **Saatlik Kontrol Noktaları** (sorunlar varsa)

---

**Hazırlık Tamamlandı. Başlamaya Hazırız! 🚀**
