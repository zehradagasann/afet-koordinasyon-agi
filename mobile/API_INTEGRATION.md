# RESQ Mobile - API Entegrasyon Promptu

Bu prompt, Claude Code veya AI asistanı kullanarak backend API'si ile mobil uygulamayı bağlarken kullanılır.

---

## 📋 Genel Bilgi

- **Backend**: FastAPI (Python) - http://localhost:8000
- **Database**: PostgreSQL + PostGIS
- **Auth**: JWT Token (7 gün geçerlilik)
- **API Style**: REST JSON
- **Mobile Client**: React Native + Expo

---

## 🔑 Temel Ayarlar

### API Base Configuration

```typescript
// src/services/api.ts

import axios, { AxiosInstance } from 'axios'
import * as SecureStore from 'expo-secure-store'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api'

class APIClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor - Auth token ekleme
    this.client.interceptors.request.use(async (config) => {
      const token = await SecureStore.getItemAsync('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Response interceptor - Error handling ve token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true
          // Token refresh logic
        }
        throw error
      }
    )
  }

  getClient() {
    return this.client
  }
}

export const apiClient = new APIClient().getClient()
```

---

## 🔐 Authentication Endpoints

### 1. POST /auth/login
Kullanıcı girişi ve token alma.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 604800,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "citizen",
    "verified": true
  }
}
```

**Implementation:**
```typescript
// src/modules/auth/services/authService.ts

export async function login(email: string, password: string) {
  const response = await apiClient.post('/auth/login', { email, password })
  const { access_token, user } = response.data
  
  // Token sakla
  await SecureStore.setItemAsync('auth_token', access_token)
  
  return user
}
```

### 2. POST /auth/register
Yeni kullanıcı kaydı.

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "Jane Doe",
  "phone": "+90555555555",
  "role": "citizen"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "email": "newuser@example.com",
  "name": "Jane Doe",
  "role": "citizen",
  "verified": false,
  "created_at": "2026-05-01T10:00:00Z"
}
```

### 3. GET /auth/me
Mevcut kullanıcı bilgisi.

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "citizen",
  "phone": "+90555555555",
  "verified": true,
  "created_at": "2026-04-01T10:00:00Z"
}
```

### 4. POST /auth/logout
Logout (token geçersiz kılma).

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## 📍 Report Endpoints

### 1. POST /reports
Yeni ihbar oluşturma.

**Request:**
```json
{
  "location": {
    "lat": 41.0082,
    "lon": 28.9784,
    "accuracy": 10.5
  },
  "person_count": 5,
  "needs": ["shelter", "food"],
  "description": "6 katlı bina çöktü",
  "photos": ["/url/to/photo1.jpg"]
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "location": {
    "lat": 41.0082,
    "lon": 28.9784
  },
  "person_count": 5,
  "needs": ["shelter", "food"],
  "status": "new",
  "cluster_id": null,
  "created_at": "2026-05-01T10:00:00Z"
}
```

**Implementation:**
```typescript
// src/modules/report/services/reportService.ts

export async function createReport(data: ReportDraft) {
  const response = await apiClient.post('/reports', {
    location: data.location,
    person_count: data.personCount,
    needs: data.needs,
    description: data.description,
  })
  
  // Fotoğraflar ayrı upload
  for (const photo of data.photos) {
    await uploadReportPhoto(response.data.id, photo)
  }
  
  return response.data
}

async function uploadReportPhoto(reportId: string, photo: File) {
  const formData = new FormData()
  formData.append('file', photo)
  
  return apiClient.post(`/reports/${reportId}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
```

### 2. GET /reports
İhbar listesi (filtreleme ve pagination).

**Query Parameters:**
```
?status=new,acknowledged
&cluster_id=uuid
&limit=20
&offset=0
&sort=-created_at
```

**Response (200):**
```json
{
  "total": 45,
  "items": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "location": { "lat": 41.0082, "lon": 28.9784 },
      "person_count": 5,
      "needs": ["shelter", "food"],
      "status": "new",
      "cluster_id": null,
      "created_at": "2026-05-01T10:00:00Z"
    }
  ]
}
```

**TanStack Query Integration:**
```typescript
// src/modules/report/hooks/useReports.ts

export function useReports(filters?: ReportFilters) {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: async () => {
      const { data } = await apiClient.get('/reports', { params: filters })
      return data.items
    },
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
  })
}
```

### 3. GET /reports/{id}
İhbar detayı.

**Response (200):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "location": { "lat": 41.0082, "lon": 28.9784 },
  "person_count": 5,
  "needs": ["shelter", "food"],
  "status": "new",
  "description": "6 katlı bina çöktü",
  "photos": ["/url/to/photo1.jpg"],
  "cluster_id": null,
  "created_at": "2026-05-01T10:00:00Z",
  "updated_at": "2026-05-01T10:05:00Z"
}
```

### 4. PATCH /reports/{id}
İhbarı güncelleme (durum güncellemesi).

**Request:**
```json
{
  "status": "acknowledged"
}
```

---

## 🚗 Vehicle & Cluster Endpoints

### 1. GET /clusters/{id}/recommend-vehicles
Bir küme için araç önerileri.

**Query Parameters:**
```
?top_n=3
```

**Response (200):**
```json
{
  "recommendations": [
    {
      "vehicle_id": "uuid",
      "vehicle_type": "truck",
      "capacity": "10 Ton",
      "score": 87.5,
      "distance_km": 5.2,
      "eta_minutes": 8,
      "details": {
        "urgency_score": 82.5,
        "distance_score": 85.3,
        "stock_score": 100.0,
        "speed_score": 75.0
      },
      "recommendation_text": "Bu kümenin 50 çadır ihtiyacı var..."
    }
  ]
}
```

**Implementation:**
```typescript
// src/modules/vehicle/services/vehicleService.ts

export function useVehicleRecommendations(clusterId: string) {
  return useQuery({
    queryKey: ['vehicle-recommendations', clusterId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/clusters/${clusterId}/recommend-vehicles`,
        { params: { top_n: 3 } }
      )
      return data.recommendations
    },
  })
}
```

### 2. POST /requests/{cluster_id}/assign-vehicle
Araç ataması (kümeye).

**Request:**
```json
{
  "vehicle_id": "uuid"
}
```

**Response (200):**
```json
{
  "message": "Araç başarıyla atandı",
  "cluster_id": "uuid",
  "vehicle_id": "uuid",
  "distance_km": 5.2,
  "eta_minutes": 8,
  "status": "assigned"
}
```

---

## 🔄 TanStack Query Setup

### .env dosyası
```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api
EXPO_PUBLIC_API_TIMEOUT=10000
```

### QueryClient Configuration
```typescript
// src/lib/queryClient.ts

import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1 * 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: 1,
    },
  },
})
```

### App.tsx Setup
```typescript
// app/_layout.tsx

import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Navigation & routes */}
    </QueryClientProvider>
  )
}
```

---

## ⚠️ Error Handling

### Backend Error Responses

**400 Bad Request:**
```json
{
  "detail": [
    {
      "loc": ["body", "person_count"],
      "msg": "ensure this value is greater than 0",
      "type": "value_error.number.not_gt"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "detail": "Invalid credentials"
}
```

**403 Forbidden:**
```json
{
  "detail": "Not enough permissions"
}
```

**500 Server Error:**
```json
{
  "detail": "Internal server error"
}
```

### Client-side Error Handling

```typescript
// src/lib/api-error.ts

export class APIError extends Error {
  constructor(
    public status: number,
    public details?: unknown,
    message?: string
  ) {
    super(message || `API Error: ${status}`)
  }
}

// axios interceptor'da
this.client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      throw new APIError(
        error.response.status,
        error.response.data,
        error.response.data?.detail || 'Unknown error'
      )
    }
    throw error
  }
)
```

---

## 📡 Offline Support (TanStack Query)

```typescript
import NetInfo from '@react-native-community/netinfo'

// QueryClient'a network state ekle
useEffect(() => {
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      queryClient.refetchQueries() // Offline sırasında gelen verileri sync et
    }
  })

  return () => unsubscribe()
}, [])
```

---

## 🧪 API Testing Checklist

- [ ] Auth endpoints test edildi
- [ ] Report endpoints test edildi
- [ ] Vehicle endpoints test edildi
- [ ] Error handling çalışıyor
- [ ] Offline → Online sync çalışıyor
- [ ] Token refresh logic çalışıyor
- [ ] CORS sorunları yok
- [ ] Timeout handling düzgün
- [ ] API response types TypeScript'e uyumlu
- [ ] Mock data production data yerine switch edilebiliyor

---

## 📚 Ilgili Dosyalar

- `TECHNOLOGY_STACK.md` - Teknoloji seçimleri
- `MODULES_PLAN.md` - Modüler yapı detayları
- `SCREENS_ARCHITECTURE.md` - Ekran tasarım referansları
- Backend: `docs/API.md` ve `docs/DATABASE_SCHEMA.md`
