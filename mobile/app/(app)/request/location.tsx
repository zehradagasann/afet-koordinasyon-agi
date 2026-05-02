import { useRouter } from "expo-router";
import * as LocationLib from "expo-location";
import { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { LocationMap } from "@/components/location-map";
import { Button, Card, ProgressBar, ScreenHeader } from "@/src/components/ui";
import { useLocationStore } from "@/src/stores/locationStore";

export default function LocationConfirmScreen() {
  const router = useRouter();
  const { currentLocation, selectedLocation, setSelectedLocation } =
    useLocationStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeLocation = selectedLocation ?? currentLocation;

  const refreshLocation = async () => {
    setIsRefreshing(true);
    try {
      const { status } = await LocationLib.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await LocationLib.getCurrentPositionAsync({
        accuracy: LocationLib.Accuracy.High,
      });
      setSelectedLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy ?? undefined,
        timestamp: loc.timestamp,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMapMove = (lat: number, lon: number) => {
    setSelectedLocation({
      latitude: lat,
      longitude: lon,
      accuracy: undefined,
      timestamp: Date.now(),
    });
  };

  const handleConfirm = () => {
    if (!activeLocation) return;
    setSelectedLocation(activeLocation);
    router.push("/(app)/request/persons");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScreenHeader
        title="Konum Tespiti"
        subtitle="Adım 1 / 4"
        onBack={() => router.back()}
      />

      <ProgressBar current={1} total={4} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-xl font-bold text-text-primary mb-2">
          Konumunuzu Onaylayın
        </Text>
        <Text className="text-text-secondary text-sm mb-5">
          Harita üzerinde dokunarak veya pini sürükleyerek konumu
          değiştirebilirsiniz.
        </Text>

        {/* Map */}
        {activeLocation ? (
          <View className="mb-4">
            <LocationMap
              latitude={activeLocation.latitude}
              longitude={activeLocation.longitude}
              onLocationChange={handleMapMove}
            />
          </View>
        ) : (
          <View className="w-full h-56 rounded-card bg-surface-card items-center justify-center mb-4">
            <ActivityIndicator color="#E63946" />
            <Text className="text-text-secondary text-sm mt-2">
              Konum alınıyor...
            </Text>
          </View>
        )}

        {/* Coordinate Card */}
        <Card className="mb-4">
          <Text className="text-xs font-semibold text-text-secondary uppercase mb-3">
            Tespit Edilen Konum
          </Text>

          {activeLocation ? (
            <>
              <View className="flex-row gap-2 mb-2">
                <Text className="text-text-muted text-sm w-20">Enlem:</Text>
                <Text className="text-text-primary font-mono text-sm">
                  {activeLocation.latitude.toFixed(6)}
                </Text>
              </View>
              <View className="flex-row gap-2 mb-2">
                <Text className="text-text-muted text-sm w-20">Boylam:</Text>
                <Text className="text-text-primary font-mono text-sm">
                  {activeLocation.longitude.toFixed(6)}
                </Text>
              </View>
              {activeLocation.accuracy && (
                <View className="flex-row gap-2">
                  <Text className="text-text-muted text-sm w-20">Doğruluk:</Text>
                  <Text className="text-text-primary text-sm">
                    ±{Math.round(activeLocation.accuracy)}m
                  </Text>
                </View>
              )}
            </>
          ) : (
            <Text className="text-text-secondary text-sm">
              Konum verisi bekleniyor...
            </Text>
          )}
        </Card>

        {/* Refresh */}
        <Button
          title="GPS ile Tekrar Ölç"
          icon="📍"
          variant="outline"
          size="md"
          className="mb-4"
          loading={isRefreshing}
          onPress={refreshLocation}
        />

        {/* Confirm */}
        <Button
          title="BU KONUMU ONAYLA →"
          size="lg"
          disabled={!activeLocation}
          onPress={handleConfirm}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
