import { Picker } from "@react-native-picker/picker";
import React, { useState, useEffect } from "react";
import {
  Alert,
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
import { useThemeColor } from "@/hooks/useThemeColor";
import { AddressType, addressApi } from "@/services/addressApi";
import { LessonRequest } from "@/services/scheduleApi";
import { StudentType, studentApi } from "@/services/studentApi";

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
  // State for form fields (using local datetime format for better UX)
  const [firstStartTime, setFirstStartTime] = useState("");
  const [firstEndTime, setFirstEndTime] = useState("");
  const [scheduleEndTime, setScheduleEndTime] = useState("");
  const [periodInDays, setPeriodInDays] = useState("7"); // Default to weekly
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // State for data loading
  const [students, setStudents] = useState<StudentType[]>([]);
  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Colors
  const backgroundColor = useThemeColor({}, "background");
  const surfaceColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");
  // Load data when modal opens
  useEffect(() => {
    if (visible) {
      loadData();
      // Set default form values
      resetForm();
    }
  }, [visible]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentsResponse, addressesResponse] = await Promise.all([
        studentApi.getStudents(),
        addressApi.getAddresses(),
      ]);
      if (studentsResponse.success && studentsResponse.data) {
        setStudents(studentsResponse.data);
      }
      if (addressesResponse.success && addressesResponse.data) {
        setAddresses(addressesResponse.data);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      Alert.alert("Error", "Failed to load students and addresses");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTimeForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const convertToISOString = (dateTimeLocal: string): string => {
    if (!dateTimeLocal) return "";
    const date = new Date(dateTimeLocal);
    return date.toISOString();
  };
  const resetForm = () => {
    // Set default values for better UX
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
    const hourAfter = new Date(nextHour);
    hourAfter.setHours(nextHour.getHours() + 1);

    // Default schedule end to 3 months from now
    const threeMonthsLater = new Date(now);
    threeMonthsLater.setMonth(now.getMonth() + 3);

    setFirstStartTime(formatDateTimeForInput(nextHour));
    setFirstEndTime(formatDateTimeForInput(hourAfter));
    setScheduleEndTime(formatDateTimeForInput(threeMonthsLater));
    setPeriodInDays("7");
    setSelectedAddressId("");
    setSelectedStudentIds([]);
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
    if (!firstStartTime) return "First start time is required";
    if (!firstEndTime) return "First end time is required";
    if (!scheduleEndTime) return "Schedule end time is required";
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

    // Validate that dates can be parsed
    try {
      const startDate = new Date(firstStartTime);
      const endDate = new Date(firstEndTime);
      const scheduleEnd = new Date(scheduleEndTime);

      if (
        isNaN(startDate.getTime()) ||
        isNaN(endDate.getTime()) ||
        isNaN(scheduleEnd.getTime())
      ) {
        return "Invalid date format";
      }

      if (startDate >= endDate) {
        return "Start time must be before end time";
      }

      if (scheduleEnd <= startDate) {
        return "Schedule end time must be after the first lesson start time";
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
      Alert.alert("Validation Error", validationError);
      return;
    }
    setSubmitting(true);
    try {
      const lessonRequest: LessonRequest = {
        firstStartTime: convertToISOString(firstStartTime),
        firstEndTime: convertToISOString(firstEndTime),
        scheduleEndTime: convertToISOString(scheduleEndTime),
        periodInDays: Number(periodInDays),
        addressId: selectedAddressId,
        studentIds: selectedStudentIds,
      };

      const success = await onSubmit(lessonRequest);
      if (success) {
        Alert.alert("Success", "Lesson planned successfully");
        handleClose();
      } else {
        Alert.alert("Error", "Failed to plan lesson");
      }
    } catch (error) {
      console.error("Failed to submit lesson:", error);
      Alert.alert("Error", "Failed to plan lesson");
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
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={[styles.closeButtonText, { color: primaryColor }]}>
              ✕
            </Text>
          </TouchableOpacity>
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
              {" "}
              {/* First Start Time */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>First Start Time *</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    { color: textColor, borderColor: primaryColor },
                  ]}
                  value={firstStartTime}
                  onChangeText={setFirstStartTime}
                  placeholder="YYYY-MM-DDTHH:MM"
                  placeholderTextColor={textColor + "80"}
                />
                <ThemedText style={styles.helperText}>
                  Example: {formatDateTimeForInput(new Date())}
                </ThemedText>
              </View>
              {/* First End Time */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>First End Time *</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    { color: textColor, borderColor: primaryColor },
                  ]}
                  value={firstEndTime}
                  onChangeText={setFirstEndTime}
                  placeholder="YYYY-MM-DDTHH:MM"
                  placeholderTextColor={textColor + "80"}
                />
                <ThemedText style={styles.helperText}>
                  Must be after start time
                </ThemedText>
              </View>
              {/* Schedule End Time */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>
                  Schedule End Time *
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    { color: textColor, borderColor: primaryColor },
                  ]}
                  value={scheduleEndTime}
                  onChangeText={setScheduleEndTime}
                  placeholder="YYYY-MM-DDTHH:MM"
                  placeholderTextColor={textColor + "80"}
                />
                <ThemedText style={styles.helperText}>
                  When to stop repeating lessons
                </ThemedText>
              </View>{" "}
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
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: primaryColor },
                  submitting && styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Plan Lesson</Text>
                )}
              </TouchableOpacity>
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
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: "bold",
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
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default AddLessonModal;
