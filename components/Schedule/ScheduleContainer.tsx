import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { Column } from "@/components/Schedule/Column";
import { ThemedText } from "@/components/ThemedText";
import { LessonEntry, Schedule } from "@/services/api";

type ScheduleProps = {
  scheduleData: Schedule | null;
  refreshing: boolean;
  onRefresh: () => void;
  columnHeight: number;
  columnWidth: number;
  confirmingLessons: Set<string>;
  confirmMeeting: (lessonId: string, isConfirmed: boolean) => Promise<boolean>;
};

const ScheduleContainer = ({
  scheduleData,
  refreshing,
  onRefresh,
  columnHeight,
  columnWidth,
  confirmingLessons,
  confirmMeeting,
}: ScheduleProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    date: keyof Schedule;
    itemIndex: number;
    item: LessonEntry;
  } | null>(null);

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

  const handleConfirmation = async (confirmed: boolean) => {
    if (!selectedItem) return;

    const { item } = selectedItem;

    try {
      const success = await confirmMeeting(item.lessonId, confirmed);

      if (success) {
        setModalVisible(false);
        setSelectedItem(null);

        // Show success message
        Alert.alert(
          "Success",
          `Meeting has been ${confirmed ? "confirmed" : "rejected"}.`,
          [{ text: "OK" }],
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Error is already handled in the hook and displayed in the UI
      Alert.alert(
        "Error",
        "Failed to update meeting status. Please try again.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Retry", onPress: () => handleConfirmation(confirmed) },
        ],
      );
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
          {Object.keys(scheduleData ?? {}).map((day, index) => (
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
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
                style={[styles.modalButton, styles.confirmButton]}
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
                style={[styles.modalButton, styles.rejectButton]}
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
                style={[styles.modalButton, styles.cancelButton]}
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
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
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
  },
  rejectButton: {
    backgroundColor: "#F44336",
  },
  cancelButton: {
    backgroundColor: "#9E9E9E",
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
