import { QueryClientProvider } from "@tanstack/react-query";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";
import { queryClient } from "@/src/lib/queryClient";
import { authService } from "@/src/services/authService";
import { useAuthStore } from "@/src/stores/authStore";

function AuthGate() {
  const { isAuthenticated, setUser, setLoading, logout } = useAuthStore();
  const [bootstrapping, setBootstrapping] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const token = await authService.getStoredToken();
      if (!token) {
        if (mounted) logout();
      }
      // Token kontrolü bitti; persist'ten gelen state ile hemen render et
      if (mounted) {
        setLoading(false);
        setBootstrapping(false);
      }
      // Arka planda token'ı doğrula (UI bloklamaz)
      if (token) {
        try {
          const fresh = await authService.getMe();
          if (mounted) setUser(fresh);
        } catch {
          await authService.logout();
          if (mounted) logout();
        }
      }
    };

    bootstrap();
    return () => {
      mounted = false;
    };
  }, [setUser, setLoading, logout]);

  useEffect(() => {
    if (bootstrapping) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(app)");
    }
  }, [isAuthenticated, bootstrapping, segments, router]);

  if (bootstrapping) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#E63946" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthGate />
        <StatusBar style="dark" />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
