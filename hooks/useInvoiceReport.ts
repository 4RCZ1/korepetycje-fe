import { useState, useCallback } from "react";

import { ApiClientError } from "@/services/api";
import {
  invoiceApi,
  getDefaultDateRange,
  validateDateRange,
} from "@/services/invoiceApi";
import { InvoiceReport, InvoiceReportParams } from "@/types/invoice";
import alert from "@/utils/alert";
import { getFormatDate } from "@/utils/dates";

export interface UseInvoiceReportState {
  report: InvoiceReport | null;
  loading: boolean;
  error: string | null;
  startDate: Date;
  endDate: Date;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
  fetchReport: (studentId: string) => Promise<boolean>;
  clearReport: () => void;
}

export function useInvoiceReport(): UseInvoiceReportState {
  const { startDate: defaultStart, endDate: defaultEnd } =
    getDefaultDateRange();

  const [report, setReport] = useState<InvoiceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date>(defaultStart);
  const [endDate, setEndDate] = useState<Date>(defaultEnd);

  const fetchReport = useCallback(
    async (studentId: string): Promise<boolean> => {
      // Validate date range before making request
      const validationError = validateDateRange(
        getFormatDate(startDate),
        getFormatDate(endDate),
      );

      if (validationError) {
        setError(validationError);
        alert("Invalid Date Range", validationError);
        return false;
      }

      try {
        setLoading(true);
        setError(null);

        const params: InvoiceReportParams = {
          studentId,
          startDate: getFormatDate(startDate),
          endDate: getFormatDate(endDate),
        };

        const response = await invoiceApi.getInvoiceReport(params);

        if (response.success && response.data) {
          setReport(response.data);
          return true;
        } else {
          setError(response.message || "Failed to load invoice report");
          alert("Error", response.message || "Failed to load invoice report");
          return false;
        }
      } catch (err) {
        let errorMessage = "Failed to load invoice report";

        if (err instanceof ApiClientError) {
          const apiError = err;

          if (apiError.code === "NETWORK_ERROR") {
            errorMessage = "No internet connection. Please check your network.";
          } else if (apiError.code === "TIMEOUT") {
            errorMessage = "Request timed out. Please try again.";
          } else if (apiError.status === 401) {
            errorMessage = "Authentication required. Please log in.";
          } else if (apiError.status === 403) {
            errorMessage = "Access denied. You don't have permission.";
          } else if (apiError.status === 404) {
            errorMessage = "Student not found.";
          } else if (apiError.status >= 500) {
            errorMessage = "Server error. Please try again later.";
          }

          console.error("Invoice report fetch error:", apiError);
        } else {
          console.error("Invoice report fetch error (unknown error type):", err);
        }

        setError(errorMessage);
        alert("Error", errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [startDate, endDate],
  );

  const clearReport = useCallback(() => {
    setReport(null);
    setError(null);
  }, []);

  return {
    report,
    loading,
    error,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    fetchReport,
    clearReport,
  };
}
