import React, { useState } from "react";
import { StyleSheet } from "react-native";

import LoginScreen from "@/components/Auth/LoginScreen";
import ResetPasswordScreen from "@/components/Auth/ResetPasswordScreen";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/hooks/useAuth";
import { useThemeColor } from "@/hooks/useThemeColor";

type AuthScreen = "login" | "resetPassword";

const AuthContainer = () => {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>("login");
  const { login, resetPassword } = useAuth();

  // Colors
  const backgroundColor = useThemeColor({}, "background");

  const handleLogin = async (
    email: string,
    password: string,
  ): Promise<boolean> => {
    return await login(email, password);
  };

  const handleResetPassword = async (email: string): Promise<boolean> => {
    return await resetPassword(email);
  };

  const navigateToResetPassword = () => {
    setCurrentScreen("resetPassword");
  };

  const navigateToLogin = () => {
    setCurrentScreen("login");
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {currentScreen === "login" ? (
        <LoginScreen
          onLogin={handleLogin}
          onNavigateToResetPassword={navigateToResetPassword}
        />
      ) : (
        <ResetPasswordScreen
          onResetPassword={handleResetPassword}
          onNavigateToLogin={navigateToLogin}
        />
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
  },
});

export default AuthContainer;
