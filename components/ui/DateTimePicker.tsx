import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Platform,
  View,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { getFormatDate, getFormatTime } from "@/utils/dates";

interface CrossPlatformDateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  mode?: "date" | "time" | "datetime";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  minimumDate?: Date;
  maximumDate?: Date;
}

const CrossPlatformDateTimePicker: React.FC<
  CrossPlatformDateTimePickerProps
> = ({
  value,
  onChange,
  mode = "datetime",
  disabled = false,
  style,
  minimumDate,
  maximumDate,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const surfaceColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "primary", "500");

  const formatDateTime = (date: Date, displayMode: string) => {
    switch (displayMode) {
      case "date":
        return date.toLocaleDateString();
      case "time":
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      case "datetime":
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}`;
      default:
        return date.toString();
    }
  };
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }

    if (selectedDate && !isNaN(selectedDate.getTime())) {
      // Validate date range
      if (minimumDate && selectedDate < minimumDate) {
        selectedDate = minimumDate;
      }
      if (maximumDate && selectedDate > maximumDate) {
        selectedDate = maximumDate;
      }

      // For time mode, preserve the original date and only update time
      if (mode === "time") {
        const newDateTime = new Date(value);
        newDateTime.setHours(selectedDate.getHours());
        newDateTime.setMinutes(selectedDate.getMinutes());
        newDateTime.setSeconds(0);
        newDateTime.setMilliseconds(0);
        onChange(newDateTime);
      } else {
        // For date mode, preserve the original time and only update date
        if (mode === "date") {
          const newDateTime = new Date(selectedDate);
          newDateTime.setHours(value.getHours());
          newDateTime.setMinutes(value.getMinutes());
          newDateTime.setSeconds(value.getSeconds());
          newDateTime.setMilliseconds(value.getMilliseconds());
          onChange(newDateTime);
        } else {
          // For datetime mode, update everything
          onChange(selectedDate);
        }
      }

      if (Platform.OS === "ios") {
        setShowPicker(false);
      }
    }
  };
  const showDateTimePicker = () => {
    if (disabled) return;

    if (Platform.OS === "web") {
      // For web, we'll use HTML5 input elements
      return;
    }

    setShowPicker(true);
  };
  if (Platform.OS === "web") {
    // Web implementation using HTML5 input
    const inputType =
      mode === "date" ? "date" : mode === "time" ? "time" : "datetime-local";
    let inputValue: string;
    if (mode === "date") {
      inputValue = getFormatDate(value);
    } else if (mode === "time") {
      inputValue = getFormatTime(value);
    } else {
      inputValue = `${getFormatDate(value)}T${getFormatTime(value)}`;
    }
    console.log("inputValue", inputValue);

    const handleWebChange = (e: any) => {
      try {
        const inputValue = e.target.value;
        let newDate: Date;

        if (mode === "time") {
          // For time mode, keep the current date but update the time
          const [hours, minutes] = inputValue.split(":");
          newDate = new Date(value);
          newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        } else {
          newDate = new Date(inputValue);
        }

        if (!isNaN(newDate.getTime())) {
          // Validate date range
          if (minimumDate && newDate < minimumDate) {
            newDate = minimumDate;
          }
          if (maximumDate && newDate > maximumDate) {
            newDate = maximumDate;
          }
          onChange(newDate);
        }
      } catch (error) {
        console.warn("Invalid date input:", error);
      }
    };

    return (
      <View style={[styles.container, style]}>
        <input
          type={inputType}
          value={inputValue}
          onChange={handleWebChange}
          disabled={disabled}
          min={minimumDate
            ?.toISOString()
            .slice(
              0,
              inputType === "datetime-local"
                ? 16
                : inputType === "date"
                  ? 10
                  : 5,
            )}
          max={maximumDate
            ?.toISOString()
            .slice(
              0,
              inputType === "datetime-local"
                ? 16
                : inputType === "date"
                  ? 10
                  : 5,
            )}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 8,
            border: `1px solid ${borderColor}`,
            backgroundColor: surfaceColor,
            color: textColor,
            fontSize: 16,
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          }}
        />
      </View>
    );
  }

  // Mobile implementation
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        onPress={showDateTimePicker}
        disabled={disabled}
        style={[
          styles.dateButton,
          {
            backgroundColor: surfaceColor,
            borderColor: borderColor,
          },
          disabled && styles.disabled,
        ]}
      >
        <ThemedText style={[styles.dateText, { color: textColor }]}>
          {formatDateTime(value, mode)}
        </ThemedText>
      </TouchableOpacity>
      {showPicker && (
        <>
          {Platform.OS === "ios" ? (
            <View
              style={[
                styles.iosPickerContainer,
                { backgroundColor: surfaceColor },
              ]}
            >
              <View style={styles.iosPickerHeader}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <ThemedText
                    style={[styles.iosPickerButton, { color: primaryColor }]}
                  >
                    Cancel
                  </ThemedText>
                </TouchableOpacity>
                <ThemedText style={styles.iosPickerTitle}>
                  Select{" "}
                  {mode === "date"
                    ? "Date"
                    : mode === "time"
                      ? "Time"
                      : "Date & Time"}
                </ThemedText>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <ThemedText
                    style={[styles.iosPickerButton, { color: primaryColor }]}
                  >
                    Done
                  </ThemedText>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={value}
                mode={mode}
                onChange={handleDateChange}
                display="spinner"
                minimumDate={minimumDate}
                maximumDate={maximumDate}
              />
            </View>
          ) : (
            <DateTimePicker
              value={value}
              mode={mode}
              onChange={handleDateChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  dateButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "500",
  },
  disabled: {
    opacity: 0.6,
  },
  iosPickerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    zIndex: 1000,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  iosPickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  iosPickerButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  iosPickerTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CrossPlatformDateTimePicker;
