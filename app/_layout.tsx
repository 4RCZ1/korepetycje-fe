import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useEffect, useRef } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationService } from "@/services/notificationService";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, loading } = useAuth();
  const notifications = useNotifications();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const pathname = usePathname();
  const router = useRouter();
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    // Initialize notification service
    NotificationService.setupNotificationResponseListener();

    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    console.log("current pathname:", pathname);
    if (!isMounted.current || loading || !loaded) {
      return;
    }

    if (
      pathname.startsWith("/login") ||
      pathname.startsWith("/resetPassword") ||
      pathname === "/" // Temporary state during navigation
    ) {
      return;
    }
    if (!isAuthenticated) {
      console.log("Redirecting to login, old pathname:", pathname);
      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 100);
    }
  }, [isAuthenticated, pathname, loading, loaded, router, isMounted]);

  if (!loaded || loading) {
    return null;
  }

  console.log("isAuthenticated:", isAuthenticated);

  return (
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
              gestureEnabled: false, // Disable swipe to go back on auth screens
            }}
          />
        )}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
