import { ApiClientError, apiRequest } from "@/services/api";
import { invoiceApiMock } from "@/services/mock/invoiceApi";
import {
  InvoiceReport,
  InvoiceReportParams,
  InvoiceReportResponse,
} from "@/types/invoice";

const USE_MOCK_API = process.env.EXPO_PUBLIC_USE_MOCK_API === "true";

/**
 * Convert backend response to InvoiceReport with calculated total
 */
function invoiceReportConverter(
  response: InvoiceReportResponse,
): InvoiceReport {
  return {
    individualHours: response.individualHours,
    groupHours: response.groupHours,
    totalHours: response.individualHours + response.groupHours,
  };
}

/**
 * Validate date range for invoice report
 * @returns Error message if invalid, null if valid
 */
export function validateDateRange(
  startDate: string,
  endDate: string,
): string | null {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime())) {
    return "Invalid start date";
  }

  if (isNaN(end.getTime())) {
    return "Invalid end date";
  }

  if (start > end) {
    return "Start date must be before end date";
  }

  // Check if date range is too large (e.g., more than 1 year)
  const oneYearMs = 365 * 24 * 60 * 60 * 1000;
  if (end.getTime() - start.getTime() > oneYearMs) {
    return "Date range cannot exceed one year";
  }

  return null;
}

/**
 * Get default date range (current month)
 */
export function getDefaultDateRange(): { startDate: Date; endDate: Date } {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
}

/**
 * Format date to ISO 8601 with time component for API
 */
function formatDateForApi(date: Date, isEndDate: boolean = false): string {
  // Clone the date to avoid mutating the original
  const d = new Date(date);

  if (isEndDate) {
    // Set to end of day for end date
    d.setHours(23, 59, 59, 999);
  } else {
    // Set to start of day for start date
    d.setHours(0, 0, 0, 0);
  }

  return d.toISOString();
}

const realApi = {
  /**
   * Fetch invoice report from backend
   */
  async getInvoiceReport(params: InvoiceReportParams): Promise<{
    data: InvoiceReport | null;
    success: boolean;
    message?: string;
  }> {
    // Validate date range
    const validationError = validateDateRange(params.startDate, params.endDate);
    if (validationError) {
      return { data: null, success: false, message: validationError };
    }

    try {
      const startDate = new Date(params.startDate);
      const endDate = new Date(params.endDate);

      const response = await apiRequest<InvoiceReportResponse>(
        `/report/${params.studentId}`,
        { method: "GET" },
        {
          startTime: formatDateForApi(startDate, false),
          endTime: formatDateForApi(endDate, true),
        },
      );

      const report = invoiceReportConverter(response);
      return { data: report, success: true };
    } catch (error) {
      if (error instanceof ApiClientError) {
        return { data: null, success: false, message: error.message };
      }
      throw error;
    }
  },
};

export const invoiceApi = USE_MOCK_API ? invoiceApiMock : realApi;
