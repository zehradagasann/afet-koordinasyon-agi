import { SafeAreaView } from "react-native-safe-area-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { z } from "zod";
import { Button, ProgressBar, ScreenHeader } from "@/src/components/ui";
import { useUIStore } from "@/src/stores/uiStore";
import { personCountSchema } from "@/src/lib/validations";

const schema = z.object({
  personCount: z.string().superRefine((val, ctx) => {
    const num = parseInt(val, 10);
    const result = personCountSchema.safeParse(num);
    if (!result.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: result.error.issues[0].message,
      });
    }
  }),
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
      <ScreenHeader
        title="Kişi Sayısı"
        subtitle="Adım 2 / 4"
        onBack={() => router.back()}
      />

      <ProgressBar current={2} total={4} />

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
        <Button
          title="SONRAKİ →"
          size="lg"
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </SafeAreaView>
  );
}
