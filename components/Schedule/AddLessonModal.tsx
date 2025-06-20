import { Picker } from "@react-native-picker/picker";
import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import DateTimePicker from "@/components/ui/DateTimePicker";
import ThemedButton from "@/components/ui/ThemedButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import { addressApi, AddressType } from "@/services/addressApi";
import { LessonRequest } from "@/services/scheduleApi";
import { studentApi, StudentType } from "@/services/studentApi";
import alert from "@/utils/alert";

type AddLessonModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (lessonRequest: LessonRequest) => Promise<boolean>;
};

const AddLessonModal = ({
  visible,
  onClose,
  onSubmit,
}: AddLessonModalProps) => {
  const [firstStartDateTime, setFirstStartDateTime] = useState(new Date());
  const [firstEndDateTime, setFirstEndDateTime] = useState(new Date());
  const [scheduleEndDate, setScheduleEndDate] = useState(new Date());
  const [periodInDays, setPeriodInDays] = useState("7"); // Default to weekly
  const [selectedAddressId, setSelectedAddressId] = useState("1");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(["1"]);
  const address: AddressType = {
    id: "1",
    name: "Default Address",
    data: "123 Main St, City, Country",
  }; //TODO use real data
  // State for data loading
  const [students, setStudents] = useState<StudentType[]>([]);
  const [addresses, _setAddresses] = useState<AddressType[]>([address]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    // Set default values for better UX
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
    const hourAfter = new Date(nextHour);
    hourAfter.setHours(nextHour.getHours() + 1);

    // Default schedule end to 3 months from now
    const threeMonthsLater = new Date(now);
    threeMonthsLater.setMonth(now.getMonth() + 3);

    setFirstStartDateTime(nextHour);
    setFirstEndDateTime(hourAfter);
    setScheduleEndDate(threeMonthsLater);
    setPeriodInDays("7");
    setSelectedAddressId("");
    setSelectedStudentIds([]);
  }, []);

  // Colors
  const backgroundColor = useThemeColor({}, "background");
  const surfaceColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");

  // Date/time change handlers
  const handleStartDateTimeChange = (newDateTime: Date) => {
    setFirstStartDateTime(newDateTime);

    // Always ensure end date is on the same day as start date
    const newEndDateTime = new Date(firstEndDateTime);
    newEndDateTime.setFullYear(newDateTime.getFullYear());
    newEndDateTime.setMonth(newDateTime.getMonth());
    newEndDateTime.setDate(newDateTime.getDate());
    setFirstEndDateTime(newEndDateTime);

    // If start time is after or equal to end time, adjust end time to be 1 hour after start time
    if (newDateTime >= newEndDateTime) {
      const adjustedEndTime = new Date(newDateTime.getTime() + 60 * 60 * 1000); // Add 1 hour
      setFirstEndDateTime(adjustedEndTime);
    }
  };

  const handleEndDateTimeChange = (newDateTime: Date) => {
    // Ensure end time is on the same date as start time
    const adjustedDateTime = new Date(newDateTime);
    adjustedDateTime.setFullYear(firstStartDateTime.getFullYear());
    adjustedDateTime.setMonth(firstStartDateTime.getMonth());
    adjustedDateTime.setDate(firstStartDateTime.getDate());

    setFirstEndDateTime(adjustedDateTime);

    // If end time is before or equal to start time, adjust start time to be 1 hour before end time
    if (adjustedDateTime <= firstStartDateTime) {
      const adjustedStartTime = new Date(
        adjustedDateTime.getTime() - 60 * 60 * 1000,
      ); // Subtract 1 hour
      setFirstStartDateTime(adjustedStartTime);
    }
  };
  // Load data when modal opens
  useEffect(() => {
    if (visible) {
      loadData();
      // Set default form values
      resetForm();
    }
  }, [visible, resetForm]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentsResponse, _addressesResponse] = await Promise.all([
        studentApi.getStudents(),
        addressApi.getAddresses(),
      ]);
      if (studentsResponse.success && studentsResponse.data) {
        setStudents(studentsResponse.data);
      }
      // if (addressesResponse.success && addressesResponse.data) {
      //   setAddresses(addressesResponse.data);
      // }
    } catch (error) {
      console.error("Failed to load data:", error);
      alert("Error", "Failed to load students and addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };
  const validateForm = (): string | null => {
    if (!firstStartDateTime) return "First start time is required";
    if (!firstEndDateTime) return "First end time is required";
    if (!scheduleEndDate) return "Schedule end date is required";
    if (
      !periodInDays ||
      isNaN(Number(periodInDays)) ||
      Number(periodInDays) <= 0
    ) {
      return "Valid period in days is required (must be greater than 0)";
    }
    if (!selectedAddressId) return "Address is required";
    if (selectedStudentIds.length === 0)
      return "At least one student must be selected";

    try {
      if (
        isNaN(firstStartDateTime.getTime()) ||
        isNaN(firstEndDateTime.getTime()) ||
        isNaN(scheduleEndDate.getTime())
      ) {
        return "Invalid date format";
      }

      if (firstStartDateTime >= firstEndDateTime) {
        return "Start time must be before end time";
      }

      if (scheduleEndDate <= firstStartDateTime) {
        return "Schedule end date must be after the first lesson start time";
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return "Invalid date format";
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      alert("Validation Error", validationError);
      return;
    }
    setSubmitting(true);
    try {
      // Create schedule end time at the end of the selected date (23:59:59)
      const scheduleEndDateTime = new Date(scheduleEndDate);
      scheduleEndDateTime.setHours(23, 59, 59, 999);

      const lessonRequest: LessonRequest = {
        firstStartTime: firstStartDateTime.toISOString(),
        firstEndTime: firstEndDateTime.toISOString(),
        scheduleEndTime: scheduleEndDateTime.toISOString(),
        periodInDays: Number(periodInDays),
        addressId: selectedAddressId,
        studentIds: selectedStudentIds,
      };

      const success = await onSubmit(lessonRequest);
      if (success) {
        alert("Success", "Lesson planned successfully");
        handleClose();
      } else {
        alert("Error", "Failed to plan lesson");
      }
    } catch (error) {
      console.error("Failed to submit lesson:", error);
      alert("Error", "Failed to plan lesson");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <View style={[styles.header, { backgroundColor: surfaceColor }]}>
          <ThemedText style={styles.title}>Add New Lesson</ThemedText>
          <ThemedButton
            title="✕"
            variant="outline"
            size="small"
            color="primary"
            onPress={handleClose}
            style={styles.closeButton}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primaryColor} />
            <ThemedText style={styles.loadingText}>Loading data...</ThemedText>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.sectionTitle}>Date & Time</ThemedText>

                <View style={styles.dateTimeGroup}>
                  <ThemedText style={styles.label}>Lesson Date</ThemedText>
                  <DateTimePicker
                    value={firstStartDateTime}
                    onChange={handleStartDateTimeChange}
                    mode="date"
                  />
                  <ThemedText style={styles.helperText}>
                    Select the date for the first lesson
                  </ThemedText>
                </View>

                <View style={styles.timeRow}>
                  <View style={styles.timePickerContainer}>
                    <ThemedText style={styles.label}>Start Time</ThemedText>
                    <DateTimePicker
                      value={firstStartDateTime}
                      onChange={handleStartDateTimeChange}
                      mode="time"
                    />
                  </View>

                  <View style={styles.timePickerContainer}>
                    <ThemedText style={styles.label}>End Time</ThemedText>
                    <DateTimePicker
                      value={firstEndDateTime}
                      onChange={handleEndDateTimeChange}
                      mode="time"
                    />
                  </View>
                </View>

                <ThemedText style={styles.helperText}>
                  Lessons cannot span multiple days. End time will be on the
                  same date.
                </ThemedText>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>
                  Schedule End Date *
                </ThemedText>
                <DateTimePicker
                  value={scheduleEndDate}
                  onChange={setScheduleEndDate}
                  mode="date"
                />
                <ThemedText style={styles.helperText}>
                  When to stop repeating lessons (time will be set to end of
                  day)
                </ThemedText>
              </View>
              {/* Period in Days */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Period in Days *</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    { color: textColor, borderColor: primaryColor },
                  ]}
                  value={periodInDays}
                  onChangeText={setPeriodInDays}
                  placeholder="7"
                  keyboardType="numeric"
                  placeholderTextColor={textColor + "80"}
                />
                <ThemedText style={styles.helperText}>
                  How often to repeat (e.g., 7 for weekly, 14 for bi-weekly)
                </ThemedText>
              </View>
              {/* Address Selection */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Address *</ThemedText>
                <View
                  style={[
                    styles.pickerContainer,
                    { borderColor: primaryColor },
                  ]}
                >
                  <Picker
                    selectedValue={selectedAddressId}
                    onValueChange={setSelectedAddressId}
                    style={[styles.picker, { color: textColor }]}
                  >
                    <Picker.Item label="Select an address..." value="" />
                    {addresses.map((address) => (
                      <Picker.Item
                        key={address.id}
                        label={`${address.name} - ${address.data}`}
                        value={address.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
              {/* Students Selection */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>
                  Students * (Select at least one)
                </ThemedText>
                <View style={styles.studentsContainer}>
                  {students.map((student) => (
                    <TouchableOpacity
                      key={student.id}
                      style={[
                        styles.studentItem,
                        {
                          backgroundColor: selectedStudentIds.includes(
                            student.id,
                          )
                            ? primaryColor + "20"
                            : surfaceColor,
                          borderColor: selectedStudentIds.includes(student.id)
                            ? primaryColor
                            : textColor + "30",
                        },
                      ]}
                      onPress={() => toggleStudentSelection(student.id)}
                    >
                      <ThemedText style={styles.studentName}>
                        {student.name} {student.surname}
                      </ThemedText>
                      {selectedStudentIds.includes(student.id) && (
                        <Text
                          style={[styles.checkmark, { color: primaryColor }]}
                        >
                          ✓
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {/* Submit Button */}
              <ThemedButton
                title="Plan Lesson"
                variant="filled"
                size="large"
                color="primary"
                loading={submitting}
                disabled={submitting}
                onPress={handleSubmit}
                style={styles.submitButton}
              />
            </View>
          </ScrollView>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
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
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "transparent",
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  picker: {
    height: 50,
  },
  studentsContainer: {
    gap: 8,
  },
  studentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  studentName: {
    fontSize: 16,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: "bold",
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  dateTimeGroup: {
    marginBottom: 16,
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
});

export default AddLessonModal;
