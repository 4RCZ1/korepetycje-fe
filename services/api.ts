import {Platform} from 'react-native';

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

type LessonEntryDTO = {
  LessonId: string;
  StartTime: string;  // ISO 8601 datetime
  EndTime: string;    // ISO 8601 datetime
  Text: string;
  ConfirmedBy: Record<string, boolean>;
};

export type LessonEntry = {
  lessonId: string;
  startTimestamp: number;  // miliseconds since the day started
  endTimestamp: number;    // miliseconds since the day started
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  description: string;
  fullyConfirmed: boolean | null;
  confirmedBy: Record<string, boolean>;
};

type ScheduleDTO = LessonEntryDTO[];

export type Schedule = {
  [date: string]: LessonEntry[];
};

export function scheduleConverter(scheduleDTO: ScheduleDTO): Schedule {
  const schedule: Schedule = {};

  for (const entryDTO of scheduleDTO) {
    const startDate = new Date(entryDTO.StartTime);
    const endDate = new Date(entryDTO.EndTime);

    // Get the date string (YYYY-MM-DD format)
    const dateKey = startDate.toISOString().split('T')[0];

    // Calculate milliseconds since the day started
    const dayStart = new Date(startDate);
    dayStart.setHours(0, 0, 0, 0);

    const startTimestamp = startDate.getTime() - dayStart.getTime();
    const endTimestamp = endDate.getTime() - dayStart.getTime();

    const lessonEntry: LessonEntry = {
      lessonId: entryDTO.LessonId,
      startTimestamp,
      endTimestamp,
      startTime: startDate.toISOString().substring(11, 16),
      endTime: endDate.toISOString().substring(11, 16),
      description: entryDTO.Text,
      fullyConfirmed: Object.values(entryDTO.ConfirmedBy).every(Boolean) || Object.values(entryDTO.ConfirmedBy).every(e => e === undefined || e === null) ? null : false,
      confirmedBy: entryDTO.ConfirmedBy,
    };

    if (!schedule[dateKey]) {
      schedule[dateKey] = [];
    }
    schedule[dateKey].push(lessonEntry);
  }

  return schedule;
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
  options: RequestInit = {},
  queryParams?: Record<string, string>
): Promise<T> {
  console.log(`Making API request to: ${endpoint}`, options, queryParams);
  let url = `${API_CONFIG.baseURL}${endpoint}`;
  if (queryParams && Object.keys(queryParams).length > 0) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    }
    url = `${url}?${searchParams.toString()}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  const config: RequestInit = {
    ...options,
    headers: {
      ...API_CONFIG.headers,
      ...options.headers,
    },
    signal: controller.signal,
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

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
    clearTimeout(timeoutId);

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
  async getSchedule(startDate: string, endDate: string): Promise<Schedule> {
    try {
      const response = await apiRequest<ApiResponse<ScheduleDTO>>('/schedule', {}, {
        startDate,
        endDate,
      });

      return scheduleConverter(response.data);
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
      throw error;
    }
  },

  // helper function to get a week schedule
  async getWeekSchedule(weekOffset: number = 0): Promise<Schedule> {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - ((today.getDay() || 7) + 1) + weekOffset * 7);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    return this.getSchedule(
      startDate.toISOString(),
      endDate.toISOString()
    );
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
  async getScheduleWithRetry(startDate: string, endDate: string, maxRetries: number = 3): Promise<Schedule> {
    let lastError: ApiClientError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.getSchedule(startDate, endDate);
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