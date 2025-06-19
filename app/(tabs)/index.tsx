import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import AddLessonModal from "@/components/Schedule/AddLessonModal";
import WeeklySchedule from "@/components/Schedule/WeeklySchedule";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useScheduleApi } from "@/hooks/useScheduleApi";
import { usePrimaryColor } from "@/hooks/useThemeColor";
import { LessonRequest, scheduleApi } from "@/services/scheduleApi";

export default function HomeScreen() {
  const { refetch } = useScheduleApi();

  // Color system hooks
  const primaryColor = usePrimaryColor("500");

  // State for Add Lesson modal
  const [addLessonModalVisible, setAddLessonModalVisible] = useState(false);

  // Pull to refresh handler

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

  return (
    <ErrorBoundary>
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
          <WeeklySchedule />
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
