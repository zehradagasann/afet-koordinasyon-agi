# RESQ Mobile - Memory Bank & Proje Bağlamı

## 📖 Proje Genel Bilgisi

**Proje Adı**: Afet Koordinasyon Ağı (RESQ)  
**Alt Modul**: React Native Mobil Uygulaması  
**Kuruluş**: Vatandaş-odaklı afet yönetimi  
**Hedef Platform**: iOS & Android (React Native + Expo)

---

## 🎯 Mobil Uygulamanın Amacı

Afet durumlarında gerçek zamanlı koordinasyon sağlayan mobil uygulama:

1. **Vatandaş Tarafı**:
  - Harita üzerinde canlı ihbar oluşturma
  - Konum seçimi ve kişi sayısı bildirme
  - İhtiyaç tiplerini seçme (barınma, yiyecek, tıbbi yardım, vb.)
  - Fotoğraf ve ses kaydı ekleme
  - Yardım talebinin durumunu takip etme
2. **Sistem Tarafı**:
  - Backend (FastAPI) ile REST API entegrasyonu
  - Gerçek zamanlı harita görünümü
  - JWT tabanlı kimlik doğrulama
  - PostgreSQL veritabanıyla veri senkronizasyonu

---

## 🏗️ Backend Mimarisi (Mevcut)

```
Backend: FastAPI (Python)
Database: PostgreSQL + PostGIS (coğrafi veriler)
Auth: JWT Token
API: REST API (http://localhost:8000)

Temel Endpoints:
- POST /api/auth/login
- POST /api/reports           (İhbar oluştur)
- GET  /api/reports           (İhbarları listele)
- GET  /api/clusters/{id}/recommend-vehicles
- POST /api/requests/{id}/assign-vehicle
```

---

## 🎨 Tasarım Dosyalarından Türetilen Özellikler

### İçinden Çıkartılan Akışlar (Tasarım Dökümanından)


| Ekran                  | İşlev                                           | Teknik Gereklilik                         |
| ---------------------- | ----------------------------------------------- | ----------------------------------------- |
| Harita & Arama         | Coğrafi konum seçimi, acil durum haritası       | Maps (React Native Maps), Geolocation API |
| Konum Tespit           | GPS konum doğrulama, harita pinlemesi           | Expo Location, AsyncStorage               |
| Kişi Sayısı            | Kullanıcı tarafından sayı girişi (1-999)        | Input field, validation (Zod)             |
| Güvenlik Durumu        | AFAD ve sistem verilerinden status gösterme     | Backend entegrasyonu, Real-time data      |
| Bilgilendirme Paneli   | Acil durum bilgileri, uyarılar, durum gösterimi | Cards, Badge components                   |
| Yardım İstiyorum (SOS) | Kırmızı buton, acil bildirim gönderme           | Notification service, API call            |
| İhbar Listesi          | Filtreleme, durum gösterimi, sıralama           | TanStack Query, infinite scroll           |
| İhbar Detay            | Tam görünüm, görsel ekleme, sesli not kayıt     | Image Picker, React Hook Form             |
| İhtiyaç Türü           | Dropdown/segmented control seçimi               | React Hook Form + Zod                     |


---

## 📐 Teknik Mimarı Prensipler

### 1. Modüler Yapı

- Her özellik kendi klasöründe (components, hooks, services)
- Cross-cutting concerns (auth, api, validation) ortak klasörlerde
- Feature-based folder structure

### 2. State Management Stratejisi

**Zustand Stores:**

- `authStore`: Kullanıcı bilgisi, token, rol
- `reportStore`: Oluşturulan ihbar draft'ı, geçmiş
- `locationStore`: Seçilen konum, GPS verisi
- `uiStore`: Loading, error, modal states

**TanStack Query:**

- Sunucu veri cachesi (reports, clusters, vehicles)
- Otomatik background refetch
- Offline desteği

### 3. API Entegrasyonu

- **Axios instance** ile merkezi konfigürasyon
- **Interceptor'lar**: Auth header, error handling, retry logic
- **Service layer**: Her domain için ayrı service (authService, reportService, vb.)

### 4. Form Handling

- **React Hook Form**: Form state, validation logic
- **Zod**: TypeScript-native schema validation
- **Custom hooks**: Form submit, async validation

---

## 🔑 Kritik Tasarım Kararları

### ✅ Expo Seçimi Sebepleri

1. Hızlı prototipleme ve hot reload
2. Cihaz API'leriyle native plugin'leri kolayca kullanabilme (GPS, kamera, vb.)
3. Firebase Cloud Messaging (geleceksi bildirimler için hazır)
4. EAS Build sayesinde Mac olmadan iOS build

### ✅ TypeScript Sebepleri

1. Backend FastAPI ile tip güvenliği eşleştirmek
2. Type safety → fewer bugs
3. IDE autocomplete ve refactoring desteği

### ✅ TanStack Query Sebepleri

1. Sunucu veri caching (offline desteği)
2. Otomatik refetch policies
3. Minimal backend çağrıları
4. Optimistic updates

### ✅ Zustand Sebepleri

1. Redux'tan çok daha basit (2KB vs 40KB)
2. UI state (modals, loading, errors) için yeterli
3. Boilerplate yok

---

## 🚨 Backend Veri Modeli (İhtiyaç Duyulan)

```typescript
// Gerekli Backend Endpoints

interface LoginRequest {
  email: string
  password: string
}

interface Report {
  id: string
  userId: string
  location: { lat: number, lon: number }
  personCount: number
  needs: string[]  // ["shelter", "food", "medical", ...]
  status: "new" | "acknowledged" | "assigned" | "resolved"
  createdAt: string
  photoUrl?: string
  audioUrl?: string
  description?: string
}

interface Cluster {
  id: string
  center: { lat: number, lon: number }
  reportCount: number
  personCount: number
  status: "pending" | "assigned" | "resolved"
  assignedVehicle?: Vehicle
}

interface Vehicle {
  id: string
  type: "ambulance" | "truck" | "van" | "bike"
  location: { lat: number, lon: number }
  capacity: number
  stock: Record<string, number>  // { shelter: 100, food: 50, ... }
  status: "available" | "en_route" | "on_site"
}
```

---

## 🔐 Güvenlik Protokolleri

### Authentication Flow

1. Kullanıcı email+password ile login
2. Backend JWT token döndürür
3. Token AsyncStorage'da saklanır
4. Her API call'da `Authorization: Bearer {token}` header'ında gönderilir
5. Token refresh logics Axios interceptor'ında

### Konum İzinleri

- iOS: Info.plist'te izin isteme mesajı
- Android: AndroidManifest.xml'de izin deklarasyonu + runtime permissions
- Kullanıcı reddederse: "Konum izni gereklidir" mesajı

### Depolama

- **AsyncStorage**: Token, basic user data
- **Device filesystem**: İndirilen fotoğraflar (tmp)
- **Backend**: Tüm önemli veriler

---

## 📱 Navigasyon Akışı

```
Root (_layout)
├── (auth) [unauthenticated users]
│   ├── login.tsx
│   ├── register.tsx
│   └── forgot-password.tsx [future]
│
└── (app) [authenticated users]
    ├── (tabs) [Tab Navigation]
    │   ├── index.tsx              [Dashboard/Map]
    │   ├── reports.tsx            [Reports List]
    │   ├── alerts.tsx             [Notifications]
    │   └── profile.tsx            [Profile & Settings]
    │
    ├── report/
    │   ├── [id].tsx               [Report Detail]
    │   └── new.tsx                [Create New Report]
    │
    └── location/
        └── select.tsx             [Location Picker]
```

---

## 🛠️ Geliştirme Ortamı Ayarlanması

### Required Software

- Node.js 18+
- npm/yarn
- Expo CLI (`npm install -g eas-cli`)
- Android Studio + SDK (Android development)
- Xcode (iOS development, macOS only)

### Backend

- Backend FastAPI server (port 8000) çalışıyor olmalı
- `.env` dosyası `EXPO_PUBLIC_API_URL=http://localhost:8000`

### .env.example

```
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_GOOGLE_MAPS_KEY=xxx  [future: harita API]
EXPO_PUBLIC_APP_NAME=RESQ
```

---

## 📊 Bağımlılıklar & İntegrasyon Noktaları

### Internal Dependencies

- **Backend API**: FastAPI REST endpoints
- **PostgreSQL**: Veri depolama
- **PostGIS**: Coğrafi sorgular

### External Services (Future)

- **Firebase Cloud Messaging**: Push notifications
- **Google Maps API**: Gelişmiş harita servisleri
- **OpenRouter/AI**: Chatbot (opsiyonel)

---

## ✅ Geliştirme Takvimi

### Phase 1: Foundation (Week 1-2) — ✅ TAMAMLANDI (2026-05-01)

- Proje setup + paketler (Expo SDK 54, RN 0.81, TS strict)
- Navigation structure (Expo Router: `(auth)`, `(app)`, `request/`*, `requests/[id]`, `status/[id]`)
- Auth akışı (login/register + SecureStore JWT + AuthGate bootstrap)
- Zustand + TanStack Query setup
- NativeWind v4 + tailwind.config.js (RESQ design tokens)
- AsyncStorage persistence (auth + draft)
- iOS/Android izin tanımları (app.json plugins)

### Phase 2: Core Features (Week 3-4) — 🚧 İLERLEMEDE

- Harita + konum seçimi (`react-native-maps` lazy + web fallback)
- İhbar oluşturma formu (3 adımlı: location → persons → needs → detail)
- İhtiyaç tipi seçimi (9 tür, multi-select)
- Fotoğraf yükleme (expo-image-picker + multipart upload)
- AFAD durum takip ekranı (status timeline + 20s polling)
- Reports liste filtreleme/sıralama
- [x] Audio recorder bileşeni (expo-av)
- [x] Tabs navigation (Dashboard / Reports / Alerts / Profile)

### Phase 3: Integration (Week 5-6)

- Backend API integrated (auth/me, requests CRUD, photo upload)
- Real-time data syncing (WebSocket veya polling iyileştirme)
- Bildirim sistemi (FCM)
- Offline queue (drafts AsyncStorage'da bekletme + reconnect sync)
- Vehicle recommendation ekranı (top-3 öneri)

### Phase 4: Polish (Week 7-8)

- Testing + bug fixes
- Performance optimization (FlashList, Reanimated)
- iOS/Android specific fixes
- EAS Build & release

---

## 🎓 Kullanılan Skillsleri

1. **react-native-mobile-design** (saaip7/ipdev-mobileapps-skill)
  - Tasarım referansları
  - Best practices for React Native UI
2. **react-native-best-practices** (callstackincubator/agent-skills)
  - Performance optimization
  - JavaScript profiling
  - Native module usage
3. **github** (callstackincubator/agent-skills)
  - Pull request workflows
  - Code review patterns
4. **upgrading-react-native** (callstackincubator/agent-skills)
  - Version upgrade patterns
  - Dependency management

---

## 🔗 İlgili Dosyalar

- `TECHNOLOGY_STACK.md` - Detaylı teknoloji seçimleri
- `MODULES_PLAN.md` - Modüler mimari detayları
- `API_INTEGRATION.md` - Backend entegrasyon guide
- `SCREENS_ARCHITECTURE.md` - Ekran tasarım referansları
- `app.json` - Expo konfigürasyonu

---

## 📒 Sprint Notları

### 2026-05-01 — Phase 1 Foundation Tamamlama

**Eklenen / Düzeltilen:**

- `tailwind.config.js` ve `metro.config.js` (NativeWind v4 entegrasyonu)
- `@react-native-async-storage/async-storage@2.2.0` (yanlış paket düzeltildi)
- Zustand `persist` middleware (`authStore`, `uiStore` → AsyncStorage)
- `app/(app)/status/[id].tsx` (AFAD timeline ekranı, Tasarım 04)
- `components/location-map.tsx` (react-native-maps + web fallback, Tasarım 02)
- `app.json` plugins (`expo-location`, `expo-image-picker` izin metinleri)
- `constants/theme.ts` RESQ tokens ile yeniden yazıldı
- 13 Eski Expo template kalıntısı silindi (themed-text, parallax-scroll-view vb.)
- `package.json` `typecheck` script eklendi
- Expo Router tab navigasyonu eklendi: `app/(app)/(tabs)` altında `index`, `reports`, `alerts`, `profile`
- `reports` tabı mevcut `requests/list` ekranını tekrar kullanacak şekilde bağlandı
- `alerts` ve `profile` için Phase 2 placeholder ekranları eklendi (logout profile ekranına taşındı)
- Offline talep kuyruğu: ağ yoksa kayıtlar `pendingRequests` olarak saklanıyor, bağlantı gelince `usePendingRequestSync` otomatik gönderim yapıyor (NetInfo)

**Doğrulama:**

- `npx tsc --noEmit` → exit 0
- `npx expo lint` → exit 0

**Mimari Notlar:**

- `react-native-maps` Web bundle'ında native-only `codegenNativeCommands` import ettiği için **platform-specific dosyalara** ayrıldı:
  - `components/location-map.tsx` → iOS + Android (gerçek harita)
  - `components/location-map.web.tsx` → Web (decorative grid + koordinat fallback)
  - Metro `.web.tsx` extension'ını otomatik resolve eder (Expo `getDefaultConfig` default).
- Expo Router `experiments.typedRoutes: true` aktif; yeni route eklendiğinde manifest `expo start` çalışana kadar yenilenmiyor — geçici çözüm: `as never` cast.
- `AuthGate` bootstrap: persisted user varsa anlık authenticated, arka planda `getMe` ile token doğrulama; geçersiz token → SecureStore + Zustand temizlenir.
- API client (`src/services/api.ts`) `AppError` sınıfı ile normalize ediyor; 401'de SecureStore otomatik temizlenir.
- **`experiments.reactCompiler` kapatıldı**: Windows'ta Metro worker'larında V8 OOM (`Fatal process out of memory: Zone`) tetikliyordu. Bundle aslında tamamlanıyor ama crash log'ları gürültü yapıyor. Expo SDK 55+ ile yeniden değerlendirilecek.

**Bilinen Bekleyenler:**

- [x] Alerts ekranını backend `GET /requests/task-packages/override-alerts` verisiyle beslemek
- Audio kaydını backend'e yükleme endpoint'i (şu an yalnızca local draft)
- [x] Offline draft sync queue
- Vehicle recommendation modal/ekranı
- FCM push entegrasyonu

