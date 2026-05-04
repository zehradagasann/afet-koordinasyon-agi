import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AlertTriangle,
  Bell,
  ChevronRight,
  ClipboardList,
  Info,
  Map,
  Truck,
  Users,
  Zap,
} from "lucide-react-native";
import { useAuthStore } from "@/src/stores/authStore";
import { useLocationStore } from "@/src/stores/locationStore";
import { useUIStore } from "@/src/stores/uiStore";
import { useLogout } from "@/src/hooks/useAuth";
import { useRequests } from "@/src/hooks/useRequests";
import { useClusters, useOverrideAlerts } from "@/src/hooks/useClusters";
import { useVehicles } from "@/src/hooks/useVehicles";
import { AlertBanner, Card } from "@/src/components/ui";

// ─── Greeting ──────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "İyi Geceler";
  if (h < 12) return "Günaydın";
  if (h < 18) return "İyi Günler";
  return "İyi Akşamlar";
}

// ─── Root ──────────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const isStaff =
    user?.role === "volunteer" ||
    user?.role === "coordinator" ||
    user?.role === "admin";

  if (isStaff) return <StaffDashboard />;
  return <CitizenDashboard />;
}

// ─── Citizen Dashboard ─────────────────────────────────────────────────────

function CitizenDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const handleLogout = useLogout();
  const { setCurrentLocation, currentLocation } = useLocationStore();
  const { isInfoPanelVisible, setInfoPanelVisible, resetDraft } = useUIStore();
  const { data: requests } = useRequests();

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setCurrentLocation({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        accuracy: current.coords.accuracy ?? undefined,
        timestamp: current.timestamp,
      });
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 10_000 },
        (loc) => {
          setCurrentLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            accuracy: loc.coords.accuracy ?? undefined,
            timestamp: loc.timestamp,
          });
        }
      );
    };
    startTracking();
    return () => { sub?.remove(); };
  }, [setCurrentLocation]);

  const activeRequests = requests?.filter(
    (r) => r.status === "pending" || r.status === "active" || r.status === "assigned"
  ) ?? [];

  const handleNewRequest = () => {
    resetDraft();
    router.push("/(app)/request/location");
  };

  const handleSOS = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "🆘 ACİL YARDIM",
      "Acil durum bildirimi oluşturulsun mu? Ekipler en kısa sürede size ulaşacak.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "EVET, ACİL YARDIM",
          style: "destructive",
          onPress: () => {
            resetDraft();
            router.push("/(app)/request/location");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-card" edges={["top"]}>
      {/* Header */}
      <View className="bg-primary px-5 pt-3 pb-5">
        <View className="flex-row items-start justify-between mb-1">
          <View>
            <Text className="text-white/70 text-xs font-medium uppercase tracking-widest">
              RESQ • Afet Koordinasyon
            </Text>
            <Text className="text-white font-bold text-2xl mt-0.5">
              {getGreeting()}, {user?.first_name ?? "Vatandaş"} 👋
            </Text>
          </View>
          <Pressable
            onPress={handleLogout}
            className="bg-white/20 rounded-full px-3 py-1.5"
          >
            <Text className="text-white text-xs font-semibold">Çıkış</Text>
          </Pressable>
        </View>

        {/* Location pill */}
        <View className="flex-row items-center mt-2 bg-white/15 self-start rounded-full px-3 py-1 gap-1.5">
          <View className="w-1.5 h-1.5 rounded-full bg-status-active" />
          <Text className="text-white/90 text-xs">
            {currentLocation
              ? `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`
              : "Konum alınıyor..."}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Request Banner */}
        {activeRequests.length > 0 && (
          <Pressable
            onPress={() => router.push("/(app)/(tabs)/reports")}
            className="bg-status-active/10 border border-status-active/30 rounded-card p-3.5 mb-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-2.5">
              <View className="w-8 h-8 rounded-full bg-status-active/20 items-center justify-center">
                <ClipboardList size={16} color="#10B981" />
              </View>
              <View>
                <Text className="text-status-active font-bold text-sm">
                  {activeRequests.length} Aktif Talep
                </Text>
                <Text className="text-text-secondary text-xs">
                  Ekip müdahalede — durumu takip et
                </Text>
              </View>
            </View>
            <ChevronRight size={16} color="#10B981" />
          </Pressable>
        )}

        {/* SOS Button */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }], marginBottom: 12 }}>
          <Pressable
            onPress={handleSOS}
            className="bg-primary rounded-2xl py-5 items-center justify-center"
            style={{ shadowColor: "#E63946", shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8 }}
          >
            <Text className="text-white text-5xl mb-2">🆘</Text>
            <Text className="text-white font-bold text-2xl tracking-wide">ACİL YARDIM</Text>
            <Text className="text-white/70 text-sm mt-1">Dokunun — Ekip yönlendirilsin</Text>
          </Pressable>
        </Animated.View>

        {/* Quick Actions Grid */}
        <Text className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3 mt-2">
          Hızlı İşlemler
        </Text>
        <View className="flex-row gap-3 mb-3">
          <QuickCard
            icon={<ClipboardList size={22} color="#E63946" />}
            title="Yardım Talep Et"
            subtitle="Konum & ihtiyaç belirt"
            onPress={handleNewRequest}
            accent
          />
          <QuickCard
            icon={<ClipboardList size={22} color="#3B82F6" />}
            title="Taleplerim"
            subtitle="Aktif & geçmiş"
            onPress={() => router.push("/(app)/(tabs)/reports")}
          />
        </View>
        <View className="flex-row gap-3 mb-5">
          <QuickCard
            icon={<Bell size={22} color="#F59E0B" />}
            title="Uyarılar"
            subtitle="Bölge bildirimler"
            onPress={() => router.push("/(app)/(tabs)/alerts")}
          />
          <QuickCard
            icon={<Info size={22} color="#0EA5E9" />}
            title="Bilgilendirme"
            subtitle="Acil hatlar & bilgiler"
            onPress={() => setInfoPanelVisible(true)}
          />
        </View>

        {/* Emergency Numbers */}
        <Card className="bg-primary/5 border-primary/20">
          <Text className="text-xs font-bold text-primary uppercase mb-3 tracking-wide">
            Acil Hatlar
          </Text>
          <View className="flex-row justify-between">
            {[
              { label: "Acil", number: "112" },
              { label: "AFAD", number: "122" },
              { label: "Kızılay", number: "168" },
            ].map((item) => (
              <View key={item.label} className="items-center">
                <Text className="text-primary font-bold text-xl">{item.number}</Text>
                <Text className="text-text-muted text-xs">{item.label}</Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>

      {/* Info Panel Modal */}
      {isInfoPanelVisible && (
        <View className="absolute inset-0 bg-black/50 justify-end">
          <View className="bg-white rounded-t-modal p-6 pb-10">
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-lg font-bold text-text-primary">
                📋 Bilgilendirme Paneli
              </Text>
              <Pressable
                onPress={() => setInfoPanelVisible(false)}
                className="w-8 h-8 rounded-full bg-surface-muted items-center justify-center"
              >
                <Text className="text-text-primary font-bold">✕</Text>
              </Pressable>
            </View>

            <AlertBanner
              variant="warning"
              title="Deprem Bölgesi Uyarısı"
              message="Bölgenizde deprem aktivitesi tespit edilmiştir. Güvenli bölgelere geçin."
            />

            <Card className="bg-surface-card mb-3">
              <Text className="text-text-primary font-semibold text-sm">
                📞 Acil Hattı: 112
              </Text>
              <Text className="text-text-secondary text-xs mt-1">
                AFAD: 122 | Kızılay: 168 | Yangın: 110
              </Text>
            </Card>

            <Card className="bg-surface-card">
              <Text className="text-text-primary font-semibold text-sm">
                🏥 En Yakın Toplanma Yeri
              </Text>
              <Text className="text-text-secondary text-xs mt-1">
                Konumunuza göre yönlendirme yapılmaktadır
              </Text>
            </Card>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Quick Action Card ─────────────────────────────────────────────────────

interface QuickCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
  accent?: boolean;
}

function QuickCard({ icon, title, subtitle, onPress, accent }: QuickCardProps) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      className={`flex-1 rounded-card p-4 border ${
        accent
          ? "bg-primary/5 border-primary/20"
          : "bg-white border-border"
      }`}
      style={{ shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
    >
      <View className="mb-2.5">{icon}</View>
      <Text className={`font-bold text-sm ${accent ? "text-primary" : "text-text-primary"}`}>
        {title}
      </Text>
      <Text className="text-text-muted text-xs mt-0.5">{subtitle}</Text>
    </Pressable>
  );
}

// ─── Staff Dashboard ───────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  volunteer: "Gönüllü",
  coordinator: "Koordinatör",
  admin: "Yönetici",
};

function StaffDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const handleLogout = useLogout();
  const { setCurrentLocation } = useLocationStore();
  const { data: clusters } = useClusters();
  const { data: alerts } = useOverrideAlerts();
  const { data: vehicles } = useVehicles();

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 10_000 },
        (loc) => {
          setCurrentLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            accuracy: loc.coords.accuracy ?? undefined,
            timestamp: loc.timestamp,
          });
        }
      );
    };
    startTracking();
    return () => { sub?.remove(); };
  }, [setCurrentLocation]);

  const activeClusters = clusters?.filter((c) => c.status === "active").length ?? 0;
  const availableVehicles = vehicles?.filter((v) => v.vehicle_status === "available").length ?? 0;
  const pendingAlerts = alerts?.length ?? 0;
  const roleLabel = ROLE_LABELS[user?.role ?? ""] ?? user?.role ?? "";

  return (
    <SafeAreaView className="flex-1 bg-surface-card" edges={["top"]}>
      {/* Header */}
      <View className="bg-primary px-5 pt-3 pb-5">
        <View className="flex-row items-start justify-between mb-2">
          <View>
            <View className="flex-row items-center gap-2 mb-0.5">
              <Text className="text-white/70 text-xs font-medium uppercase tracking-widest">
                RESQ
              </Text>
              <View className="bg-white/25 rounded-full px-2 py-0.5">
                <Text className="text-white text-xs font-bold">{roleLabel}</Text>
              </View>
            </View>
            <Text className="text-white font-bold text-2xl">
              {getGreeting()}, {user?.first_name} 👋
            </Text>
          </View>
          <Pressable
            onPress={handleLogout}
            className="bg-white/20 rounded-full px-3 py-1.5"
          >
            <Text className="text-white text-xs font-semibold">Çıkış</Text>
          </Pressable>
        </View>

        {/* Live status pill */}
        <View className="flex-row items-center bg-white/15 self-start rounded-full px-3 py-1 gap-1.5">
          <View className="w-1.5 h-1.5 rounded-full bg-status-active" />
          <Text className="text-white/90 text-xs">Saha Veri Akışı Aktif</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* AI Override Alert */}
        {pendingAlerts > 0 && (
          <Pressable
            onPress={() => router.push("/(app)/(tabs)/tasks")}
            className="bg-status-pending/10 border border-status-pending/30 rounded-card p-3.5 mb-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-2.5">
              <View className="w-8 h-8 rounded-full bg-status-pending/20 items-center justify-center">
                <Zap size={16} color="#F59E0B" />
              </View>
              <View>
                <Text className="text-status-pending font-bold text-sm">
                  {pendingAlerts} Yapay Zeka Yönlendirmesi
                </Text>
                <Text className="text-text-secondary text-xs">
                  Bekleyen rota değişikliği önerisi
                </Text>
              </View>
            </View>
            <ChevronRight size={16} color="#F59E0B" />
          </Pressable>
        )}

        {/* Live Stats Row */}
        <Text className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">
          Anlık Durum
        </Text>
        <View className="flex-row gap-3 mb-5">
          <StatCard
            value={activeClusters}
            label="Aktif Küme"
            icon={<AlertTriangle size={18} color="#E63946" />}
            color="text-status-urgent"
          />
          <StatCard
            value={availableVehicles}
            label="Müsait Araç"
            icon={<Truck size={18} color="#10B981" />}
            color="text-status-active"
          />
          <StatCard
            value={clusters?.reduce((s, c) => s + c.total_persons_affected, 0) ?? 0}
            label="Etkilenen"
            icon={<Users size={18} color="#3B82F6" />}
            color="text-status-resolved"
          />
        </View>

        {/* Navigation Cards */}
        <Text className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">
          Hızlı Erişim
        </Text>

        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            router.push("/(app)/(tabs)/tasks");
          }}
          className="bg-primary rounded-card p-5 mb-3 flex-row items-center justify-between"
          style={{ shadowColor: "#E63946", shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6 }}
        >
          <View>
            <Text className="text-white font-bold text-lg">Aktif Görevler</Text>
            <Text className="text-white/70 text-sm mt-0.5">
              Araç atamaları & müdahale
            </Text>
          </View>
          <View className="bg-white/20 w-12 h-12 rounded-xl items-center justify-center">
            <Text className="text-2xl">🚑</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            router.push("/(app)/(tabs)/map");
          }}
          className="bg-white border border-border rounded-card p-5 mb-3 flex-row items-center justify-between"
          style={{ shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
        >
          <View>
            <Text className="text-text-primary font-bold text-base">Saha Haritası</Text>
            <Text className="text-text-secondary text-sm mt-0.5">
              Afet kümeleri & araç takibi
            </Text>
          </View>
          <View className="bg-surface-muted w-12 h-12 rounded-xl items-center justify-center">
            <Map size={22} color="#4B5563" />
          </View>
        </Pressable>

        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            router.push("/(app)/(tabs)/alerts");
          }}
          className="bg-white border border-border rounded-card p-5 flex-row items-center justify-between"
          style={{ shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
        >
          <View>
            <Text className="text-text-primary font-bold text-base">Uyarılar & Bildirimler</Text>
            <Text className="text-text-secondary text-sm mt-0.5">
              Sistem ve bölge uyarıları
            </Text>
          </View>
          <View className="bg-surface-muted w-12 h-12 rounded-xl items-center justify-center">
            <Bell size={22} color="#4B5563" />
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────

interface StatCardProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ value, label, icon, color }: StatCardProps) {
  return (
    <View
      className="flex-1 bg-white border border-border rounded-card p-3 items-center"
      style={{ shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}
    >
      <View className="mb-1.5">{icon}</View>
      <Text className={`font-bold text-2xl ${color}`}>{value}</Text>
      <Text className="text-text-muted text-xs text-center mt-0.5">{label}</Text>
    </View>
  );
}
