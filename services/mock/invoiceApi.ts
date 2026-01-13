import {
  InvoiceReport,
  InvoiceReportParams,
  InvoiceReportResponse,
} from "@/types/invoice";
import { validateDateRange } from "@/services/invoiceApi";

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
 * Mock implementation of invoice API
 * Simulates network delay and generates mock data based on student ID and date range
 */
export const invoiceApiMock = {
  /**
   * Fetch invoice report (mock implementation)
   * Returns mock data with hours calculated based on the date range
   */
  async getInvoiceReport(
    params: InvoiceReportParams,
  ): Promise<{ data: InvoiceReport | null; success: boolean; message?: string }> {
    console.log(
      "[invoiceApiMock.getInvoiceReport]",
      JSON.stringify(params, null, 2),
    );

    // Validate date range
    const validationError = validateDateRange(params.startDate, params.endDate);
    if (validationError) {
      console.log(
        "[invoiceApiMock.getInvoiceReport] Validation error:",
        validationError,
      );
      return { data: null, success: false, message: validationError };
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Calculate mock hours based on date range
    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);
    const daysDiff =
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Generate mock data with some variation based on studentId
    const studentIdNum = parseInt(params.studentId.replace(/\D/g, ""), 10) || 1;
    const seed = studentIdNum * daysDiff;

    // Mock calculation: roughly 1-2 hours per week
    const weeksInRange = daysDiff / 7;
    const baseIndividualHours = Math.floor(weeksInRange * 1.5);
    const baseGroupHours = Math.floor(weeksInRange * 0.5);

    // Add some variation based on seed
    const individualHours = Math.max(
      0,
      baseIndividualHours + ((seed % 5) - 2),
    );
    const groupHours = Math.max(0, baseGroupHours + ((seed % 3) - 1));

    const mockResponse: InvoiceReportResponse = {
      individualHours,
      groupHours,
    };

    const report = invoiceReportConverter(mockResponse);
    const response = { data: report, success: true };

    console.log(
      "[invoiceApiMock.getInvoiceReport] Response:",
      JSON.stringify(response, null, 2),
    );

    return response;
  },
};
