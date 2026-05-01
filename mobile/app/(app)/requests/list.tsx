import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import { useMemo, useState } from "react";
import { requestService } from "@/src/services/requestService";
import type { DisasterRequest, RequestStatus } from "@/src/types";

const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: "Bekliyor",
  active: "Aktif",
  assigned: "Atandı",
  resolved: "Çözüldü",
  cancelled: "İptal",
};

const STATUS_COLORS: Record<RequestStatus, string> = {
  pending: "bg-status-pending/20 text-status-pending",
  active: "bg-status-active/20 text-status-active",
  assigned: "bg-blue-100 text-blue-600",
  resolved: "bg-status-resolved/20 text-status-resolved",
  cancelled: "bg-gray-100 text-gray-500",
};

function RequestItem({ item }: { item: DisasterRequest }) {
  const router = useRouter();
  const colorClass = STATUS_COLORS[item.status];
  return (
    <Pressable
      className="bg-white rounded-card p-4 mb-3 border border-border"
      onPress={() => router.push(`/(app)/requests/${item.id}`)}
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-text-primary font-semibold text-base flex-1">
          {item.need_type.charAt(0).toUpperCase() + item.need_type.slice(1)}
        </Text>
        <View className={`rounded-full px-2.5 py-1 ${colorClass.split(" ")[0]}`}>
          <Text className={`text-xs font-semibold ${colorClass.split(" ")[1]}`}>
            {STATUS_LABELS[item.status]}
          </Text>
        </View>
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
  );
}

type RequestsListScreenProps = {
  embeddedInTabs?: boolean;
};

type SortKey = "newest" | "oldest" | "priority";
type FilterKey = "all" | RequestStatus;

export default function RequestsListScreen({
  embeddedInTabs = false,
}: RequestsListScreenProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sortBy, setSortBy] = useState<SortKey>("newest");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["requests"],
    queryFn: requestService.getAll,
  });

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
    { key: "all", label: "Tümü" },
    { key: "pending", label: "Bekliyor" },
    { key: "active", label: "Aktif" },
    { key: "assigned", label: "Atandı" },
    { key: "resolved", label: "Çözüldü" },
  ];

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: "newest", label: "En Yeni" },
    { key: "oldest", label: "En Eski" },
    { key: "priority", label: "Öncelik" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-surface-card">
      <View className="bg-primary px-4 py-4 flex-row items-center gap-3">
        {!embeddedInTabs && (
          <Pressable onPress={() => router.back()}>
            <Text className="text-white text-xl font-bold">←</Text>
          </Pressable>
        )}
        <Text className="text-white font-bold text-lg">Taleplerim</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#E63946" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-text-secondary text-center mb-4">
            Talepler yüklenemedi
          </Text>
          <Pressable className="bg-primary rounded-button px-6 py-3" onPress={() => refetch()}>
            <Text className="text-white font-semibold">Tekrar Dene</Text>
          </Pressable>
        </View>
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
            <View className="items-center py-16">
              <Text className="text-4xl mb-4">📋</Text>
              <Text className="text-text-secondary text-center">
                {filter === "all"
                  ? "Henüz talebiniz yok"
                  : "Bu filtre için talep bulunamadı"}
              </Text>
              <Pressable
                className="bg-primary rounded-button px-6 py-3 mt-4"
                onPress={() => router.push("/(app)/request/location")}
              >
                <Text className="text-white font-semibold">İlk Talebimi Oluştur</Text>
              </Pressable>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
