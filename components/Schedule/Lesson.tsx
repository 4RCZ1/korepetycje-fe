import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/hooks/useAuth";
import { usePrimaryColor, useThemeColor } from "@/hooks/useThemeColor";
import { LessonEntry } from "@/services/scheduleApi";

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
  const { isTutor } = useAuth();
  // Color system hooks
  const primaryColor = usePrimaryColor("500");
  const primaryDarkColor = usePrimaryColor("700");
  const primaryLightColor = usePrimaryColor("300");
  const grayColor = useThemeColor({}, "black", "100");
  const grayDarkColor = useThemeColor({}, "black", "500");
  const whiteColor = useThemeColor({}, "white", "500");

  const getTextStyle = (confirmed?: boolean | null) => {
    return {
      color: getTextColor(confirmed),
      fontSize: 11,
      lineHeight: 13,
      textAlign: "center" as const,
      fontWeight: "500" as const,
      marginBottom: 1,
    };
  };

  const getTextColor = (confirmed?: boolean | null): string => {
    if (confirmed === false) {
      return "#CCCCCC"; // Keep muted text for rejected items
    }
    return whiteColor; // Use white from color system
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
      return {
        backgroundColor: primaryColor,
        borderColor: primaryDarkColor,
      };
    } else if (confirmed === false) {
      return {
        backgroundColor: grayColor,
        borderColor: grayDarkColor,
      };
    } else {
      return {
        backgroundColor: primaryLightColor,
        borderColor: primaryColor,
      };
    }
  };

  const getConfirmationStatus = (confirmed?: boolean | null) => {
    if (confirmed === true) return "Potwierdzona";
    if (confirmed === false) return "Odrzucona";
    return "Oczekująca";
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
        (isPending && !isConfirming) || isTutor()
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
            style={getTextStyle(lesson.fullyConfirmed)}
            numberOfLines={2}
          >
            {lesson.description}
          </ThemedText>
          <ThemedText
            style={[
              styles.positionText,
              { color: `${getTextColor(lesson.fullyConfirmed)}CC` },
            ]}
          >
            {lesson.startTime}-{lesson.endTime}
          </ThemedText>
          <ThemedText
            style={[
              styles.statusText,
              { color: `${getTextColor(lesson.fullyConfirmed)}E6` },
            ]}
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
  scheduleItemLoading: {
    opacity: 0.7,
  },
  positionText: {
    fontSize: 11,
    lineHeight: 15,
    textAlign: "center",
  },
  statusText: {
    fontSize: 9,
    lineHeight: 11,
    textAlign: "center",
    fontWeight: "bold",
  },
});
