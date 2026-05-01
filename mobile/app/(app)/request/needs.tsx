import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import type { NeedType } from "@/src/types";
import { useUIStore } from "@/src/stores/uiStore";

interface NeedOption {
  type: NeedType;
  label: string;
  icon: string;
  color: string;
}

const NEED_OPTIONS: NeedOption[] = [
  { type: "rescue", label: "Kurtarma", icon: "🚒", color: "#E63946" },
  { type: "medical", label: "Tıbbi Yardım", icon: "🏥", color: "#DC2626" },
  { type: "food", label: "Yiyecek", icon: "🍞", color: "#F59E0B" },
  { type: "water", label: "Su", icon: "💧", color: "#3B82F6" },
  { type: "shelter", label: "Barınak", icon: "🏠", color: "#8B5CF6" },
  { type: "heating", label: "Isınma", icon: "🔥", color: "#F97316" },
  { type: "clothing", label: "Giyim", icon: "👕", color: "#10B981" },
  { type: "hygiene", label: "Hijyen", icon: "🧼", color: "#06B6D4" },
  { type: "other", label: "Diğer", icon: "📦", color: "#6B7280" },
];

export default function NeedsScreen() {
  const router = useRouter();
  const { requestDraft, updateDraft } = useUIStore();
  const [selected, setSelected] = useState<NeedType[]>(requestDraft.needTypes);
  const [error, setError] = useState<string | null>(null);

  const toggle = (type: NeedType) => {
    setError(null);
    setSelected((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleNext = () => {
    if (selected.length === 0) {
      setError("En az bir ihtiyaç türü seçin");
      return;
    }
    updateDraft({ needTypes: selected });
    router.push("/(app)/request/detail");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-primary px-4 py-4 flex-row items-center gap-3">
        <Pressable onPress={() => router.back()}>
          <Text className="text-white text-xl font-bold">←</Text>
        </Pressable>
        <View>
          <Text className="text-white font-bold text-lg">İhtiyaç Türü</Text>
          <Text className="text-white/70 text-xs">Adım 3 / 3</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="h-1.5 bg-border">
        <View className="h-1.5 bg-primary w-full" />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
        <Text className="text-xl font-bold text-text-primary mb-2">
          Neye İhtiyacınız Var?
        </Text>
        <Text className="text-text-secondary text-sm mb-6">
          Birden fazla seçebilirsiniz
        </Text>

        {error && (
          <View className="bg-primary/10 rounded-card p-3 mb-4">
            <Text className="text-primary text-sm">{error}</Text>
          </View>
        )}

        {/* Grid */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          {NEED_OPTIONS.map((option) => {
            const isSelected = selected.includes(option.type);
            return (
              <Pressable
                key={option.type}
                className={`rounded-card p-4 items-center justify-center border-2 ${
                  isSelected
                    ? "bg-primary border-primary"
                    : "bg-white border-border"
                }`}
                style={{ width: "30%" }}
                onPress={() => toggle(option.type)}
              >
                <Text className="text-3xl mb-2">{option.icon}</Text>
                <Text
                  className={`text-xs font-semibold text-center ${
                    isSelected ? "text-white" : "text-text-primary"
                  }`}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Selected Count */}
        {selected.length > 0 && (
          <View className="bg-primary/10 rounded-card p-3 mb-4">
            <Text className="text-primary text-sm font-medium">
              {selected.length} ihtiyaç türü seçildi:{" "}
              {selected
                .map((t) => NEED_OPTIONS.find((o) => o.type === t)?.label)
                .join(", ")}
            </Text>
          </View>
        )}

        <Pressable
          className={`rounded-button py-4 items-center ${
            selected.length > 0 ? "bg-primary" : "bg-primary/40"
          }`}
          onPress={handleNext}
        >
          <Text className="text-white font-bold text-base">SONRAKI →</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
