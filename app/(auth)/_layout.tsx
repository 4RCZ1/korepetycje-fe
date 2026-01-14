import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  return (
    <Stack 
      initialRouteName="login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="resetPassword" />
      <Stack.Screen name="data-removal" />
    </Stack>
  );
}
