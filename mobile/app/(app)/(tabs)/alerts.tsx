import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Text, View } from "react-native";
import {
  Card,
  EmptyState,
  ErrorState,
  LoadingOverlay,
  ScreenHeader,
} from "@/src/components/ui";
import { useOverrideAlerts } from "@/src/hooks/useClusters";
import { useAuthStore } from "@/src/stores/authStore";
import type { VehicleOverrideAlert } from "@/src/types";

export default function AlertsTabScreen() {
  const { user } = useAuthStore();
  const isStaff =
    user?.role === "volunteer" ||
    user?.role === "coordinator" ||
    user?.role === "admin";

  if (isStaff) return <PersonelUyarilar />;
  return <VatandasUyarilar />;
}

// ─── Vatandaş: Bölgesel Uyarılar ──────────────────────────────────────────

const BOLGESEL_UYARILAR = [
  {
    id: "1",
    seviye: "tehlike" as const,
    baslik: "Deprem Bölgesi Uyarısı",
    mesaj:
      "Bölgenizde 4.2 büyüklüğünde deprem aktivitesi tespit edilmiştir. Güvenli alanlara geçin, açık alanlarda bekleyin.",
    zaman: "Az önce",
  },
  {
    id: "2",
    seviye: "dikkat" as const,
    baslik: "Artçı Sarsıntı Riski",
    mesaj:
      "Ana deprem sonrası 24 saat boyunca artçı sarsıntı beklenebilir. Hasarlı yapılara girmeyin.",
    zaman: "15 dk önce",
  },
  {
    id: "3",
    seviye: "bilgi" as const,
    baslik: "AFAD Ekipleri Sahada",
    mesaj:
      "Arama-kurtarma ekipleri bölgenizde aktif olarak çalışmaktadır. 122'yi aramadan önce taleplerinizi sistem üzerinden iletin.",
    zaman: "1 saat önce",
  },
  {
    id: "4",
    seviye: "bilgi" as const,
    baslik: "Toplanma Alanları Açık",
    mesaj:
      "Yakın çevrenizdeki parklar ve okul bahçeleri geçici toplanma alanı olarak hizmet vermektedir.",
    zaman: "2 saat önce",
  },
];

type Seviye = "tehlike" | "dikkat" | "bilgi";

const SEVIYE_STIL: Record<Seviye, { bg: string; metin: string; icon: string; etiket: string }> = {
  tehlike: { bg: "bg-status-urgent/10", metin: "text-status-urgent", icon: "🚨", etiket: "TEHLİKE"  },
  dikkat:  { bg: "bg-status-pending/10", metin: "text-status-pending", icon: "⚠️", etiket: "DİKKAT"  },
  bilgi:   { bg: "bg-status-info/10",   metin: "text-status-info",   icon: "ℹ️", etiket: "BİLGİ"   },
};

function VatandasUyarilar() {
  return (
    <SafeAreaView className="flex-1 bg-surface-card">
      <ScreenHeader
        title="Bölgesel Uyarılar"
        subtitle="AFAD & acil durum bildirimleri"
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Acil hatlar */}
        <Card className="bg-primary/5 border-primary/20 mb-5">
          <Text className="text-xs font-bold text-primary uppercase mb-3 tracking-wide">
            Acil İletişim Hatları
          </Text>
          <View className="flex-row justify-between">
            {[
              { etiket: "Acil", numara: "112" },
              { etiket: "AFAD", numara: "122" },
              { etiket: "Kızılay", numara: "168" },
              { etiket: "Yangın", numara: "110" },
            ].map((item) => (
              <View key={item.etiket} className="items-center">
                <Text className="text-primary font-bold text-xl">{item.numara}</Text>
                <Text className="text-text-muted text-xs">{item.etiket}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Text className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">
          Güncel Uyarılar
        </Text>

        {BOLGESEL_UYARILAR.map((uyari) => {
          const stil = SEVIYE_STIL[uyari.seviye];
          return (
            <View
              key={uyari.id}
              className={`${stil.bg} rounded-card p-4 mb-3 border border-transparent`}
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <Text className="text-base">{stil.icon}</Text>
                  <Text className={`text-xs font-bold ${stil.metin} uppercase tracking-wide`}>
                    {stil.etiket}
                  </Text>
                </View>
                <Text className="text-text-muted text-xs">{uyari.zaman}</Text>
              </View>
              <Text className={`font-semibold text-sm ${stil.metin} mb-1`}>
                {uyari.baslik}
              </Text>
              <Text className="text-text-secondary text-xs leading-5">
                {uyari.mesaj}
              </Text>
            </View>
          );
        })}

        {/* Güvenlik ipuçları */}
        <Text className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3 mt-2">
          Güvenlik Hatırlatıcıları
        </Text>
        {[
          "Hasarlı yapılara kesinlikle girmeyin.",
          "Gaz kokusunda vanayı kapatın, elektriği kesin.",
          "Aile üyelerinizle önceden buluşma yeri belirleyin.",
          "Su ve erzak stoğunuzu kontrol edin.",
        ].map((ipucu, i) => (
          <View key={i} className="flex-row items-start gap-2 mb-2.5">
            <Text className="text-primary font-bold text-sm mt-0.5">•</Text>
            <Text className="text-text-secondary text-sm flex-1 leading-5">{ipucu}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Personel: AI Yönlendirme Uyarıları ───────────────────────────────────

function PersonelUyarilar() {
  const { data, isLoading, refetch, error } = useOverrideAlerts();

  return (
    <SafeAreaView className="flex-1 bg-surface-card">
      <ScreenHeader
        title="Yönlendirme Uyarıları"
        subtitle="Yapay zeka araç önerileri"
      />

      {isLoading ? (
        <LoadingOverlay message="Yükleniyor..." />
      ) : error ? (
        <ErrorState message="Uyarılar alınamadı." onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon="✅"
          title="Şu an yönlendirme önerisi yok"
          description="Sistem küme ve araçları taramaya devam ediyor. Yeni kritik durum oluştuğunda burada görünecek."
        />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        >
          <Text className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">
            Bekleyen Öneriler ({data.length})
          </Text>
          {data.map((alert) => (
            <YonlendirmeKarti key={alert.vehicle_id} alert={alert} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function YonlendirmeKarti({ alert }: { alert: VehicleOverrideAlert }) {
  return (
    <Card className="mb-4 border-l-4 border-l-status-pending">
      <Text className="text-xs font-bold text-status-pending uppercase mb-2 tracking-wide">
        ⚡ Yapay Zeka Yönlendirme Önerisi
      </Text>

      <Text className="text-text-primary font-semibold text-base mb-1">
        {alert.vehicle_type} aracı
      </Text>

      <View className="bg-surface-card rounded-card p-3 mb-3 border border-border/60">
        <View className="flex-row gap-2 mb-1.5">
          <Text className="text-text-muted text-xs w-20">Mevcut:</Text>
          <Text className="text-text-primary text-xs font-medium flex-1">
            {alert.current_cluster_name} — {alert.current_need_type}
          </Text>
        </View>
        <View className="flex-row gap-2">
          <Text className="text-text-muted text-xs w-20">Önerilen:</Text>
          <Text className="text-status-pending text-xs font-bold flex-1">
            {alert.new_cluster_name} — {alert.new_need_type}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2 mb-1">
        <Text className="text-status-urgent font-bold text-sm">
          +{alert.score_difference.toFixed(1)} puan öncelik artışı
        </Text>
      </View>
      <Text className="text-text-muted text-xs">
        Mevcut skor: {alert.current_cluster_score.toFixed(1)} → Yeni skor: {alert.new_cluster_score.toFixed(1)}
      </Text>
    </Card>
  );
}
