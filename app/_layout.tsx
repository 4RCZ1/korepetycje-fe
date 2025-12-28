import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useEffect, useRef } from "react";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import { useColorScheme } from "@/hooks/useColorScheme";
import { NotificationService } from "@/services/notificationService";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, loading } = useAuth();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    // Initialize notification service
    NotificationService.setupNotificationResponseListener();

    return () => {
      isMounted.current = false;
    };
  }, []);

  if (!loaded || loading) {
    return null;
  }

  console.log("isAuthenticated:", isAuthenticated);

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          {isAuthenticated && (
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          )}
          {isAuthenticated && <Stack.Screen name="+not-found" />}
          {!isAuthenticated && (
            <Stack.Screen
              name="(auth)"
              options={{
                headerShown: false,
              }}
            />
          )}
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
