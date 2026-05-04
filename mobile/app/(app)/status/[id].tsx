import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { requestService } from "@/src/services/requestService";
import type { RequestStatus } from "@/src/types";

const STATUS_FLOW: { key: RequestStatus; label: string; description: string }[] = [
  {
    key: "pending",
    label: "Talep Alındı",
    description: "Talebiniz sistem tarafından kayıt altına alındı",
  },
  {
    key: "active",
    label: "Doğrulanıyor",
    description: "AFAD ve koordinatörler tarafından inceleniyor",
  },
  {
    key: "assigned",
    label: "Ekip Atandı",
    description: "Yardım ekibi yola çıkarıldı",
  },
  {
    key: "resolved",
    label: "Tamamlandı",
    description: "İhtiyacınız karşılandı",
  },
];

const statusOrder = (s: RequestStatus): number => {
  const idx = STATUS_FLOW.findIndex((step) => step.key === s);
  return idx === -1 ? 0 : idx;
};

export default function StatusScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: request, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["request", id],
    queryFn: () => requestService.getById(id),
    enabled: !!id,
    refetchInterval: 20_000,
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-surface-card items-center justify-center">
        <ActivityIndicator size="large" color="#E63946" />
      </SafeAreaView>
    );
  }

  if (!request) {
    return (
      <SafeAreaView className="flex-1 bg-surface-card items-center justify-center">
        <Text className="text-text-secondary">Talep bulunamadı</Text>
        <Pressable
          className="bg-primary rounded-button px-6 py-3 mt-4"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Geri</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const currentStep = statusOrder(request.status);
  const isCancelled = request.status === "cancelled";

  return (
    <SafeAreaView className="flex-1 bg-surface-card">
      {/* Header */}
      <View className="bg-primary px-4 py-4 flex-row items-center gap-3">
        <Pressable onPress={() => router.back()}>
          <Text className="text-white text-xl font-bold">←</Text>
        </Pressable>
        <View className="flex-1">
          <Text className="text-white font-bold text-lg">Güvenlik Durumu</Text>
          <Text className="text-white/70 text-xs">AFAD ile senkronize</Text>
        </View>
        <Pressable onPress={() => refetch()}>
          <Text className="text-white text-base">{isRefetching ? "..." : "↻"}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* AFAD Verification Banner */}
        <View
          className={`rounded-card p-4 mb-4 ${
            request.is_verified
              ? "bg-status-active/10 border border-status-active/30"
              : "bg-status-pending/10 border border-status-pending/30"
          }`}
        >
          <Text className="text-xs font-semibold uppercase mb-1 text-text-secondary">
            AFAD Doğrulama
          </Text>
          <Text
            className={`font-bold text-lg ${
              request.is_verified ? "text-status-active" : "text-status-pending"
            }`}
          >
            {request.is_verified ? "✓ Doğrulandı" : "⏳ Bekliyor"}
          </Text>
          <Text className="text-text-secondary text-xs mt-1">
            {request.is_verified
              ? "Talebiniz resmi kanallar tarafından onaylandı"
              : "Deprem bölgesi yakınlığı kontrol ediliyor"}
          </Text>
        </View>

        {/* Status Timeline */}
        <Text className="text-xs font-semibold text-text-secondary uppercase mb-3">
          Talep Akışı
        </Text>

        {isCancelled ? (
          <View className="bg-white rounded-card p-4 border border-border">
            <Text className="text-text-primary font-bold text-base">
              ✕ İptal Edildi
            </Text>
            <Text className="text-text-secondary text-sm mt-1">
              Bu talep iptal edilmiş durumda
            </Text>
          </View>
        ) : (
          <View className="bg-white rounded-card p-4 mb-4">
            {STATUS_FLOW.map((step, idx) => {
              const reached = idx <= currentStep;
              const isCurrent = idx === currentStep;
              return (
                <View key={step.key} className="flex-row gap-3">
                  {/* Indicator */}
                  <View className="items-center">
                    <View
                      className={`w-7 h-7 rounded-full items-center justify-center ${
                        reached ? "bg-primary" : "bg-border"
                      }`}
                    >
                      <Text className="text-white text-xs font-bold">
                        {reached ? "✓" : idx + 1}
                      </Text>
                    </View>
                    {idx < STATUS_FLOW.length - 1 && (
                      <View
                        className={`w-0.5 flex-1 my-1 ${
                          idx < currentStep ? "bg-primary" : "bg-border"
                        }`}
                        style={{ minHeight: 32 }}
                      />
                    )}
                  </View>

                  {/* Label */}
                  <View className="flex-1 pb-4">
                    <Text
                      className={`font-semibold text-sm ${
                        isCurrent
                          ? "text-primary"
                          : reached
                            ? "text-text-primary"
                            : "text-text-muted"
                      }`}
                    >
                      {step.label}
                      {isCurrent && (
                        <Text className="text-primary text-xs"> • aktif</Text>
                      )}
                    </Text>
                    <Text className="text-text-secondary text-xs mt-0.5">
                      {step.description}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Quick Actions */}
        <View className="bg-primary/5 border border-primary/20 rounded-card p-4 mb-4">
          <Text className="text-primary font-semibold text-sm mb-2">
            ☎️ Acil İletişim
          </Text>
          <View className="flex-row gap-2 mb-2">
            <Text className="text-text-muted text-sm w-24">AFAD:</Text>
            <Text className="text-text-primary font-bold text-sm">122</Text>
          </View>
          <View className="flex-row gap-2 mb-2">
            <Text className="text-text-muted text-sm w-24">Acil:</Text>
            <Text className="text-text-primary font-bold text-sm">112</Text>
          </View>
          <View className="flex-row gap-2">
            <Text className="text-text-muted text-sm w-24">Kızılay:</Text>
            <Text className="text-text-primary font-bold text-sm">168</Text>
          </View>
        </View>

        {/* Detail link */}
        <Pressable
          className="bg-white border border-border rounded-card p-4 flex-row items-center justify-between"
          onPress={() => router.push(`/(app)/requests/${request.id}`)}
        >
          <View>
            <Text className="text-text-primary font-semibold text-sm">
              Talep Detayını Gör
            </Text>
            <Text className="text-text-secondary text-xs mt-1">
              Konum, ihtiyaç ve diğer bilgiler
            </Text>
          </View>
          <Text className="text-text-muted text-2xl">›</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
