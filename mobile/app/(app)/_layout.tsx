import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack initialRouteName="(tabs)" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="index" />
      <Stack.Screen
        name="request/location"
        options={{ presentation: "card" }}
      />
      <Stack.Screen
        name="request/persons"
        options={{ presentation: "card" }}
      />
      <Stack.Screen
        name="request/needs"
        options={{ presentation: "card" }}
      />
      <Stack.Screen
        name="request/detail"
        options={{ presentation: "card" }}
      />
      <Stack.Screen name="requests/list" />
      <Stack.Screen name="requests/[id]" />
      <Stack.Screen
        name="status/[id]"
        options={{ presentation: "modal" }}
      />
    </Stack>
  );
}
