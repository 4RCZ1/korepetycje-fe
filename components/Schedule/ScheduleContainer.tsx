import * as ScreenOrientation from "expo-screen-orientation";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { Column } from "@/components/Schedule/Column";
import EditLessonModal from "@/components/Schedule/EditLessonModal";
import { ThemedText } from "@/components/ThemedText";
import ThemedButton from "@/components/ui/ThemedButton";
import { useAuth } from "@/hooks/useAuth";
import { useThemeColor } from "@/hooks/useThemeColor";
import { LessonEntry, Schedule } from "@/services/scheduleApi";
import alert from "@/utils/alert";

const getDaysInRange = (startDate: Date, endDate: Date): string[] => {
  const days: string[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateString = currentDate.toLocaleDateString("en-CA", {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    days.push(dateString);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
};

type ScheduleProps = {
  scheduleData: Schedule | null;
  refreshing: boolean;
  onRefresh: () => void;
  confirmingLessons: Set<string>;
  confirmMeeting: (
    lessonId: string,
    isConfirmed: boolean,
  ) => Promise<boolean | string>;
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
  const { isTutor } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    date: keyof Schedule;
    itemIndex: number;
    item: LessonEntry;
  } | null>(null);
  const [deletingLesson, setDeletingLesson] = useState(false);
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
      if (typeof success === "string") {
        setModalVisible(false);
        setSelectedItem(null);
        alert("Błąd", success);
        return;
      }

      if (success) {
        setModalVisible(false);
        setSelectedItem(null);

        alert(
          "Sukces",
          `Spotkanie zostało ${confirmed ? "potwierdzone" : "odrzucone"}.`,
          [{ text: "OK" }],
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Error is already handled in the hook and displayed in the UI
      alert(
        "Błąd",
        "Nie udało się zaktualizować statusu spotkania. Spróbuj ponownie.",
        [
          { text: "Anuluj", style: "cancel" },
          { text: "Ponów", onPress: () => handleConfirmation(confirmed) },
        ],
      );
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
          "Sukces",
          `Lekcja${deleteFutureLessons ? " i przyszłe lekcje" : ""} została usunięta pomyślnie.`,
          [{ text: "OK" }],
        );
      }
    } catch (error) {
      console.log("Failed to delete lesson:", error);
      alert("Błąd", "Nie udało się usunąć lekcji. Spróbuj ponownie.", [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Ponów",
          onPress: () => handleDeleteLesson(deleteFutureLessons),
        },
      ]);
    } finally {
      setDeletingLesson(false);
    }
  };

  const handleEditLesson = async (
    lessonId: string,
    startTime: string,
    endTime: string,
    editFutureLessons: boolean,
  ) => {
    try {
      const success = await editLesson(
        lessonId,
        startTime,
        endTime,
        editFutureLessons,
      );

      if (success) {
        setEditModalVisible(false);
        setModalVisible(false);
        setSelectedItem(null);
      }

      return success;
    } catch (error) {
      console.log("Failed to edit lesson:", error);
      throw error;
    }
  };

  const handleOpenEditModal = () => {
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setModalVisible(false);
    setSelectedItem(null);
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
        <TouchableWithoutFeedback onPress={closeEditModal}>
          <View
            style={[
              styles.modalOverlay,
              { backgroundColor: "rgba(0, 0, 0, 0.5)" },
            ]}
          >
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View
                style={[styles.modalContent, { backgroundColor: surfaceColor }]}
              >
                <ThemedText style={styles.modalTitle}>
                  Szczegóły Lekcji
                </ThemedText>

                <View style={styles.lessonDetails}>
                  <ThemedText style={styles.modalText}>
                    {selectedItem?.item.description}
                  </ThemedText>

                  {selectedItem?.item.lessonType && (
                    <ThemedText style={styles.modalSubtext}>
                      Typ: {selectedItem.item.lessonType}
                    </ThemedText>
                  )}

                  <ThemedText style={styles.modalSubtext}>
                    Czas: {selectedItem?.item.startTime} -{" "}
                    {selectedItem?.item.endTime}
                  </ThemedText>

                  <ThemedText style={styles.modalSubtext}>
                    Adres: {selectedItem?.item.address}
                  </ThemedText>

                  {/* Attendances */}
                  {selectedItem?.item.attendances &&
                    selectedItem.item.attendances.length > 0 && (
                      <View style={styles.attendancesSection}>
                        <ThemedText style={styles.attendancesTitle}>
                          Uczniowie:
                        </ThemedText>
                        {selectedItem.item.attendances.map(
                          (attendance, index) => (
                            <View key={index} style={styles.attendanceItem}>
                              <ThemedText style={styles.attendanceText}>
                                {attendance.studentName}{" "}
                                {attendance.studentSurname}
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
                                  ? "Potwierdzona"
                                  : attendance.confirmed === false
                                    ? "Odrzucona"
                                    : "Oczekująca"}
                              </ThemedText>
                            </View>
                          ),
                        )}
                      </View>
                    )}
                </View>
                {isTutor() ? (
                  <View style={styles.secondaryButtons}>
                    <ThemedButton
                      title="Edytuj Lekcję"
                      variant="outline"
                      size="small"
                      color="primary"
                      onPress={handleOpenEditModal}
                      style={styles.secondaryButton}
                    />

                    <ThemedButton
                      title="Usuń Lekcję"
                      variant="outline"
                      size="small"
                      color="error"
                      onPress={() => setDeleteModalVisible(true)}
                      style={styles.secondaryButton}
                    />

                    <ThemedButton
                      title="Anuluj"
                      variant="outline"
                      size="small"
                      color="surface"
                      onPress={() => setModalVisible(false)}
                      style={styles.secondaryButton}
                    />
                  </View>
                ) : (
                  <View style={styles.primaryButtons}>
                    <ThemedButton
                      title="Potwierdź"
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
                      title="Odrzuć"
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
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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
            <ThemedText style={styles.modalTitle}>Usuń Lekcję</ThemedText>
            <ThemedText style={styles.modalText}>
              Czy na pewno chcesz usunąć tę lekcję?
            </ThemedText>
            <ThemedText style={styles.modalSubtext}>
              {selectedItem?.item.description}
            </ThemedText>

            <View style={styles.deleteButtons}>
              <ThemedButton
                title="Usuń Tylko Tę Lekcję"
                variant="filled"
                size="medium"
                color="error"
                loading={deletingLesson}
                disabled={deletingLesson}
                onPress={() => handleDeleteLesson(false)}
              />

              <ThemedButton
                title="Usuń Tę + Przyszłe Lekcje"
                variant="filled"
                size="medium"
                color="error"
                loading={deletingLesson}
                disabled={deletingLesson}
                onPress={() => handleDeleteLesson(true)}
              />

              <ThemedButton
                title="Anuluj"
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
      <EditLessonModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        selectedItem={selectedItem}
        editLesson={handleEditLesson}
      />
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
  modalButton: {
    flex: 1,
  },
});

export default ScheduleContainer;
