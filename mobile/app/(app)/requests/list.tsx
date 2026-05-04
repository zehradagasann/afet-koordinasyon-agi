import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { useMemo, useState } from "react";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingOverlay,
  ScreenHeader,
  StatusBadge,
  getNeedLabel,
} from "@/src/components/ui";
import { useMyRequests } from "@/src/hooks/useRequests";
import type { DisasterRequest, RequestStatus } from "@/src/types";

function RequestItem({ item }: { item: DisasterRequest }) {
  const router = useRouter();
  return (
    <Card className="mb-3">
      <Pressable onPress={() => router.push(`/(app)/requests/${item.id}`)}>
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-text-primary font-semibold text-base flex-1">
            {getNeedLabel(item.need_type)}
          </Text>
          <StatusBadge status={item.status} />
        </View>
        <Text className="text-text-secondary text-sm">
          👥 {item.person_count} kişi
        </Text>
        <Text className="text-text-muted text-xs mt-1">
          {new Date(item.created_at).toLocaleDateString("tr-TR", {
            day: "2-digit",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </Pressable>
    </Card>
  );
}

type FilterKey = "all" | RequestStatus;
type SortKey = "newest" | "oldest" | "priority";

type RequestsListScreenProps = {
  embeddedInTabs?: boolean;
};

export default function RequestsListScreen({
  embeddedInTabs = false,
}: RequestsListScreenProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sortBy, setSortBy] = useState<SortKey>("newest");

  const { data, isLoading, error, refetch } = useMyRequests();

  const filteredAndSorted = useMemo(() => {
    const items = [...(data ?? [])];

    const filtered =
      filter === "all" ? items : items.filter((item) => item.status === filter);

    const byDateDesc = (a: DisasterRequest, b: DisasterRequest) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    const byDateAsc = (a: DisasterRequest, b: DisasterRequest) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    const byPriority = (a: DisasterRequest, b: DisasterRequest) => {
      const priority: Record<RequestStatus, number> = {
        pending: 5,
        active: 4,
        assigned: 3,
        resolved: 2,
        cancelled: 1,
      };
      return priority[b.status] - priority[a.status] || byDateDesc(a, b);
    };

    if (sortBy === "oldest") return filtered.sort(byDateAsc);
    if (sortBy === "priority") return filtered.sort(byPriority);
    return filtered.sort(byDateDesc);
  }, [data, filter, sortBy]);

  const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
    { key: "all",       label: "Tümü"     },
    { key: "pending",   label: "Bekliyor" },
    { key: "active",    label: "Aktif"    },
    { key: "assigned",  label: "Atandı"   },
    { key: "resolved",  label: "Çözüldü"  },
    { key: "cancelled", label: "İptal"    },
  ];

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: "newest", label: "En Yeni" },
    { key: "oldest", label: "En Eski" },
    { key: "priority", label: "Öncelik" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-surface-card">
      <ScreenHeader
        title="Taleplerim"
        onBack={embeddedInTabs ? undefined : () => router.back()}
      />

      {isLoading ? (
        <LoadingOverlay />
      ) : error ? (
        <ErrorState message="Talepler yüklenemedi" onRetry={() => refetch()} />
      ) : (
        <FlatList
          data={filteredAndSorted}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RequestItem item={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
          ListHeaderComponent={
            <View className="mb-4">
              <Text className="text-xs font-semibold text-text-secondary uppercase mb-2">
                Filtre
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-3">
                {FILTER_OPTIONS.map((option) => {
                  const active = filter === option.key;
                  return (
                    <Pressable
                      key={option.key}
                      className={`px-3 py-2 rounded-full border ${
                        active
                          ? "bg-primary border-primary"
                          : "bg-white border-border"
                      }`}
                      onPress={() => setFilter(option.key)}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          active ? "text-white" : "text-text-secondary"
                        }`}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text className="text-xs font-semibold text-text-secondary uppercase mb-2">
                Sıralama
              </Text>
              <View className="flex-row gap-2">
                {SORT_OPTIONS.map((option) => {
                  const active = sortBy === option.key;
                  return (
                    <Pressable
                      key={option.key}
                      className={`px-3 py-2 rounded-full border ${
                        active
                          ? "bg-primary border-primary"
                          : "bg-white border-border"
                      }`}
                      onPress={() => setSortBy(option.key)}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          active ? "text-white" : "text-text-secondary"
                        }`}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              icon="📋"
              title={
                filter === "all"
                  ? "Henüz talebiniz bulunmuyor"
                  : "Bu filtrede talep bulunamadı"
              }
              description={
                filter === "all"
                  ? "Yardım ihtiyacınız olduğunda hızlıca talep oluşturabilirsiniz."
                  : undefined
              }
              actionTitle={filter === "all" ? "İlk Talebimi Oluştur" : undefined}
              onAction={filter === "all" ? () => router.push("/(app)/request/location") : undefined}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
