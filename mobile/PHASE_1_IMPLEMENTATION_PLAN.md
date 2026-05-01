# RESQ Mobile - Phase 1 Implementasyon Planı

**Başlangıç**: 2026-05-01  
**Hedef Bitiş**: 2026-05-14 (2 hafta)  
**Çalışma Saati**: Günlük 4-6 saat

---

## 📅 İçindekiler

1. [Hafta 1 - Foundation](#hafta-1---foundation)
2. [Hafta 2 - Core Features](#hafta-2---core-features)
3. [Günlük Milestone'lar](#günlük-milestones)
4. [Testing Stratejisi](#testing-stratejisi)
5. [Riskler & Mitigations](#riskler--mitigations)

---

## 📌 Phase 1 Hedefleri

### Sonunda Elde Edilecekler
- ✅ Çalışan login/register flow
- ✅ Harita ile konum seçimi
- ✅ Multi-step talep oluşturma formu
- ✅ API entegrasyonu (backend ile senkron)
- ✅ Offline desteği (draft'lar)
- ✅ Zustand + TanStack Query working
- ✅ TypeScript strict, no `any` types
- ✅ iOS + Android test edilmiş

---

## 📈 Hafta 1 - Foundation

### Gün 1: Project Setup & API Client
**Süresi**: 4-5 saat  
**Modülü**: Core Setup

#### Tasks
```
1. ESLint + Prettier Configuration
   ├─ Create .eslintrc.json
   ├─ Create .prettierrc.json
   └─ Run linting on existing code

2. Tailwind/NativeWind Configuration
   ├─ Configure tailwind.config.js
   ├─ Setup NativeWind in app
   └─ Create color system (colors.ts)

3. API Client Setup
   ├─ Create src/services/api.ts (Axios instance)
   ├─ Add interceptors (auth token, errors)
   ├─ Create error handling class (APIError)
   └─ Test with backend /auth/login

4. Environment Setup
   ├─ Create .env.local from .env.example
   ├─ Add EXPO_PUBLIC_API_URL
   └─ Test env variables load correctly

5. Type System
   ├─ Create src/types/index.ts (User, Auth types)
   ├─ Create Zod schemas (auth.ts)
   └─ Test TypeScript compilation
```

**Completion Criteria**:
- [ ] npm run lint → No errors
- [ ] Axios instance connects to backend
- [ ] /auth/login endpoint responds
- [ ] TypeScript strict mode → No issues

---

### Gün 2: Zustand & TanStack Query Setup
**Süresi**: 4-5 saat  
**Modülü**: State Management

#### Tasks
```
1. TanStack Query Client
   ├─ Create src/lib/queryClient.ts
   ├─ Configure staleTime, gcTime, retry
   ├─ Add QueryClientProvider to app root
   └─ Add DevTools (optional, for debugging)

2. Zustand Stores
   ├─ Create src/stores/authStore.ts
   │   ├─ State: user, token, isLoading, error
   │   ├─ Actions: setAuth, logout, clearError
   │   └─ Hydration from AsyncStorage
   │
   ├─ Create src/stores/locationStore.ts
   │   ├─ State: currentLocation, selectedLocation, personCount
   │   └─ Actions: setLocation, setPersonCount
   │
   └─ Create src/stores/uiStore.ts
       ├─ State: loading, error, toast
       └─ Actions: setLoading, setError, showToast

3. Custom Hooks
   ├─ Create src/hooks/useAuth.ts
   │   └─ Return auth state & actions
   │
   └─ Create src/hooks/useLocation.ts
       └─ Return location state & actions

4. Testing Hooks
   ├─ Test authStore initialization
   ├─ Test locationStore setters
   └─ Test custom hooks work
```

**Completion Criteria**:
- [ ] Zustand stores persist to AsyncStorage
- [ ] TanStack Query DevTools visible
- [ ] Hooks return correct state
- [ ] No memory leaks in store

---

### Gün 3: Auth Module - Login & Register Forms
**Süresi**: 5-6 saat  
**Modülü**: Auth Module

#### File Structure
```
src/modules/auth/
├── components/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── RoleSelector.tsx (gizli - citizen default)
├── hooks/
│   └── useAuth.ts
├── services/
│   └── authService.ts
├── types/
│   └── index.ts
└── index.ts
```

#### Tasks - LoginForm.tsx
```typescript
// src/modules/auth/components/LoginForm.tsx

Features:
- React Hook Form + Zod validation
- Email & password fields
- Loading state + error display
- Submit → authService.login() → Zustand store
- Navigation to Dashboard on success
- Validation rules:
  ├─ Email: valid email format
  └─ Password: min 6 chars

Styling:
- NativeWind (Tailwind)
- Red (#E63946) submit button
- Standard gray inputs
- Error messages in red
```

**Code Outline**:
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '../types/index'
import { useMutation } from '@tanstack/react-query'
import { authService } from '../services/authService'

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  })
  
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (user) => {
      // Save to authStore
      // Navigate to dashboard
    }
  })
  
  return (
    // Form JSX
  )
}
```

#### Tasks - RegisterForm.tsx
```typescript
// src/modules/auth/components/RegisterForm.tsx

Features:
- Multi-field form
- Role: "citizen" (hardcoded, not shown)
- Fields: email, password, name, phone, tc_no, city, district
- Validation per field
- Submit → authService.register()
- T.C. ID format: 11 digits

Fields Validation:
├─ email: valid email
├─ password: min 8, uppercase, number, special char
├─ first_name: min 2 chars
├─ last_name: min 2 chars
├─ phone: Turkish format (055...)
├─ tc_identity_no: exactly 11 digits
├─ city: required
└─ district: required

Styling:
- Same as login (consistency)
- Red submit button
- Inline error messages
```

#### Tasks - Services
```typescript
// src/modules/auth/services/authService.ts

Functions:
- login(email, password) → JWT + user
  └─ Calls POST /auth/login
  └─ Stores token in SecureStore
  └─ Returns user object

- register(data) → JWT + user
  └─ Calls POST /auth/register
  └─ role: "citizen" hardcoded
  └─ Returns user object

- logout()
  └─ Clears token
  └─ Clears Zustand store

- getCurrentUser(token) → user
  └─ Calls GET /auth/me
```

**Completion Criteria**:
- [ ] Login form submits and logs in
- [ ] Register form creates user with role=citizen
- [ ] JWT token saved securely
- [ ] Navigation works after login
- [ ] Form validation shows errors
- [ ] E2E test: register → login → dashboard works

---

### Gün 4-5: Location Module - Map & GPS
**Süresi**: 8-10 saat  
**Modülü**: Location Module

#### File Structure
```
src/modules/location/
├── components/
│   ├── MapView.tsx
│   ├── LocationPicker.tsx
│   └── PersonCountInput.tsx
├── hooks/
│   ├── useLocation.ts
│   └── useMap.ts
├── services/
│   └── locationService.ts
└── types/
    └── index.ts
```

#### Tasks - MapView.tsx
```typescript
// src/modules/location/components/MapView.tsx

Features:
- React Native Maps
- Current GPS location (blue marker)
- Tap to select location (orange marker)
- Cluster markers (kümeleme)
- Zoom in/out buttons
- Attribution / map type toggle

Props:
- onLocationSelected(lat, lon)
- showClusters?: boolean
- initialLocation?: {lat, lon}

State:
- mapRegion (center, zoom)
- selectedLocation
- currentLocation (GPS)
- clusters (optional)

Styling:
- Full width/height
- Header with search/info
- Bottom controls

Interaction:
1. GPS on startup → centerMap
2. User tap → set selectedLocation
3. Button press → zoom level change
```

**Code Outline**:
```typescript
import MapView, { Marker } from 'react-native-maps'
import { useLocation } from '../hooks/useLocation'

export const MapViewComponent = ({ onLocationSelected }) => {
  const { currentLocation, selectedLocation, setSelectedLocation } = useLocation()
  const [region, setRegion] = useState({...})
  
  useEffect(() => {
    // Request location permission
    // Get current GPS
    // Center map
  }, [])
  
  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate
    setSelectedLocation(latitude, longitude)
    onLocationSelected(latitude, longitude)
  }
  
  return (
    <MapView
      region={region}
      onPress={handleMapPress}
    >
      <Marker coordinate={currentLocation} pinColor="blue" />
      <Marker coordinate={selectedLocation} pinColor="orange" />
    </MapView>
  )
}
```

#### Tasks - LocationPicker.tsx
```typescript
// 02-Konum-Tespit-Onay.tsx ekranı

Features:
- Map displayed (MapView)
- Location confirmation UI
- Person count (1-999)
- "Seçili Konum:" göstermesi
- "SONRAKI" button → person count screen
- "GERİ" button → back

State Flow:
1. User sees map with selected location
2. User confirms location
3. User enters person count
4. Click SONRAKI → navigate to next step

Integration:
- locationStore: selectedLocation
- navigation: push('report/new')
```

#### Tasks - GPS Integration
```typescript
// src/modules/location/hooks/useLocation.ts

Functions:
- requestPermission() → boolean
  └─ iOS: NSLocationWhenInUseUsageDescription
  └─ Android: ACCESS_FINE_LOCATION runtime

- getCurrentLocation() → {lat, lon, accuracy}
  └─ Expo.Location
  └─ High accuracy
  └─ Timeout: 30 seconds

- watchLocation() → unsubscribe
  └─ Continuous GPS updates
  └─ For real-time movement

- reverseGeocode(lat, lon) → address (future)
  └─ Optional: Postcode API

Error Handling:
- User denies permission → Show message
- GPS timeout → Retry or manual input
- Network error → Cache last known location
```

**Completion Criteria**:
- [ ] Map renders without errors
- [ ] GPS permission requested & granted
- [ ] Current location shown as blue marker
- [ ] Tap on map sets orange marker
- [ ] Location picker screen navigates properly
- [ ] Person count input: 1-999 validation
- [ ] Works on both iOS simulator & Android emulator

---

## 📈 Hafta 2 - Core Features

### Gün 6-7: Request Module - Multi-Step Form
**Süresi**: 8-10 saat  
**Modülü**: Request Module

#### File Structure
```
src/modules/request/
├── components/
│   ├── ReportForm.tsx
│   ├── NeedsSelector.tsx
│   ├── PhotoUpload.tsx
│   └── AudioRecorder.tsx
├── screens/
│   ├── CreateReportScreen.tsx
│   └── ReportListScreen.tsx
├── hooks/
│   └── useReports.ts
├── services/
│   └── reportService.ts
└── types/
    └── index.ts
```

#### Tasks - Multi-Step Form (03, 09, 08 Screens)

**Step 1: Person Count (03-Kisi-Sayisi-Secimi.png)**
```typescript
- Header: "ADIM 1 / 4"
- Title: "KİŞİ SAYISI"
- Input: Person count (1-999)
- Buttons: SONRAKI, GERİ

Validation: min 1, max 999
State: reportStore.draft.personCount
```

**Step 2: Needs Selection (09-İhtiyac-Türü-Seçimi.png)**
```typescript
- Header: "ADIM 2 / 4"
- Title: "İHTİYAÇ TÜRÜ"
- Options: 
  ├─ BESLENME (food)
  ├─ TIBBİ YARDIM (medical)
  ├─ KURTARMA (rescue)
  ├─ ISINMA (heating)
  └─ (more: water, shelter, clothing, hygiene)
- Multi-select (checkboxes)

State: reportStore.draft.needs[]
Validation: min 1 selected
```

**Step 3: Additional Info (08-İhbar-Detay-Görsel-Ekleme.png)**
```typescript
- Header: "ADIM 3 / 4"
- Title: "EK BİLGİ"
- Description text field (optional)
- Photo upload button
- Audio record button
- Media preview (thumbnails)

Components:
- ImagePicker (Expo)
- AudioRecorder (Expo)
- MediaPreview component

State: reportStore.draft.{photos, audioUrl, description}
```

**Step 4: Review & Submit (Derived)**
```typescript
- Header: "ADIM 4 / 4"
- Title: "TALEP ÖZETI"
- Show all fields:
  ├─ Location
  ├─ Person count
  ├─ Needs
  ├─ Description
  └─ Media count
- Submit button → POST /requests
- Loading spinner
- Error message
- Success toast
```

#### Tasks - Components

**PhotoUpload.tsx**:
```typescript
- ImagePicker.launchCameraAsync()
- Or: ImagePicker.launchImageLibraryAsync()
- Preview: Image component
- Delete button
- Max 5 photos

State: File[] in reportStore
```

**NeedsSelector.tsx**:
```typescript
- Multi-select buttons/checkboxes
- Icons per need type
- Colors: Red (selected), Gray (unselected)
- At least 1 required
```

**Completion Criteria**:
- [ ] All 4 steps navigate correctly
- [ ] Form data persisted in Zustand
- [ ] Photo/audio upload works
- [ ] Submit button calls POST /requests
- [ ] Success → navigate to ReportList
- [ ] Error → show message & allow retry
- [ ] Offline: draft saved, submit on reconnect

---

### Gün 8-9: API Integration & Testing
**Süresi**: 6-8 saat  
**Modülü**: Integration

#### Tasks

**1. TanStack Query Hooks**
```typescript
// src/modules/request/hooks/useReports.ts

- useReports() → Get all reports
  └─ TanStack Query
  └─ Pagination
  └─ Sorting

- useCreateReport() → Mutation
  └─ POST /requests
  └─ Upload photos separately
  └─ Invalidate cache after

- useReportDetail(id) → Get single report
```

**2. Error Handling**
```typescript
- Network error → retry
- 400 validation error → show message
- 401 auth error → redirect to login
- 500 server error → show generic message
```

**3. Offline Support**
```typescript
- Draft reports in AsyncStorage
- Sync on reconnect
- Show "Offline" banner
- Queue failed requests
```

**4. Testing**
```
Tests:
- ✅ Login with valid credentials
- ✅ Login with invalid credentials
- ✅ Register new user
- ✅ Create report with all fields
- ✅ Create report without optional fields
- ✅ Fetch reports list
- ✅ Upload photos
- ✅ Offline → Online sync
- ✅ Rate limiting (slow down after 5 reqs/min)
```

---

### Gün 10: Navigation & Screens Wiring
**Süresi**: 4-5 saat  
**Modülü**: Navigation

#### Tasks

**1. Expo Router Setup**
```
app/
├── (auth)/
│   ├── login.tsx
│   ├── register.tsx
│   └── _layout.tsx
├── (app)/
│   ├── (tabs)/
│   │   ├── index.tsx (Dashboard/Map)
│   │   ├── reports.tsx (Report List)
│   │   ├── alerts.tsx (Placeholder)
│   │   └── profile.tsx (Placeholder)
│   ├── report/
│   │   ├── new.tsx (Multi-step form)
│   │   └── [id].tsx (Detail)
│   └── _layout.tsx
└── _layout.tsx (Root)
```

**2. Route Guards**
```typescript
- If not authenticated → (auth) routes
- If authenticated → (app) routes
- Token check on app startup
```

**3. Navigation Flow**
```
Login → Dashboard
       ├─ Create Report → Multi-step form
       ├─ View Reports → Report List
       └─ View Details → Report Detail
```

**Completion Criteria**:
- [ ] Auth guard works
- [ ] All routes navigable
- [ ] Parameters pass correctly
- [ ] Back button works
- [ ] Deep linking (if applicable)

---

### Gün 11-12: Testing & Polish
**Süresi**: 8-10 saat  
**Modülü**: QA & Polish

#### Testing Checklist

**Manual Testing**:
- [ ] iOS simulator
  - [ ] Login/Register
  - [ ] Map view
  - [ ] Form submission
  - [ ] Photo upload
  - [ ] Navigation

- [ ] Android emulator
  - [ ] Same tests as iOS
  - [ ] Android-specific features
  - [ ] Back button behavior

**Edge Cases**:
- [ ] No GPS permission → fallback UI
- [ ] Slow network → loading states
- [ ] App backgrounded → resume
- [ ] No internet → offline mode
- [ ] Very long text inputs → truncation
- [ ] Large photos → compression

**Performance**:
- [ ] Map doesn't lag with cluster markers
- [ ] Form doesn't have unnecessary re-renders
- [ ] Images loaded with thumbnails
- [ ] No memory leaks

**Styling**:
- [ ] Colors match design (#E63946, etc.)
- [ ] Spacing consistent (16px grid)
- [ ] Border radius correct (12px cards, 24px buttons)
- [ ] Typography legible
- [ ] Dark mode check (if applicable)

#### Polish Tasks

**1. Error Messages**
```
- Validation errors → inline
- API errors → toast/banner
- Network errors → persistent message
- User-friendly language (not tech jargon)
```

**2. Loading States**
```
- Show spinner during requests
- Disable button while loading
- Cancel long requests (timeout)
```

**3. Accessibility**
```
- Labels for all inputs
- Color contrast > 4.5:1
- Touch targets >= 44x44 pt
- Keyboard navigation
- Screen reader friendly
```

**4. Performance Optimization**
```
- Lazy load images
- Memoize expensive components
- Optimize TanStack Query config
- Profile with DevTools
```

---

### Gün 13-14: Final Testing & Deployment Prep
**Süresi**: 6-8 saat  
**Modülü**: QA & Release

#### Tasks

**1. Full Regression Testing**
- [ ] All features work end-to-end
- [ ] No regressions from Phase 1
- [ ] All error cases handled
- [ ] Offline/online sync works

**2. Performance Profiling**
- [ ] Bundle size check
- [ ] Memory profile
- [ ] Frame rate test (should be 60 FPS)
- [ ] Load time measurement

**3. Build & Package**
```bash
# Prepare for EAS build
eas build --platform android
eas build --platform ios
```

**4. Documentation**
- [ ] README updated with setup
- [ ] Known issues documented
- [ ] Troubleshooting guide
- [ ] Architecture decisions recorded

**5. Code Quality**
```bash
npm run lint → No errors
npm run format → All files formatted
npx tsc --noEmit → No TypeScript errors
npm test → All tests pass
```

---

## 📊 Günlük Milestones

### Week 1

| Gün | Modül | Checkpoint | Beklenen Output |
|-----|-------|-----------|-----------------|
| 1 | Setup | ESLint, TailwindCSS, API | Lint ✅, API connects ✅ |
| 2 | State | Zustand, TanStack Query | Stores work, persist ✅ |
| 3 | Auth | Login/Register forms | Can login/register ✅ |
| 4-5 | Location | Maps, GPS, Picker | Map renders, GPS works ✅ |

**End of Week 1 Objective**: Konum seçme ve talep başlatma kadar

### Week 2

| Gün | Modül | Checkpoint | Beklenen Output |
|-----|-------|-----------|-----------------|
| 6-7 | Request | Multi-step form | All 4 steps work ✅ |
| 8-9 | Integration | API hooks, offline | API calls work ✅, offline ✅ |
| 10 | Navigation | Route setup | All screens connected ✅ |
| 11-12 | Testing | Manual + edge cases | iOS/Android tested ✅ |
| 13-14 | Polish | Performance, build | EAS build ready ✅ |

**End of Phase 1 Objective**: Full vatandaş talep oluşturma akışı

---

## 🧪 Testing Stratejisi

### Unit Tests
```typescript
// Auth validation
test('loginSchema validates email format')
test('personCountSchema min/max validation')

// Store actions
test('authStore.setAuth saves user')
test('locationStore.setLocation updates state')

// Services
test('authService.login calls correct endpoint')
test('reportService.createReport sends correct payload')
```

### Integration Tests
```typescript
// E2E flows
test('User can register, login, create report')
test('Report persists to backend')
test('Offline draft syncs when online')
```

### Manual Testing Checklist
- [ ] iOS 14+, iPhone X/12/13/14
- [ ] Android 8+, Pixel 4/5, Samsung Galaxy
- [ ] Network: Fast 4G, Slow 3G, Offline
- [ ] Permissions: GPS, Camera, Photo Library
- [ ] Screen sizes: 375px to 480px width

---

## ⚠️ Riskler & Mitigations

### Risk 1: GPS Permission Delays
**Problem**: GPS permission modal blocks flow  
**Mitigation**:
- Request early (app startup)
- Show clear explanation
- Fallback to manual location input

### Risk 2: Large Photo Upload
**Problem**: Network bandwidth  
**Mitigation**:
- Compress before upload
- Show upload progress
- Queue if offline

### Risk 3: Form State Loss
**Problem**: App crash loses draft  
**Mitigation**:
- Save draft to AsyncStorage after each field
- Restore on app relaunch
- Show warning if unsaved changes

### Risk 4: Rate Limiting
**Problem**: Backend limits requests  
**Mitigation**:
- Check backend rate limit config
- Add client-side debounce
- Show "Please wait" message

### Risk 5: TypeScript Complexity
**Problem**: Strict mode too strict  
**Mitigation**:
- Gradual migration (allow `unknown` → type guard)
- Use `satisfies` operator
- Create strict type utilities

---

## 📋 Phase 1 Completion Checklist

### Features
- [ ] Login/Register flow works
- [ ] Map renders and allows location selection
- [ ] Multi-step form validates all fields
- [ ] Photos/audio can be uploaded
- [ ] API integration working
- [ ] Offline drafts persist

### Quality
- [ ] No TypeScript errors (`tsc --noEmit`)
- [ ] ESLint clean (`npm run lint`)
- [ ] Prettier formatted (`npm run format`)
- [ ] 60 FPS on iOS & Android
- [ ] Bundle size < 50MB (uncompressed)

### Testing
- [ ] Manual tests on iOS simulator
- [ ] Manual tests on Android emulator
- [ ] All edge cases handled
- [ ] Network error scenarios tested
- [ ] Offline/online transitions tested

### Documentation
- [ ] CLAUDE.md updated
- [ ] API_INTEGRATION.md validated
- [ ] SCREENS_ARCHITECTURE.md matches reality
- [ ] Known issues documented
- [ ] Setup guide tested from scratch

---

## 📞 Daily Check-ins

### Each Day, Report:
1. **What was completed**
2. **What's planned tomorrow**
3. **Blockers or issues**
4. **Code commits with descriptive messages**

### Weekly Review (Every Friday):
1. **Milestone achieved**: ✅ or ❌
2. **Adjustments needed**
3. **Risk assessment**
4. **Next week preview**

---

## 🎯 Success Criteria for Phase 1

**By End of Week 2**:
- ✅ User can login with test account
- ✅ User can create new report
- ✅ User can select location on map
- ✅ User can add photos to report
- ✅ Report submitted to backend
- ✅ Works on iOS & Android
- ✅ No console errors
- ✅ TypeScript strict mode pass

**Phase 1 Duration**: ~80-100 hours (2 weeks @ 40-50 hours/week)

---

**Şimdi başlamaya hazırız! 🚀**

Başlangıç Komutu:
```bash
cd mobile
npm run start

# Choose: web (for faster development)
# Then: Press 'w' to open web
```

**Sonraki Adım**: Auth Module Kodlaması (Gün 1-3)
