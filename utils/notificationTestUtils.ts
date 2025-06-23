import { NotificationService } from '@/services/notificationService';
import { Schedule, LessonEntry } from '@/services/scheduleApi';

/**
 * Test utilities for notifications during development
 * These functions can be called from the console or development screens
 */
export class NotificationTestUtils {
  /**
   * Create a test schedule with lessons in the near future for testing
   */
  static createTestSchedule(): Schedule {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Create lessons starting 30 minutes and 90 minutes from now
    const lesson1StartTime = new Date(now.getTime() + 30 * 60 * 1000);
    const lesson1EndTime = new Date(lesson1StartTime.getTime() + 60 * 60 * 1000);
    
    const lesson2StartTime = new Date(now.getTime() + 90 * 60 * 1000);
    const lesson2EndTime = new Date(lesson2StartTime.getTime() + 60 * 60 * 1000);

    const testLesson1: LessonEntry = {
      lessonId: 'test-lesson-1',
      startTimestamp: lesson1StartTime.getTime() - new Date(today).getTime(),
      endTimestamp: lesson1EndTime.getTime() - new Date(today).getTime(),
      startTime: lesson1StartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      endTime: lesson1EndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      address: 'Test Address 1',
      description: 'Test Mathematics Lesson',
      lessonType: 'Mathematics',
      fullyConfirmed: true,
      attendances: [
        {
          studentName: 'John',
          studentSurname: 'Doe',
          confirmed: true
        }
      ]
    };

    const testLesson2: LessonEntry = {
      lessonId: 'test-lesson-2',
      startTimestamp: lesson2StartTime.getTime() - new Date(tomorrow).getTime(),
      endTimestamp: lesson2EndTime.getTime() - new Date(tomorrow).getTime(),
      startTime: lesson2StartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      endTime: lesson2EndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      address: 'Test Address 2',
      description: 'Test Physics Lesson',
      lessonType: 'Physics',
      fullyConfirmed: true,
      attendances: [
        {
          studentName: 'Jane',
          studentSurname: 'Smith',
          confirmed: true
        }
      ]
    };

    return {
      [today]: [testLesson1],
      [tomorrow]: [testLesson2]
    };
  }

  /**
   * Test notification scheduling with mock data
   */
  static async testNotificationScheduling(): Promise<void> {
    console.log('Testing notification scheduling...');
    
    try {
      const testSchedule = this.createTestSchedule();
      console.log('Created test schedule:', testSchedule);
      
      await NotificationService.scheduleNotificationsForLessons(testSchedule);
      console.log('Test notifications scheduled successfully!');
      
      // List scheduled notifications for verification
      const scheduled = await import('expo-notifications').then(module => 
        module.getAllScheduledNotificationsAsync()
      );
      console.log('Currently scheduled notifications:', scheduled);
      
    } catch (error) {
      console.error('Error testing notifications:', error);
    }
  }

  /**
   * Test permission request
   */
  static async testPermissionRequest(): Promise<void> {
    console.log('Testing permission request...');
    
    try {
      const hasPermission = await NotificationService.requestPermissions();
      console.log('Permission granted:', hasPermission);
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  }

  /**
   * Test cancelling all lesson notifications
   */
  static async testCancelNotifications(): Promise<void> {
    console.log('Testing notification cancellation...');
    
    try {
      await NotificationService.cancelAllLessonNotifications();
      console.log('All lesson notifications cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }
  /**
   * Send a test notification immediately (for testing UI)
   */
  static async sendTestNotification(): Promise<void> {
    console.log('Sending immediate test notification...');
    
    try {
      const Notifications = await import('expo-notifications');
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification',
          body: 'This is a test notification to verify the UI and behavior',
          data: { 
            type: 'test',
            timestamp: new Date().toISOString()
          },
        },
        trigger: { 
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 1, 
          repeats: false 
        },
      });
      
      console.log('Test notification scheduled to appear in 1 second');
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }
}

// Export functions for global access during development
if (__DEV__) {
  (global as any).NotificationTestUtils = NotificationTestUtils;
}
