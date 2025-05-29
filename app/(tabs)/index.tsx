import React from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Image } from 'expo-image';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface ScheduleItem {
  yPosStart: number; // 0-100 percentage from top
  yPosEnd: number;   // 0-100 percentage from top
  text: string;
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

// Predefined JSON data with percentage-based positioning
const scheduleData: WeekSchedule = {
  Monday: [
    { yPosStart: 10, yPosEnd: 25, text: "Morning Meeting" },
    { yPosStart: 30, yPosEnd: 55, text: "Project Work" },
    { yPosStart: 60, yPosEnd: 75, text: "Lunch Break" }
  ],
  Tuesday: [
    { yPosStart: 15, yPosEnd: 45, text: "Deep Work Session" },
    { yPosStart: 50, yPosEnd: 65, text: "Quick Call" },
    { yPosStart: 70, yPosEnd: 90, text: "Code Review" }
  ],
  Wednesday: [
    { yPosStart: 5, yPosEnd: 20, text: "Team Standup" },
    { yPosStart: 25, yPosEnd: 45, text: "Development" },
    { yPosStart: 50, yPosEnd: 70, text: "Documentation" },
    { yPosStart: 75, yPosEnd: 85, text: "Planning" }
  ],
  Thursday: [
    { yPosStart: 20, yPosEnd: 50, text: "Client Meeting" },
    { yPosStart: 55, yPosEnd: 80, text: "Implementation" }
  ],
  Friday: [
    { yPosStart: 10, yPosEnd: 25, text: "Planning" },
    { yPosStart: 30, yPosEnd: 50, text: "Development" },
    { yPosStart: 55, yPosEnd: 75, text: "Testing" },
    { yPosStart: 80, yPosEnd: 90, text: "Wrap-up" }
  ],
  Saturday: [
    { yPosStart: 25, yPosEnd: 65, text: "Personal Project" },
    { yPosStart: 70, yPosEnd: 85, text: "Learning" }
  ],
  Sunday: [
    { yPosStart: 40, yPosEnd: 60, text: "Review & Prep" },
    { yPosStart: 65, yPosEnd: 80, text: "Relaxation" }
  ]
};

export default function HomeScreen() {
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

            const rectangleStyle = {
              top: top,
              width: columnWidth - 4,
              height: height,
            };

            return (
              <View
                key={itemIndex}
                style={[styles.scheduleItem, rectangleStyle]}
              >
                <ThemedText style={styles.scheduleText} numberOfLines={3}>
                  {item.text}
                </ThemedText>
                <ThemedText style={styles.positionText}>
                  {item.yPosStart}%-{item.yPosEnd}%
                </ThemedText>
              </View>
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
          Schedule with percentage-based positioning (0-100%)
        </ThemedText>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.gridContainer}>
            {weekdays.map((day, index) =>
              renderColumn(day as keyof WeekSchedule, index)
            )}
          </View>
        </ScrollView>

        {/* Percentage scale reference */}
        <View style={styles.scaleContainer}>
          <ThemedText style={styles.scaleTitle}>Percentage Scale Reference:</ThemedText>
          <View style={styles.scaleBar}>
            {[0, 25, 50, 75, 100].map(percentage => (
              <View key={percentage} style={styles.scaleItem}>
                <ThemedText style={styles.scaleText}>{percentage}%</ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.legendContainer}>
          <ThemedText style={styles.legendTitle}>Schedule Details</ThemedText>
          {Object.entries(scheduleData).map(([day, items]) => (
            <View key={day} style={styles.legendDay}>
              <ThemedText style={styles.legendDayName}>{day}:</ThemedText>
              <ThemedText style={styles.legendItems}>
                {items.length} item{items.length !== 1 ? 's' : ''}
              </ThemedText>
            </View>
          ))}
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
    backgroundColor: '#007AFF',
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
    borderColor: '#0056b3',
  },
  scheduleText: {
    color: 'white',
    fontSize: 9,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 2,
  },
  positionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 7,
    textAlign: 'center',
  },
  columnBorder: {
    position: 'absolute',
    right: 0,
    top: 30,
    bottom: 0,
    width: 1,
    backgroundColor: '#ddd',
  },
  scaleContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  scaleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scaleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scaleItem: {
    alignItems: 'center',
  },
  scaleText: {
    fontSize: 12,
    opacity: 0.7,
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