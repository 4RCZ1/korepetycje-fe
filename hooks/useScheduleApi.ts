import { useState, useEffect, useCallback } from "react";

import { ApiClientError } from "@/services/api";
import { NotificationService } from "@/services/notificationService";
import { scheduleApi, Schedule } from "@/services/scheduleApi";

export interface UseScheduleApiState {
  scheduleData: Schedule | null;
  loading: boolean;
  error: string | null;
  refetch: (offset?: number) => Promise<void>;
  confirmMeeting: (lessonId: string, isConfirmed: boolean) => Promise<boolean>;
  deleteLesson: (
    lessonId: string,
    deleteFutureLessons: boolean,
  ) => Promise<boolean>;
  editLesson: (
    lessonId: string,
    startTime: string,
    endTime: string,
    editFutureLessons: boolean,
  ) => Promise<boolean>;
  confirmingLessons: Set<string>;
}

export function useScheduleApi(
  fetchOnRender: boolean = true,
  offset: number = 0,
): UseScheduleApiState {
  const [scheduleData, setScheduleData] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingLessons, setConfirmingLessons] = useState<Set<string>>(
    new Set(),
  );
  const fetchSchedule = useCallback(async (offset: number = 0) => {
    try {
      setLoading(true);
      setError(null);

      const data = await scheduleApi.getWeekSchedule(offset);
      setScheduleData(data);

      // Schedule notifications for upcoming lessons
      await NotificationService.scheduleNotificationsForLessons(data);
    } catch (err) {
      const apiError = err as ApiClientError;

      // Provide user-friendly error messages
      let errorMessage = "Failed to load schedule";

      if (apiError.code === "NETWORK_ERROR") {
        errorMessage = "No internet connection. Please check your network.";
      } else if (apiError.code === "TIMEOUT") {
        errorMessage = "Request timed out. Please try again.";
      } else if (apiError.status === 401) {
        errorMessage = "Authentication required. Please log in.";
      } else if (apiError.status === 403) {
        errorMessage = "Access denied. You don't have permission.";
      } else if (apiError.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }

      setError(errorMessage);
      console.error("Schedule fetch error:", apiError);
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmMeeting = useCallback(
    async (lessonId: string, isConfirmed: boolean): Promise<boolean> => {
      try {
        // Add to confirming set for loading state
        setConfirmingLessons((prev) => new Set(prev).add(lessonId));
        setError(null);

        const result = await scheduleApi.confirmMeeting(lessonId, isConfirmed);
        if (!result?.confirmed) {
          return false;
        }
        // Update local state optimistically
        setScheduleData((prevData) => {
          if (!prevData) return prevData;

          const newData = { ...prevData };

          // Find and update the specific lesson
          for (const [day, items] of Object.entries(newData)) {
            const itemIndex = items.findIndex(
              (item) => item.lessonId === lessonId,
            );
            if (itemIndex !== -1) {
              newData[day as keyof Schedule] = [...items];
              newData[day as keyof Schedule][itemIndex] = {
                ...items[itemIndex],
              };
              break;
            }
          }

          return newData;
        });

        return true;
      } catch (err) {
        const apiError = err as ApiClientError;

        let errorMessage = "Failed to update meeting status";

        if (apiError.code === "NETWORK_ERROR") {
          errorMessage = "No internet connection. Changes not saved.";
        } else if (apiError.status === 409) {
          errorMessage = "Meeting status was already changed. Refreshing...";
          // Refresh data on conflict
          fetchSchedule();
        }

        setError(errorMessage);
        console.error("Meeting confirmation error:", apiError);
        return false;
      } finally {
        // Remove from confirming set
        setConfirmingLessons((prev) => {
          const newSet = new Set(prev);
          newSet.delete(lessonId);
          return newSet;
        });
      }
    },
    [fetchSchedule],
  );

  const deleteLesson = useCallback(
    async (
      lessonId: string,
      deleteFutureLessons: boolean,
    ): Promise<boolean> => {
      try {
        setError(null);

        const success = await scheduleApi.deleteLesson(
          lessonId,
          deleteFutureLessons,
        );
        console.log("Lesson deleted successfully:", success);

        if (success) {
          // Refresh the schedule data after deletion
          await fetchSchedule(offset);
        }

        return success;
      } catch (err) {
        console.log("Failed to delete lesson:", err);
        const apiError = err as ApiClientError;

        let errorMessage = "Failed to delete lesson";

        if (apiError.code === "NETWORK_ERROR") {
          errorMessage = "No internet connection. Lesson not deleted.";
        } else if (apiError.status === 404) {
          errorMessage = "Lesson not found. It may have already been deleted.";
          // Refresh data on not found
          fetchSchedule(offset);
        } else if (apiError.status === 403) {
          errorMessage =
            "Access denied. You don't have permission to delete this lesson.";
        }

        setError(errorMessage);
        console.error("Lesson deletion error:", apiError);
        return false;
      }
    },
    [fetchSchedule, offset],
  );

  // Edit lesson
  const editLesson = useCallback(
    async (
      lessonId: string,
      startTime: string,
      endTime: string,
      editFutureLessons: boolean,
    ): Promise<boolean> => {
      try {
        setError(null);

        const success = await scheduleApi.editLesson(lessonId, {
          startTime,
          endTime,
          editFutureLessons,
        });

        if (success) {
          // Refresh the schedule data after editing
          await fetchSchedule(offset);
        }

        return Boolean(success);
      } catch (err) {
        console.log("Failed to edit lesson:", err);
        const apiError = err as ApiClientError;

        let errorMessage = "Failed to edit lesson";

        if (apiError.code === "NETWORK_ERROR") {
          errorMessage = "No internet connection. Lesson not updated.";
        } else if (apiError.status === 404) {
          errorMessage = "Lesson not found. It may have been deleted.";
          // Refresh data on not found
          fetchSchedule(offset);
        } else if (apiError.status === 403) {
          errorMessage =
            "Access denied. You don't have permission to edit this lesson.";
        } else if (apiError.status === 400) {
          errorMessage = "Invalid lesson data. Please check the time values.";
        }

        setError(errorMessage);
        console.error("Lesson edit error:", apiError);
        return false;
      }
    },
    [fetchSchedule, offset],
  );

  // Initial data fetch
  useEffect(() => {
    if (!fetchOnRender) return;
    fetchSchedule(offset);
  }, [fetchOnRender, fetchSchedule, offset]);

  return {
    scheduleData,
    loading,
    error,
    refetch: fetchSchedule,
    confirmMeeting,
    deleteLesson,
    editLesson,
    confirmingLessons,
  };
}
