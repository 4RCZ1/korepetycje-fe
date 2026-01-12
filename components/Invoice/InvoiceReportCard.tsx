import React, { useState } from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ThemedButton from "@/components/ui/ThemedButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import { InvoiceReport } from "@/types/invoice";
import { exportInvoiceReport } from "@/utils/invoiceExport";

interface InvoiceReportCardProps {
  report: InvoiceReport;
  studentName: string;
  startDate: Date;
  endDate: Date;
  style?: StyleProp<ViewStyle>;
  showExportButton?: boolean;
}

const InvoiceReportCard: React.FC<InvoiceReportCardProps> = ({
  report,
  studentName,
  startDate,
  endDate,
  style,
  showExportButton = true,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const backgroundColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "border");

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatHours = (hours: number): number => {
    return Math.round(hours);
  };

  const handleExport = async (format: "csv" | "txt") => {
    setIsExporting(true);
    try {
      await exportInvoiceReport(
        {
          report,
          studentName,
          startDate,
          endDate,
        },
        format,
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }, style]}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={[styles.studentName, { color: primaryColor }]}>
          {studentName}
        </ThemedText>
        <ThemedText style={[styles.dateRange, { color: textColor + "80" }]}>
          {formatDate(startDate)} - {formatDate(endDate)}
        </ThemedText>
      </View>

      <View style={[styles.divider, { backgroundColor: borderColor }]} />

      {/* Hours breakdown */}
      <View style={styles.hoursSection}>
        <View style={styles.hoursRow}>
          <ThemedText style={[styles.hoursLabel, { color: textColor }]}>
            Individual lessons:
          </ThemedText>
          <ThemedText style={[styles.hoursValue, { color: textColor }]}>
            {formatHours(report.individualHours)} h
          </ThemedText>
        </View>

        <View style={styles.hoursRow}>
          <ThemedText style={[styles.hoursLabel, { color: textColor }]}>
            Group lessons:
          </ThemedText>
          <ThemedText style={[styles.hoursValue, { color: textColor }]}>
            {formatHours(report.groupHours)} h
          </ThemedText>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: borderColor }]} />

      {/* Total */}
      <View style={styles.totalSection}>
        <ThemedText style={[styles.totalLabel, { color: primaryColor }]}>
          Total hours:
        </ThemedText>
        <ThemedText style={[styles.totalValue, { color: primaryColor }]}>
          {formatHours(report.totalHours)} h
        </ThemedText>
      </View>

      {/* Export Buttons */}
      {showExportButton && (
        <>
          <View style={[styles.divider, { backgroundColor: borderColor }]} />
          <View style={styles.exportSection}>
            <ThemedButton
              title="Export CSV"
              variant="outline"
              size="small"
              color="primary"
              onPress={() => handleExport("csv")}
              loading={isExporting}
              disabled={isExporting}
              style={styles.exportButton}
            />
            <ThemedButton
              title="Export TXT"
              variant="outline"
              size="small"
              color="primary"
              onPress={() => handleExport("txt")}
              loading={isExporting}
              disabled={isExporting}
              style={styles.exportButton}
            />
          </View>
        </>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  header: {
    marginBottom: 12,
  },
  studentName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  dateRange: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginVertical: 12,
    opacity: 0.3,
  },
  hoursSection: {
    gap: 8,
  },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hoursLabel: {
    fontSize: 16,
  },
  hoursValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  exportSection: {
    flexDirection: "row",
    gap: 12,
  },
  exportButton: {
    flex: 1,
  },
});

export default InvoiceReportCard;
