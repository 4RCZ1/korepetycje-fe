<!-- Copilot / AI agent instructions for contributors -->
# Repo-specific guidance for AI coding agents

Purpose
- Quickly understand how this Expo + React Native (web-enabled) app is structured and how to make safe, consistent changes.

Big picture
- Framework: Expo app using `expo-router` file-based routing. Routes live in the `app/` directory.
- Data layer: low-level HTTP helper is `services/api.ts` (`apiRequest`, `setAuthToken`, `ApiClientError`). Higher-level endpoints live in `services/*.ts`.
- State & side-effects: most data flows are encapsulated in `hooks/*` (e.g. `useAuth.ts`, `useResourceApi.ts`, `useScheduleApi.ts`, `useStudentGroups.ts`, `useNotifications.ts`).
- UI: reusable UI lives under `components/` (theme-aware components prefixed `Themed*`, feature folders like `ResourceGroups`, `StudentGroups`, `Schedule`, `Students`, `Resources`, and shared UI in `ui/` and `Navigation/`).
- Notifications: lesson reminder system using Expo Notifications (`services/notificationService.ts`, `hooks/useNotifications.ts`). See `docs/notifications.md` for details.

Core entities (domain model)
- **Student** (`StudentType` in `services/studentApi.ts`): has id, name, surname, address. Can be assigned resources and scheduled for lessons.
- **StudentGroup** (`StudentGroupType` in `types/studentGroup.ts`): named collection of students. Simplifies bulk operations and resource assignments.
- **Resource** (`ResourceType` in `types/resource.ts`): uploaded file with id, name, uploadDate, fileSize, fileType. Can be grouped and assigned to students.
- **ResourceGroup** (`ResourceGroupType` in `types/resource.ts`): named collection of resources. Simplifies bulk assignments.
- **Lesson** (`LessonEntry` in `services/scheduleApi.ts`): scheduled event with startTime, endTime, address, description, lessonType, and attendances (student confirmations).
- **Schedule** (`Schedule`): map of date strings (YYYY-MM-DD) to arrays of `LessonEntry` for that day.
- **Assignment** (`types/assignment.ts`): links students to resources (direct, via resource group, or via student group). Supports reverse lookups (resource → students).
- **Address** (`AddressType` in `services/addressApi.ts`): location entity with id, name, and data fields. Uses DTO converter pattern (`AddressDTO` → `AddressType`).

Mocks & testing
- Some endpoints have mock implementations under `services/mock/` (e.g. `resourceGroupApi.ts`, `studentGroupApi.ts`, `studentApi.ts`, `resourceApi.ts`) for local development when backend is unavailable.
- Mocks simulate network delay and maintain in-memory state. Use them as reference when implementing new endpoints.
- Enable mock mode via environment variable: `EXPO_PUBLIC_USE_MOCK_API=true`.

How to run (use exact scripts)
- Install: `npm install`
- Start dev server: `npm start` (runs `expo start`). For web-only: `npm run web`.
- Android/iOS builds: `npm run android` / `npm run ios` (requires native toolchains).
- Lint: `npm run lint`.

Important project conventions (do not invent new ones)
- Routing: modify files inside `app/` to add pages/screens. Keep nested routes under folders like `(tabs)`, `(auth)`. Main tabs: `schedule.tsx`, `student.tsx`, `resources.tsx`, `groups.tsx`.
- Theming: use `useThemeColor` and the `Themed*` components for colors and text instead of raw color strings. See `docs/color-system.md` for theme details.
- API: use `services/api.ts` and `apiRequest` for all HTTP calls so error handling and token injection remain centralized. Add new endpoints under `services/` and expose them via a named export (see `resourceApi` pattern).
- Auth: `useAuth.ts` exposes a singleton `authManager` and a `useAuth()` hook. When logging in, set the token via `setAuthToken(token)` (auth manager does this).
- Storage: helpers in `utils/storage.ts` (AsyncStorage wrappers). Use storage keys consistent with existing code (`auth_token`, `auth_user`).
- Alerts: use platform-agnostic alert helper from `utils/alert.ts` instead of raw `Alert.alert` for cross-platform compatibility.
- Dates: use formatting utilities from `utils/dates.ts` for consistent date handling.

API & network details to be aware of
- Base URL comes from `process.env.EXPO_PUBLIC_BACKEND_BASE_URL` (see `services/api.ts`).
- `apiRequest` expects backend responses with a `{ success: boolean, data: ... }` shape and will throw `ApiClientError` on errors. Follow that shape when mocking or interpreting responses.
- Common error cases are mapped (`TIMEOUT`, `NETWORK_ERROR`, `UNKNOWN_ERROR`) — do not bypass `apiRequest` unless you intentionally need raw fetch semantics.

Resource upload example (common pattern)
- Get presigned URL: `resourceApi.beginUpload(filename)`
- Upload file with `resourceApi.uploadFileToS3(presignedUrl, fileUri, mimeType)`
- Refresh resources via `useResourceApi().refetch()` — see `hooks/useResourceApi.ts` for a reference implementation.

Where to look for examples
- Auth flow: `hooks/useAuth.ts`, `services/authApi.ts`
- API helper & errors: `services/api.ts`
- File uploads: `services/resourceApi.ts`, `hooks/useResourceApi.ts`
- Student groups: `services/studentGroupApi.ts`, `hooks/useStudentGroups.ts`, `components/StudentGroups/`
- Resource groups: `services/resourceGroupApi.ts`, `hooks/useResourceGroups.ts`, `components/ResourceGroups/`
- Notifications: `services/notificationService.ts`, `hooks/useNotifications.ts`, `docs/notifications.md`
- Address handling: `services/addressApi.ts` (demonstrates DTO converter pattern)
- Themed UI & color utilities: `components/ThemedText.tsx`, `components/ThemedView.tsx`, `components/ui/ThemedButton.tsx`, `hooks/useThemeColor.ts`, `constants/Colors.ts`, `utils/colors.ts`
- Routes & UI structure: `app/` directory (file-based routing). Example pages: `app/(tabs)/schedule.tsx`, `app/(tabs)/groups.tsx`, `app/(auth)/login.tsx`.
- Modal patterns: `components/ResourceGroups/ResourceGroupModal.tsx`, `components/StudentGroups/StudentGroupModal.tsx`, `components/Schedule/AddLessonModal.tsx`

Editing guidelines for agents
- Keep changes small and focused: update only files relevant to the feature or bug.
- Maintain TypeScript types — use types from `types/` when available (e.g. `types/resource.ts`, `types/studentGroup.ts`, `types/assignment.ts`).
- Prefer adding new endpoints under `services/` and then wrapping them with a hook under `hooks/` when stateful behavior is needed.
- When changing auth behavior, update `useAuth.ts` and ensure `setAuthToken` is called appropriately.
- For new features with UI, create a component folder under `components/` (e.g. `components/FeatureName/`) following the pattern of `StudentGroups/` or `ResourceGroups/`.
- When adding notification features, integrate with `NotificationService` and update lesson scheduling logic accordingly.

Testing & verification
- Manual: `npm start` then open the web target with `npm run web` for fast verification.
- Mobile testing requires Expo dev client or Expo Go plus Android/iOS toolchains.

When unsure
- Search for similar patterns under `services/` and `hooks/` before introducing new conventions.
- Ask the repository owner which environment variables to use; `EXPO_PUBLIC_BACKEND_BASE_URL` is required for API calls.

Available utilities
- `utils/storage.ts`: AsyncStorage wrappers for persistent data
- `utils/alert.ts`: Cross-platform alert dialogs
- `utils/dates.ts`: Date formatting and manipulation
- `utils/colors.ts`: Color manipulation utilities
- `utils/fileHelpers.ts`: File handling utilities for uploads
- `utils/notificationTestUtils.ts`: Testing utilities for notification features

If you edit this file
- Keep it short and concrete. Add references to new helper files you create.

---
Please review and tell me which parts need more detail or any missing examples you want included.
