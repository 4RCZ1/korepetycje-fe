import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import WeeklySchedule from "@/components/Schedule/WeeklySchedule";
import { ThemedView } from "@/components/ThemedView";
import ThemedButton from "@/components/ui/ThemedButton";
import { useScheduleApi } from "@/hooks/useScheduleApi";
import { LessonRequest, scheduleApi } from "@/services/scheduleApi";

export default function HomeScreen() {
  const { refetch } = useScheduleApi();

  return (
    <ErrorBoundary>
      <ParallaxScrollView>
        <WeeklySchedule />
      </ParallaxScrollView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
  },
});
