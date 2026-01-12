import { Paths, File } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

import { InvoiceReport } from "@/types/invoice";
import alert from "@/utils/alert";

interface ExportParams {
  report: InvoiceReport;
  studentName: string;
  startDate: Date;
  endDate: Date;
}

/**
 * Format date for display in exports
 */
function formatDateForExport(date: Date): string {
  return date.toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Generate CSV content for invoice report
 */
export function generateInvoiceCSV(params: ExportParams): string {
  const { report, studentName, startDate, endDate } = params;

  const lines = [
    "Invoice Report",
    "",
    `Student,${studentName}`,
    `Period,${formatDateForExport(startDate)} - ${formatDateForExport(endDate)}`,
    "",
    "Type,Hours",
    `Individual Lessons,${report.individualHours}`,
    `Group Lessons,${report.groupHours}`,
    `Total,${report.totalHours}`,
  ];

  return lines.join("\n");
}

/**
 * Generate plain text content for invoice report
 */
export function generateInvoiceText(params: ExportParams): string {
  const { report, studentName, startDate, endDate } = params;

  const lines = [
    "=================================",
    "       INVOICE REPORT",
    "=================================",
    "",
    `Student: ${studentName}`,
    `Period:  ${formatDateForExport(startDate)} - ${formatDateForExport(endDate)}`,
    "",
    "---------------------------------",
    "Hours Breakdown:",
    "---------------------------------",
    `Individual Lessons:  ${report.individualHours} h`,
    `Group Lessons:       ${report.groupHours} h`,
    "---------------------------------",
    `TOTAL:               ${report.totalHours} h`,
    "=================================",
  ];

  return lines.join("\n");
}

/**
 * Export invoice report to file and share
 */
export async function exportInvoiceReport(
  params: ExportParams,
  format: "csv" | "txt" = "csv",
): Promise<boolean> {
  try {
    // Check if sharing is available
    if (Platform.OS !== "web") {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        alert("Export Not Available", "Sharing is not available on this device.");
        return false;
      }
    }

    const { studentName, startDate, endDate } = params;

    // Generate content based on format
    const content =
      format === "csv"
        ? generateInvoiceCSV(params)
        : generateInvoiceText(params);

    // Generate filename
    const sanitizedName = studentName.replace(/\s+/g, "_");
    const dateStr = `${startDate.getFullYear()}${(startDate.getMonth() + 1).toString().padStart(2, "0")}`;
    const filename = `invoice_${sanitizedName}_${dateStr}.${format}`;

    if (Platform.OS === "web") {
      // Web: Download file using browser API
      const blob = new Blob([content], {
        type: format === "csv" ? "text/csv" : "text/plain",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    }

    // Native: Save to cache and share
    const file = new File(Paths.cache, filename);
    await file.write(content);

    await Sharing.shareAsync(file.uri, {
      mimeType: format === "csv" ? "text/csv" : "text/plain",
      dialogTitle: "Export Invoice Report",
    });

    return true;
  } catch (error) {
    console.error("Export error:", error);
    alert("Export Failed", "Failed to export the invoice report.");
    return false;
  }
}
