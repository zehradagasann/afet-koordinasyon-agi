# Ekran Mimarisi

Expo Router — dosya tabanlı navigasyon. Klasör grupları navigasyon layout'unu belirler.

## Navigasyon Ağacı

```
app/
├── _layout.tsx                   # Root: SecureStore token kontrolü → auth veya app
│
├── (auth)/
│   ├── _layout.tsx               # Stack navigator
│   ├── login.tsx                 # Giriş ekranı
│   └── register.tsx              # Kayıt ekranı
│
└── (app)/
    ├── _layout.tsx               # Stack (tabs + modal ekranlar)
    ├── index.tsx                 # (app) kökü — (tabs)'a yönlendirir
    │
    ├── (tabs)/
    │   ├── _layout.tsx           # Alt sekme navigasyonu
    │   ├── index.tsx             # Ana sayfa (harita + GPS izleme)
    │   ├── map.tsx               # Saha haritası (kümeler + araçlar)
    │   ├── alerts.tsx            # Bildirimler
    │   ├── tasks.tsx             # Görevler (koordinatör / gönüllü)
    │   ├── reports.tsx           # İhbar listesi
    │   └── profile.tsx           # Profil
    │
    ├── request/                  # Talep oluşturma akışı (stack)
    │   ├── location.tsx          # Adım 1: GPS / haritadan konum
    │   ├── persons.tsx           # Adım 2: Kişi sayısı
    │   ├── needs.tsx             # Adım 3: İhtiyaç türleri (çoklu)
    │   └── detail.tsx            # Adım 4: Açıklama, fotoğraf, ses → gönder
    │
    ├── requests/
    │   ├── list.tsx              # Tüm talepler listesi
    │   └── [id].tsx              # Talep detay görünümü
    │
    └── status/
        └── [id].tsx              # Talep durum takip ekranı
```

## Ekran Açıklamaları

### Auth

| Ekran | Dosya | Açıklama |
|-------|-------|---------|
| Giriş | `(auth)/login.tsx` | Email + şifre, JWT alır, SecureStore'a kaydeder |
| Kayıt | `(auth)/register.tsx` | Kayıt formu, rol zorunlu olarak `citizen` atanır |

### Ana Sekmeler

| Ekran | Dosya | Açıklama |
|-------|-------|---------|
| Ana Sayfa | `(tabs)/index.tsx` | Harita üstü GPS izleme, hızlı "Yardım İste" butonu |
| Saha Haritası | `(tabs)/map.tsx` | Aktif kümeler + araçlar, önceliğe göre renk kodlu marker |
| Bildirimler | `(tabs)/alerts.tsx` | Sistem bildirimleri |
| Görevler | `(tabs)/tasks.tsx` | Atanmış görevler (koordinatör / gönüllü) |
| İhbarlar | `(tabs)/reports.tsx` | İhbar listesi |
| Profil | `(tabs)/profile.tsx` | Kullanıcı bilgileri, çıkış |

### Talep Oluşturma Akışı

Kullanıcı "Yardım İste" butonuna basınca sırayla geçer:

```
location → persons → needs → detail → (gönderim sonrası) status/[id]
```

| Adım | Dosya | Açıklama |
|------|-------|---------|
| 1 | `request/location.tsx` | Mevcut GPS konumu göster, haritadan manuel seçim, yenileme |
| 2 | `request/persons.tsx` | Kişi sayısı (klavye + hızlı seçim butonları: 1–10) |
| 3 | `request/needs.tsx` | 9 kategori, çoklu seçim (rescue, medical, food, water, shelter, clothing, hygiene, heating, other) |
| 4 | `request/detail.tsx` | Açıklama metni, fotoğraf ekleme, sesli not kaydı, gönder |

Tüm adımlardaki veri `uiStore.requestDraft` Zustand slice'ında tutulur.

### Talep Takip

| Ekran | Dosya | Açıklama |
|-------|-------|---------|
| Durum Takip | `status/[id].tsx` | 4 aşamalı ilerleme: Talep Alındı → Doğrulanıyor → Ekip Atandı → Tamamlandı |
| Talep Detay | `requests/[id].tsx` | Konum, ihtiyaç, kişi sayısı, fotoğraflar |
| Talep Listesi | `requests/list.tsx` | Kullanıcının tüm talepleri |

## State Akışı

```
Zustand authStore     → kullanıcı oturumu (AsyncStorage'a persist)
Zustand locationStore → GPS konum (persist yok, runtime)
Zustand uiStore       → requestDraft + pendingRequests (AsyncStorage'a persist)
TanStack Query        → requests, clusters, vehicles (sunucu cache)
SecureStore           → JWT token
```
