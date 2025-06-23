import React, { useState, useEffect } from "react";
import { Modal, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import DateTimePicker from "@/components/ui/DateTimePicker";
import ThemedButton from "@/components/ui/ThemedButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import { LessonEntry } from "@/services/scheduleApi";
import alert from "@/utils/alert";

type EditLessonModalProps = {
  visible: boolean;
  onClose: () => void;
  selectedItem: {
    date: string | number;
    itemIndex: number;
    item: LessonEntry;
  } | null;
  editLesson: (
    lessonId: string,
    startTime: string,
    endTime: string,
    editFutureLessons: boolean,
  ) => Promise<boolean>;
};

const EditLessonModal = ({
  visible,
  onClose,
  selectedItem,
  editLesson,
}: EditLessonModalProps) => {
  const [editingLesson, setEditingLesson] = useState(false);
  const [editStartDateTime, setEditStartDateTime] = useState(new Date());
  const [editEndDateTime, setEditEndDateTime] = useState(new Date());

  // Colors
  const backgroundColor = useThemeColor({}, "background");
  const surfaceColor = useThemeColor({}, "surface");

  // Initialize form when modal opens or selectedItem changes
  useEffect(() => {
    if (visible && selectedItem) {
      // Pre-populate the edit form with current times
      const { item, date } = selectedItem;

      // Create Date objects from the lesson date and times
      const startDateTime = new Date(`${date}T${item.startTime}:00`);
      const endDateTime = new Date(`${date}T${item.endTime}:00`);

      setEditStartDateTime(startDateTime);
      setEditEndDateTime(endDateTime);
    }
  }, [visible, selectedItem]);

  const handleStartDateTimeChange = (newDateTime: Date) => {
    setEditStartDateTime(newDateTime);

    // Always ensure end date is on the same day as start date
    const newEndDateTime = new Date(editEndDateTime);
    newEndDateTime.setFullYear(newDateTime.getFullYear());
    newEndDateTime.setMonth(newDateTime.getMonth());
    newEndDateTime.setDate(newDateTime.getDate());
    setEditEndDateTime(newEndDateTime);

    // If start time is after or equal to end time, adjust end time to be 1 hour after start time
    if (newDateTime >= newEndDateTime) {
      const adjustedEndTime = new Date(newDateTime.getTime() + 60 * 60 * 1000); // Add 1 hour
      setEditEndDateTime(adjustedEndTime);
    }
  };

  const handleEndDateTimeChange = (newDateTime: Date) => {
    // Ensure end time is on the same date as start time
    const adjustedDateTime = new Date(newDateTime);
    adjustedDateTime.setFullYear(editStartDateTime.getFullYear());
    adjustedDateTime.setMonth(editStartDateTime.getMonth());
    adjustedDateTime.setDate(editStartDateTime.getDate());

    setEditEndDateTime(adjustedDateTime);

    // If end time is before or equal to start time, adjust start time to be 1 hour before end time
    if (adjustedDateTime <= editStartDateTime) {
      const adjustedStartTime = new Date(
        adjustedDateTime.getTime() - 60 * 60 * 1000,
      ); // Subtract 1 hour
      setEditStartDateTime(adjustedStartTime);
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

      if (success) {        alert(
          "Sukces",
          `Lekcja${editFutureLessons ? " i przyszłe lekcje" : ""} została zaktualizowana pomyślnie.`,
          [{ text: "OK" }],
        );
        onClose();
      }
    } catch (error) {
      console.log("Failed to edit lesson:", error);      alert("Błąd", "Nie udało się edytować lekcji. Spróbuj ponownie.", [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Ponów",
          onPress: () => handleEditLesson(editFutureLessons),
        },
      ]);
    } finally {
      setEditingLesson(false);
    }
  };

  const handleClose = () => {
    setEditingLesson(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <ThemedView style={[styles.container, { backgroundColor }]}>        <View style={[styles.header, { backgroundColor: surfaceColor }]}>
          <ThemedText style={styles.title}>Edytuj Czas Lekcji</ThemedText>
          <ThemedButton
            title="✕"
            variant="outline"
            size="small"
            color="primary"
            onPress={handleClose}
            style={styles.closeButton}
          />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.formContainer}>
            {/* Lesson Description */}            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                Szczegóły Lekcji
              </ThemedText>
              <ThemedText style={styles.description}>
                {selectedItem?.item.description}
              </ThemedText>
            </View>

            {/* Date/Time Input Section */}            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Data i Godzina</ThemedText>

              {/* Date Picker */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Data</ThemedText>
                <DateTimePicker
                  value={editStartDateTime}
                  onChange={handleStartDateTimeChange}
                  mode="date"
                />
                <ThemedText style={styles.helperText}>
                  Wybierz datę tej lekcji
                </ThemedText>
              </View>

              {/* Time Pickers Row */}
              <View style={styles.timeRow}>
                <View style={styles.timePickerContainer}>
                  <ThemedText style={styles.label}>Godzina Rozpoczęcia</ThemedText>
                  <DateTimePicker
                    value={editStartDateTime}
                    onChange={handleStartDateTimeChange}
                    mode="time"
                  />
                </View>

                <View style={styles.timePickerContainer}>
                  <ThemedText style={styles.label}>Godzina Zakończenia</ThemedText>
                  <DateTimePicker
                    value={editEndDateTime}
                    onChange={handleEndDateTimeChange}
                    mode="time"
                  />
                </View>
              </View>

              <ThemedText style={styles.helperText}>
                Lekcje nie mogą obejmować wielu dni. Godzina zakończenia będzie tego samego dnia.
              </ThemedText>
            </View>

            {/* Action Buttons */}            <View style={styles.buttonSection}>
              <ThemedButton
                title="Aktualizuj Tylko Tę Lekcję"
                variant="filled"
                size="large"
                color="primary"
                loading={editingLesson}
                disabled={editingLesson}
                onPress={() => handleEditLesson(false)}
                style={styles.button}
              />

              <ThemedButton
                title="Aktualizuj Tę + Przyszłe Lekcje"
                variant="filled"
                size="large"
                color="primary"
                loading={editingLesson}
                disabled={editingLesson}
                onPress={() => handleEditLesson(true)}
                style={styles.button}
              />

              <ThemedButton
                title="Anuluj"
                variant="outline"
                size="large"
                color="surface"
                onPress={handleClose}
                style={styles.button}
              />
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    width: 40,
    height: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  formContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    marginBottom: 8,
    padding: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
    marginBottom: 8,
  },
  timePickerContainer: {
    flex: 1,
  },
  buttonSection: {
    gap: 12,
    marginTop: 24,
  },
  button: {
    marginBottom: 8,
  },
});

export default EditLessonModal;
