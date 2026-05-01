import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from "react-native";
import { z } from "zod";
import { useUIStore } from "@/src/stores/uiStore";

const schema = z.object({
  personCount: z
    .string()
    .min(1, "Kişi sayısı girin")
    .refine((v) => {
      const n = parseInt(v, 10);
      return !isNaN(n) && n >= 1 && n <= 999;
    }, "1 ile 999 arasında bir sayı girin"),
});

type FormData = z.infer<typeof schema>;

const QUICK_VALUES = [1, 2, 3, 4, 5, 10];

export default function PersonsScreen() {
  const router = useRouter();
  const { requestDraft, updateDraft } = useUIStore();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { personCount: String(requestDraft.personCount) },
  });

  const onSubmit = (data: FormData) => {
    updateDraft({ personCount: parseInt(data.personCount, 10) });
    router.push("/(app)/request/needs");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-primary px-4 py-4 flex-row items-center gap-3">
        <Pressable onPress={() => router.back()}>
          <Text className="text-white text-xl font-bold">←</Text>
        </Pressable>
        <View>
          <Text className="text-white font-bold text-lg">Kişi Sayısı</Text>
          <Text className="text-white/70 text-xs">Adım 2 / 3</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="h-1.5 bg-border">
        <View className="h-1.5 bg-primary w-2/3" />
      </View>

      <View className="flex-1 p-6">
        <Text className="text-xl font-bold text-text-primary mb-2">
          Kaç Kişisiniz?
        </Text>
        <Text className="text-text-secondary text-sm mb-8">
          Yardıma ihtiyaç duyan toplam kişi sayısını girin
        </Text>

        {/* Number Input */}
        <View className="items-center mb-8">
          <Controller
            control={control}
            name="personCount"
            render={({ field: { onChange, value, onBlur } }) => (
              <TextInput
                className={`border-2 rounded-card text-center text-5xl font-bold text-text-primary w-40 py-6 ${
                  errors.personCount ? "border-primary" : "border-border"
                }`}
                keyboardType="numeric"
                maxLength={3}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          {errors.personCount && (
            <Text className="text-primary text-sm mt-2">
              {errors.personCount.message}
            </Text>
          )}
          <Text className="text-text-secondary text-sm mt-3">kişi</Text>
        </View>

        {/* Quick Select */}
        <Text className="text-xs font-semibold text-text-secondary uppercase mb-3">
          Hızlı Seçim
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-8">
          {QUICK_VALUES.map((val) => (
            <Pressable
              key={val}
              className="border-2 border-border rounded-card px-5 py-3"
              onPress={() => setValue("personCount", String(val))}
            >
              <Text className="text-text-primary font-semibold text-base">
                {val}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Next */}
        <Pressable
          className="bg-primary rounded-button py-4 items-center"
          onPress={handleSubmit(onSubmit)}
        >
          <Text className="text-white font-bold text-base">SONRAKI →</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
