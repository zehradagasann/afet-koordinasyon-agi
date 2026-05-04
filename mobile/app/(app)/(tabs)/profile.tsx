import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "react-native";
import { Button, Card, ScreenHeader } from "@/src/components/ui";
import { useLogout } from "@/src/hooks/useAuth";
import { useAuthStore } from "@/src/stores/authStore";

export default function ProfileTabScreen() {
  const { user } = useAuthStore();
  const handleLogout = useLogout();

  return (
    <SafeAreaView className="flex-1 bg-surface-card">
      <ScreenHeader title="Profil" />

      <View className="p-4">
        {/* User Info Card */}
        <Card className="mb-4">
          <View className="items-center mb-3">
            <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-2">
              <Text className="text-2xl">👤</Text>
            </View>
            <Text className="text-text-primary font-semibold text-base">
              {user ? `${user.first_name} ${user.last_name}` : "Kullanıcı"}
            </Text>
            <Text className="text-text-secondary text-sm">{user?.email}</Text>
          </View>

          <View className="border-t border-border pt-3">
            <View className="flex-row justify-between py-2">
              <Text className="text-text-muted text-sm">Telefon</Text>
              <Text className="text-text-primary text-sm font-medium">
                {user?.phone ?? "—"}
              </Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-text-muted text-sm">Şehir</Text>
              <Text className="text-text-primary text-sm font-medium">
                {user?.city ?? "—"}, {user?.district ?? "—"}
              </Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-text-muted text-sm">Rol</Text>
              <Text className="text-text-primary text-sm font-medium capitalize">
                {user?.role ?? "citizen"}
              </Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-text-muted text-sm">Durum</Text>
              <Text className="text-status-active text-sm font-medium">
                {user?.is_active ? "Aktif" : "Pasif"}
              </Text>
            </View>
          </View>
        </Card>

        {/* App Info */}
        <Card className="mb-4">
          <Text className="text-text-muted text-xs mb-1">Uygulama Sürümü</Text>
          <Text className="text-text-primary text-sm font-medium">
            RESQ v1.0.0
          </Text>
        </Card>

        {/* Logout */}
        <Button
          title="ÇIKIŞ YAP"
          variant="danger"
          size="lg"
          onPress={handleLogout}
        />
      </View>
    </SafeAreaView>
  );
}
