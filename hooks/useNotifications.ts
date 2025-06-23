import { useEffect } from 'react';
import { NotificationService } from '@/services/notificationService';

/**
 * Hook to initialize and manage notifications for the app
 */
export function useNotifications() {
  useEffect(() => {
    // Request permissions on app start
    const initializeNotifications = async () => {
      try {
        const hasPermission = await NotificationService.requestPermissions();
        if (hasPermission) {
          console.log('Notification permissions granted');
        } else {
          console.log('Notification permissions denied');
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializeNotifications();
  }, []);

  return {
    requestPermissions: NotificationService.requestPermissions,
    cancelAllLessonNotifications: NotificationService.cancelAllLessonNotifications,
    scheduleNotificationsForLessons: NotificationService.scheduleNotificationsForLessons,
  };
}
