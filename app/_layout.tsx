import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { useRouter, Stack, usePathname, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useEffect, useRef } from "react";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import { useColorScheme } from "@/hooks/useColorScheme";
import { NotificationService } from "@/services/notificationService";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const pathname = usePathname();
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

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

  useEffect(() => {
    console.log("Current Segments:", segments);
    console.log("Current Pathname:", pathname);
  }, [segments, pathname]);

  useEffect(() => {
    console.log("current pathname:", pathname);
    if (!isMounted.current || loading || !loaded) {
      return;
    }

    if (
      pathname.startsWith("/login") ||
      pathname.startsWith("/resetPassword") ||
      pathname.startsWith("/data-removal") ||
      pathname === "/" // Temporary state during navigation
    ) {
      return;
    }
    if (!isAuthenticated) {
      console.log("Redirecting to login, old pathname:", pathname);
      setTimeout(() => {
        router.replace("/login");
      }, 100);
    }
  }, [isAuthenticated, pathname, loading, loaded, isMounted]);

  // Always render a navigator on first render so expo-router has a mounted navigator
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
