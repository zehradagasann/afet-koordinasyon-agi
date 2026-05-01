import { useRouter } from "expo-router";
import { Pressable, SafeAreaView, Text, View } from "react-native";
import { authService } from "@/src/services/authService";
import { useAuthStore } from "@/src/stores/authStore";

export default function ProfileTabScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await authService.logout();
    logout();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-card">
      <View className="bg-primary px-4 py-4">
        <Text className="text-white font-bold text-lg">Profil</Text>
      </View>

      <View className="p-4">
        <View className="bg-white rounded-card border border-border p-4 mb-4">
          <Text className="text-text-primary font-semibold text-base mb-1">
            {user ? `${user.first_name} ${user.last_name}` : "Kullanıcı"}
          </Text>
          <Text className="text-text-secondary text-sm mb-1">{user?.email}</Text>
          <Text className="text-text-muted text-xs">
            Rol: {user?.role ?? "citizen"}
          </Text>
        </View>

        <Pressable
          className="bg-primary rounded-button py-3.5 items-center"
          onPress={handleLogout}
        >
          <Text className="text-white font-bold text-sm">ÇIKIŞ YAP</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
