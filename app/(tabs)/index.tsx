import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { Image } from 'expo-image';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface ScheduleItem {
  yPosStart: number; // 0-100 percentage from top
  yPosEnd: number;   // 0-100 percentage from top
  text: string;
  confirmed?: boolean | null; // undefined/null = pending, true = confirmed, false = rejected
}

interface WeekSchedule {
  Monday: ScheduleItem[];
  Tuesday: ScheduleItem[];
  Wednesday: ScheduleItem[];
  Thursday: ScheduleItem[];
  Friday: ScheduleItem[];
  Saturday: ScheduleItem[];
  Sunday: ScheduleItem[];
}

// Predefined JSON data with confirmation states
const initialScheduleData: WeekSchedule = {
  Monday: [
    { yPosStart: 10, yPosEnd: 25, text: "Morning Meeting", confirmed: true },
    { yPosStart: 30, yPosEnd: 55, text: "Project Work", confirmed: null },
    { yPosStart: 60, yPosEnd: 75, text: "Lunch Break", confirmed: false }
  ],
  Tuesday: [
    { yPosStart: 15, yPosEnd: 45, text: "Deep Work Session", confirmed: undefined },
    { yPosStart: 50, yPosEnd: 65, text: "Quick Call", confirmed: true },
    { yPosStart: 70, yPosEnd: 90, text: "Code Review", confirmed: null }
  ],
  Wednesday: [
    { yPosStart: 5, yPosEnd: 20, text: "Team Standup", confirmed: true },
    { yPosStart: 25, yPosEnd: 45, text: "Development", confirmed: undefined },
    { yPosStart: 50, yPosEnd: 70, text: "Documentation", confirmed: false },
    { yPosStart: 75, yPosEnd: 85, text: "Planning", confirmed: null }
  ],
  Thursday: [
    { yPosStart: 20, yPosEnd: 50, text: "Client Meeting", confirmed: true },
    { yPosStart: 55, yPosEnd: 80, text: "Implementation", confirmed: undefined }
  ],
  Friday: [
    { yPosStart: 10, yPosEnd: 25, text: "Planning", confirmed: null },
    { yPosStart: 30, yPosEnd: 50, text: "Development", confirmed: true },
    { yPosStart: 55, yPosEnd: 75, text: "Testing", confirmed: undefined },
    { yPosStart: 80, yPosEnd: 90, text: "Wrap-up", confirmed: false }
  ],
  Saturday: [
    { yPosStart: 25, yPosEnd: 65, text: "Personal Project", confirmed: null },
    { yPosStart: 70, yPosEnd: 85, text: "Learning", confirmed: true }
  ],
  Sunday: [
    { yPosStart: 40, yPosEnd: 60, text: "Review & Prep", confirmed: undefined },
    { yPosStart: 65, yPosEnd: 80, text: "Relaxation", confirmed: true }
  ]
};

export default function HomeScreen() {
  const [scheduleData, setScheduleData] = useState<WeekSchedule>(initialScheduleData);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    day: keyof WeekSchedule;
    itemIndex: number;
    item: ScheduleItem;
  } | null>(null);

  const screenWidth = Dimensions.get('window').width;
  const columnWidth = (screenWidth - 32) / 7; // 32 for padding
  const columnHeight = 400; // Fixed column height for percentage calculations
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const weekdayAbbr = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const calculatePosition = (yPos: number): number => {
    return (yPos / 100) * columnHeight;
  };

  const calculateHeight = (yPosStart: number, yPosEnd: number): number => {
    const startPos = calculatePosition(yPosStart);
    const endPos = calculatePosition(yPosEnd);
    return Math.abs(endPos - startPos);
  };

  const getTopPosition = (yPosStart: number, yPosEnd: number): number => {
    const startPos = calculatePosition(yPosStart);
    const endPos = calculatePosition(yPosEnd);
    return Math.min(startPos, endPos);
  };

  const getItemStyle = (confirmed?: boolean | null) => {
    if (confirmed === true) {
      return styles.scheduleItemConfirmed; // Current blue style
    } else if (confirmed === false) {
      return styles.scheduleItemRejected; // Grayed out
    } else {
      return styles.scheduleItemPending; // Lighter blue
    }
  };

  const getTextStyle = (confirmed?: boolean | null) => {
    if (confirmed === false) {
      return styles.scheduleTextRejected;
    }
    return styles.scheduleText;
  };

  const handleItemPress = (day: keyof WeekSchedule, itemIndex: number, item: ScheduleItem) => {
    if (item.confirmed === undefined || item.confirmed === null) {
      setSelectedItem({ day, itemIndex, item });
      setModalVisible(true);
    }
  };

  const handleConfirmation = (confirmed: boolean) => {
    if (selectedItem) {
      setScheduleData(prevData => {
        const newData = { ...prevData };
        newData[selectedItem.day] = [...newData[selectedItem.day]];
        newData[selectedItem.day][selectedItem.itemIndex] = {
          ...newData[selectedItem.day][selectedItem.itemIndex],
          confirmed: confirmed
        };
        return newData;
      });
    }
    setModalVisible(false);
    setSelectedItem(null);
  };

  const getConfirmationStatus = (confirmed?: boolean | null) => {
    if (confirmed === true) return "✓ Confirmed";
    if (confirmed === false) return "✗ Rejected";
    return "? Pending";
  };

  const renderColumn = (dayKey: keyof WeekSchedule, columnIndex: number) => {
    const daySchedule = scheduleData[dayKey];

    return (
      <View key={dayKey} style={[styles.column, { width: columnWidth }]}>
        {/* Day header */}
        <View style={styles.dayHeader}>
          <ThemedText style={styles.dayText}>{weekdayAbbr[columnIndex]}</ThemedText>
        </View>

        {/* Schedule container with fixed height for percentage calculations */}
        <View style={[styles.scheduleContainer, { height: columnHeight }]}>
          {/* Background grid lines for visualization (optional) */}
          {[0, 25, 50, 75, 100].map(percentage => (
            <View
              key={percentage}
              style={[
                styles.gridLine,
                {
                  top: calculatePosition(percentage),
                  width: columnWidth - 4,
                }
              ]}
            />
          ))}

          {/* Schedule items */}
          {daySchedule.map((item, itemIndex) => {
            const top = getTopPosition(item.yPosStart, item.yPosEnd);
            const height = calculateHeight(item.yPosStart, item.yPosEnd);
            const isPending = item.confirmed === undefined || item.confirmed === null;

            const rectangleStyle = {
              top: top,
              width: columnWidth - 4,
              height: height,
            };

            const ItemComponent = isPending ? TouchableOpacity : View;

            return (
              <ItemComponent
                key={itemIndex}
                style={[
                  styles.scheduleItem,
                  getItemStyle(item.confirmed),
                  rectangleStyle
                ]}
                onPress={isPending ? () => handleItemPress(dayKey, itemIndex, item) : undefined}
                activeOpacity={isPending ? 0.7 : 1}
              >
                <ThemedText style={[styles.scheduleText, getTextStyle(item.confirmed)]} numberOfLines={2}>
                  {item.text}
                </ThemedText>
                <ThemedText style={[styles.positionText, getTextStyle(item.confirmed)]}>
                  {item.yPosStart}%-{item.yPosEnd}%
                </ThemedText>
                <ThemedText style={[styles.statusText, getTextStyle(item.confirmed)]}>
                  {getConfirmationStatus(item.confirmed)}
                </ThemedText>
              </ItemComponent>
            );
          })}
        </View>

        {/* Column border */}
        <View style={styles.columnBorder} />
      </View>
    );
  };

  return (
    <ParallaxScrollView headerBackgroundColor={{light: '#A1CEDC', dark: '#1D3D47'}}>
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Weekly Schedule</ThemedText>
        <ThemedText style={styles.instruction}>
          Tap pending items (lighter blue) to confirm or reject them
        </ThemedText>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.gridContainer}>
            {weekdays.map((day, index) =>
              renderColumn(day as keyof WeekSchedule, index)
            )}
          </View>
        </ScrollView>

        {/* Legend for confirmation states */}
        <View style={styles.statusLegend}>
          <ThemedText style={styles.legendTitle}>Status Legend:</ThemedText>
          <View style={styles.statusRow}>
            <View style={[styles.statusIndicator, styles.scheduleItemConfirmed]} />
            <ThemedText style={styles.statusLabel}>Confirmed</ThemedText>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.statusIndicator, styles.scheduleItemPending]} />
            <ThemedText style={styles.statusLabel}>Pending (tap to confirm)</ThemedText>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.statusIndicator, styles.scheduleItemRejected]} />
            <ThemedText style={styles.statusLabel}>Rejected</ThemedText>
          </View>
        </View>

        {/* Confirmation Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ThemedText style={styles.modalTitle}>Confirm Schedule Item</ThemedText>
              <ThemedText style={styles.modalText}>
                {selectedItem?.item.text}
              </ThemedText>
              <ThemedText style={styles.modalSubtext}>
                {selectedItem?.item.yPosStart}% - {selectedItem?.item.yPosEnd}%
              </ThemedText>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={() => handleConfirmation(true)}
                >
                  <ThemedText style={styles.buttonText}>Confirm</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.rejectButton]}
                  onPress={() => handleConfirmation(false)}
                >
                  <ThemedText style={styles.buttonText}>Reject</ThemedText>
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

        <View style={styles.legendContainer}>
          <ThemedText style={styles.legendTitle}>Schedule Details</ThemedText>
          {Object.entries(scheduleData).map(([day, items]) => {
            const confirmed = items.filter(item => item.confirmed === true).length;
            const pending = items.filter(item => item.confirmed === undefined || item.confirmed === null).length;
            const rejected = items.filter(item => item.confirmed === false).length;

            return (
              <View key={day} style={styles.legendDay}>
                <ThemedText style={styles.legendDayName}>{day}:</ThemedText>
                <ThemedText style={styles.legendItems}>
                  {confirmed}✓ {pending}? {rejected}✗
                </ThemedText>
              </View>
            );
          })}
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.7,
  },
  gridContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
  },
  column: {
    position: 'relative',
    marginHorizontal: 1,
  },
  dayHeader: {
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  dayText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  scheduleContainer: {
    position: 'relative',
    backgroundColor: '#fafafa',
    borderRadius: 4,
  },
  gridLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#e0e0e0',
    opacity: 0.5,
  },
  scheduleItem: {
    position: 'absolute',
    borderRadius: 6,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
  },
  scheduleItemConfirmed: {
    backgroundColor: '#007AFF',
    borderColor: '#0056b3',
  },
  scheduleItemPending: {
    backgroundColor: '#87CEEB',
    borderColor: '#6BB6FF',
  },
  scheduleItemRejected: {
    backgroundColor: '#9E9E9E',
    borderColor: '#757575',
  },
  scheduleText: {
    color: 'white',
    fontSize: 9,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 1,
  },
  scheduleTextRejected: {
    color: '#CCCCCC',
    fontSize: 9,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 1,
  },
  positionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 7,
    textAlign: 'center',
    marginBottom: 1,
  },
  statusText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 6,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  columnBorder: {
    position: 'absolute',
    right: 0,
    top: 30,
    bottom: 0,
    width: 1,
    backgroundColor: '#ddd',
  },
  statusLegend: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 10,
    borderWidth: 1,
  },
  statusLabel: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtext: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  modalButton: {
    borderRadius: 8,
    padding: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 14,
  },
  legendContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  legendDay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  legendDayName: {
    fontSize: 14,
    fontWeight: '500',
  },
  legendItems: {
    fontSize: 14,
    opacity: 0.7,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});