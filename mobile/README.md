# RESQ — Mobil Uygulama

Afet koordinasyon sisteminin React Native / Expo mobil istemcisi. Vatandaşların yardım talebi oluşturmasını, gönüllü ve koordinatörlerin sahayı takip etmesini sağlar.

## Gereksinimler

- Node.js 20+
- Expo CLI (`npm install -g expo-cli`)
- Android: Google Maps API key (`app.json` içinde mevcut)

## Kurulum ve Çalıştırma

```bash
cd mobile
npm install
npm run start          # Expo dev server
npm run android        # Android emülatör
npm run ios            # iOS simülatör
```

`.env` dosyası oluştur:
```
EXPO_PUBLIC_API_URL=http://<backend-ip>:8000
```

## APK Build

```bash
eas build --platform android --profile preview
```

## Proje Yapısı

```
mobile/
├── app/                        # Expo Router ekranları
│   ├── _layout.tsx             # Root layout (auth gate)
│   ├── (auth)/                 # Giriş / Kayıt
│   └── (app)/
│       ├── (tabs)/             # Ana sekmeler (Ana Sayfa, Harita, Profil...)
│       ├── request/            # Talep oluşturma akışı (4 adım)
│       ├── requests/           # Talep listesi ve detay
│       └── status/[id].tsx     # Talep takip ekranı
├── src/
│   ├── services/               # API çağrıları (axios)
│   ├── hooks/                  # TanStack Query mutation/query sarmalayıcıları
│   ├── stores/                 # Zustand state (auth, location, ui)
│   ├── components/ui/          # Paylaşılan UI bileşenleri
│   ├── types/                  # TypeScript tip tanımları
│   └── lib/                    # QueryClient, validasyon şemaları
└── assets/                     # İkonlar, splash screen
```

## Dokümantasyon

| Dosya | İçerik |
|-------|--------|
| `CLAUDE.md` | Geliştirici rehberi ve mimari kararlar |
| `API_INTEGRATION.md` | Backend endpoint referansı |
| `TECHNOLOGY_STACK.md` | Kullanılan kütüphaneler ve gerekçeleri |
| `SCREENS_ARCHITECTURE.md` | Ekran listesi ve navigasyon akışı |
