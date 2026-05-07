# API Entegrasyon Rehberi

Backend: FastAPI — `EXPO_PUBLIC_API_URL` env değişkeniyle yapılandırılır (varsayılan: `http://localhost:8000`).

## Axios İstemcisi

`src/services/api.ts` — tüm servislerin kullandığı merkezi istemci:

- Her istekte `Authorization: Bearer <token>` başlığı otomatik eklenir (SecureStore'dan)
- 401 → token silinir, kullanıcı login'e yönlendirilir
- FastAPI `detail` hataları `AppError` sınıfına dönüştürülür
- `AppError` özellikleri: `message`, `statusCode`, `isNetworkError`, `isUnauthorized`, `isNotFound`, `isRateLimited`

## Kimlik Doğrulama — `/auth`

| Method | Endpoint | Açıklama |
|--------|----------|---------|
| POST | `/auth/login` | `{email, password}` → `{access_token, user}` |
| POST | `/auth/register` | `{email, password, full_name, phone, role}` → `{access_token, user}` |
| GET | `/auth/me` | Mevcut kullanıcı profili |

Token `expo-secure-store`'da `resq_access_token` anahtarıyla saklanır.

## Afet Talepleri — `/api/ihbarlar`

| Method | Endpoint | Açıklama |
|--------|----------|---------|
| POST | `/api/ihbarlar` | Yeni talep oluştur |
| GET | `/api/ihbarlar/mine` | Giriş yapan kullanıcının talepleri |
| GET | `/api/ihbarlar/prioritized` | Tüm talepler (öncelik sıralı) |
| POST | `/api/ihbarlar/{id}/photos` | Fotoğraf / ses dosyası yükle (multipart) |

**Not:** Tekil talep detay endpoint'i (`GET /api/ihbarlar/{id}`) backend'de yok. `getById(id)` istemci tarafında `/mine` listesinden filtreler.

### Talep Oluşturma — İstek Gövdesi

```typescript
{
  latitude: number
  longitude: number
  need_type: NeedType        // "rescue" | "medical" | "food" | "water" | "shelter" | "clothing" | "hygiene" | "heating" | "other"
  person_count: number
  description?: string
}
```

## Kümeler — `/api/clusters`

| Method | Endpoint | Açıklama |
|--------|----------|---------|
| GET | `/api/clusters` | Tüm aktif kümeler |
| GET | `/api/clusters/override-alerts` | Araç yeniden atama önerileri |
| POST | `/api/clusters/{id}/execute-override` | Araç atamayı uygula |
| POST | `/api/clusters/{id}/complete` | Görevi tamamlandı işaretle |

## Araçlar — `/api/vehicles`

| Method | Endpoint | Açıklama |
|--------|----------|---------|
| GET | `/api/vehicles` | Tüm araçlar |

## Çevrimdışı Mod

`usePendingRequestSync` hook'u NetInfo ile bağlantıyı izler. İnternet kesilince talepler `uiStore.pendingRequests` kuyruğuna alınır, bağlantı gelince otomatik gönderilir. Ağ hatası → tekrar dene, validasyon hatası → kuyruğu sil.

## Hook Kullanım Örnekleri

```typescript
// Talepler
const { data: requests } = useRequests();
const { data: mine } = useMyRequests();
const createMutation = useCreateRequest();
createMutation.mutate({ latitude, longitude, need_type, person_count });

// Kümeler
const { data: clusters } = useClusters();

// Araçlar
const { data: vehicles } = useVehicles();

// Auth
const loginMutation = useLogin();
const { logout } = useLogout();
```
