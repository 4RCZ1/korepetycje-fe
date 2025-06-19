import * as ScreenOrientation from "expo-screen-orientation";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { Column } from "@/components/Schedule/Column";
import { ThemedText } from "@/components/ThemedText";
import {
  useThemeColor,
  usePrimaryColor,
  useErrorColor,
} from "@/hooks/useThemeColor";
import { LessonEntry, Schedule } from "@/services/scheduleApi";
import alert from "@/utils/alert";

const getDaysInRange = (startDate: Date, endDate: Date): string[] => {
  const days: string[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    days.push(currentDate.toISOString().split("T")[0]); // Format as YYYY-MM-DD
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
};

type ScheduleProps = {
  scheduleData: Schedule | null;
  refreshing: boolean;
  onRefresh: () => void;
  confirmingLessons: Set<string>;
  confirmMeeting: (lessonId: string, isConfirmed: boolean) => Promise<boolean>;
  startDate: Date;
  endDate: Date;
};

const ScheduleContainer = ({
  scheduleData,
  refreshing,
  onRefresh,
  confirmingLessons,
  confirmMeeting,
  startDate,
  endDate,
}: ScheduleProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    date: keyof Schedule;
    itemIndex: number;
    item: LessonEntry;
  } | null>(null);
  const [screenDimensions, setScreenDimensions] = useState(() => {
    const { width, height } = Dimensions.get("window");
    return { width, height };
  });

  // Calculate dynamic values based on current screen dimensions
  const columnWidth = (screenDimensions.width - 32) / 7; // 32 for padding
  const isLandscape = screenDimensions.width > screenDimensions.height;
  const columnHeight = isLandscape ? 430 : 600; // Adjust height based on orientation

  // Color system hooks
  const surfaceColor = useThemeColor({}, "surface");
  const primaryColor = usePrimaryColor("500");
  const primaryDarkColor = usePrimaryColor("700");
  const errorColor = useErrorColor("500");
  const errorDarkColor = useErrorColor("700");
  const borderColor = useThemeColor({}, "border");

  const handleItemPress = (
    date: string,
    itemIndex: number,
    item: LessonEntry,
  ) => {
    if (item.fullyConfirmed === undefined || item.fullyConfirmed === null) {
      setSelectedItem({ date, itemIndex, item });
      setModalVisible(true);
    }
  };

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

  const daysInRange = getDaysInRange(startDate, endDate);
  console.log("Days in Range:", daysInRange);

  const handleConfirmation = async (confirmed: boolean) => {
    if (!selectedItem) return;

    const { item } = selectedItem;

    try {
      const success = await confirmMeeting(item.lessonId, confirmed);

      if (success) {
        setModalVisible(false);
        setSelectedItem(null);

        alert(
          "Success",
          `Meeting has been ${confirmed ? "confirmed" : "rejected"}.`,
          [{ text: "OK" }],
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Error is already handled in the hook and displayed in the UI
      alert("Error", "Failed to update meeting status. Please try again.", [
        { text: "Cancel", style: "cancel" },
        { text: "Retry", onPress: () => handleConfirmation(confirmed) },
      ]);
    }
  };

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.gridContainer}>
          {daysInRange.map((day, index) => (
            <Column
              columnHeight={columnHeight}
              columnWidth={columnWidth}
              columnIndex={index}
              scheduleData={scheduleData}
              handleItemPress={handleItemPress}
              confirmingLessons={confirmingLessons}
              date={day}
              key={day}
            />
          ))}
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={[
            styles.modalOverlay,
            { backgroundColor: "rgba(0, 0, 0, 0.5)" },
          ]}
        >
          <View
            style={[styles.modalContent, { backgroundColor: surfaceColor }]}
          >
            <ThemedText style={styles.modalTitle}>
              Confirm Schedule Item
            </ThemedText>
            <ThemedText style={styles.modalText}>
              {selectedItem?.item.description}
            </ThemedText>
            <ThemedText style={styles.modalSubtext}>
              {selectedItem?.item.startTime}% - {selectedItem?.item.endTime}%
            </ThemedText>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: primaryColor,
                    borderColor: primaryDarkColor,
                  },
                ]}
                onPress={() => handleConfirmation(true)}
                disabled={
                  selectedItem
                    ? confirmingLessons.has(selectedItem.item.lessonId)
                    : false
                }
              >
                {selectedItem &&
                confirmingLessons.has(selectedItem.item.lessonId) ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <ThemedText style={styles.buttonText}>Confirm</ThemedText>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: errorColor, borderColor: errorDarkColor },
                ]}
                onPress={() => handleConfirmation(false)}
                disabled={
                  selectedItem
                    ? confirmingLessons.has(selectedItem.item.lessonId)
                    : false
                }
              >
                {selectedItem &&
                confirmingLessons.has(selectedItem.item.lessonId) ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <ThemedText style={styles.buttonText}>Reject</ThemedText>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: borderColor, borderColor: borderColor },
                ]}
                onPress={() => setModalVisible(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: "row",
    height: 450,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  modalSubtext: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  modalButton: {
    borderRadius: 8,
    padding: 12,
    minWidth: 80,
    alignItems: "center",
    borderWidth: 1,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 14,
  },
});

export default ScheduleContainer;
