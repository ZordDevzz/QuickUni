# Design Spec: Semester Management Module

**Date:** 2026-05-25  
**Status:** Draft  
**Topic:** Semester Management (CRUD)  

## 1. Overview
The Semester Management module allows administrators to manage academic semesters in the QuickUni system. This includes creating, updating, deleting, and setting the "Current Semester" which affects system-wide defaults.

## 2. Goals
- Provide a clean, intuitive UI for managing semesters.
- Ensure only one semester is marked as "Current" at any given time.
- Enforce data integrity (e.g., start date before end date, no duplicate codes).

## 3. Architecture

### 3.1 Data Model (Existing)
Table: `academic.semester`
- `id`: `smallserial` (Primary Key)
- `code`: `varchar(30)` (Unique)
- `name`: `varchar(255)`
- `academicYear`: `smallint`
- `startDate`: `date`
- `endDate`: `date`
- `isCurrent`: `boolean`

### 3.2 Server Actions (`src/actions/academic.ts`)
- `getSemesters()`: Fetch all semesters ordered by `startDate` desc.
- `createSemester(data)`: Create a new semester. If `isCurrent` is true, unset others.
- `updateSemester(id, data)`: Update an existing semester. If `isCurrent` is true, unset others.
- `deleteSemester(id)`: Delete a semester (prevent if it's the current one).
- `toggleCurrentSemester(id)`: A specialized action to set a semester as current and unset others.

### 3.3 Validation (`src/lib/validators/academic.ts`)
Using Zod:
- `code`: Required, string, max 30.
- `name`: Required, string, max 255.
- `academicYear`: Required, number (year).
- `startDate`: Required, date.
- `endDate`: Required, date, must be after `startDate`.
- `isCurrent`: Boolean.

## 4. UI Design (Method 1: Centralized Data Table)

### 4.1 Main Page (`admin/academic/semesters/page.tsx`)
- Server component to fetch the list of semesters.
- Renders `SemesterClient` component.

### 4.2 Client Component (`SemesterClient.tsx`)
- Uses `DataTable` from Shadcn UI.
- "Add Semester" button opens a Dialog.
- Search/Filter by name or code.

### 4.3 Table Columns (`semester-columns.tsx`)
- **Code**: Display code.
- **Name**: Display name.
- **Year**: Display academic year.
- **Dates**: Display formatted start and end dates.
- **Is Current**: A `Switch` component. Toggling triggers `toggleCurrentSemester`.
- **Actions**: Dropdown menu with "Edit" and "Delete" options.

### 4.4 Dialog Form
- Shared form for Create and Edit.
- Real-time validation using `react-hook-form` and `zodResolver`.
- Success/Error notifications using `sonner` or `custom-toast`.

## 5. Implementation Strategy
1.  Define Zod validators.
2.  Implement Server Actions with transaction support for `isCurrent`.
3.  Create the UI structure (Page, Client Component, Columns).
4.  Implement the Add/Edit Dialog.
5.  Verify the "Current Semester" logic.

## 6. Testing Plan
- **Unit Tests**: Validate Zod schema (valid/invalid dates).
- **Integration Tests**: Verify that setting one semester as `isCurrent` updates the database correctly (unsetting others).
- **UI Tests**: Ensure the Switch correctly reflects the database state and updates optimistically or with proper loading states.
