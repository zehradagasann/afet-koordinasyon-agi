# RESQ Mobile - Modüler Mimari Planı

## 🎯 Modüler Yapı Felsefesi

Her modul bağımsız olarak geliştirilip, test edilip, bağlanabilecek şekilde tasarlanır. Cross-module dependencies en aza indirilir.

---

## 📦 Modüller

### Module 1: **Authentication Module** (Auth)
**Dosya Yolu:** `src/modules/auth/`

#### Sorumlu Olduğu İşler
- Kullanıcı girişi/kaydı
- JWT token yönetimi
- Oturum kalıcılığı
- Rol kontrolü (Admin, Coordinator, Volunteer, Citizen)

#### Dosya Yapısı
```
src/modules/auth/
├── components/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── RoleSelector.tsx
├── hooks/
│   └── useAuth.ts
├── services/
│   └── authService.ts
├── stores/
│   └── authStore.ts
├── types/
│   └── index.ts
└── index.ts (exports)
```

#### Temel Tipler
```typescript
interface User {
  id: string
  email: string
  name: string
  role: "citizen" | "volunteer" | "coordinator" | "admin"
  phone?: string
  verified: boolean
  createdAt: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
```

#### API Endpoints
```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/refresh-token
```

#### Testleri
- Login form validation
- Token persistence
- Auto-logout on token expiration
- Role-based access

---

### Module 2: **Location Module** (Konum & Harita)
**Dosya Yolu:** `src/modules/location/`

#### Sorumlu Olduğu İşler
- GPS konum alma
- Harita görünümü
- Konum seçimi & pinleme
- Adres reverse geocoding (backend tarafından)

#### Dosya Yapısı
```
src/modules/location/
├── components/
│   ├── MapView.tsx              # Harita container
│   ├── Marker.tsx               # Konum işaretçisi
│   ├── ClusterMarker.tsx         # Küme işaretçisi
│   ├── LocationPicker.tsx        # Interaktif seçim
│   ├── PersonCountInput.tsx      # Kişi sayısı
│   └── ConfirmLocation.tsx       # Konum onay ekranı
├── hooks/
│   ├── useLocation.ts            # GPS ve AsyncStorage
│   ├── useMap.ts
│   └── useGeolocation.ts
├── services/
│   └── locationService.ts
├── stores/
│   └── locationStore.ts
├── types/
│   └── index.ts
└── lib/
    └── geo.ts                    # Haversine vb. fonksiyonlar
```

#### Temel Tipler
```typescript
interface Location {
  lat: number
  lon: number
  accuracy?: number
  altitude?: number
  timestamp: string
}

interface MapState {
  currentLocation: Location | null
  selectedLocation: Location | null
  personCount: number
  clusters: Cluster[]
  zoom: number
  loading: boolean
}

interface Cluster {
  id: string
  center: Location
  reportCount: number
  personCount: number
}
```

#### Izinler
- **iOS**: `NSLocationWhenInUseUsageDescription` (Info.plist)
- **Android**: `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION` (AndroidManifest.xml)
- Runtime: Expo Location permission request

#### Testleri
- GPS accuracy test
- Cluster marker rendering
- Location picker interaction

---

### Module 3: **Report Module** (İhbar & Görev)
**Dosya Yolu:** `src/modules/report/`

#### Sorumlu Olduğu İşler
- İhbar oluşturma
- İhtiyaç tipleri seçimi
- Fotoğraf/ses ekleme
- İhbar listesi & filtreleme
- İhbar detay görünümü

#### Dosya Yapısı
```
src/modules/report/
├── screens/
│   ├── ReportListScreen.tsx      # İhbar listesi
│   ├── ReportDetailScreen.tsx    # İhbar detayı
│   └── CreateReportScreen.tsx    # İhbar oluştur
├── components/
│   ├── ReportForm.tsx
│   ├── ReportCard.tsx
│   ├── NeedsSelector.tsx         # Multi-select needs
│   ├── PhotoUpload.tsx
│   ├── AudioRecorder.tsx
│   ├── ReportStatus.tsx
│   └── FilterBar.tsx
├── hooks/
│   └── useReports.ts             # TanStack Query hooks
├── services/
│   └── reportService.ts
├── stores/
│   └── reportStore.ts            # Draft raporlar
├── types/
│   └── index.ts
└── lib/
    ├── needs.ts                  # İhtiyaç tipleri (enum)
    └── reportFormSchema.ts       # Zod validation
```

#### Temel Tipler
```typescript
type NeedType = "shelter" | "food" | "medical" | "water" | "clothing" | "hygiene" | "heating"

interface Report {
  id: string
  userId: string
  clusterId?: string
  location: Location
  personCount: number
  needs: NeedType[]
  status: "new" | "acknowledged" | "assigned" | "resolved" | "closed"
  photos?: string[]
  audioUrl?: string
  description?: string
  createdAt: string
  updatedAt: string
}

interface ReportDraft {
  location?: Location
  personCount?: number
  needs: NeedType[]
  photos: File[]
  audioUrl?: string
  description?: string
}
```

#### API Endpoints
```
POST   /api/reports                      (İhbar oluştur)
GET    /api/reports                      (Listele)
GET    /api/reports/{id}                 (Detay)
PATCH  /api/reports/{id}                 (Güncelle)
POST   /api/reports/{id}/photos          (Fotoğraf upload)
GET    /api/clusters/{id}/recommend-vehicles
POST   /api/requests/{id}/assign-vehicle
```

#### Offline Support
- Draft reports AsyncStorage'da
- Sync on reconnect via TanStack Query

#### Testleri
- Form validation (Zod)
- Photo upload
- Draft persistence
- List filtering & sorting

---

### Module 4: **Vehicle Module** (Araç Yönetimi)
**Dosya Yolu:** `src/modules/vehicle/`

#### Sorumlu Olduğu İşler
- Araç listesi
- Araç önerisi (backend algoritması)
- Araç atama onayı
- ETA görünümü

#### Dosya Yapısı
```
src/modules/vehicle/
├── components/
│   ├── VehicleList.tsx
│   ├── VehicleCard.tsx
│   ├── RecommendationCard.tsx    # Top-3 önerisi
│   ├── ETADisplay.tsx            # Tahmini varış süresi
│   └── AssignmentConfirm.tsx
├── hooks/
│   └── useVehicles.ts
├── services/
│   └── vehicleService.ts
├── types/
│   └── index.ts
└── lib/
    └── vehicleTypes.ts           # Araç tipleri enum
```

#### Temel Tipler
```typescript
type VehicleType = "ambulance" | "truck" | "van" | "bike" | "helicopter"

interface Vehicle {
  id: string
  type: VehicleType
  capacity: string
  location: Location
  status: "available" | "en_route" | "on_site" | "maintenance"
  stock: Record<NeedType, number>
  assignedCluster?: string
  eta?: number  // minutes
}

interface Recommendation {
  vehicle: Vehicle
  score: number
  details: {
    distance_km: number
    eta_minutes: number
    urgency_score: number
    distance_score: number
    stock_score: number
    speed_score: number
  }
  recommendation_text: string
}
```

#### API Endpoints
```
GET    /api/vehicles
GET    /api/clusters/{id}/recommend-vehicles  (Top-3)
POST   /api/requests/{id}/assign-vehicle
```

#### Testleri
- Recommendation algorithm verification
- ETA calculation
- Vehicle availability status

---

### Module 5: **Alert & Notification Module** (Uyarılar)
**Dosya Yolu:** `src/modules/alert/`

#### Sorumlu Olduğu İşler
- Push bildirim alma
- Bildirim listesi
- Bildirim detayı
- Ses ve titreşim uyarıları

#### Dosya Yapısı
```
src/modules/alert/
├── screens/
│   └── AlertListScreen.tsx
├── components/
│   ├── NotificationBanner.tsx    # Üst banner
│   ├── AlertCard.tsx
│   └── AlertDetail.tsx
├── hooks/
│   └── useNotifications.ts
├── services/
│   └── notificationService.ts
├── stores/
│   └── alertStore.ts
└── types/
    └── index.ts
```

#### Temel Tipler
```typescript
type AlertType = "new_report" | "vehicle_assigned" | "status_update" | "urgent"

interface Alert {
  id: string
  type: AlertType
  title: string
  body: string
  reportId?: string
  clusterId?: string
  read: boolean
  createdAt: string
}
```

#### Push Notification Flow (Future)
- Firebase Cloud Messaging
- Notification handler
- Sound + vibration

#### Testleri
- Local notification trigger
- List rendering
- Mark as read

---

### Module 6: **Profile & Settings Module**
**Dosya Yolu:** `src/modules/profile/`

#### Sorumlu Olduğu İşler
- Kullanıcı profili
- Ayarlar yönetimi
- Logout işlemi
- Versiyon info

#### Dosya Yapısı
```
src/modules/profile/
├── screens/
│   ├── ProfileScreen.tsx
│   └── SettingsScreen.tsx
├── components/
│   ├── ProfileCard.tsx
│   ├── SettingItem.tsx
│   └── LanguagePicker.tsx
├── hooks/
│   └── useProfile.ts
├── services/
│   └── profileService.ts
└── types/
    └── index.ts
```

#### Temel Tipler
```typescript
interface Settings {
  language: "tr" | "en"
  notifications: boolean
  soundEnabled: boolean
  vibrationEnabled: boolean
  darkMode: boolean
}
```

#### Testleri
- Profile data loading
- Settings persistence
- Logout flow

---

## 🔗 Cross-Module Communication

### Dependency Map
```
Authentication
    ↓
All Modules (Auth guard)

Location
    ↓
Report (requires location)

Report
    ↓
Vehicle (recommendation)

Vehicle & Report
    ↓
Alert (notifications)
```

### Best Practices
1. **Modules export index.ts** - Single entry point
2. **Services > Components** - Logic in services
3. **Zustand for module state** - Isolated stores
4. **TanStack Query for server state** - Automatic sync
5. **Custom hooks bridge** - useAuth(), useReports(), etc.

---

## 📊 Module Dependencies Summary

| Module | Depends On | Depended By |
|--------|-----------|------------|
| Auth | - | All others |
| Location | Auth | Report, Vehicle |
| Report | Auth, Location | Vehicle, Alert |
| Vehicle | Auth, Report | Alert |
| Alert | Auth, Report, Vehicle | - |
| Profile | Auth | - |

---

## 🚀 Phase-wise Module Rollout

**Phase 1: Foundation (Week 1-2)**
- [ ] Auth Module (complete)
- [ ] Location Module (basic map)
- [ ] Project structure setup

**Phase 2: Core Features (Week 3-4)**
- [ ] Report Module (create & list)
- [ ] Location Module (picker + confirmation)
- [ ] Vehicle Module (mock data)

**Phase 3: Integration (Week 5-6)**
- [ ] Vehicle Module (real API)
- [ ] Alert Module (local notifications)
- [ ] Real-time updates via TanStack Query

**Phase 4: Polish (Week 7-8)**
- [ ] Profile & Settings Module
- [ ] Offline support
- [ ] Performance optimization
- [ ] E2E testing

---

## ✅ Module Quality Checklist

Her modül için:
- [ ] TypeScript types complete
- [ ] Zod validation schema (if form)
- [ ] Error handling
- [ ] Loading states
- [ ] Unit tests (jest)
- [ ] Integration test with other modules
- [ ] Error boundaries
- [ ] Accessibility (a11y)
- [ ] Responsive design (NativeWind)
- [ ] Offline support (if applicable)
