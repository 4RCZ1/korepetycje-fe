import React, { useState } from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";

import InvoiceReportCard from "@/components/Invoice/InvoiceReportCard";
import { ThemedText } from "@/components/ThemedText";
import DateRangePicker from "@/components/ui/DateRangePicker";
import ThemedButton from "@/components/ui/ThemedButton";
import { useInvoiceReport } from "@/hooks/useInvoiceReport";
import { useThemeColor } from "@/hooks/useThemeColor";
import { StudentType } from "@/services/studentApi";

interface StudentInvoiceSectionProps {
  student: StudentType;
  style?: StyleProp<ViewStyle>;
}

const StudentInvoiceSection: React.FC<StudentInvoiceSectionProps> = ({
  student,
  style,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    report,
    loading,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    fetchReport,
    clearReport,
  } = useInvoiceReport();

  const textColor = useThemeColor({}, "text");
  const surfaceColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "border");

  const handleGenerateReport = async () => {
    await fetchReport(student.id);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      clearReport();
    }
  };

  const studentName = `${student.name} ${student.surname}`;

  return (
    <View style={[styles.container, style]}>
      <ThemedButton
        title={isExpanded ? "Hide Report Section" : "Generate Report"}
        variant="outline"
        size="medium"
        color="primary"
        onPress={toggleExpanded}
        style={styles.toggleButton}
      />

      {isExpanded && (
        <View
          style={[
            styles.expandedSection,
            {
              backgroundColor: surfaceColor,
              borderColor: borderColor,
            },
          ]}
        >
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Invoice Report
          </ThemedText>

          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            disabled={loading}
            startLabel="From"
            endLabel="To"
          />

          <ThemedButton
            title="Generate"
            variant="filled"
            size="medium"
            color="primary"
            onPress={handleGenerateReport}
            loading={loading}
            disabled={loading}
            style={styles.generateButton}
          />

          {report && (
            <InvoiceReportCard
              report={report}
              studentName={studentName}
              startDate={startDate}
              endDate={endDate}
              style={styles.reportCard}
            />
          )}

          {!report && !loading && (
            <ThemedText style={[styles.emptyText, { color: textColor + "80" }]}>
              Select a date range and click &quot;Generate&quot; to view the report.
            </ThemedText>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  toggleButton: {
    width: "100%",
  },
  expandedSection: {
    marginTop: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  generateButton: {
    marginTop: 16,
    width: "100%",
  },
  reportCard: {
    marginTop: 16,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    textAlign: "center",
  },
});

export default StudentInvoiceSection;
