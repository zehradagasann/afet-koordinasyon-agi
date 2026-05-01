# RESQ Mobile - Teknoloji Stack Dokümantı

**Proje Adı:** RESQ Mobil Uygulaması  
**Platform:** iOS & Android (React Native + Expo)  
**Başlangıç Tarihi:** 2026-05-01  
**Son Güncelleme:** 2026-05-01

---

## 📱 Teknoloji Stack Özeti

### Core Framework
| Teknoloji | Versiyon | Amaç |
|-----------|----------|------|
| React Native | 0.73+ | Mobil uygulama framework'ü |
| Expo SDK | 50+ | Hızlı geliştirme ve deployment |
| TypeScript | 5.x | Tip güvenliği ve IDE desteği |
| Node.js | 18+ | NPM package manager |

### State Management & Data Fetching
| Kütüphane | Versiyon | Amaç |
|-----------|----------|------|
| Zustand | 4.x | Global state management (küçük ve hızlı) |
| TanStack Query | 4.x | Sunucu durumu yönetimi ve caching |
| AsyncStorage | 1.x | Cihaz üzerinde veri depolama |

### UI & Styling
| Kütüphane | Versiyon | Amaç |
|-----------|----------|------|
| NativeWind | 2.x | Tailwind CSS for React Native |
| Lucide React Native | 0.x | Icon set (200+ ikon) |
| React Native Maps | 1.x | Harita görünümü ve coğrafi veriler |

### Navigation
| Kütüphane | Versiyon | Amaç |
|-----------|----------|------|
| React Navigation | 6.x | Multi-screen navigation |
| React Navigation Native Stack | 6.x | Native stack navigator |
| React Navigation Bottom Tabs | 6.x | Alt sekme navigasyonu |

### Forms & Validation
| Kütüphane | Versiyon | Amaç |
|-----------|----------|------|
| React Hook Form | 7.x | Form state yönetimi (hafif) |
| Zod | 3.x | TypeScript-first şema validasyonu |
| @hookform/resolvers | 3.x | Zod ile React Hook Form entegrasyonu |

### API & Networking
| Kütüphane | Versiyon | Amaç |
|-----------|----------|------|
| Axios | 1.x | HTTP client (interceptors desteği) |
| Expo Image Picker | 14.x | Cihaz kütüphanesinden fotoğraf seçme |
| Expo Location | 16.x | GPS ve konum servisleri |

### DevTools & Testing
| Araç | Versiyon | Amaç |
|------|----------|------|
| ESLint | 8.x | Kod kalitesi kontrol |
| Prettier | 3.x | Kod formatı |
| Jest | 29.x | Unit testleri |

---

## 🗂️ Proje Dosya Yapısı

```
mobile/
├── app/                              # Expo Router ile ekranlar
│   ├── (auth)/                       # Auth ekranları (drawer dışı)
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── _layout.tsx
│   │
│   ├── (app)/                        # Tab navigasyonu
│   │   ├── (tabs)/                   # Bottom tab navigator
│   │   │   ├── index.tsx             # Harita & Dashboard
│   │   │   ├── reports.tsx           # İhbar Listesi
│   │   │   ├── alerts.tsx            # Bildirimler & Uyarılar
│   │   │   ├── profile.tsx           # Profil & Ayarlar
│   │   │   └── _layout.tsx
│   │   │
│   │   ├── report/
│   │   │   ├── [id].tsx              # İhbar Detayı
│   │   │   ├── new.tsx               # Yeni İhbar Oluştur
│   │   │   └── _layout.tsx
│   │   │
│   │   ├── location/
│   │   │   ├── select.tsx            # Konum Seçimi
│   │   │   └── _layout.tsx
│   │   │
│   │   ├── _layout.tsx               # App layout (auth guard)
│   │
│   ├── _layout.tsx                   # Root layout
│
├── src/
│   ├── components/
│   │   ├── ui/                       # Temel UI bileşenleri
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   │
│   │   ├── map/                      # Harita bileşenleri
│   │   │   ├── MapView.tsx
│   │   │   ├── Marker.tsx
│   │   │   └── ClusterMarker.tsx
│   │   │
│   │   ├── report/                   # İhbar bileşenleri
│   │   │   ├── ReportForm.tsx
│   │   │   ├── ReportCard.tsx
│   │   │   ├── NeedsSelector.tsx
│   │   │   └── PhotoUpload.tsx
│   │   │
│   │   ├── location/                 # Konum bileşenleri
│   │   │   ├── LocationPicker.tsx
│   │   │   ├── PersonCount.tsx
│   │   │   └── ConfirmLocation.tsx
│   │   │
│   │   ├── auth/                     # Auth bileşenleri
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── RoleSelector.tsx
│   │   │
│   │   └── common/                   # Ortak bileşenler
│   │       ├── Header.tsx
│   │       ├── SafeAreaView.tsx
│   │       └── ErrorBoundary.tsx
│   │
│   ├── stores/                       # Zustand stores
│   │   ├── authStore.ts
│   │   ├── reportStore.ts
│   │   ├── locationStore.ts
│   │   └── uiStore.ts
│   │
│   ├── services/                     # API servisleri
│   │   ├── api.ts                    # Axios instance
│   │   ├── authService.ts
│   │   ├── reportService.ts
│   │   ├── vehicleService.ts
│   │   └── mapService.ts
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useReports.ts
│   │   ├── useLocation.ts
│   │   ├── useClusters.ts
│   │   └── useForm.ts
│   │
│   ├── lib/
│   │   ├── validation.ts             # Zod şemaları
│   │   ├── constants.ts              # Sabitler
│   │   ├── colors.ts                 # Renk paleti
│   │   ├── needs.ts                  # İhtiyaç tipleri
│   │   └── geo.ts                    # Coğrafi fonksiyonlar
│   │
│   ├── types/
│   │   ├── index.ts                  # Tüm TypeScript tipleri
│   │   ├── api.ts                    # API yanıt tipleri
│   │   └── domain.ts                 # Business logic tipleri
│   │
│   └── utils/
│       ├── navigation.ts
│       ├── storage.ts                # AsyncStorage wrapper
│       ├── validation.ts
│       └── formatting.ts
│
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── app.json                          # Expo app.json
├── .env.example
└── README.md
```

---

## 🎯 Teknoloji Seçim Gerekçeleri

### Neden Expo?
- ✅ Firebase entegrasyonu kolay
- ✅ Hızlı geliştirme ve hot reload
- ✅ Cihaz kütüphanelerine yüksek seviye API'ler
- ✅ EAS Build ile kolayca iOS/Android derlemesi
- ✅ Bare workflow'a upgrade edilebilir

### Neden Zustand?
- ✅ Redux'tan çok daha küçük (2KB)
- ✅ Doğrudan React state gibi kullanım
- ✅ DevTools desteği
- ✅ TypeScript çok iyi destekleniyor
- ❌ Redux gerekli değil (sadece auth + UI state)

### Neden TanStack Query?
- ✅ Sunucu verilerini otomatik cache ve sync eder
- ✅ Otomatik background refetch
- ✅ Offline desteği
- ✅ Performans optimizasyonları
- ✅ Backend'e minimum istek gönder

### Neden Axios?
- ✅ Interceptor'lar (auth token ekleme, error handling)
- ✅ Request/Response transformasyon
- ✅ Cancel token'lar (request iptal etme)
- ✅ Daha hoş API (fetch'e kıyasla)

### Neden React Hook Form + Zod?
- ✅ Minimal re-render
- ✅ Performant form handling
- ✅ TypeScript native validation (Zod)
- ✅ Otomatik form state yönetimi

### Neden NativeWind?
- ✅ Tailwind CSS bilenlere tanıdık
- ✅ Utility-first approach
- ✅ Responsive design desteği
- ✅ Dark mode hazır

---

## 🔌 Backend Entegrasyonu

### FastAPI Backend Bağlantısı
```
Backend URL: http://localhost:8000  (dev)
             https://api.resq.com   (prod)

Authentication: JWT Token (Authorization: Bearer {token})
Content-Type: application/json
```

### Örnek API Çağrıları
```typescript
// Axios instance ile otomatik auth header ekleme
GET    /api/auth/login
POST   /api/reports
GET    /api/reports?cluster_id=xxx
GET    /api/clusters/{id}/recommend-vehicles
POST   /api/requests/{id}/assign-vehicle
```

---

## 📦 Build & Deployment

### Development
```bash
npm run start      # Expo dev server
npm run android    # Android emülatör
npm run ios        # iOS simulator
npm run web        # Web preview
```

### Production
```bash
eas build --platform ios
eas build --platform android
eas submit --platform ios
eas submit --platform android
```

---

## 🔒 Güvenlik

- **Auth**: JWT token (AsyncStorage'da saklanır)
- **API**: HTTPS + token doğrulama
- **Konum**: Kullanıcı izni gerekli (GPS)
- **Depolama**: AsyncStorage (cihaz veritabanı)
- **Env**: .env.local (git'te yok)

---

## ✅ Teslimat Kontrol Listesi

- [ ] Expo proje yapısı kurulmuş
- [ ] TypeScript konfigürasyonu düzgün
- [ ] Tüm paketler yüklü ve working
- [ ] .env.example oluşturulmuş
- [ ] Backend bağlantısı test edilmiş
- [ ] İlk ekranlar tasarıma uygun
- [ ] Navigasyon düzgün çalışıyor
- [ ] Jest/ESLint konfigüre edilmiş
