/**
 * Report data for generating invoices
 */
export interface InvoiceReport {
  individualHours: number;
  groupHours: number;
  totalHours: number; // calculated on frontend
}

/**
 * Parameters for fetching invoice report
 */
export interface InvoiceReportParams {
  studentId: string;
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
}

/**
 * Backend response structure
 */
export interface InvoiceReportResponse {
  individualHours: number;
  groupHours: number;
}
