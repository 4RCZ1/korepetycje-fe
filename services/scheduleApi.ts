import { ApiClientError, ApiResponse, apiRequest } from "@/services/api";

type AttendanceDTO = {
  StudentName: string;
  StudentSurname: string;
  Confirmed: boolean | null;
}

type LessonEntryDTO = {
  LessonId: string;
  StartTime: string; // ISO 8601 datetime
  EndTime: string; // ISO 8601 datetime
  Address: string;
  Description: string;
  Attendances: AttendanceDTO[];
};

export type AttendanceType = {
  studentName: string;
  studentSurname: string;
  confirmed: boolean | null; // null means not confirmed by anyone
}

export type LessonEntry = {
  lessonId: string;
  startTimestamp: number; // miliseconds since the day started
  endTimestamp: number; // miliseconds since the day started
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  address: string
  description: string;
  fullyConfirmed: boolean | null;
  attendances: AttendanceType[];
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
    const dateKey = startDate.toISOString().split("T")[0];

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
      description: entryDTO.Description,
      fullyConfirmed:
        entryDTO.Attendances.every(e=>Boolean(e.Confirmed)) ||
        entryDTO.Attendances.every(
          (e) => e.Confirmed === undefined || e.Confirmed === null,
        )
          ? null
          : false,
      attendances: entryDTO.Attendances.map((attendance) => ({
        studentName: attendance.StudentName,
        studentSurname: attendance.StudentSurname,
        confirmed: attendance.Confirmed,
      })),
      address: entryDTO.Address,
    };

    if (!schedule[dateKey]) {
      schedule[dateKey] = [];
    }
    schedule[dateKey].push(lessonEntry);
  }

  return schedule;
}

export type LessonRequest = {
  firstStartTime: string;    // ISO 8601 datetime
  firstEndTime: string;      // ISO 8601 datetime
  scheduleEndTime: string;   // ISO 8601 datetime
  periodInDays: number;
  addressId: string;
  studentIds: string[];
}

export interface ConfirmMeetingRequest {
  lessonId: string;
  confirmed: boolean;
}

export interface ConfirmMeetingResponse {
  lessonId: string;
  confirmed: boolean;
  updatedAt: string;
}

export const scheduleApi = {
  // GET request to fetch schedule
  async getSchedule(startDate: string, endDate: string): Promise<Schedule> {
    try {
      const response = await apiRequest<ApiResponse<ScheduleDTO>>(
        "/lesson",
        {},
        {
          startTime: startDate,
          endTime: endDate,
        },
      );

      return scheduleConverter(response.data ?? []);
    } catch (error) {
      console.error("Failed to fetch schedule:", error);
      throw error;
    }
  },

  async planLesson(lesson: LessonRequest): Promise<boolean> {
    try {
      const response = await apiRequest<ApiResponse<boolean>>(
        "/plan-lessons",
        {
          method: "POST",
          body: JSON.stringify(lesson),
        },
      );
      return response.success;
    } catch (error) {
      console.error("Failed to plan lesson:", error);
      return false
    }
  },

  // helper function to get a week schedule
  async getWeekSchedule(weekOffset: number = 0): Promise<Schedule> {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(
      today.getDate() - ((today.getDay() || 7) + 1) + weekOffset * 7,
    );
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    return this.getSchedule(startDate.toISOString(), endDate.toISOString());
  },

  // POST request to confirm/cancel meeting
  async confirmMeeting(
    lessonId: string,
    isConfirmed: boolean,
  ): Promise<ConfirmMeetingResponse | null> {
    try {
      const response = await apiRequest<ApiResponse<ConfirmMeetingResponse>>(
        `/lesson/${lessonId}/confirm`,
        {
          method: "PUT",
          body: JSON.stringify({
            confirmed: isConfirmed,
          }),
        },
      );
      return response.data;
    } catch (error) {
      console.error("Failed to confirm meeting:", error);
      throw error;
    }
  },

  async deleteLesson(lessonId: string, deleteFutureLessons: boolean): Promise<boolean> {
    try {
      const response = await apiRequest<ApiResponse<boolean>>(
        `/delete-lesson`,
        {
          method: "POST",
          body: JSON.stringify({
            lessonId,
            deleteFutureLessons,
          }),
        },
      );
      return response.success;
    } catch (error) {
      console.error("Failed to delete lesson:", error);
      throw error;
    }
  },

  // Additional utility methods for retries and offline handling
  async getScheduleWithRetry(
    startDate: string,
    endDate: string,
    maxRetries: number = 3,
  ): Promise<Schedule> {
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
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  },
};
