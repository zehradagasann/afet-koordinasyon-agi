import { Tabs } from "expo-router";
import { Text } from "react-native";
import { usePendingRequestSync } from "@/src/hooks/usePendingRequestSync";

export default function AppTabsLayout() {
  usePendingRequestSync();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#E63946",
        tabBarInactiveTintColor: "#9CA3AF",
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
          tabBarIcon: ({ color }) => (
            // Emoji icon keeps dependency footprint low.
            <TabsIcon color={color} icon="🏠" />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Talepler",
          tabBarIcon: ({ color }) => <TabsIcon color={color} icon="📋" />,
        }}
      />
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
