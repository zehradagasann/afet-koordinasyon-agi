import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { authService } from "@/src/services/authService";
import { useAuthStore } from "@/src/stores/authStore";
import type { LoginRequest, RegisterRequest } from "@/src/types";

/**
 * Login mutation hook.
 * On success: saves user to Zustand store and navigates to (app).
 */
export function useLogin() {
  const { setUser } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      setUser(response.user);
      router.replace("/(app)");
    },
  });
}

/**
 * Register mutation hook.
 * On success: saves user to Zustand store and navigates to (app).
 */
export function useRegister() {
  const { setUser } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterRequest) =>
      authService.register({ ...data, role: "citizen" }),
    onSuccess: (response) => {
      setUser(response.user);
      router.replace("/(app)");
    },
  });
}

/**
 * Logout helper — clears token, Zustand state, and navigates to login.
 */
export function useLogout() {
  const { logout } = useAuthStore();
  const router = useRouter();

  return async () => {
    await authService.logout();
    logout();
    router.replace("/(auth)/login");
  };
}
