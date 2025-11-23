import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
  DrawerItem,
} from "@react-navigation/drawer";
import React from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import ThemedButton from "@/components/ui/ThemedButton";
import { useAuth } from "@/hooks/useAuth";
import { useThemeColor } from "@/hooks/useThemeColor";
import alert from "@/utils/alert";

export default function CustomDrawerContent(
  props: DrawerContentComponentProps,
) {
  const { isTutor, user, logout } = useAuth();

  // Colors
  const backgroundColor = useThemeColor({}, "background");
  const surfaceColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");

  const handleLogout = () => {
    alert("Wyloguj", "Czy na pewno chcesz się wylogować?", [
      {
        text: "Anuluj",
        style: "cancel",
      },
      {
        text: "Wyloguj",
        style: "destructive",
        onPress: logout,
      },
    ]);
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Info Section */}
        {user && (
          <ThemedView
            style={[styles.userSection, { backgroundColor: surfaceColor }]}
          >
            <ThemedText style={[styles.userEmail, { color: textColor }]}>
              {user.email}
            </ThemedText>
            <ThemedText style={[styles.userRole, { color: primaryColor }]}>
              {isTutor() ? "Korepetytor" : "Uczeń"}
            </ThemedText>
          </ThemedView>
        )}

        {/* Default Drawer Items */}
        <View style={styles.drawerItems}>
          <DrawerItem
            label={"Plan Lekcji"}
            icon={({ color }) => (
              <IconSymbol size={28} name="calendar" color={color} />
            )}
            onPress={() => props.navigation.navigate("schedule")}
          />

          {isTutor() && (
            <DrawerItem
              label={"Uczniowie"}
              icon={({ color }) => (
                <IconSymbol size={28} name="person" color={color} />
              )}
              onPress={() => props.navigation.navigate("student")}
            />
          )}

          {isTutor() && (
            <DrawerItem
              label={"Zasoby"}
              icon={({ color }) => (
                <IconSymbol size={28} name="folder" color={color} />
              )}
              onPress={() => props.navigation.navigate("resources")}
            />
          )}

          {isTutor() && (
            <DrawerItem
              label={"Grupy"}
              icon={({ color }) => (
                <IconSymbol size={28} name="person.2" color={color} />
              )}
              onPress={() => props.navigation.navigate("groups")}
            />
          )}
        </View>
      </DrawerContentScrollView>
      {/* Logout Section */}
      <ThemedView
        style={[styles.logoutSection, { backgroundColor: surfaceColor }]}
      >
        <ThemedButton
          title="Wyloguj się"
          variant="outline"
          size="medium"
          color="error"
          icon="rectangle.portrait.and.arrow.right"
          onPress={handleLogout}
          style={styles.logoutButton}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  userSection: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  drawerItems: {
    flex: 1,
    paddingTop: 8,
  },
  logoutSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#00000010",
  },
  logoutButton: {
    width: "100%",
  },
});
