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

const phoneRegex = /^(?:\+?90)?\s?5\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;

const schema = z
  .object({
    first_name: z.string().min(2, "Ad en az 2 karakter"),
    last_name: z.string().min(2, "Soyad en az 2 karakter"),
    email: z.string().email("Geçerli bir e-posta girin"),
    tc_identity_no: z
      .string()
      .regex(/^\d{11}$/, "TC Kimlik No 11 haneli olmalı"),
    phone: z
      .string()
      .min(10, "Telefon numarasını girin")
      .regex(phoneRegex, "Telefon formatı geçersiz (örn. 0532 123 45 67)"),
    city: z.string().min(2, "Şehir gerekli"),
    district: z.string().min(2, "İlçe gerekli"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      tc_identity_no: "",
      phone: "",
      city: "",
      district: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    try {
      const response = await authService.register({
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        email: data.email.trim().toLowerCase(),
        tc_identity_no: data.tc_identity_no.trim(),
        phone: data.phone.replace(/\s+/g, ""),
        city: data.city.trim(),
        district: data.district.trim(),
        password: data.password,
        role: "citizen",
      });
      setUser(response.user);
      router.replace("/(app)");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Kayıt başarısız oldu";
      setSubmitError(message);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="bg-primary px-6 pt-16 pb-8">
          <Text className="text-white text-3xl font-bold">RESQ</Text>
          <Text className="text-white/80 text-base mt-1">
            Yeni Hesap Oluştur
          </Text>
        </View>

        <View className="flex-1 px-6 pt-6">
          <Text className="text-2xl font-bold text-text-primary mb-2">
            Kayıt Ol
          </Text>
          <Text className="text-text-secondary text-sm mb-5">
            Vatandaş hesabı oluşturarak yardım talep edebilirsiniz
          </Text>

          {submitError && (
            <View className="bg-status-urgent/10 border border-status-urgent/40 rounded-card p-3 mb-4">
              <Text className="text-status-urgent font-semibold text-sm">
                ⚠️ Kayıt başarısız
              </Text>
              <Text className="text-status-urgent/90 text-xs mt-1">
                {submitError}
              </Text>
            </View>
          )}

          {/* Ad / Soyad Row */}
          <View className="flex-row gap-3 mb-3">
            <View className="flex-1">
              <Text className="text-sm font-medium text-text-primary mb-2">
                Ad
              </Text>
              <Controller
                control={control}
                name="first_name"
                render={({ field: { onChange, value, onBlur } }) => (
                  <TextInput
                    className={`border rounded-input px-4 py-3 text-text-primary text-base ${errors.first_name ? "border-primary" : "border-border"}`}
                    placeholder="Adınız"
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
              {errors.first_name && (
                <Text className="text-primary text-xs mt-1">
                  {errors.first_name.message}
                </Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-text-primary mb-2">
                Soyad
              </Text>
              <Controller
                control={control}
                name="last_name"
                render={({ field: { onChange, value, onBlur } }) => (
                  <TextInput
                    className={`border rounded-input px-4 py-3 text-text-primary text-base ${errors.last_name ? "border-primary" : "border-border"}`}
                    placeholder="Soyadınız"
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
              {errors.last_name && (
                <Text className="text-primary text-xs mt-1">
                  {errors.last_name.message}
                </Text>
              )}
            </View>
          </View>

          {/* Email */}
          <View className="mb-3">
            <Text className="text-sm font-medium text-text-primary mb-2">
              E-posta
            </Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInput
                  className={`border rounded-input px-4 py-3 text-text-primary text-base ${errors.email ? "border-primary" : "border-border"}`}
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

          {/* TC Kimlik No */}
          <View className="mb-3">
            <Text className="text-sm font-medium text-text-primary mb-2">
              T.C. Kimlik No
            </Text>
            <Controller
              control={control}
              name="tc_identity_no"
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInput
                  className={`border rounded-input px-4 py-3 text-text-primary text-base ${errors.tc_identity_no ? "border-primary" : "border-border"}`}
                  placeholder="11 haneli kimlik numarası"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  maxLength={11}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.tc_identity_no && (
              <Text className="text-primary text-xs mt-1">
                {errors.tc_identity_no.message}
              </Text>
            )}
          </View>

          {/* Phone */}
          <View className="mb-3">
            <Text className="text-sm font-medium text-text-primary mb-2">
              Telefon
            </Text>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInput
                  className={`border rounded-input px-4 py-3 text-text-primary text-base ${errors.phone ? "border-primary" : "border-border"}`}
                  placeholder="05XX XXX XX XX"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.phone && (
              <Text className="text-primary text-xs mt-1">
                {errors.phone.message}
              </Text>
            )}
          </View>

          {/* Şehir / İlçe */}
          <View className="flex-row gap-3 mb-3">
            <View className="flex-1">
              <Text className="text-sm font-medium text-text-primary mb-2">
                Şehir
              </Text>
              <Controller
                control={control}
                name="city"
                render={({ field: { onChange, value, onBlur } }) => (
                  <TextInput
                    className={`border rounded-input px-4 py-3 text-text-primary text-base ${errors.city ? "border-primary" : "border-border"}`}
                    placeholder="İstanbul"
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
              {errors.city && (
                <Text className="text-primary text-xs mt-1">
                  {errors.city.message}
                </Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-text-primary mb-2">
                İlçe
              </Text>
              <Controller
                control={control}
                name="district"
                render={({ field: { onChange, value, onBlur } }) => (
                  <TextInput
                    className={`border rounded-input px-4 py-3 text-text-primary text-base ${errors.district ? "border-primary" : "border-border"}`}
                    placeholder="Kadıköy"
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
              {errors.district && (
                <Text className="text-primary text-xs mt-1">
                  {errors.district.message}
                </Text>
              )}
            </View>
          </View>

          {/* Password */}
          <View className="mb-3">
            <Text className="text-sm font-medium text-text-primary mb-2">
              Şifre
            </Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInput
                  className={`border rounded-input px-4 py-3 text-text-primary text-base ${errors.password ? "border-primary" : "border-border"}`}
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
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

          {/* Confirm Password */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-text-primary mb-2">
              Şifre Tekrar
            </Text>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInput
                  className={`border rounded-input px-4 py-3 text-text-primary text-base ${errors.confirmPassword ? "border-primary" : "border-border"}`}
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.confirmPassword && (
              <Text className="text-primary text-xs mt-1">
                {errors.confirmPassword.message}
              </Text>
            )}
          </View>

          <Pressable
            className={`rounded-button py-4 items-center ${isSubmitting ? "bg-primary/60" : "bg-primary"}`}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">KAYIT OL</Text>
            )}
          </Pressable>

          <View className="flex-row justify-center mt-6">
            <Text className="text-text-secondary text-sm">
              Zaten hesabınız var mı?{" "}
            </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text className="text-primary font-semibold text-sm">
                  Giriş Yap
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
