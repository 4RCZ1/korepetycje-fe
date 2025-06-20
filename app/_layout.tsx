import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useAuth } from "@/hooks/useAuth";
import { useColorScheme } from "@/hooks/useColorScheme";
import {useEffect,useRef} from "react";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, loading } = useAuth();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const pathname = usePathname();
  const router = useRouter();
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Nawigacja tylko jeśli komponent jest zamontowany i dane są załadowane
    if (isMounted.current && !loading && loaded && !isAuthenticated && !pathname.startsWith("/auth")) {
      // Używamy setTimeout aby opóźnić nawigację do następnego cyklu renderowania
      setTimeout(() => {
        router.replace("/auth");
      }, 0);
    }
  }, [isAuthenticated, pathname, loading, loaded, router]);


  if (!loaded || loading) {
    // Async font loading or auth loading only occurs in development.
    return null;
  }

  console.log('isAuthenticated:', isAuthenticated);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        {isAuthenticated && (
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        )}
        {isAuthenticated && <Stack.Screen name="+not-found" />}
        {!isAuthenticated && (
          <Stack.Screen
            name="auth"
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
