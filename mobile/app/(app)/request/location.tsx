import { useRouter } from "expo-router";
import * as LocationLib from "expo-location";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { LocationMap } from "@/components/location-map";
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
      {/* Header */}
      <View className="bg-primary px-4 py-4 flex-row items-center gap-3">
        <Pressable onPress={() => router.back()}>
          <Text className="text-white text-xl font-bold">←</Text>
        </Pressable>
        <View>
          <Text className="text-white font-bold text-lg">Konum Tespiti</Text>
          <Text className="text-white/70 text-xs">Adım 1 / 3</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="h-1.5 bg-border">
        <View className="h-1.5 bg-primary w-1/3" />
      </View>

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
        <View className="bg-surface-card rounded-card p-4 mb-4">
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
        </View>

        {/* Refresh */}
        <Pressable
          className="border-2 border-primary rounded-button py-3 items-center mb-4"
          onPress={refreshLocation}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <ActivityIndicator color="#E63946" />
          ) : (
            <Text className="text-primary font-semibold">
              📍 GPS ile Tekrar Ölç
            </Text>
          )}
        </Pressable>

        {/* Confirm */}
        <Pressable
          className={`rounded-button py-4 items-center ${
            activeLocation ? "bg-primary" : "bg-primary/40"
          }`}
          onPress={handleConfirm}
          disabled={!activeLocation}
        >
          <Text className="text-white font-bold text-base">
            BU KONUMU ONAYLA →
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
