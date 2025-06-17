import * as ScreenOrientation from "expo-screen-orientation";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import AddLessonModal from "@/components/Schedule/AddLessonModal";
import ScheduleContainer from "@/components/Schedule/ScheduleContainer";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useScheduleApi } from "@/hooks/useScheduleApi";
import { usePrimaryColor } from "@/hooks/useThemeColor";
import { LessonRequest, scheduleApi } from "@/services/scheduleApi";

export default function HomeScreen() {
  const {
    scheduleData,
    loading,
    error,
    refetch,
    confirmMeeting,
    confirmingLessons,
  } = useScheduleApi();

  // Color system hooks
  const primaryColor = usePrimaryColor("500");
  const primaryLightColor = usePrimaryColor("100");

  // State for screen dimensions that updates on rotation
  const [screenDimensions, setScreenDimensions] = useState(() => {
    const { width, height } = Dimensions.get("window");
    return { width, height };
  });
  // State for pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  // State for Add Lesson modal
  const [addLessonModalVisible, setAddLessonModalVisible] = useState(false);

  // Calculate dynamic values based on current screen dimensions
  const columnWidth = (screenDimensions.width - 32) / 7; // 32 for padding
  const isLandscape = screenDimensions.width > screenDimensions.height;
  const columnHeight = isLandscape ? 430 : 600; // Adjust height based on orientation

  useEffect(() => {
    // Only enable rotation on native platforms, not web
    const setupOrientation = async () => {
      if (Platform.OS !== "web") {
        try {
          // Enable rotation
          await ScreenOrientation.unlockAsync();
        } catch (error) {
          console.warn("Could not unlock screen orientation:", error);
        }
      }
    };

    setupOrientation();

    // Listen for dimension changes (rotation)
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenDimensions({ width: window.width, height: window.height });
    });

    let orientationSubscription: ScreenOrientation.Subscription | null = null;

    if (Platform.OS !== "web") {
      try {
        orientationSubscription =
          ScreenOrientation.addOrientationChangeListener(() => {
            // Force a re-render by updating dimensions
            const { width, height } = Dimensions.get("window");
            setScreenDimensions({ width, height });
          });
      } catch (error) {
        console.warn("Could not add orientation change listener:", error);
      }
    }

    return () => {
      subscription?.remove();
      if (orientationSubscription && Platform.OS !== "web") {
        try {
          ScreenOrientation.removeOrientationChangeListener(
            orientationSubscription,
          );
        } catch (error) {
          console.warn("Could not remove orientation change listener:", error);
        }
      }
    };
  }, []);
  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  // Add lesson handler
  const handleAddLesson = async (
    lessonRequest: LessonRequest,
  ): Promise<boolean> => {
    try {
      const success = await scheduleApi.planLesson(lessonRequest);
      if (success) {
        // Refresh the schedule to show the new lesson
        await refetch();
      }
      return success;
    } catch (error) {
      console.error("Failed to add lesson:", error);
      return false;
    }
  };

  // Loading state
  if (loading && !scheduleData) {
    return (
      <ParallaxScrollView>
        <ThemedView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <ThemedText style={styles.loadingText}>
              Loading schedule...
            </ThemedText>
          </View>
        </ThemedView>
      </ParallaxScrollView>
    );
  }

  // Error state
  if (error && !scheduleData) {
    return (
      <ParallaxScrollView>
        <ThemedView style={styles.container}>
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorTitle}>
              Unable to load schedule
            </ThemedText>
            <ThemedText style={styles.errorMessage}>{error}</ThemedText>
            <TouchableOpacity style={styles.retryButton} onPress={refetch}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </ParallaxScrollView>
    );
  }

  return (
    <ErrorBoundary>
      {" "}
      <ParallaxScrollView>
        <ThemedView style={styles.container}>
          {/* Header with Add Lesson button */}
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={[
                styles.addLessonButton,
                { backgroundColor: primaryColor },
              ]}
              onPress={() => setAddLessonModalVisible(true)}
            >
              <Text style={styles.addLessonButtonText}>+ Add Lesson</Text>
            </TouchableOpacity>
          </View>
          <ThemedText type={"primary"} style={styles.title}>
            Weekly Schedule
          </ThemedText>
          <ThemedText type={"primary"} style={styles.instruction}>
            Tap pending items (lighter blue) to confirm or reject them
          </ThemedText>
          {/* Refresh button for manual refresh since ParallaxScrollView doesn't support RefreshControl */}
          <TouchableOpacity
            style={[
              styles.colorDemoButton,
              {
                backgroundColor: primaryLightColor,
                borderColor: primaryColor,
              },
            ]}
            onPress={onRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator color="#007AFF" size="small" />
            ) : (
              <ThemedText type={"primary"} style={styles.colorDemoButtonText}>
                🔄 Refresh
              </ThemedText>
            )}
          </TouchableOpacity>
          {/* Show error banner if there's an error but we have cached data */}
          {error && scheduleData && (
            <View style={styles.errorBanner}>
              <ThemedText style={styles.errorBannerText}>{error}</ThemedText>
              <TouchableOpacity onPress={() => {}}>
                <ThemedText style={styles.dismissText}>✕</ThemedText>
              </TouchableOpacity>
            </View>
          )}
          <ThemedText type={"primary"} style={styles.dimensionInfo}>
            Screen: {screenDimensions.width.toFixed(0)}x
            {screenDimensions.height.toFixed(0)}
            {isLandscape ? " (Landscape)" : " (Portrait)"}
          </ThemedText>{" "}
          <ScheduleContainer
            scheduleData={scheduleData}
            columnWidth={columnWidth}
            columnHeight={columnHeight}
            confirmingLessons={confirmingLessons}
            confirmMeeting={confirmMeeting}
            onRefresh={onRefresh}
            refreshing={refreshing}
          />
          {/* Add Lesson Modal */}
          <AddLessonModal
            visible={addLessonModalVisible}
            onClose={() => setAddLessonModalVisible(false)}
            onSubmit={handleAddLesson}
          />
        </ThemedView>
      </ParallaxScrollView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  addLessonButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addLessonButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  instruction: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
    opacity: 0.8,
  },
  colorDemoButton: {
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
  },
  colorDemoButtonText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  refreshButton: {
    alignSelf: "center",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  refreshButtonText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  dimensionInfo: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 16,
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    opacity: 0.8,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorBanner: {
    backgroundColor: "#ffebee",
    borderColor: "#f44336",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorBannerText: {
    color: "#d32f2f",
    fontSize: 14,
    flex: 1,
  },
  dismissText: {
    color: "#d32f2f",
    fontSize: 16,
    fontWeight: "bold",
    paddingLeft: 10,
  },
});
