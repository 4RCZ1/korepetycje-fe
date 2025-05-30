import { Platform } from 'react-native';

// Configuration
const API_CONFIG = {
  baseURL: 'localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Types for API responses
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// Enhanced ScheduleItem to include lessonId for API operations
export interface ScheduleItem {
  lessonId: string;           // Added for API operations
  yPosStart: number;
  yPosEnd: number;
  text: string;
  confirmed?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface WeekSchedule {
  Monday: ScheduleItem[];
  Tuesday: ScheduleItem[];
  Wednesday: ScheduleItem[];
  Thursday: ScheduleItem[];
  Friday: ScheduleItem[];
  Saturday: ScheduleItem[];
  Sunday: ScheduleItem[];
}

export interface ConfirmMeetingRequest {
  lessonId: string;
  isConfirmed: boolean;
}

export interface ConfirmMeetingResponse {
  lessonId: string;
  confirmed: boolean;
  updatedAt: string;
}

// Custom error class for API errors
export class ApiClientError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
  }
}

// Generic API request function with comprehensive error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  console.log(`Making API request to: ${endpoint}`, options);
  const url = `${API_CONFIG.baseURL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      ...API_CONFIG.headers,
      ...options.headers,
    },
    // Add timeout using AbortController
    signal: AbortSignal.timeout(API_CONFIG.timeout),
  };

  try {
    const response = await fetch(url, config);

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiClientError(
        errorData.message || `HTTP Error: ${response.status}`,
        response.status,
        errorData.code
      );
    }

    const data = await response.json();

    // Validate API response structure
    if (data.success === false) {
      throw new ApiClientError(
        data.message || 'API returned error',
        response.status,
        data.code
      );
    }

    return data;
  } catch (_error) {
    // Handle different types of errors
    if (_error instanceof ApiClientError) {
      throw _error;
    }
    const error = _error as Error;

    if (error.name === 'AbortError') {
      throw new ApiClientError('Request timeout', 408, 'TIMEOUT');
    }

    if (error.name === 'TypeError' && error.message.includes('network')) {
      throw new ApiClientError('Network error - check your connection', 0, 'NETWORK_ERROR');
    }

    throw new ApiClientError(
      error.message || 'Unknown error occurred',
      0,
      'UNKNOWN_ERROR'
    );
  }
}

// API service functions
export const scheduleApi = {
  // GET request to fetch schedule
  async getSchedule(): Promise<WeekSchedule> {
    try {
      const response = await apiRequest<ApiResponse<WeekSchedule>>('/schedule');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
      throw error;
    }
  },

  // POST request to confirm/cancel meeting
  async confirmMeeting(
    lessonId: string,
    isConfirmed: boolean
  ): Promise<ConfirmMeetingResponse> {
    try {
      const response = await apiRequest<ApiResponse<ConfirmMeetingResponse>>('/schedule/confirm', {
        method: 'POST',
        body: JSON.stringify({
          lessonId,
          isConfirmed,
        }),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to confirm meeting:', error);
      throw error;
    }
  },

  // Additional utility methods for retries and offline handling
  async getScheduleWithRetry(maxRetries: number = 3): Promise<WeekSchedule> {
    let lastError: ApiClientError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.getSchedule();
      } catch (error) {
        lastError = error as ApiClientError;

        // Don't retry on client errors (4xx)
        if (lastError.status >= 400 && lastError.status < 500) {
          throw lastError;
        }

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  },
};