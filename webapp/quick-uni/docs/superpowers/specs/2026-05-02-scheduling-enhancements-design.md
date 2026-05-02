# Design Spec: Scheduling System Enhancements

**Date:** 2026-05-02
**Status:** Draft
**Topic:** Semester Selection, Constraint Management, and Visual Polish

## 1. Overview
This specification outlines enhancements to the QuickUni scheduling system to support multi-semester management, user-controlled availability constraints (blacklists), holiday management, and improved visual clarity via subject-based color coding.

## 2. Semester State Management

### 2.1 Global Context
- **SemesterProvider:** A new React Context provider wrapped around the `AdminLayout`.
- **Global Selector:** A dropdown in the `AdminHeader` allowing users to select the "Active Working Semester".
- **Defaulting:** On initial load, it fetches and defaults to the semester marked `is_current: true`.
- **Persistence:** The selection will be stored in local storage to persist across sessions.

### 2.2 Local Override (ScheduleManager)
- **Component-Level State:** `ScheduleManager` will initialize its `semesterId` state from the Global Context.
- **Local Selector:** A dropdown inside the `ScheduleManager` header.
- **Independence:** Changing the local selector updates only the `ScheduleManager` view and actions (Auto-Generate, Publish). This allows admins to prepare next semester's schedule without affecting the global context used by other administrative pages.

## 3. Constraint Management UI

### 3.1 "Edit Availability" Mode
- **Toggle Action:** A "Lock" or "Calendar" icon button in the `ScheduleManager` toolbar to enter/exit "Edit Availability" mode.
- **Behavior Change:** 
    - While active, clicking an empty cell in the `TimeGrid` toggles a bit in the `availability` table for the currently selected Entity (Room or Teacher).
    - It uses the existing `occupiedMask` (integer bitmask) to store these blocks.
- **Visual Feedback:** 
    - Blocked slots will be rendered with a distinct background pattern (e.g., diagonal stripes or dark-gray tint).
    - These slots will be treated as collisions by both the `Backtracking Solver` and the `Validation Service`.

### 3.2 Holiday Management
- **Holiday Dialog:** Accessible via a "Holidays" button in the `ScheduleManager` header.
- **CRUD Operations:** Simple list-based UI to add/remove dates from the `holiday_blacklist` table.
- **Impact:** The `publishTemplateToSchedule` action will skip class generation for any dates present in this table.

## 4. Visual Polish: Subject-Based Color Coding

### 4.1 Hashing Utility
- A `stringToColor` utility function in `src/lib/utils.ts`.
- **Input:** `subjectId` (UUID) or `subjectCode`.
- **Algorithm:** Consistent hash (e.g., DJB2) to generate a numeric hue (0-360).

### 4.2 HSL Palette
- **Saturation:** Fixed at 70% for vibrancy.
- **Lightness:** Fixed at 85-90% to ensure high contrast with black text.
- **CSS Variable:** The color will be passed as a style property to the assignment blocks in `TimeGrid.tsx`.

## 5. Data Flow & Components

### 5.1 New/Updated Actions
- `getSemesters()`: Fetch all available semesters.
- `toggleAvailability(entityId, entityType, day, slotMask)`: Action to toggle specific bits in the `availability` table (using bitwise XOR with the requested mask).
- `getHolidays()` / `saveHoliday()`: Actions for the holiday management dialog.

### 5.2 Updated Components
- `AdminHeader.tsx`: Add Global Semester Selector.
- `ScheduleManager.tsx`: Add local semester state, local selector, and "Edit Availability" toggle.
- `TimeGrid.tsx`: Implement pattern rendering for blocked slots and HSL coloring for assignments.
- `ScheduleSlotDialog.tsx`: Ensure it remains disabled/hidden during "Edit Availability" mode.

## 6. Testing Strategy
- **Unit Tests:** Verify `stringToColor` produces stable outputs.
- **Integration Tests:** 
    - Verify "Auto-Generate" respects manual blocks added via "Edit Availability" mode.
    - Verify "Publish" skips classes on holiday dates.
- **UI Tests:** Verify semester switching correctly refreshes the grid data.
