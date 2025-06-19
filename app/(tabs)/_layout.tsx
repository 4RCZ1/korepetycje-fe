import { Drawer } from "expo-router/drawer";
import React from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          drawerActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: true,
          drawerPosition: "left",
          drawerContentContainerStyle: {
            paddingTop: Platform.OS === "ios" ? 50 : 20,
          },
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: "Schedule",
            title: "Schedule",
            drawerIcon: ({ color }) => (
              <IconSymbol size={28} name="calendar" color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="student"
          options={{
            drawerLabel: "Students",
            title: "Students",
            drawerIcon: ({ color }) => (
              <IconSymbol size={28} name="person" color={color} />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
