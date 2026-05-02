import { ScrollView, Text, View, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, ScreenHeader, StatusBadge } from "@/src/components/ui";
import { getNeedLabel } from "@/src/components/ui/Badge";
import { useAuthStore } from "@/src/stores/authStore";
import { useOverrideAlerts, useClusters, useExecuteOverride, useCompleteMission } from "@/src/hooks/useClusters";
import { useVehicles } from "@/src/hooks/useVehicles";

export default function TasksScreen() {
  const { user } = useAuthStore();
  const { data: alerts, isLoading: loadingAlerts } = useOverrideAlerts();
  const { data: vehicles, isLoading: loadingVehicles } = useVehicles();
  const { data: clusters, isLoading: loadingClusters } = useClusters();
  const executeOverride = useExecuteOverride();
  const completeMission = useCompleteMission();

  const isLoading = loadingAlerts || loadingVehicles || loadingClusters;

  // Sürücü senaryosu için mock: İlk yoldaki aracı bul
  const activeVehicle = vehicles?.find((v) => v.vehicle_status === "en_route");
  const currentCluster = activeVehicle
    ? clusters?.find((c) => c.cluster_id === activeVehicle.assigned_cluster_id)
    : null;

  const handleExecuteOverride = (vehicleId: string, newClusterId: string) => {
    executeOverride.mutate({ vehicleId, newClusterId }, {
      onSuccess: () => Alert.alert("Başarılı", "Rota başarıyla güncellendi"),
      onError: (err: any) => Alert.alert("Hata", err.message || "Rota güncellenemedi"),
    });
  };

  const handleCompleteMission = (clusterId: string) => {
    completeMission.mutate(clusterId, {
      onSuccess: () => Alert.alert("Başarılı", "Görev tamamlandı olarak işaretlendi"),
      onError: (err: any) => Alert.alert("Hata", err.message || "Görev tamamlanamadı"),
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-card">
      <ScreenHeader
        title="Aktif Görevler"
        subtitle={user?.role === "volunteer" ? "Gönüllü Paneli" : "Koordinatör Paneli"}
      />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        
        {isLoading ? (
          <ActivityIndicator size="large" color="#E63946" className="mt-10" />
        ) : (
          <>
            {/* Atanan Araç Durumu */}
            {activeVehicle ? (
              <Card className="mb-6 bg-blue-50 border-blue-200">
                <Text className="text-xs font-bold text-blue-700 uppercase mb-3">
                  Atanan Aracınız
                </Text>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-text-primary font-bold text-lg">
                    {activeVehicle.vehicle_type} ({activeVehicle.capacity})
                  </Text>
                  <Text className="text-status-active font-semibold text-sm">Yolda</Text>
                </View>
                <Text className="text-text-secondary text-sm mb-4">
                  Stok: Çadır {activeVehicle.tent_count} | Gıda {activeVehicle.food_count} | Su {activeVehicle.water_count}
                </Text>
              </Card>
            ) : (
              <Card className="mb-6">
                <Text className="text-text-secondary">Şu an size atanmış aktif bir araç bulunmuyor.</Text>
              </Card>
            )}

            {/* Current Task */}
            {currentCluster && activeVehicle && (
              <>
                <Text className="text-sm font-semibold text-text-secondary uppercase mb-3">
                  Mevcut Hedef (Küme)
                </Text>
                <Card className="mb-6 border-status-urgent/30 shadow-sm">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-status-urgent font-bold text-base flex-1">
                      {currentCluster.cluster_name}
                    </Text>
                    <StatusBadge status={currentCluster.status} />
                  </View>
                  
                  <View className="flex-row gap-2 mb-2">
                    <Text className="text-text-muted text-sm w-20">İhtiyaç:</Text>
                    <Text className="text-text-primary font-medium text-sm">
                      {getNeedLabel(currentCluster.need_type as any)}
                    </Text>
                  </View>

                  <View className="flex-row gap-2 mb-4">
                    <Text className="text-text-muted text-sm w-20">Öncelik:</Text>
                    <Text className="text-text-primary font-medium text-sm uppercase">
                      {currentCluster.priority_level} ({currentCluster.average_priority_score.toFixed(1)})
                    </Text>
                  </View>

                  <Button 
                    title="OLAY YERİNE ULAŞILDI" 
                    variant="primary" 
                    size="md" 
                    loading={completeMission.isPending}
                    onPress={() => handleCompleteMission(currentCluster.cluster_id)}
                  />
                </Card>
              </>
            )}

            {/* AI Override Suggestions */}
            <View className="flex-row items-center justify-between mb-3 mt-2">
              <Text className="text-sm font-semibold text-text-secondary uppercase">
                Yapay Zeka Yönlendirmeleri
              </Text>
              {alerts && alerts.length > 0 && (
                <View className="bg-status-urgent rounded-full w-5 h-5 items-center justify-center">
                  <Text className="text-white text-xs font-bold">{alerts.length}</Text>
                </View>
              )}
            </View>

            {alerts && alerts.length > 0 ? (
              alerts.map((alert) => (
                <Card key={alert.vehicle_id} className="mb-3 border-l-4 border-l-status-pending">
                  <Text className="text-status-pending font-bold text-sm mb-1">
                    ⚠️ Rota Değişikliği Önerisi
                  </Text>
                  <Text className="text-text-primary text-sm mb-2">
                    Daha acil bir vaka tespit edildi. Yeni hedef: <Text className="font-bold">{alert.new_cluster_name}</Text>
                  </Text>
                  <Text className="text-text-secondary text-xs mb-3">
                    Öncelik artışı: +{alert.score_difference.toFixed(1)} Puan
                  </Text>
                  <View className="flex-row gap-2">
                    <Button title="Reddet" variant="outline" size="sm" style={{ flex: 1 }} />
                    <Button 
                      title="Rotayı Değiştir" 
                      size="sm" 
                      style={{ flex: 1 }} 
                      loading={executeOverride.isPending}
                      onPress={() => handleExecuteOverride(alert.vehicle_id, alert.new_cluster_id)}
                    />
                  </View>
                </Card>
              ))
            ) : (
              <Text className="text-text-secondary text-sm italic">Şu an için yeni bir yönlendirme yok.</Text>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
