import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Button, Input, AlertBanner } from "@/src/components/ui";
import { useLogin } from "@/src/hooks/useAuth";
import { loginSchema, type LoginFormData } from "@/src/lib/validations";

export default function LoginScreen() {
  const loginMutation = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
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

          {loginMutation.error && (
            <AlertBanner
              variant="error"
              title="Giriş başarısız"
              message={loginMutation.error.message}
            />
          )}

          {/* Email */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label="E-posta"
                placeholder="ornek@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
              />
            )}
          />

          {/* Password */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label="Şifre"
                placeholder="••••••••"
                secureTextEntry
                autoComplete="password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />

          {/* Submit */}
          <View className="mt-2">
            <Button
              title="GİRİŞ YAP"
              size="lg"
              loading={loginMutation.isPending}
              onPress={handleSubmit(onSubmit)}
            />
          </View>

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
