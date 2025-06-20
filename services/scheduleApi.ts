import { ApiClientError, apiRequest } from "@/services/api";
import { getWeekStartEndDates } from "@/utils/dates";

type AttendanceDTO = {
  studentName: string;
  studentSurname: string;
  confirmed: boolean | null;
};

type LessonEntryDTO = {
  lessonId: string;
  startTime: string; // ISO 8601 datetime
  endTime: string; // ISO 8601 datetime
  address: string;
  description: string;
  lessonType?: string; // Optional lesson type
  attendances: AttendanceDTO[];
};

export type AttendanceType = {
  studentName: string;
  studentSurname: string;
  confirmed: boolean | null; // null means not confirmed by anyone
};

export type LessonEntry = {
  lessonId: string;
  startTimestamp: number; // miliseconds since the day started
  endTimestamp: number; // miliseconds since the day started
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  address: string;
  description: string;
  lessonType?: string; // Optional lesson type
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
    const startDate = new Date(entryDTO.startTime);
    const endDate = new Date(entryDTO.endTime);

    // Get the date string (YYYY-MM-DD format)
    const dateKey = startDate.toISOString().split("T")[0];

    // Calculate milliseconds since the day started
    const dayStart = new Date(startDate);
    dayStart.setHours(0, 0, 0, 0);

    const startTimestamp = startDate.getTime() - dayStart.getTime();
    const endTimestamp = endDate.getTime() - dayStart.getTime();

    const lessonEntry: LessonEntry = {
      lessonId: entryDTO.lessonId,
      startTimestamp,
      endTimestamp,
      startTime: startDate.toISOString().substring(11, 16),
      endTime: endDate.toISOString().substring(11, 16),
      description: entryDTO.description,
      lessonType: entryDTO.lessonType,
      fullyConfirmed:
        entryDTO.attendances.every((e) => Boolean(e.confirmed)) ||
        entryDTO.attendances.every(
          (e) => e.confirmed === undefined || e.confirmed === null,
        )
          ? null
          : false,
      attendances: entryDTO.attendances.map((attendance) => ({
        studentName: attendance.studentName,
        studentSurname: attendance.studentSurname,
        confirmed: attendance.confirmed,
      })),
      address: entryDTO.address,
    };

    if (!schedule[dateKey]) {
      schedule[dateKey] = [];
    }
    schedule[dateKey].push(lessonEntry);
  }

  return schedule;
}

export type LessonRequest = {
  firstStartTime: string; // ISO 8601 datetime
  firstEndTime: string; // ISO 8601 datetime
  scheduleEndTime: string; // ISO 8601 datetime
  periodInDays: number;
  addressId: string;
  studentIds: string[];
  description: string;
};

export interface ConfirmMeetingRequest {
  lessonId: string;
  confirmed: boolean;
}

export interface ConfirmMeetingResponse {
  lessonId: string;
  confirmed: boolean;
  updatedAt: string;
}

export interface EditLessonRequest {
  startTime: string; // ISO 8601 datetime
  endTime: string; // ISO 8601 datetime
  editFutureLessons: boolean;
}

export interface EditLessonResponse {
  lessonId: string;
  startTime: string;
  endTime: string;
  updatedAt: string;
}

export const scheduleApi = {
  // GET request to fetch schedule
  async getSchedule(startDate: string, endDate: string): Promise<Schedule> {
    try {
      const response = await apiRequest<ScheduleDTO>(
        "/lesson",
        {},
        {
          startTime: startDate,
          endTime: endDate,
        },
      );

      return scheduleConverter(response ?? []);
    } catch (error) {
      console.error("Failed to fetch schedule:", error);
      throw error;
    }
  },

  async planLesson(lesson: LessonRequest): Promise<boolean> {
    try {
      const response = await apiRequest<string>("/plan-lessons", {
        method: "POST",
        body: JSON.stringify(lesson),
      });
      return response === "";
    } catch (error) {
      console.error("Failed to plan lesson:", error);
      return false;
    }
  },

  // helper function to get a week schedule
  async getWeekSchedule(weekOffset: number = 0): Promise<Schedule> {
    const { startDate, endDate } = getWeekStartEndDates({ weekOffset });
    return this.getSchedule(startDate.toISOString(), endDate.toISOString());
  },

  // POST request to confirm/cancel meeting
  async confirmMeeting(
    lessonId: string,
    isConfirmed: boolean,
  ): Promise<ConfirmMeetingResponse | null> {
    try {
      const response = await apiRequest<ConfirmMeetingResponse>(
        `/lesson/${lessonId}/confirm`,
        {
          method: "PUT",
          body: JSON.stringify({
            confirmed: isConfirmed,
          }),
        },
      );
      return response;
    } catch (error) {
      console.error("Failed to confirm meeting:", error);
      throw error;
    }
  },

  async deleteLesson(
    lessonId: string,
    deleteFutureLessons: boolean,
  ): Promise<boolean> {
    try {
      const response = await apiRequest<string>(`/delete-lesson`, {
        method: "POST",
        body: JSON.stringify({
          lessonId,
          deleteFutureLessons,
        }),
      });
      return response === "";
    } catch (error) {
      console.error("Failed to delete lesson:", error);
      throw error;
    }
  },

  async editLesson(
    lessonId: string,
    editRequest: EditLessonRequest,
  ): Promise<EditLessonResponse | null> {
    try {
      const response = await apiRequest<EditLessonResponse>(
        `/lesson/${lessonId}`,
        {
          method: "PATCH",
          body: JSON.stringify(editRequest),
        },
      );
      return response;
    } catch (error) {
      console.error("Failed to edit lesson:", error);
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
