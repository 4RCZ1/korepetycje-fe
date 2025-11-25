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
  const [students, setStudents] = useState<StudentType[]>([]);
  const [addresses, setAddresses] = useState<AddressType[]>([]);
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
      alert("Błąd", "Nie udało się załadować uczniów i adresów");
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
    if (!firstStartDateTime)
      return "Czas rozpoczęcia pierwszej lekcji jest wymagany";
    if (!firstEndDateTime)
      return "Czas zakończenia pierwszej lekcji jest wymagany";
    if (!scheduleEndDate) return "Data zakończenia planu jest wymagana";
    if (
      !periodInDays ||
      isNaN(Number(periodInDays)) ||
      Number(periodInDays) <= 0
    ) {
      return "Prawidłowy okres w dniach jest wymagany (musi być większy niż 0)";
    }
    if (!selectedAddressId) return "Adres jest wymagany";
    if (selectedStudentIds.length === 0)
      return "Przynajmniej jeden uczeń musi być wybrany";

    try {
      if (
        isNaN(firstStartDateTime.getTime()) ||
        isNaN(firstEndDateTime.getTime()) ||
        isNaN(scheduleEndDate.getTime())
      ) {
        return "Nieprawidłowy format daty";
      }

      if (firstStartDateTime >= firstEndDateTime) {
        return "Czas rozpoczęcia musi być przed czasem zakończenia";
      }

      if (scheduleEndDate <= firstStartDateTime) {
        return "Data zakończenia planu musi być po czasie rozpoczęcia pierwszej lekcji";
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return "Nieprawidłowy format daty";
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      alert("Błąd walidacji", validationError);
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
        alert("Sukces", "Lekcja została zaplanowana pomyślnie");
        handleClose();
      } else {
        alert("Błąd", "Nie udało się zaplanować lekcji");
      }
    } catch (error) {
      console.error("Failed to submit lesson:", error);
      alert("Błąd", "Nie udało się zaplanować lekcji");
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
          <ThemedText style={styles.title}>Dodaj Nową Lekcję</ThemedText>
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
            <ThemedText style={styles.loadingText}>
              Ładowanie danych...
            </ThemedText>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.sectionTitle}>
                  Data i Godzina
                </ThemedText>

                <View style={styles.dateTimeGroup}>
                  <ThemedText style={styles.label}>Data Lekcji</ThemedText>
                  <DateTimePicker
                    value={firstStartDateTime}
                    onChange={handleStartDateTimeChange}
                    mode="date"
                  />
                  <ThemedText style={styles.helperText}>
                    Wybierz datę pierwszej lekcji
                  </ThemedText>
                </View>

                <View style={styles.timeRow}>
                  <View style={styles.timePickerContainer}>
                    <ThemedText style={styles.label}>
                      Godzina Rozpoczęcia
                    </ThemedText>
                    <DateTimePicker
                      value={firstStartDateTime}
                      onChange={handleStartDateTimeChange}
                      mode="time"
                    />
                  </View>

                  <View style={styles.timePickerContainer}>
                    <ThemedText style={styles.label}>
                      Godzina Zakończenia
                    </ThemedText>
                    <DateTimePicker
                      value={firstEndDateTime}
                      onChange={handleEndDateTimeChange}
                      mode="time"
                    />
                  </View>
                </View>

                <ThemedText style={styles.helperText}>
                  Lekcje nie mogą obejmować wielu dni. Godzina zakończenia
                  będzie tego samego dnia.
                </ThemedText>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>
                  Data Zakończenia Planu *
                </ThemedText>
                <DateTimePicker
                  value={scheduleEndDate}
                  onChange={setScheduleEndDate}
                  mode="date"
                />
                <ThemedText style={styles.helperText}>
                  Kiedy zakończyć powtarzanie lekcji (godzina zostanie ustawiona
                  na koniec dnia)
                </ThemedText>
              </View>
              {/* Period in Days */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Okres w Dniach *</ThemedText>
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
                  Jak często powtarzać (np. 7 dla co tydzień, 14 dla co dwa
                  tygodnie)
                </ThemedText>
              </View>
              {/* Address Selection */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Adres *</ThemedText>
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
                    <Picker.Item label="Wybierz adres..." value="" />
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
                  Uczniowie * (Wybierz co najmniej jednego)
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
                title="Zaplanuj Lekcję"
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
