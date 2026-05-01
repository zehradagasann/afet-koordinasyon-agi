import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { authService } from "@/src/services/authService";
import { useAuthStore } from "@/src/stores/authStore";
import { useLocationStore } from "@/src/stores/locationStore";
import { useUIStore } from "@/src/stores/uiStore";

export default function DashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
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

  const handleLogout = async () => {
    await authService.logout();
    logout();
    router.replace("/(auth)/login");
  };

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
        <View className="flex-row items-center gap-3">
          <Pressable
            className="bg-white/20 rounded-full px-3 py-1.5"
            onPress={() => router.push("/(app)/(tabs)/reports")}
          >
            <Text className="text-white text-xs font-semibold">Taleplerim</Text>
          </Pressable>
          <Pressable onPress={handleLogout}>
            <Text className="text-white/70 text-xs">Çıkış</Text>
          </Pressable>
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
          <View className="bg-status-urgent/10 border border-status-urgent rounded-card p-3 mb-4">
            <Text className="text-status-urgent text-sm">{locationError}</Text>
          </View>
        )}

        {/* Status Card */}
        <View className="bg-white rounded-card p-4 mb-4 shadow-sm">
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
        </View>

        {/* Quick Actions */}
        <Text className="text-sm font-semibold text-text-secondary uppercase mb-3">
          Hızlı İşlemler
        </Text>

        {/* SOS Button */}
        <Pressable
          className="bg-primary rounded-card p-5 mb-3 flex-row items-center justify-between"
          onPress={handleSOS}
        >
          <View>
            <Text className="text-white font-bold text-xl">SOS</Text>
            <Text className="text-white/80 text-sm">Acil yardım talep et</Text>
          </View>
          <Text className="text-white text-4xl">🆘</Text>
        </Pressable>

        {/* New Request Button */}
        <Pressable
          className="bg-white border-2 border-primary rounded-card p-4 mb-3 flex-row items-center justify-between"
          onPress={handleNewRequest}
        >
          <View>
            <Text className="text-primary font-bold text-base">Yardım Talep Et</Text>
            <Text className="text-text-secondary text-sm">
              Konum, kişi sayısı ve ihtiyaç türü belirt
            </Text>
          </View>
          <Text className="text-2xl">📋</Text>
        </Pressable>

        {/* Info Panel Button */}
        <Pressable
          className="bg-white border border-border rounded-card p-4 mb-3 flex-row items-center justify-between"
          onPress={() => setInfoPanelVisible(true)}
        >
          <View>
            <Text className="text-text-primary font-semibold text-base">
              Bilgilendirme Paneli
            </Text>
            <Text className="text-text-secondary text-sm">
              Acil durum bilgileri ve uyarılar
            </Text>
          </View>
          <Text className="text-2xl">ℹ️</Text>
        </Pressable>

        {/* Status Check */}
        <Pressable
          className="bg-white border border-border rounded-card p-4 flex-row items-center justify-between"
          onPress={() => router.push("/(app)/(tabs)/reports")}
        >
          <View>
            <Text className="text-text-primary font-semibold text-base">
              Taleplerim
            </Text>
            <Text className="text-text-secondary text-sm">
              Aktif ve geçmiş taleplerinizi görün
            </Text>
          </View>
          <Text className="text-2xl">📜</Text>
        </Pressable>
      </ScrollView>

      {/* Info Panel Modal */}
      {isInfoPanelVisible && (
        <View className="absolute inset-0 bg-black/50 justify-end">
          <View className="bg-white rounded-t-modal p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-text-primary">
                Bilgilendirme Paneli
              </Text>
              <Pressable onPress={() => setInfoPanelVisible(false)}>
                <Text className="text-primary text-lg font-bold">✕</Text>
              </Pressable>
            </View>

            <View className="bg-status-urgent/10 rounded-card p-3 mb-3">
              <Text className="text-status-urgent font-semibold text-sm">
                ⚠️ Deprem Bölgesi Uyarısı
              </Text>
              <Text className="text-text-secondary text-xs mt-1">
                Bölgenizde deprem aktivitesi tespit edilmiştir. Güvenli bölgelere
                geçin.
              </Text>
            </View>

            <View className="bg-surface-card rounded-card p-3 mb-3">
              <Text className="text-text-primary font-semibold text-sm">
                📞 Acil Hattı: 112
              </Text>
              <Text className="text-text-secondary text-xs mt-1">
                AFAD: 122 | Kızılay: 168
              </Text>
            </View>

            <View className="bg-surface-card rounded-card p-3">
              <Text className="text-text-primary font-semibold text-sm">
                🏥 En Yakın Toplanma Yeri
              </Text>
              <Text className="text-text-secondary text-xs mt-1">
                Konumunuza göre yönlendirme yapılmaktadır
              </Text>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
