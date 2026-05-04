import { z } from "zod";
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
import { AlertBanner, Button, Input } from "@/src/components/ui";
import { useRegister } from "@/src/hooks/useAuth";
import { registerSchema, type RegisterFormData } from "@/src/lib/validations";

export default function RegisterScreen() {
  const registerMutation = useRegister();

  const confirmSchema = registerSchema
    .and(z.object({ confirmPassword: z.string() }))
    .refine((d) => d.password === d.confirmPassword, {
      message: "Şifreler eşleşmiyor",
      path: ["confirmPassword"],
    });

  type FormData = z.infer<typeof confirmSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(confirmSchema),
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

  const onSubmit = (data: FormData) => {
    const { confirmPassword: _cp, ...rest } = data;
    registerMutation.mutate({ ...rest, role: "citizen" });
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

          {registerMutation.error && (
            <AlertBanner
              variant="error"
              title="Kayıt başarısız"
              message={registerMutation.error.message}
            />
          )}

          {/* Ad / Soyad Row */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Controller
                control={control}
                name="first_name"
                render={({ field: { onChange, value, onBlur } }) => (
                  <Input
                    label="Ad"
                    placeholder="Adınız"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.first_name?.message}
                  />
                )}
              />
            </View>
            <View className="flex-1">
              <Controller
                control={control}
                name="last_name"
                render={({ field: { onChange, value, onBlur } }) => (
                  <Input
                    label="Soyad"
                    placeholder="Soyadınız"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.last_name?.message}
                  />
                )}
              />
            </View>
          </View>

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

          {/* TC Kimlik No */}
          <Controller
            control={control}
            name="tc_identity_no"
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label="T.C. Kimlik No"
                placeholder="11 haneli kimlik numarası"
                keyboardType="number-pad"
                maxLength={11}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.tc_identity_no?.message}
              />
            )}
          />

          {/* Phone */}
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label="Telefon"
                placeholder="05XX XXX XX XX"
                keyboardType="phone-pad"
                autoComplete="tel"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.phone?.message}
              />
            )}
          />

          {/* Şehir / İlçe */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Controller
                control={control}
                name="city"
                render={({ field: { onChange, value, onBlur } }) => (
                  <Input
                    label="Şehir"
                    placeholder="İstanbul"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.city?.message}
                  />
                )}
              />
            </View>
            <View className="flex-1">
              <Controller
                control={control}
                name="district"
                render={({ field: { onChange, value, onBlur } }) => (
                  <Input
                    label="İlçe"
                    placeholder="Kadıköy"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.district?.message}
                  />
                )}
              />
            </View>
          </View>

          {/* Password */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label="Şifre"
                placeholder="••••••••"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />

          {/* Confirm Password */}
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label="Şifre Tekrar"
                placeholder="••••••••"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
              />
            )}
          />

          <View className="mt-2">
            <Button
              title="KAYIT OL"
              size="lg"
              loading={registerMutation.isPending}
              onPress={handleSubmit(onSubmit)}
            />
          </View>

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
