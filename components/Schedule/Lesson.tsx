import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { LessonEntry } from "@/services/api";

const MS_IN_DAY = 24 * 60 * 60 * 1000;

type LessonProps = {
  lesson: LessonEntry;
  lessonIndex: number;
  columnWidth: number;
  calculatePosition: (yPos: number) => number;
  date: string; // Date in YYYY-MM-DD format
  handleItemPress: (
    date: string,
    lessonIndex: number,
    lesson: LessonEntry,
  ) => void;
  confirmingLessons: Set<string>; // Set of lesson IDs that are currently being confirmed
};

export const Lesson = ({
  lesson,
  lessonIndex,
  columnWidth,
  calculatePosition,
  date,
  handleItemPress,
  confirmingLessons,
}: LessonProps) => {
  const getTextStyle = (confirmed?: boolean | null) => {
    if (confirmed === false) {
      return styles.scheduleTextRejected;
    }
    return styles.scheduleText;
  };

  const calculateHeight = (startTime: number, endTime: number): number => {
    const startPercent = (startTime / MS_IN_DAY) * 100;
    const endPercent = (endTime / MS_IN_DAY) * 100;
    const startPos = calculatePosition(startPercent);
    const endPos = calculatePosition(endPercent);
    return Math.abs(endPos - startPos);
  };

  const getTopPosition = (startTime: number, endTime: number): number => {
    const startPercent = (startTime / MS_IN_DAY) * 100;
    const endPercent = (endTime / MS_IN_DAY) * 100;
    const startPos = calculatePosition(startPercent);
    const endPos = calculatePosition(endPercent);
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

  const getConfirmationStatus = (confirmed?: boolean | null) => {
    if (confirmed === true) return "✓ Confirmed";
    if (confirmed === false) return "✗ Rejected";
    return "? Pending";
  };

  const top = getTopPosition(lesson.startTimestamp, lesson.endTimestamp);
  const height = calculateHeight(lesson.startTimestamp, lesson.endTimestamp);
  const isPending =
    lesson.fullyConfirmed === undefined || lesson.fullyConfirmed === null;
  const isConfirming = confirmingLessons.has(lesson.lessonId);

  const rectangleStyle = {
    top: top,
    width: columnWidth - 4,
    height: height,
  };

  const ItemComponent = isPending && !isConfirming ? TouchableOpacity : View;

  return (
    <ItemComponent
      style={[
        styles.scheduleItem,
        getItemStyle(lesson.fullyConfirmed),
        rectangleStyle,
        isConfirming && styles.scheduleItemLoading,
      ]}
      onPress={
        isPending && !isConfirming
          ? () => handleItemPress(date, lessonIndex, lesson)
          : undefined
      }
      activeOpacity={isPending && !isConfirming ? 0.7 : 1}
    >
      {isConfirming ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <>
          <ThemedText
            style={[styles.scheduleText, getTextStyle(lesson.fullyConfirmed)]}
            numberOfLines={2}
          >
            {lesson.description}
          </ThemedText>
          <ThemedText
            style={[styles.positionText, getTextStyle(lesson.fullyConfirmed)]}
          >
            {lesson.startTime}-{lesson.endTime}
          </ThemedText>
          <ThemedText
            style={[styles.statusText, getTextStyle(lesson.fullyConfirmed)]}
          >
            {getConfirmationStatus(lesson.fullyConfirmed)}
          </ThemedText>
        </>
      )}
    </ItemComponent>
  );
};

const styles = StyleSheet.create({
  scheduleItem: {
    position: "absolute",
    borderRadius: 6,
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
  },
  scheduleItemConfirmed: {
    backgroundColor: "#007AFF",
    borderColor: "#0056b3",
  },
  scheduleItemPending: {
    backgroundColor: "#87CEEB",
    borderColor: "#6BB6FF",
  },
  scheduleItemRejected: {
    backgroundColor: "#9E9E9E",
    borderColor: "#757575",
  },
  scheduleItemLoading: {
    opacity: 0.7,
  },
  scheduleText: {
    color: "white",
    fontSize: 9,
    textAlign: "center",
    fontWeight: "500",
    marginBottom: 1,
  },
  scheduleTextRejected: {
    color: "#CCCCCC",
    fontSize: 9,
    textAlign: "center",
    fontWeight: "500",
    marginBottom: 1,
  },
  positionText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 7,
    textAlign: "center",
    marginBottom: 1,
  },
  statusText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 6,
    textAlign: "center",
    fontWeight: "bold",
  },
});
