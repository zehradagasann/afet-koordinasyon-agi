import { Tabs } from "expo-router";
import { Text } from "react-native";
import { usePendingRequestSync } from "@/src/hooks/usePendingRequestSync";
import { useAuthStore } from "@/src/stores/authStore";

export default function AppTabsLayout() {
  usePendingRequestSync();
  const { user } = useAuthStore();
  
  const isStaff = user?.role === "volunteer" || user?.role === "coordinator" || user?.role === "admin";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#E63946",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: 66,
          paddingBottom: 8,
          paddingTop: 6,
          borderTopColor: "#E5E7EB",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ color }) => <TabsIcon color={color} icon="🏠" />,
        }}
      />
      
      {/* Citizen Only Tabs */}
      <Tabs.Screen
        name="reports"
        options={{
          title: "Talepler",
          tabBarIcon: ({ color }) => <TabsIcon color={color} icon="📋" />,
          href: isStaff ? null : "/(app)/(tabs)/reports",
        }}
      />

      {/* Staff Only Tabs */}
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Görevler",
          tabBarIcon: ({ color }) => <TabsIcon color={color} icon="🚑" />,
          href: isStaff ? "/(app)/(tabs)/tasks" : null,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Saha",
          tabBarIcon: ({ color }) => <TabsIcon color={color} icon="🗺️" />,
          href: isStaff ? "/(app)/(tabs)/map" : null,
        }}
      />

      {/* Common Tabs */}
      <Tabs.Screen
        name="alerts"
        options={{
          title: "Uyarılar",
          tabBarIcon: ({ color }) => <TabsIcon color={color} icon="🔔" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => <TabsIcon color={color} icon="👤" />,
        }}
      />
    </Tabs>
  );
}

function TabsIcon({ icon, color }: { icon: string; color: string }) {
  return <Text style={{ color, fontSize: 16 }}>{icon}</Text>;
}
