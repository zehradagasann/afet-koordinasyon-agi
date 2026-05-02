import { SafeAreaView, ScrollView, Text, View } from "react-native";
import {
  Card,
  EmptyState,
  ErrorState,
  LoadingOverlay,
  ScreenHeader,
} from "@/src/components/ui";
import { useOverrideAlerts } from "@/src/hooks/useClusters";
import type { VehicleOverrideAlert } from "@/src/types";

export default function AlertsTabScreen() {
  const { data, isLoading, refetch, error } = useOverrideAlerts();

  return (
    <SafeAreaView className="flex-1 bg-surface-card">
      <ScreenHeader
        title="Uyarılar"
        subtitle="Araç yönlendirme önerileri (AI)"
      />

      {isLoading ? (
        <LoadingOverlay message="Yükleniyor..." />
      ) : error ? (
        <ErrorState message="Uyarılar alınamadı." onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon="✅"
          title="Şu an yönlendirme önerisi yok"
          description="Sistem küme ve araçları taramaya devam ediyor. Yeni kritik durum oluştuğunda burada belirecek."
        />
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
    <Card className="mb-4">
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
    </Card>
  );
}
