import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useAuthStore } from "@/src/stores/authStore";
import { useLocationStore } from "@/src/stores/locationStore";
import { useUIStore } from "@/src/stores/uiStore";
import { useLogout } from "@/src/hooks/useAuth";
import { Button, Card, PressableCard, AlertBanner } from "@/src/components/ui";

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const isStaff = user?.role === "volunteer" || user?.role === "coordinator" || user?.role === "admin";

  if (isStaff) {
    return <StaffDashboard />;
  }
  return <CitizenDashboard />;
}

function StaffDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const handleLogout = useLogout();
  const { setCurrentLocation, currentLocation } = useLocationStore();

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

  return (
    <SafeAreaView className="flex-1 bg-surface-card">
      <View className="bg-primary px-4 py-3 flex-row items-center justify-between">
        <View>
          <Text className="text-white font-bold text-xl">RESQ YÖNETİM</Text>
          <Text className="text-white/80 text-xs uppercase">{user?.role}</Text>
        </View>
        <Button
          title="Çıkış"
          variant="ghost"
          size="sm"
          onPress={handleLogout}
          style={{ opacity: 0.8 }}
        />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <View className="mb-5">
          <Text className="text-xl font-bold text-text-primary">
            Hoş Geldiniz, {user?.first_name}
          </Text>
          <Text className="text-text-secondary text-sm mt-1">
            Saha operasyonları ve araç yönetimi paneli
          </Text>
        </View>

        <Card className="mb-4" elevated>
          <Text className="text-xs font-semibold text-text-secondary uppercase mb-3">
            Sistem Durumu
          </Text>
          <View className="flex-row items-center gap-2">
            <View className="w-2.5 h-2.5 rounded-full bg-status-active" />
            <Text className="text-text-primary font-medium text-sm">
              Saha Veri Akışı Aktif
            </Text>
          </View>
        </Card>

        <Text className="text-sm font-semibold text-text-secondary uppercase mb-3 mt-2">
          Hızlı Erişim
        </Text>

        <PressableCard
          className="bg-primary mb-3 flex-row items-center justify-between border-0"
          elevated
          onPress={() => router.push("/(app)/(tabs)/tasks")}
        >
          <View>
            <Text className="text-white font-bold text-xl">Görevler</Text>
            <Text className="text-white/80 text-sm mt-1">Atanan araç ve müdahale görevleri</Text>
          </View>
          <Text className="text-white text-4xl">🚑</Text>
        </PressableCard>

        <PressableCard
          className="border-2 border-primary mb-3 flex-row items-center justify-between"
          elevated
          onPress={() => router.push("/(app)/(tabs)/map")}
        >
          <View>
            <Text className="text-primary font-bold text-base">Saha Haritası</Text>
            <Text className="text-text-secondary text-sm mt-1">
              Afet kümeleri ve araç takibi
            </Text>
          </View>
          <Text className="text-2xl">🗺️</Text>
        </PressableCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function CitizenDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const handleLogout = useLogout();
  const { setCurrentLocation, currentLocation } = useLocationStore();
  const { isInfoPanelVisible, setInfoPanelVisible, resetDraft } = useUIStore();
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Konum izni gereklidir");
        return;
      }

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

  const handleNewRequest = () => {
    resetDraft();
    router.push("/(app)/request/location");
  };

  const handleSOS = () => {
    Alert.alert(
      "ACİL YARDIM",
      "Acil durum bildirimi oluşturulsun mu?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "EVET, ACİL",
          style: "destructive",
          onPress: () => router.push("/(app)/request/location"),
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-card">
      {/* Top Bar */}
      <View className="bg-primary px-4 py-3 flex-row items-center justify-between">
        <View>
          <Text className="text-white font-bold text-xl">RESQ</Text>
          <Text className="text-white/80 text-xs">
            {currentLocation
              ? `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`
              : "Konum alınıyor..."}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Button
            title="Taleplerim"
            variant="ghost"
            size="sm"
            onPress={() => router.push("/(app)/(tabs)/reports")}
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          />
          <Button
            title="Çıkış"
            variant="ghost"
            size="sm"
            onPress={handleLogout}
            style={{ opacity: 0.8 }}
          />
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Greeting */}
        <View className="mb-5">
          <Text className="text-xl font-bold text-text-primary">
            Merhaba, {user?.first_name ?? "Vatandaş"}
          </Text>
          <Text className="text-text-secondary text-sm mt-1">
            Yardıma ihtiyacınız var mı?
          </Text>
        </View>

        {/* Location Error Banner */}
        {locationError && (
          <AlertBanner variant="error" title="Konum Hatası" message={locationError} />
        )}

        {/* Status Card */}
        <Card className="mb-4" elevated>
          <Text className="text-xs font-semibold text-text-secondary uppercase mb-3">
            Sistem Durumu
          </Text>
          <View className="flex-row items-center gap-2">
            <View className="w-2.5 h-2.5 rounded-full bg-status-active" />
            <Text className="text-text-primary font-medium text-sm">
              Koordinasyon Sistemi Aktif
            </Text>
          </View>
          <Text className="text-text-muted text-xs mt-1 ml-4">
            AFAD ile senkronize
          </Text>
        </Card>

        {/* Quick Actions */}
        <Text className="text-sm font-semibold text-text-secondary uppercase mb-3 mt-2">
          Hızlı İşlemler
        </Text>

        {/* SOS Button */}
        <PressableCard
          className="bg-primary mb-3 flex-row items-center justify-between border-0"
          elevated
          onPress={handleSOS}
        >
          <View>
            <Text className="text-white font-bold text-xl">SOS</Text>
            <Text className="text-white/80 text-sm mt-1">Acil yardım talep et</Text>
          </View>
          <Text className="text-white text-4xl">🆘</Text>
        </PressableCard>

        {/* New Request Button */}
        <PressableCard
          className="border-2 border-primary mb-3 flex-row items-center justify-between"
          elevated
          onPress={handleNewRequest}
        >
          <View>
            <Text className="text-primary font-bold text-base">Yardım Talep Et</Text>
            <Text className="text-text-secondary text-sm mt-1">
              Konum, kişi sayısı ve ihtiyaç türü belirt
            </Text>
          </View>
          <Text className="text-2xl">📋</Text>
        </PressableCard>

        {/* Info Panel Button */}
        <PressableCard
          className="mb-3 flex-row items-center justify-between"
          onPress={() => setInfoPanelVisible(true)}
        >
          <View>
            <Text className="text-text-primary font-semibold text-base">
              Bilgilendirme Paneli
            </Text>
            <Text className="text-text-secondary text-sm mt-1">
              Acil durum bilgileri ve uyarılar
            </Text>
          </View>
          <Text className="text-2xl">ℹ️</Text>
        </PressableCard>

        {/* Status Check */}
        <PressableCard
          className="flex-row items-center justify-between"
          onPress={() => router.push("/(app)/(tabs)/reports")}
        >
          <View>
            <Text className="text-text-primary font-semibold text-base">
              Taleplerim
            </Text>
            <Text className="text-text-secondary text-sm mt-1">
              Aktif ve geçmiş taleplerinizi görün
            </Text>
          </View>
          <Text className="text-2xl">📜</Text>
        </PressableCard>
      </ScrollView>

      {/* Info Panel Modal */}
      {isInfoPanelVisible && (
        <View className="absolute inset-0 bg-black/50 justify-end">
          <View className="bg-white rounded-t-modal p-6 pb-10">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-lg font-bold text-text-primary">
                Bilgilendirme Paneli
              </Text>
              <Button
                title="✕"
                variant="ghost"
                size="sm"
                onPress={() => setInfoPanelVisible(false)}
              />
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
                AFAD: 122 | Kızılay: 168
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
