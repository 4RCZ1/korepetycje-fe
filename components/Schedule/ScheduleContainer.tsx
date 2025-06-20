import * as ScreenOrientation from "expo-screen-orientation";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { Column } from "@/components/Schedule/Column";
import { ThemedText } from "@/components/ThemedText";
import DateTimePicker from "@/components/ui/DateTimePicker";
import ThemedButton from "@/components/ui/ThemedButton";
import { useThemeColor } from "@/hooks/useThemeColor";
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
  deleteLesson: (
    lessonId: string,
    deleteFutureLessons: boolean,
  ) => Promise<boolean>;
  editLesson: (
    lessonId: string,
    startTime: string,
    endTime: string,
    editFutureLessons: boolean,
  ) => Promise<boolean>;
  startDate: Date;
  endDate: Date;
};

const ScheduleContainer = ({
  scheduleData,
  refreshing,
  onRefresh,
  confirmingLessons,
  confirmMeeting,
  deleteLesson,
  editLesson,
  startDate,
  endDate,
}: ScheduleProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    date: keyof Schedule;
    itemIndex: number;
    item: LessonEntry;
  } | null>(null);
  const [deletingLesson, setDeletingLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState(false);
  const [editStartDateTime, setEditStartDateTime] = useState(new Date());
  const [editEndDateTime, setEditEndDateTime] = useState(new Date());
  const [screenDimensions, setScreenDimensions] = useState(() => {
    const { width, height } = Dimensions.get("window");
    return { width, height };
  });

  // Calculate dynamic values based on current screen dimensions
  const containerWidth = screenDimensions.width - 32; // 32 for padding
  const columnWidth = Math.max(100, containerWidth / 7); // Ensure minimum width of 100
  const isLandscape = screenDimensions.width > screenDimensions.height;
  const columnHeight = isLandscape ? 700 : 900; // Adjust height based on orientation

  // Color system hooks
  const surfaceColor = useThemeColor({}, "surface");
  const confirmedBackgroundColor = useThemeColor({}, "primary", "100");
  const confirmedTextColor = useThemeColor({}, "primary", "700");
  const rejectedBackgroundColor = useThemeColor({}, "error", "100");
  const rejectedTextColor = useThemeColor({}, "error", "700");
  const pendingBackgroundColor = useThemeColor({}, "warning", "100");
  const pendingTextColor = useThemeColor({}, "warning", "700");

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

  const handleDeleteLesson = async (deleteFutureLessons: boolean) => {
    if (!selectedItem) return;

    const { item } = selectedItem;
    setDeletingLesson(true);

    try {
      const success = await deleteLesson(item.lessonId, deleteFutureLessons);

      if (success) {
        setDeleteModalVisible(false);
        setModalVisible(false);
        setSelectedItem(null);

        alert(
          "Success",
          `Lesson${deleteFutureLessons ? " and future lessons" : ""} deleted successfully.`,
          [{ text: "OK" }],
        );
      }
    } catch (error) {
      console.log("Failed to delete lesson:", error);
      alert("Error", "Failed to delete lesson. Please try again.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Retry",
          onPress: () => handleDeleteLesson(deleteFutureLessons),
        },
      ]);
    } finally {
      setDeletingLesson(false);
    }
  };

  const handleEditLesson = async (editFutureLessons: boolean) => {
    if (!selectedItem || !editStartDateTime || !editEndDateTime) return;

    const { item } = selectedItem;
    setEditingLesson(true);

    try {
      // Convert Date objects to ISO 8601 datetime format
      const startDateTime = editStartDateTime.toISOString();
      const endDateTime = editEndDateTime.toISOString();

      const success = await editLesson(
        item.lessonId,
        startDateTime,
        endDateTime,
        editFutureLessons,
      );

      if (success) {
        setEditModalVisible(false);
        setModalVisible(false);
        setSelectedItem(null);
        setEditStartDateTime(new Date());
        setEditEndDateTime(new Date());

        alert(
          "Success",
          `Lesson${editFutureLessons ? " and future lessons" : ""} updated successfully.`,
          [{ text: "OK" }],
        );
      }
    } catch (error) {
      console.log("Failed to edit lesson:", error);
      alert("Error", "Failed to edit lesson. Please try again.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Retry",
          onPress: () => handleEditLesson(editFutureLessons),
        },
      ]);
    } finally {
      setEditingLesson(false);
    }
  };

  const handleOpenEditModal = () => {
    if (!selectedItem) return;

    // Pre-populate the edit form with current times
    const { item } = selectedItem;
    const lessonDate = selectedItem.date; // This should be in YYYY-MM-DD format

    // Create Date objects from the lesson date and times
    const startDateTime = new Date(`${lessonDate}T${item.startTime}:00`);
    const endDateTime = new Date(`${lessonDate}T${item.endTime}:00`);

    setEditStartDateTime(startDateTime);
    setEditEndDateTime(endDateTime);
    setEditModalVisible(true);
  };

  const handleStartDateTimeChange = (newDateTime: Date) => {
    setEditStartDateTime(newDateTime);

    // If this is a date change, also update the end date to the same day (keeping the time)
    if (newDateTime.toDateString() !== editStartDateTime.toDateString()) {
      const newEndDateTime = new Date(editEndDateTime);
      newEndDateTime.setFullYear(newDateTime.getFullYear());
      newEndDateTime.setMonth(newDateTime.getMonth());
      newEndDateTime.setDate(newDateTime.getDate());
      setEditEndDateTime(newEndDateTime);
    }

    // If start time is after or equal to end time, adjust end time to be 1 minute after start time
    if (newDateTime >= editEndDateTime) {
      const adjustedEndTime = new Date(newDateTime.getTime() + 60 * 1000); // Add 1 minute
      setEditEndDateTime(adjustedEndTime);
    }
  };

  const handleEndDateTimeChange = (newDateTime: Date) => {
    setEditEndDateTime(newDateTime);

    // If end time is before start time, adjust start time to be 1 minute before end time
    if (newDateTime <= editStartDateTime) {
      const adjustedStartTime = new Date(newDateTime.getTime() - 60 * 1000); // Subtract 1 minute
      setEditStartDateTime(adjustedStartTime);
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
            <ThemedText style={styles.modalTitle}>Lesson Details</ThemedText>

            <View style={styles.lessonDetails}>
              <ThemedText style={styles.modalText}>
                {selectedItem?.item.description}
              </ThemedText>

              {selectedItem?.item.lessonType && (
                <ThemedText style={styles.modalSubtext}>
                  Type: {selectedItem.item.lessonType}
                </ThemedText>
              )}

              <ThemedText style={styles.modalSubtext}>
                Time: {selectedItem?.item.startTime} -{" "}
                {selectedItem?.item.endTime}
              </ThemedText>

              <ThemedText style={styles.modalSubtext}>
                Address: {selectedItem?.item.address}
              </ThemedText>

              {/* Attendances */}
              {selectedItem?.item.attendances &&
                selectedItem.item.attendances.length > 0 && (
                  <View style={styles.attendancesSection}>
                    <ThemedText style={styles.attendancesTitle}>
                      Students:
                    </ThemedText>
                    {selectedItem.item.attendances.map((attendance, index) => (
                      <View key={index} style={styles.attendanceItem}>
                        <ThemedText style={styles.attendanceText}>
                          {attendance.studentName} {attendance.studentSurname}
                        </ThemedText>
                        <ThemedText
                          style={[
                            styles.attendanceStatus,
                            attendance.confirmed === true && {
                              backgroundColor: confirmedBackgroundColor,
                              color: confirmedTextColor,
                            },
                            attendance.confirmed === false && {
                              backgroundColor: rejectedBackgroundColor,
                              color: rejectedTextColor,
                            },
                            attendance.confirmed === null && {
                              backgroundColor: pendingBackgroundColor,
                              color: pendingTextColor,
                            },
                          ]}
                        >
                          {attendance.confirmed === true
                            ? "Confirmed"
                            : attendance.confirmed === false
                              ? "Rejected"
                              : "Pending"}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                )}
            </View>

            <View style={styles.primaryButtons}>
              <ThemedButton
                title="Confirm"
                variant="filled"
                size="medium"
                color="primary"
                loading={
                  selectedItem
                    ? confirmingLessons.has(selectedItem.item.lessonId)
                    : false
                }
                disabled={
                  selectedItem
                    ? confirmingLessons.has(selectedItem.item.lessonId)
                    : false
                }
                onPress={() => handleConfirmation(true)}
                style={styles.primaryButton}
              />

              <ThemedButton
                title="Reject"
                variant="filled"
                size="medium"
                color="error"
                loading={
                  selectedItem
                    ? confirmingLessons.has(selectedItem.item.lessonId)
                    : false
                }
                disabled={
                  selectedItem
                    ? confirmingLessons.has(selectedItem.item.lessonId)
                    : false
                }
                onPress={() => handleConfirmation(false)}
                style={styles.primaryButton}
              />
            </View>

            <View style={styles.secondaryButtons}>
              <ThemedButton
                title="Edit Lesson"
                variant="outline"
                size="small"
                color="primary"
                onPress={handleOpenEditModal}
                style={styles.secondaryButton}
              />

              <ThemedButton
                title="Delete Lesson"
                variant="outline"
                size="small"
                color="error"
                onPress={() => setDeleteModalVisible(true)}
                style={styles.secondaryButton}
              />

              <ThemedButton
                title="Cancel"
                variant="outline"
                size="small"
                color="surface"
                onPress={() => setModalVisible(false)}
                style={styles.secondaryButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
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
            <ThemedText style={styles.modalTitle}>Delete Lesson</ThemedText>
            <ThemedText style={styles.modalText}>
              Are you sure you want to delete this lesson?
            </ThemedText>
            <ThemedText style={styles.modalSubtext}>
              {selectedItem?.item.description}
            </ThemedText>

            <View style={styles.deleteButtons}>
              <ThemedButton
                title="Delete This Lesson Only"
                variant="filled"
                size="medium"
                color="error"
                loading={deletingLesson}
                disabled={deletingLesson}
                onPress={() => handleDeleteLesson(false)}
              />

              <ThemedButton
                title="Delete This + Future Lessons"
                variant="filled"
                size="medium"
                color="error"
                loading={deletingLesson}
                disabled={deletingLesson}
                onPress={() => handleDeleteLesson(true)}
              />

              <ThemedButton
                title="Cancel"
                variant="outline"
                size="medium"
                color="surface"
                onPress={() => setDeleteModalVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Lesson Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
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
            <ThemedText style={styles.modalTitle}>Edit Lesson Time</ThemedText>
            <ThemedText style={styles.modalText}>
              {selectedItem?.item.description}
            </ThemedText>

            {/* Date/Time Input Section */}
            <View style={styles.timeInputSection}>
              <View>
                <ThemedText style={styles.timeLabel}>Start Date:</ThemedText>
                <DateTimePicker
                  value={editStartDateTime}
                  onChange={handleStartDateTimeChange}
                  mode="date"
                />
              </View>

              <View style={styles.timeInputRow}>
                <View style={styles.timePickerContainer}>
                  <ThemedText style={styles.timeLabel}>Start Time:</ThemedText>
                  <DateTimePicker
                    value={editStartDateTime}
                    onChange={handleStartDateTimeChange}
                    mode="time"
                  />
                </View>

                <View style={styles.timePickerContainer}>
                  <ThemedText style={styles.timeLabel}>End Time:</ThemedText>
                  <DateTimePicker
                    value={editEndDateTime}
                    onChange={handleEndDateTimeChange}
                    mode="time"
                  />
                </View>
              </View>
            </View>

            <View style={styles.editButtons}>
              <ThemedButton
                title="Update This Lesson Only"
                variant="filled"
                size="medium"
                color="primary"
                loading={editingLesson}
                disabled={editingLesson}
                onPress={() => handleEditLesson(false)}
              />

              <ThemedButton
                title="Update This + Future Lessons"
                variant="filled"
                size="medium"
                color="primary"
                loading={editingLesson}
                disabled={editingLesson}
                onPress={() => handleEditLesson(true)}
              />

              <ThemedButton
                title="Cancel"
                variant="outline"
                size="medium"
                color="surface"
                onPress={() => setEditModalVisible(false)}
              />
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
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 20,
    padding: 35,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 400,
    maxWidth: 500,
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
    marginBottom: 8,
    textAlign: "center",
  },
  lessonDetails: {
    width: "100%",
    marginBottom: 20,
  },
  attendancesSection: {
    marginTop: 15,
    width: "100%",
  },
  attendancesTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "left",
  },
  attendanceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 4,
    borderRadius: 6,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  attendanceText: {
    fontSize: 13,
    flex: 1,
  },
  attendanceStatus: {
    fontSize: 12,
    fontWeight: "500",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textAlign: "center",
  },
  primaryButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 15,
    width: "100%",
  },
  primaryButton: {
    flex: 1,
  },
  secondaryButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    width: "100%",
  },
  secondaryButton: {
    flex: 1,
  },
  deleteButtons: {
    flexDirection: "column",
    gap: 10,
    alignSelf: "stretch",
  },
  timeInputSection: {
    alignSelf: "stretch",
  },
  timePickerContainer: {
    flex: 1,
    marginBottom: 15,
  },
  timeInputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  editButtons: {
    flexDirection: "column",
    gap: 10,
  },
  modalButton: {
    flex: 1,
  },
});

export default ScheduleContainer;
