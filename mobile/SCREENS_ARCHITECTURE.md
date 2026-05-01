# RESQ Mobile - Ekran Mimarisi & Tasarım Promptu

Bu dokument, tasarım dosyalarından (andorid tasarım/) türetilen her ekranın mimarisini ve bileşen hiyerarşisini tanımlar.

---

## 🎨 Tasarım Referans Dosyaları

Tasarım dosyaları `andorid tasarım/` klasöründedir:
1. `01-Harita-Arama-Bilgilendirme.png` → **Dashboard/Map Screen**
2. `02-Konum-Tespit-Onay.png` → **Location Confirmation Screen**
3. `03-Kisi-Sayisi-Secimi.png` → **Person Count Screen**
4. `04-Güvenlik-Durumu-AFAD.png` → **Safety Status Screen**
5. `05-Bilgilendirme-Paneli.png` → **Info Panel Screen**
6. `06-Yardim-Istiyorum-SOS.png` → **SOS/Emergency Screen**
7. `07-İhbar-Listesi.png` → **Reports List Screen**
8. `08-İhbar-Detay-Görsel-Ekleme.png` → **Report Detail & Media Screen**
9. `09-İhtiyac-Türü-Seçimi.png` → **Needs Selection Screen**

---

## 📱 Ekran Mimarisi Detayları

### Screen 1: Dashboard / Harita Ana Ekranı

**Dosya**: `app/(app)/(tabs)/index.tsx`  
**Referans**: `01-Harita-Arama-Bilgilendirme.png`

#### Bileşen Hiyerarşisi
```
SafeAreaView
├── Header
│   ├── Logo (RESQ)
│   ├── Notification Icon
│   └── Menu Icon
├── SearchBar (Arama: "Güvenli Alan Ara...")
│   ├── Location Toggle (TOPLANMA / EKİP / CANLI)
│   ├── Input Field
│   └── Filter Icon (Harita türü)
├── MapView (React Native Maps)
│   ├── Marker[] (İhbar konumları)
│   ├── ClusterMarker[] (Küme işaretçileri)
│   └── UserLocation Marker (Mavi nokta)
├── InfoCard (Bilgilendirme)
│   ├── Status Badge (durum renkleri)
│   ├── "EN YAKIN ALAN: 450M" (turuncu)
│   ├── "YARDIM EKİBİ: 8 DK" (mavi)
│   └── Sub-label ("PARK X" vs "2.2 KM MESAFE")
├── BottomSheet (Açılır bilgi)
│   ├── "PARK X - TOPLANMA ALANI"
│   ├── "STADYUM Y - GÜVENLİ BÖLGE"
│   └── Person count & need types
└── BottomTabNavigator
    ├── Home (active)
    ├── Reports
    ├── Alerts
    └── Profile
```

#### Tasarım Kuralları (Tasarımdan)
- **Header**: Siyah arka plan (#1a1a1a) + turuncu logo + beyaz metin
- **SearchBar**: Koyu gri arka plan (#2a2a2a), turuncu vurgu
- **Map Markers**: Turuncu için aktif/seçili, mavi için EKİP konum
- **Info Card**: Kırmızı başlık "#E63946" + beyaz metin
- **Bottom Navigation**: 5 sekme (SOS, MAP, GUIDE, INFO) - turuncu aktif
- **BottomSheet**: Koyu arka plan, kaymak stili

#### Key Props & State
```typescript
interface DashboardProps {
  // TanStack Query
  reports: Report[]  // useReports hook'tan
  clusters: Cluster[]
  userLocation: Location
  vehicles: Vehicle[]
  
  // State
  selectedMarker?: string (markerId)
  mapType: "standard" | "satellite"
  searchText: string
  filterOpen: boolean
}
```

#### Component Code Pattern
```typescript
// app/(app)/(tabs)/index.tsx

export default function DashboardScreen() {
  const { data: reports, isLoading } = useReports()
  const { data: clusters } = useClusters()
  const { location } = useLocation()
  
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <SearchBar />
      {isLoading ? <LoadingSpinner /> : <MapView reports={reports} clusters={clusters} />}
      <InfoCard />
      <BottomSheet />
    </SafeAreaView>
  )
}
```

---

### Screen 2: Konum Tespiti & Onay

**Dosya**: `app/(app)/location/select.tsx`  
**Referans**: `02-Konum-Tespit-Onay.png`

#### Bileşen Hiyerarşisi
```
SafeAreaView
├── Header
│   ├── Title ("KONUM TESPİTİ")
│   └── Subtitle ("Bulunduğunuz alandaki toplam kişi sayısını doğru bir şekilde belirtin.")
├── CircleAvatar (Mavi daire)
│   ├── Icon (Kalp/konum sembolü)
│   └── Text ("GÜVENDEYİM")
├── StatusButtons (3 buton grid)
│   ├── ButtonCard ("Annem", checked)
│   ├── ButtonCard ("Babam", checked)
│   └── ButtonCard ("Kardeşim", unchecked)
└── BottomActions
    ├── Button ("SONRAKI", red)
    └── Button ("GERİ", secondary)
```

#### Tasarım Kuralları
- **Başlık**: Beyaz, 20px font
- **Avatar**: Mavi daire (#3366FF), 120px
- **Butonlar**: Borderlı, turuncu vurgu (seçili)
- **Alt Butonlar**: Red (#E63946) primary, grey secondary

#### Component Code Pattern
```typescript
// app/(app)/location/select.tsx

export default function LocationConfirmScreen() {
  const { selectedLocation, setSelectedLocation } = useLocation()
  const [confirmText, setConfirmText] = useState("")
  
  return (
    <SafeAreaView>
      <Header title="KONUM TESPİTİ" />
      <CircleAvatar icon="heart" color="blue" />
      <ConfirmationButtons items={confirmationItems} />
      <BottomActions 
        onNext={() => navigation.push('report/new')}
        onBack={() => navigation.goBack()}
      />
    </SafeAreaView>
  )
}
```

---

### Screen 3: Kişi Sayısı Seçimi

**Dosya**: `app/(app)/report/new.tsx` (Step 1)  
**Referans**: `03-Kisi-Sayisi-Secimi.png`

#### Bileşen Hiyerarşisi
```
SafeAreaView
├── ProgressBar ("ADIM 2 / 4")
├── Title ("KİŞİ SAYISI")
├── Subtitle ("Lütfen bulunduğunuz alandaki toplam kişi sayısını doğru bir şekilde belirtin.")
├── NumberSelector (3-buton grid)
│   ├── Button ("-")
│   ├── Input ("4", large text)
│   └── Button ("+")
└── BottomActions
    ├── Button ("SONRAKI", red)
    └── Button ("GERİ", secondary)
```

#### Form Validation
```typescript
const personCountSchema = z.number().min(1).max(999)
```

#### Component Code Pattern
```typescript
// ReportForm.tsx (Part 1)

<NumberSelector 
  value={personCount}
  onChange={setPersonCount}
  min={1}
  max={999}
/>
```

---

### Screen 4: Güvenlik Durumu & AFAD

**Dosya**: `app/(app)/report/new.tsx` (Step 2)  
**Referans**: `04-Güvenlik-Durumu-AFAD.png`

#### Bileşen Hiyerarşisi
```
SafeAreaView
├── Header (Turuncu bar)
├── Title ("GÜVENDEYİM")
├── Subtitle ("Konumunuz ve durumunuz merkez kişiye ve AFAD ile senkronize edilir.")
├── StatusCards (3x1)
│   ├── Card ("Annem", DELIVERED ✓)
│   ├── Card ("Babam", DELIVERED ✓)
│   └── Card ("Kardeşim", WAITING ⏳)
└── BottomActions
```

#### Component Code Pattern
```typescript
interface StatusCard {
  label: string
  status: "delivered" | "waiting" | "pending"
}

<StatusCards items={statusItems} />
```

---

### Screen 5: Bilgilendirme Paneli

**Dosya**: `app/(app)/(tabs)/index.tsx` (Modal/BottomSheet)  
**Referans**: `05-Bilgilendirme-Paneli.png`

#### Bileşen Hiyerarşisi
```
Modal/BottomSheet
├── Header (Turuncu: "HARITA")
├── Section "ACİL DURUM"
│   ├── IconCard ("Bilgeniizdeki toplanma alanı: X Parkı...")
├── Section "UYARI"
│   ├── IconCard ("Bölgenizde yoğun kar yağışı...")
├── Section "DURUM"
│   ├── IconCard ("Yardım aracı tahmini 15 dakika mesafenizde.")
├── Button ("YENİ İHBAR OLUŞTUR", red)
└── Button ("GERİ", secondary)
```

#### Tasarım Kuralları
- **Header**: Turuncu arka plan, beyaz metin
- **Alert Box**: Kırmızı / turuncu / mavi renkler (durum türüne göre)
- **Icon**: Solda, sembol + durum açıklaması

---

### Screen 6: Yardım İstiyorum (SOS)

**Dosya**: `app/(app)/(tabs)/sos.tsx` (veya main screen'de big button)  
**Referans**: `06-Yardim-Istiyorum-SOS.png`

#### Bileşen Hiyerarşisi
```
SafeAreaView
├── Header (Turuncu bar: "HARITA")
├── EmergencyAlert (Kırmızı arka plan, centering)
│   ├── AsteriskIcon (Beyaz)
│   ├── Title ("YARDIM İSTİYORUM", white, bold)
│   └── SubSection (Mavi)
│       ├── Icon (Arama sembolü)
│       └── Text ("BİRİNİ BİLDİR")
├── ActionButtons
│   ├── Button ("SOS", red, bottom left)
│   ├── Button ("MAP", secondary, bottom center)
│   └── Button ("STATUS", secondary, bottom right)
```

#### Component Code Pattern
```typescript
// Emergency SOS trigger
<Button 
  color="red"
  onPress={async () => {
    const { location } = useLocation()
    await reportService.createEmergency(location)
    showNotification("SOS Bildirimi Gönderildi")
  }}
>
  YARDIM İSTİYORUM
</Button>
```

---

### Screen 7: İhbar Listesi

**Dosya**: `app/(app)/(tabs)/reports.tsx`  
**Referans**: `07-İhbar-Listesi.png`

#### Bileşen Hiyerarşisi
```
SafeAreaView
├── Header ("İHBAR GEÇMIŞI")
├── FilterBar (Durum filtreleri)
│   ├── Chip ("YANGIN İHBAR", active)
│   ├── Chip ("DOĞRULANMIŞ", secondary)
│   └── Chip ("YOLDA", secondary)
├── ReportList (FlatList infinite scroll)
│   └── ReportCard[] (dinamik)
│       ├── IconLocation
│       ├── Title & Description
│       ├── Status Badge (durum rengi)
│       ├── Timestamp
│       └── RightArrow (navigasyon)
└── FAB (turuncu, alt sağ)
    └── "+ İhbar Oluştur"
```

#### Component Code Pattern
```typescript
// app/(app)/(tabs)/reports.tsx

export default function ReportsScreen() {
  const { data: reports, fetchNextPage } = useReports()
  const [filters, setFilters] = useState<ReportFilters>({})
  
  return (
    <SafeAreaView>
      <FilterBar filters={filters} onChange={setFilters} />
      <FlatList
        data={reports}
        renderItem={({ item }) => <ReportCard report={item} />}
        onEndReached={fetchNextPage}
      />
      <FAB onPress={() => navigation.navigate('report/new')} />
    </SafeAreaView>
  )
}
```

---

### Screen 8: İhbar Detayı & Medya Ekleme

**Dosya**: `app/(app)/report/[id].tsx`  
**Referans**: `08-İhbar-Detay-Görsel-Ekleme.png`

#### Bileşen Hiyerarşisi
```
SafeAreaView
├── ProgressBar ("4/4")
├── Title ("EK BİLGİ")
├── SubTitle ("İsteğe bağlı. Durumu daha iyi açıklamak için fotoğraf veya ses kaydı ekleyebilirsiniz.")
├── MediaOptions (2 buton)
│   ├── Button ("SESLİ NOT KAYDET", mic icon)
│   └── Button ("FOTOĞRAF ÇEK", camera icon)
├── MediaPreview[] (yüklenen medya)
├── Button ("İHBARI GÖNDER", red, full-width)
└── Button ("GERİ", secondary)
```

#### Component Code Pattern
```typescript
// app/(app)/report/[id].tsx

export default function ReportDetailScreen() {
  const [photos, setPhotos] = useState<File[]>([])
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  
  const handlePhotoUpload = async () => {
    const result = await ImagePicker.launchCameraAsync()
    if (!result.cancelled) {
      setPhotos([...photos, result.uri])
    }
  }
  
  return (
    <SafeAreaView>
      <ProgressBar step={4} total={4} />
      <MediaButton icon="camera" label="FOTOĞRAF ÇEK" onPress={handlePhotoUpload} />
      <MediaButton icon="mic" label="SESLİ NOT KAYDET" onPress={handleAudioRecord} />
      <MediaPreview items={[...photos, audioUrl]} />
      <SubmitButton onPress={handleSubmit} />
    </SafeAreaView>
  )
}
```

---

### Screen 9: İhtiyaç Türü Seçimi

**Dosya**: `app/(app)/report/new.tsx` (Step 3)  
**Referans**: `09-İhtiyac-Türü-Seçimi.png`

#### Bileşen Hiyerarşisi
```
SafeAreaView
├── Title ("İHTİYAÇ TÜRÜ")
├── NeedsSelector (4 option buttons)
│   ├── NeedCard ("BESLENME", icon: fork+knife, borderf: orange)
│   ├── NeedCard ("TIBBİ YARDIM", icon: cross, borderf: secondary)
│   ├── NeedCard ("KURTARMA", icon: rescue, borderf: secondary)
│   └── NeedCard ("ISINMA", icon: fire, borderf: secondary)
├── Description ("Lütfen ihtiyaç türünü seçin")
└── BottomActions
    ├── Button ("SONRAKI", red)
    └── Button ("GERİ", secondary)
```

#### Zod Validation
```typescript
const needsSchema = z.array(
  z.enum(['shelter', 'food', 'medical', 'water', 'clothing', 'hygiene', 'heating'])
).min(1, "En az bir ihtiyaç seçmelisiniz")
```

#### Component Code Pattern
```typescript
// NeedsSelector.tsx

interface NeedOption {
  id: NeedType
  label: string
  icon: IconType
}

<MultiSelect
  options={needOptions}
  selected={selectedNeeds}
  onChange={setSelectedNeeds}
/>
```

---

## 🎨 Global Design System

### Colors (Tailwind + Custom)
```typescript
// src/lib/colors.ts

export const colors = {
  primary: {
    red: '#E63946',      // CTA buttons, errors, alerts
    orange: '#FF6B6B',   // Hover states, secondary actions
    blue: '#3366FF',     // Info, status
  },
  neutral: {
    white: '#FFFFFF',
    black: '#1a1a1a',
    gray: '#6C757D',
    lightGray: '#F8F9FA',
  },
  status: {
    success: '#2D6A4F',  // Resolved, OK
    warning: '#F4A261',  // Pending, waiting
    danger: '#E63946',   // Critical, error
  },
}
```

### Typography
```typescript
export const typography = {
  h1: { fontSize: 28, fontWeight: '700' },  // Page titles
  h2: { fontSize: 24, fontWeight: '700' },  // Section titles
  h3: { fontSize: 18, fontWeight: '600' },  // Subsections
  body: { fontSize: 14, fontWeight: '400' }, // Main text
  caption: { fontSize: 12, fontWeight: '400' }, // Hints, labels
}
```

### Spacing
```typescript
export const spacing = {
  xs: 4,    // 4px
  sm: 8,    // 8px
  md: 16,   // 16px
  lg: 24,   // 24px
  xl: 32,   // 32px
}
```

### Border Radius
```typescript
export const borderRadius = {
  sm: 4,    // inputs
  md: 8,    // cards
  lg: 12,   // buttons, modals
  full: 999, // avatars, circles
}
```

---

## ✅ Implementation Checklist per Screen

Her ekran için:
- [ ] TypeScript types complete (Props, State)
- [ ] Zod validation schema (if form)
- [ ] TanStack Query hooks integrated
- [ ] Tasarım referansıyla birebir aynı
- [ ] Responsive layout (NativeWind)
- [ ] Error handling & loading states
- [ ] Accessibility (labels, contrast)
- [ ] Unit test written
- [ ] iOS/Android tested

---

## 🔗 Navigation Mapping

```
Root Auth
├── Login → Register
└── Forgot Password

Root App
├── Dashboard (index)
│   ├── Location/select → Report/new
│   └── Report/[id]
├── Reports List
│   └── Report/[id]
├── Alerts
└── Profile
```

---

## 📚 Related Documents

- `TECHNOLOGY_STACK.md` - Component libraries & tools
- `MODULES_PLAN.md` - Module structure & dependencies
- `API_INTEGRATION.md` - Backend integration points
- Design files: `andorid tasarım/` folder (9 screenshots)
