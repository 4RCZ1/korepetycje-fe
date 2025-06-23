# Push Notifications Implementation

This document describes the push notifications implementation for lesson reminders in the Korepetycje app.

## Overview

The app now automatically schedules push notifications to remind users about upcoming lessons. Notifications are scheduled to appear 1 hour before each lesson starts.

## Key Features

### Automatic Scheduling
- Notifications are automatically scheduled whenever the weekly schedule is fetched
- Only future lessons are included (past lessons are filtered out)
- Notifications are scheduled 1 hour before the lesson start time

### Smart Management
- All existing lesson notifications are cancelled before scheduling new ones
- This prevents duplicate notifications when the schedule is refreshed
- Notifications are automatically rescheduled when lessons are edited or deleted

### Permission Handling
- The app requests notification permissions on startup
- Graceful fallback if permissions are denied
- Platform-specific permission requests (iOS/Android)

## Implementation Details

### Files Modified/Created

1. **`services/notificationService.ts`** - Core notification service
   - Handles permission requests
   - Manages notification scheduling and cancellation
   - Configures notification appearance and behavior

2. **`hooks/useScheduleApi.ts`** - Updated to trigger notifications
   - Calls notification scheduling after successful schedule fetch
   - Automatic rescheduling when lessons are modified

3. **`hooks/useNotifications.ts`** - Utility hook for notification management
   - Handles permission initialization
   - Provides easy access to notification functions

4. **`app/_layout.tsx`** - App-level notification setup
   - Initializes notification response listeners
   - Sets up permission requests on app start

5. **`app.json`** - Expo configuration
   - Added expo-notifications plugin
   - Configured notification icon and default channel
   - Added required Android permissions

## Notification Content

Each notification includes:
- **Title**: "Upcoming Lesson"
- **Body**: Shows student names and lesson start time
- **Data**: Includes lesson ID and metadata for handling taps

## Technical Notes

### Android-Specific Features
- **Notification Channel**: "Lesson Reminders" channel with high importance
- **Vibration Pattern**: Custom vibration pattern for lesson reminders  
- **Sound**: Uses default notification sound
- **Visual**: Supports lights and badges on compatible devices
- **Exact Alarms**: Uses SCHEDULE_EXACT_ALARM permission for precise timing on Android 12+

### Permission Requirements
- **iOS**: Automatically requests alert, badge, and sound permissions
- **Android**: Includes required permissions:
  - `RECEIVE_BOOT_COMPLETED` - For scheduling notifications after device restart
  - `VIBRATE` - For notification vibration
  - `WAKE_LOCK` - For waking device when notification triggers
  - `SCHEDULE_EXACT_ALARM` - For exact timing on Android 12+ (API level 31+)
- **Android 13+**: Creates notification channel before requesting permissions (required)
- **Web**: Notifications are disabled (not supported)

### Error Handling
- Graceful handling of permission denials
- Console logging for debugging
- Prevents scheduling notifications in the past

### Performance Considerations
- Efficient cancellation of old notifications
- Batched scheduling of multiple lessons
- Minimal impact on schedule fetch operations

## Usage

The notification system works automatically once implemented:

1. User logs in and navigates to schedule
2. App fetches weekly schedule data
3. Notifications are automatically scheduled for all future lessons
4. When lessons are edited/deleted, notifications are automatically updated
5. Users receive notifications 1 hour before each lesson

## Future Enhancements

Possible improvements:
- Customizable notification timing (allow users to choose reminder time)
- Different notification types for different lesson types
- Rich notifications with lesson details
- Integration with calendar apps
- Snooze functionality for notifications
