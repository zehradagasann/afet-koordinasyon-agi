import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { requestService } from "@/src/services/requestService";
import type { RequestStatus } from "@/src/types";

const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: "Bekliyor",
  active: "Aktif",
  assigned: "Ekip Atandı",
  resolved: "Çözüldü",
  cancelled: "İptal Edildi",
};

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: request, isLoading } = useQuery({
    queryKey: ["request", id],
    queryFn: () => requestService.getById(id),
    enabled: !!id,
    refetchInterval: 30_000,
  });

  return (
    <SafeAreaView className="flex-1 bg-surface-card">
      <View className="bg-primary px-4 py-4 flex-row items-center gap-3">
        <Pressable onPress={() => router.back()}>
          <Text className="text-white text-xl font-bold">←</Text>
        </Pressable>
        <Text className="text-white font-bold text-lg">Talep Detayı</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#E63946" />
        </View>
      ) : !request ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-text-secondary">Talep bulunamadı</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Status Banner */}
          <View
            className={`rounded-card p-4 mb-4 ${
              request.status === "resolved"
                ? "bg-status-active/10"
                : request.status === "assigned"
                ? "bg-blue-50"
                : "bg-status-pending/10"
            }`}
          >
            <Text className="text-text-secondary text-xs uppercase font-semibold mb-1">
              Durum
            </Text>
            <Text className="text-text-primary text-xl font-bold">
              {STATUS_LABELS[request.status]}
            </Text>
            {request.is_verified && (
              <Text className="text-status-active text-xs mt-1">
                ✓ AFAD tarafından doğrulandı
              </Text>
            )}
          </View>

          {/* Details */}
          <View className="bg-white rounded-card p-4 mb-4 border border-border">
            <Text className="text-xs font-semibold text-text-secondary uppercase mb-3">
              Talep Bilgileri
            </Text>

            <View className="flex-row gap-2 mb-3">
              <Text className="text-text-muted text-sm w-28">İhtiyaç:</Text>
              <Text className="text-text-primary font-medium text-sm capitalize">
                {request.need_type}
              </Text>
            </View>

            <View className="flex-row gap-2 mb-3">
              <Text className="text-text-muted text-sm w-28">Kişi Sayısı:</Text>
              <Text className="text-text-primary font-medium text-sm">
                {request.person_count} kişi
              </Text>
            </View>

            <View className="flex-row gap-2 mb-3">
              <Text className="text-text-muted text-sm w-28">Konum:</Text>
              <Text className="text-text-primary font-mono text-sm">
                {request.latitude.toFixed(4)}, {request.longitude.toFixed(4)}
              </Text>
            </View>

            {request.description && (
              <View className="flex-row gap-2 mb-3">
                <Text className="text-text-muted text-sm w-28">Açıklama:</Text>
                <Text className="text-text-primary text-sm flex-1">
                  {request.description}
                </Text>
              </View>
            )}

            <View className="flex-row gap-2">
              <Text className="text-text-muted text-sm w-28">Oluşturulma:</Text>
              <Text className="text-text-primary text-sm">
                {new Date(request.created_at).toLocaleDateString("tr-TR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>

          {/* Track Status */}
          <Pressable
            className="bg-primary rounded-button py-3.5 items-center mb-3"
            onPress={() =>
              // Note: typedRoutes manifest only refreshes when `expo start` runs;
              // until then the new /status/[id] route is unknown. Cast for now.
              router.push(
                `/(app)/status/${request.id}` as never
              )
            }
          >
            <Text className="text-white font-bold text-base">
              Güvenlik Durumunu Takip Et
            </Text>
          </Pressable>

          {/* Help Info */}
          <View className="bg-primary/5 border border-primary/20 rounded-card p-4">
            <Text className="text-primary font-semibold text-sm mb-1">
              ℹ️ Bilgi
            </Text>
            <Text className="text-text-secondary text-xs">
              Talebiniz koordinatörlere iletildi. Ekip size ulaştığında bildirim
              alacaksınız. Acil durumda 112&apos;yi arayın.
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
