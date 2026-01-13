import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  View,
  Platform,
} from "react-native";

import InvoiceReportCard from "@/components/Invoice/InvoiceReportCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import DateRangePicker from "@/components/ui/DateRangePicker";
import ThemedButton from "@/components/ui/ThemedButton";
import { useInvoiceReport } from "@/hooks/useInvoiceReport";
import { useStudentApi } from "@/hooks/useStudentApi";
import { useThemeColor } from "@/hooks/useThemeColor";
import alert from "@/utils/alert";

export default function InvoiceReportScreen() {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  const {
    students,
    loading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents,
  } = useStudentApi();

  const {
    report,
    loading: reportLoading,
    error: reportError,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    fetchReport,
    clearReport,
  } = useInvoiceReport();

  // Colors
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");
  const surfaceColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "border");
  const errorColor = useThemeColor({}, "error", "500");

  const handleGenerateReport = async () => {
    if (!selectedStudentId) {
      alert("Wybierz ucznia", "Proszę wybrać ucznia, aby wygenerować raport.");
      return;
    }
    await fetchReport(selectedStudentId);
  };

  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId);
    clearReport();
  };

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const studentName = selectedStudent
    ? `${selectedStudent.name} ${selectedStudent.surname}`
    : "";

  if (studentsLoading && students.length === 0) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <ThemedText style={[styles.title, { color: textColor }]}>
            Faktury
          </ThemedText>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={[styles.loadingText, { color: textColor }]}>
            Ładowanie uczniów...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <ThemedText style={[styles.title, { color: textColor }]}>
          Faktury
        </ThemedText>
      </View>

      {studentsError && (
        <View
          style={[
            styles.errorContainer,
            { backgroundColor: errorColor + "20" },
          ]}
        >
          <ThemedText style={[styles.errorText, { color: errorColor }]}>
            {studentsError}
          </ThemedText>
          <ThemedButton
            title="Ponów"
            variant="outline"
            size="small"
            color="error"
            onPress={refetchStudents}
          />
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={studentsLoading}
            onRefresh={refetchStudents}
            tintColor={primaryColor}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Student Selection */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Wybierz ucznia
          </ThemedText>
          <View
            style={[
              styles.pickerContainer,
              {
                backgroundColor: surfaceColor,
                borderColor: borderColor,
              },
            ]}
          >
            <Picker
              selectedValue={selectedStudentId}
              onValueChange={handleStudentChange}
              style={[
                styles.picker,
                { color: textColor },
                Platform.OS === "web" && { backgroundColor: surfaceColor },
              ]}
              dropdownIconColor={textColor}
            >
              <Picker.Item
                label="-- Wybierz ucznia --"
                value=""
                style={{ color: textColor + "80" }}
              />
              {students.map((student) => (
                <Picker.Item
                  key={student.id}
                  label={`${student.name} ${student.surname}`}
                  value={student.id}
                  style={{ color: textColor }}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Date Range Selection */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Zakres dat
          </ThemedText>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            disabled={reportLoading}
            startLabel="Od"
            endLabel="Do"
          />
        </View>

        {/* Generate Button */}
        <View style={styles.section}>
          <ThemedButton
            title="Generuj raport"
            variant="filled"
            size="large"
            color="primary"
            onPress={handleGenerateReport}
            loading={reportLoading}
            disabled={!selectedStudentId || reportLoading}
            style={styles.generateButton}
          />
        </View>

        {/* Report Display */}
        {report && selectedStudent && (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Wyniki raportu
            </ThemedText>
            <InvoiceReportCard
              report={report}
              studentName={studentName}
              startDate={startDate}
              endDate={endDate}
            />
          </View>
        )}

        {/* Empty State */}
        {!report && !reportLoading && selectedStudentId && (
          <View style={styles.emptyState}>
            <ThemedText style={[styles.emptyText, { color: textColor + "80" }]}>
              Wybierz zakres dat i kliknij &quot;Generuj raport&quot;, aby zobaczyć
              podsumowanie godzin lekcji.
            </ThemedText>
          </View>
        )}

        {!selectedStudentId && (
          <View style={styles.emptyState}>
            <ThemedText style={[styles.emptyText, { color: textColor + "80" }]}>
              Wybierz ucznia, aby wygenerować raport fakturowy.
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
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
  errorContainer: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    marginRight: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  pickerContainer: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  generateButton: {
    width: "100%",
  },
  emptyState: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
});
