# Teknoloji Yığını

## Çekirdek

| Paket | Versiyon | Kullanım |
|-------|----------|---------|
| React Native | 0.81.5 | Mobil framework |
| Expo SDK | ~54.0.33 | Native API köprüsü, build araçları |
| Expo Router | ~6.0.23 | Dosya tabanlı navigasyon |
| TypeScript | strict | Tip güvenliği |

## State Yönetimi

| Paket | Kullanım |
|-------|---------|
| **Zustand** ^5.0.12 | Yerel UI state (auth, location, draft, offline queue) |
| **TanStack Query** ^5.100.7 | Sunucu state, cache, refetch, mutation |

Kural: API'dan gelen veri → TanStack Query. Uygulama içi durum → Zustand.

## Form ve Validasyon

| Paket | Kullanım |
|-------|---------|
| react-hook-form ^7.74.0 | Form state yönetimi |
| zod ^4.4.1 | Şema validasyonu |
| @hookform/resolvers ^5.2.2 | Zod + RHF entegrasyonu |

## Ağ ve API

| Paket | Kullanım |
|-------|---------|
| axios ^1.15.2 | HTTP istemcisi, interceptor'larla JWT yönetimi |
| @react-native-community/netinfo 11.4.1 | Bağlantı durumu (çevrimdışı mod) |

## Depolama ve Güvenlik

| Paket | Kullanım |
|-------|---------|
| expo-secure-store ~15.0.8 | JWT token (şifreli, Keychain/Keystore) |
| @react-native-async-storage/async-storage 2.2.0 | Zustand persist (non-sensitive) |

## Cihaz Özellikleri

| Paket | Kullanım |
|-------|---------|
| expo-location ~19.0.8 | GPS konum alma |
| expo-image-picker ~17.0.11 | Galeriden fotoğraf seçimi |
| expo-av ~16.0.8 | Ses kaydı (sesli not) |
| react-native-maps 1.20.1 | Harita (Google Maps / Apple Maps) |
| expo-haptics ~15.0.8 | Titreşim geri bildirimi |

## Stil

| Paket | Kullanım |
|-------|---------|
| nativewind ^4.2.3 | Tailwind CSS sınıfları React Native'de |
| tailwindcss ^3.4.17 | Altta çalışan CSS motoru |

## Navigasyon

Expo Router ile dosya tabanlı navigasyon. Grup klasörleri:
- `(auth)` — giriş/kayıt, token yoksa yönlendirilir
- `(app)/(tabs)` — alt sekme navigasyonu
- `(app)/request/*` — talep oluşturma stack'i

## UI Bileşenleri

`src/components/ui/` altında proje genelinde kullanılan bileşenler:

| Bileşen | Açıklama |
|---------|---------|
| `Button` | Birincil / ikincil / tehlike varyantları |
| `Input` | Etiket, hata mesajı, ikon destekli |
| `Card` | Genel kart sarmalayıcı |
| `Badge` | İhtiyaç türü etiketi (`getNeedLabel` yardımcısı) |
| `Feedback` | Alert banner, loading, error state |
| `Progress` | ProgressBar (talep adım göstergesi) |
