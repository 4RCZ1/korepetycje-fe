import React from "react";
import { StyleSheet, View } from "react-native";

import { Lesson } from "@/components/Schedule/Lesson";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { LessonEntry, Schedule } from "@/services/scheduleApi";

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
  // Color system hooks
  const surfaceColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "border");
  const whiteColor = useThemeColor({}, "white", "700");

  const calculatePosition = (yPos: number): number => {
    return (yPos / 100) * columnHeight;
  };

  if (!scheduleData) return null;

  const daySchedule = scheduleData[date] || [];

  return (
    <View
      key={date}
      style={[
        styles.column,
        { width: columnWidth, borderColor: `${borderColor}80` },
      ]}
    >
      <View style={[styles.dayHeader, { backgroundColor: whiteColor }]}>
        <ThemedText style={styles.dayText}>
          {weekdayAbbr[columnIndex]}
        </ThemedText>
        <ThemedText style={styles.dateText}>{date}</ThemedText>
      </View>

      {/* Schedule container with fixed height for percentage calculations */}
      <View
        style={[
          styles.scheduleContainer,
          { height: columnHeight, backgroundColor: surfaceColor },
        ]}
      >
        {[0, 25, 50, 75, 100].map((percentage) => (
          <View
            key={percentage}
            style={[
              styles.gridLine,
              {
                top: calculatePosition(percentage),
                backgroundColor: borderColor,
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
    </View>
  );
};

const styles = StyleSheet.create({
  column: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  dayHeader: {
    height: 30,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: {
    fontSize: 12,
    lineHeight: 13,
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 10,
    lineHeight: 11,
  },
  scheduleContainer: {
    position: "relative",
    borderRadius: 4,
  },
  gridLine: {
    position: "absolute",
    height: 1,
    opacity: 0.5,
    width: "100%",
  },
});
