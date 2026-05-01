import { useQuery } from "@tanstack/react-query";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { clusterService } from "@/src/services/clusterService";
import type { VehicleOverrideAlert } from "@/src/types";

export default function AlertsTabScreen() {
  const { data, isLoading, refetch, error } = useQuery({
    queryKey: ["override-alerts"],
    queryFn: clusterService.getOverrideAlerts,
  });

  return (
    <SafeAreaView className="flex-1 bg-surface-card">
      <View className="bg-primary px-4 py-4">
        <Text className="text-white font-bold text-lg">Uyarılar</Text>
        <Text className="text-white/80 text-xs mt-1">
          Araç yönlendirme önerileri (AI)
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-text-secondary text-sm">Yükleniyor...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-text-secondary text-center mb-3">
            Uyarılar alınamadı.
          </Text>
          <Pressable
            className="bg-primary rounded-button px-5 py-3"
            onPress={() => refetch()}
          >
            <Text className="text-white font-semibold text-xs">Tekrar Dene</Text>
          </Pressable>
        </View>
      ) : !data || data.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-4xl mb-3">✅</Text>
          <Text className="text-text-primary font-semibold text-base mb-1">
            Şu an yönlendirme önerisi yok
          </Text>
          <Text className="text-text-secondary text-sm text-center">
            Sistem küme ve araçları taramaya devam ediyor. Yeni kritik durum
            oluştuğunda burada belirecek.
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        >
          {data.map((alert) => (
            <AlertCard key={alert.vehicle_id} alert={alert} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function AlertCard({ alert }: { alert: VehicleOverrideAlert }) {
  return (
    <View className="bg-white rounded-card border border-border p-4 mb-4">
      <Text className="text-xs font-semibold text-status-active uppercase mb-2">
        Önerilen yönlendirme
      </Text>

      <Text className="text-text-primary font-semibold text-base mb-1">
        {alert.vehicle_type} aracı için öneri
      </Text>
      <Text className="text-text-secondary text-sm mb-3">
        Mevcut görev: {alert.current_cluster_name} ({alert.current_need_type})
        {"\n"}
        Yeni görev: {alert.new_cluster_name} ({alert.new_need_type})
      </Text>

      <View className="bg-surface-card rounded-card border border-border/60 p-3 mb-3">
        <Text className="text-text-primary font-semibold text-sm">
          Öncelik farkı: +{alert.score_difference.toFixed(1)} puan
        </Text>
        <Text className="text-text-secondary text-xs mt-1">
          Mevcut skor: {alert.current_cluster_score.toFixed(1)} • Yeni skor:{" "}
          {alert.new_cluster_score.toFixed(1)}
        </Text>
      </View>

      <Text className="text-text-muted text-xs">
        Araç ID: {alert.vehicle_id}
      </Text>
    </View>
  );
}
