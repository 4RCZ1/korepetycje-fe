import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { LessonEntry, Schedule } from "./scheduleApi";

// Configure how notifications should be handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  private static readonly LESSON_NOTIFICATION_ID_PREFIX = "lesson_";
  private static readonly NOTIFICATION_CHANNEL_ID = "lesson-reminders";

  /**
   * Set up the notification channel (required for Android 13+)
   */
  static async setupNotificationChannel(): Promise<void> {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(
        this.NOTIFICATION_CHANNEL_ID,
        {
          name: "Lesson Reminders",
          description: "Notifications for upcoming lessons",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
          sound: "default",
          enableVibrate: true,
          enableLights: true,
          showBadge: true,
        },
      );
    }
  }

  /**
   * Request permission for push notifications
   */
  static async requestPermissions(): Promise<boolean> {
    if (Platform.OS === "web") {
      return false; // Notifications not supported on web
    }

    // Set up notification channel first (required for Android 13+)
    await this.setupNotificationChannel();

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowDisplayInCarPlay: false,
          allowCriticalAlerts: false,
          provideAppNotificationSettings: false,
          allowProvisional: false,
        },
      });
      finalStatus = status;
    }

    return finalStatus === "granted";
  }

  /**
   * Cancel all scheduled lesson notifications
   */
  static async cancelAllLessonNotifications(): Promise<void> {
    try {
      const scheduledNotifications =
        await Notifications.getAllScheduledNotificationsAsync();

      const lessonNotificationIds = scheduledNotifications
        .filter((notification) =>
          notification.identifier.startsWith(
            this.LESSON_NOTIFICATION_ID_PREFIX,
          ),
        )
        .map((notification) => notification.identifier);
      if (lessonNotificationIds.length > 0) {
        // Cancel notifications one by one as the bulk method doesn't exist
        for (const id of lessonNotificationIds) {
          await Notifications.cancelScheduledNotificationAsync(id);
        }
        console.log(
          `Cancelled ${lessonNotificationIds.length} lesson notifications`,
        );
      }
    } catch (error) {
      console.error("Error cancelling lesson notifications:", error);
    }
  }

  /**
   * Schedule notifications for upcoming lessons
   */
  static async scheduleNotificationsForLessons(
    schedule: Schedule,
  ): Promise<void> {
    try {
      // First cancel all existing lesson notifications
      await this.cancelAllLessonNotifications();

      // Check if we have permission
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn("Notification permissions not granted");
        return;
      }

      const now = new Date();
      const upcomingLessons = this.getUpcomingLessons(schedule, now);

      console.log(
        `Scheduling notifications for ${upcomingLessons.length} upcoming lessons`,
      );

      for (const { lesson, lessonDate } of upcomingLessons) {
        await this.scheduleNotificationForLesson(lesson, lessonDate);
      }
    } catch (error) {
      console.error("Error scheduling lesson notifications:", error);
    }
  }

  /**
   * Get all lessons that are in the future
   */
  private static getUpcomingLessons(
    schedule: Schedule,
    currentTime: Date,
  ): {
    lesson: LessonEntry;
    lessonDate: Date;
  }[] {
    const upcomingLessons: { lesson: LessonEntry; lessonDate: Date }[] = [];

    for (const [dateStr, lessons] of Object.entries(schedule)) {
      for (const lesson of lessons) {
        // Parse the date and add the lesson time
        const lessonDate = new Date(dateStr);
        lessonDate.setTime(lessonDate.getTime() + lesson.startTimestamp);

        // Only include lessons that are in the future
        if (lessonDate > currentTime) {
          upcomingLessons.push({ lesson, lessonDate });
        }
      }
    }

    // Sort by lesson date
    upcomingLessons.sort(
      (a, b) => a.lessonDate.getTime() - b.lessonDate.getTime(),
    );

    return upcomingLessons;
  }

  /**
   * Schedule a notification for a specific lesson (1 hour before)
   */
  private static async scheduleNotificationForLesson(
    lesson: LessonEntry,
    lessonDate: Date,
  ): Promise<void> {
    try {
      console.log(lessonDate);
      // Calculate notification time (1 hour before lesson)
      const lessonTimeUTC =
        lessonDate.getTime() + lessonDate.getTimezoneOffset() * 60000;
      console.log(
        "lessonTimeUTC",
        lessonTimeUTC,
        lessonDate.getTime(),
        lessonDate.getTimezoneOffset(),
      );
      const notificationTime = new Date(lessonTimeUTC - 60 * 60 * 1000);
      const now = new Date();

      // Calculate seconds until notification time
      const secondsUntilNotification = Math.floor(
        (notificationTime.getTime() - now.getTime()) / 1000,
      );

      // Don't schedule notification if it would be in the past or immediate
      if (secondsUntilNotification <= 0) {
        return;
      }

      // Create notification content
      const studentNames = lesson.attendances
        .map(
          (attendance) =>
            `${attendance.studentName} ${attendance.studentSurname}`,
        )
        .join(", ");

      const title = "Upcoming Lesson";
      const body = studentNames
        ? `Zajęcia zaczynają się o ${lesson.startTime}`
        : `Zajęcia zaczynają się o ${lesson.startTime}`;

      const notificationId = `${this.LESSON_NOTIFICATION_ID_PREFIX}${lesson.lessonId}`;

      await Notifications.scheduleNotificationAsync({
        identifier: notificationId,
        content: {
          title,
          body,
          data: {
            lessonId: lesson.lessonId,
            lessonStartTime: lessonDate.toISOString(),
            type: "lesson_reminder",
          },
          ...(Platform.OS === "android" && {
            channelId: this.NOTIFICATION_CHANNEL_ID,
          }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsUntilNotification,
          repeats: false,
        },
      });
      console.log(
        "timessss for notifications",
        secondsUntilNotification,
        notificationTime,
      );
      console.log(
        `Scheduled notification for lesson ${lesson.lessonId} at ${notificationTime.toISOString()}`,
      );
    } catch (error) {
      console.error(
        `Error scheduling notification for lesson ${lesson.lessonId}:`,
        error,
      );
    }
  }

  /**
   * Handle notification response when user taps on a notification
   */
  static setupNotificationResponseListener(): void {
    Notifications.addNotificationResponseReceivedListener((response) => {
      const { data } = response.notification.request.content;

      if (data?.type === "lesson_reminder") {
        console.log("User tapped on lesson reminder notification:", data);
        // You can add navigation logic here if needed
        // For example: navigate to the lesson details or schedule screen
      }
    });
  }
}
