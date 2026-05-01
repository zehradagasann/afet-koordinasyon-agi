import { Text, View } from "react-native";

interface LocationMapProps {
  latitude: number;
  longitude: number;
  onLocationChange?: (lat: number, lon: number) => void;
}

export function LocationMap({ latitude, longitude }: LocationMapProps) {
  return (
    <View className="w-full h-56 rounded-card bg-surface-card border border-border items-center justify-center overflow-hidden">
      {/* Decorative grid */}
      <View className="absolute inset-0 opacity-30">
        {Array.from({ length: 6 }).map((_, row) => (
          <View
            key={row}
            className="flex-row"
            style={{ height: `${100 / 6}%` }}
          >
            {Array.from({ length: 6 }).map((__, col) => (
              <View
                key={col}
                className="border border-border"
                style={{ width: `${100 / 6}%` }}
              />
            ))}
          </View>
        ))}
      </View>
      <Text className="text-4xl mb-2">📍</Text>
      <Text className="text-text-primary font-mono text-sm">
        {latitude.toFixed(5)}, {longitude.toFixed(5)}
      </Text>
      <Text className="text-text-muted text-xs mt-1">
        (Harita yalnızca cihaz üzerinde gösterilir)
      </Text>
    </View>
  );
}
