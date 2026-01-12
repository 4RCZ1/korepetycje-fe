import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import CrossPlatformDateTimePicker from "@/components/ui/DateTimePicker";
import { useThemeColor } from "@/hooks/useThemeColor";

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  minimumDate?: Date;
  maximumDate?: Date;
  startLabel?: string;
  endLabel?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  disabled = false,
  style,
  minimumDate,
  maximumDate,
  startLabel = "Start Date",
  endLabel = "End Date",
}) => {
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");

  return (
    <View style={[styles.container, style]}>
      <View style={styles.dateField}>
        <ThemedText style={[styles.label, { color: textColor }]}>
          {startLabel}
        </ThemedText>
        <CrossPlatformDateTimePicker
          value={startDate}
          onChange={onStartDateChange}
          mode="date"
          disabled={disabled}
          minimumDate={minimumDate}
          maximumDate={endDate}
        />
      </View>

      <View style={[styles.separator, { backgroundColor: borderColor }]} />

      <View style={styles.dateField}>
        <ThemedText style={[styles.label, { color: textColor }]}>
          {endLabel}
        </ThemedText>
        <CrossPlatformDateTimePicker
          value={endDate}
          onChange={onEndDateChange}
          mode="date"
          disabled={disabled}
          minimumDate={startDate}
          maximumDate={maximumDate}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  dateField: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  separator: {
    height: 1,
    marginVertical: 8,
    opacity: 0.3,
  },
});

export default DateRangePicker;
