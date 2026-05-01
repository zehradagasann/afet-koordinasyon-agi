import MapView, { Marker } from "react-native-maps";
import { View } from "react-native";

interface LocationMapProps {
  latitude: number;
  longitude: number;
  onLocationChange?: (lat: number, lon: number) => void;
}

export function LocationMap({
  latitude,
  longitude,
  onLocationChange,
}: LocationMapProps) {
  return (
    <View className="w-full h-56 rounded-card overflow-hidden border border-border">
      <MapView
        style={{ flex: 1 }}
        region={{
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        onPress={(e) => {
          const { latitude: lat, longitude: lon } = e.nativeEvent.coordinate;
          onLocationChange?.(lat, lon);
        }}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          pinColor="#E63946"
          title="Talep Konumu"
          draggable
          onDragEnd={(e) => {
            const { latitude: lat, longitude: lon } =
              e.nativeEvent.coordinate;
            onLocationChange?.(lat, lon);
          }}
        />
      </MapView>
    </View>
  );
}
