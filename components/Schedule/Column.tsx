import React from "react";
import { StyleSheet, View } from "react-native";

import { Lesson } from "@/components/Schedule/Lesson";
import { ThemedText } from "@/components/ThemedText";
import { LessonEntry, Schedule } from "@/services/api";

export type ColumnProps = {
  date: string; // Date in YYYY-MM-DD format
  columnIndex: number;
  scheduleData: Schedule | null;
  columnWidth: number;
  columnHeight: number;
  handleItemPress: (date: string, itemIndex: number, item: LessonEntry) => void;
  confirmingLessons: Set<string>;
};

const weekdayAbbr = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const Column = ({
  date,
  columnIndex,
  scheduleData,
  columnHeight,
  columnWidth,
  handleItemPress,
  confirmingLessons,
}: ColumnProps) => {
  const calculatePosition = (yPos: number): number => {
    return (yPos / 100) * columnHeight;
  };

  if (!scheduleData) return null;

  const daySchedule = scheduleData[date];

  return (
    <View key={date} style={[styles.column, { width: columnWidth }]}>
      <View style={styles.dayHeader}>
        <ThemedText style={styles.dayText}>
          {weekdayAbbr[columnIndex]}
        </ThemedText>
      </View>

      {/* Schedule container with fixed height for percentage calculations */}
      <View style={[styles.scheduleContainer, { height: columnHeight }]}>
        {/* Background grid lines for visualization (optional) */}
        {[0, 25, 50, 75, 100].map((percentage) => (
          <View
            key={percentage}
            style={[
              styles.gridLine,
              {
                top: calculatePosition(percentage),
                width: columnWidth - 4,
              },
            ]}
          />
        ))}

        {/* Schedule items */}
        {daySchedule.map((item, itemIndex) => (
          <Lesson
            lesson={item}
            key={itemIndex}
            lessonIndex={itemIndex}
            columnWidth={columnWidth}
            calculatePosition={calculatePosition}
            date={date}
            handleItemPress={handleItemPress}
            confirmingLessons={confirmingLessons}
          />
        ))}
      </View>

      {/* Column border */}
      <View style={styles.columnBorder} />
    </View>
  );
};

const styles = StyleSheet.create({
  column: {
    marginRight: 2,
  },
  dayHeader: {
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginBottom: 4,
  },
  dayText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  scheduleContainer: {
    position: "relative",
    backgroundColor: "#fafafa",
    borderRadius: 4,
  },
  gridLine: {
    position: "absolute",
    height: 1,
    backgroundColor: "#e0e0e0",
    opacity: 0.5,
  },
  columnBorder: {
    position: "absolute",
    right: 0,
    top: 30,
    bottom: 0,
    width: 1,
    backgroundColor: "#ddd",
  },
});
