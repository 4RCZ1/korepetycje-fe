import React from "react";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import WeeklySchedule from "@/components/Schedule/WeeklySchedule";

export default function HomeScreen() {
  return (
    <ErrorBoundary>
      <ParallaxScrollView>
        <WeeklySchedule />
      </ParallaxScrollView>
    </ErrorBoundary>
  );
}
