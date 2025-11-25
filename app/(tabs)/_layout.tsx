import { Drawer } from "expo-router/drawer";
import React from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import CustomDrawerContent from "@/components/Navigation/CustomDrawerContent";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
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
          name="schedule"
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
        <Drawer.Screen
          name="resources"
          options={{
            drawerLabel: "Resources",
            title: "Resources",
            drawerIcon: ({ color }) => (
              <IconSymbol size={28} name="folder" color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="groups"
          options={{
            drawerLabel: "Groups",
            title: "Groups",
            drawerIcon: ({ color }) => (
              <IconSymbol size={28} name="person.2" color={color} />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
