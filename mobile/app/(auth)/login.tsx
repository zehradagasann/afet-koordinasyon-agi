import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { z } from "zod";
import { authService } from "@/src/services/authService";
import { useAuthStore } from "@/src/stores/authStore";

const schema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    try {
      const response = await authService.login(data);
      setUser(response.user);
      router.replace("/(app)");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Giriş başarısız oldu";
      setSubmitError(message);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="bg-primary px-6 pt-16 pb-10">
          <Text className="text-white text-3xl font-bold">RESQ</Text>
          <Text className="text-white/80 text-base mt-1">
            Afet Koordinasyon Sistemi
          </Text>
        </View>

        {/* Form */}
        <View className="flex-1 px-6 pt-10">
          <Text className="text-2xl font-bold text-text-primary mb-2">
            Giriş Yap
          </Text>
          <Text className="text-text-secondary text-sm mb-8">
            Hesabınıza giriş yaparak yardım talep edebilirsiniz
          </Text>

          {submitError && (
            <View className="bg-status-urgent/10 border border-status-urgent/40 rounded-card p-3 mb-4">
              <Text className="text-status-urgent font-semibold text-sm">
                ⚠️ Giriş başarısız
              </Text>
              <Text className="text-status-urgent/90 text-xs mt-1">
                {submitError}
              </Text>
            </View>
          )}

          {/* Email */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-text-primary mb-2">
              E-posta
            </Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInput
                  className={`border rounded-input px-4 py-3.5 text-text-primary text-base ${
                    errors.email ? "border-primary" : "border-border"
                  }`}
                  placeholder="ornek@email.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.email && (
              <Text className="text-primary text-xs mt-1">
                {errors.email.message}
              </Text>
            )}
          </View>

          {/* Password */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-text-primary mb-2">
              Şifre
            </Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInput
                  className={`border rounded-input px-4 py-3.5 text-text-primary text-base ${
                    errors.password ? "border-primary" : "border-border"
                  }`}
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoComplete="password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.password && (
              <Text className="text-primary text-xs mt-1">
                {errors.password.message}
              </Text>
            )}
          </View>

          {/* Submit */}
          <Pressable
            className={`rounded-button py-4 items-center ${
              isSubmitting ? "bg-primary/60" : "bg-primary"
            }`}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">GİRİŞ YAP</Text>
            )}
          </Pressable>

          {/* Register link */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-text-secondary text-sm">
              Hesabınız yok mu?{" "}
            </Text>
            <Link href="/(auth)/register" asChild>
              <Pressable>
                <Text className="text-primary font-semibold text-sm">
                  Kayıt Ol
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
