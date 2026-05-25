# Design Spec: Teacher's Classes and Student Roster

**Date:** 2026-05-25  
**Status:** Draft  
**Topic:** Teacher-specific Class Management  

## 1. Overview
The Teacher Classes module provides faculty with a dedicated space to manage their assigned course classes. This includes viewing a list of classes for a specific semester and accessing a detailed roster of students enrolled in each class.

## 2. Goals
- Provide teachers with a clear overview of their teaching load.
- Enable easy access to student lists for grading or attendance tracking.
- Facilitate offline management via Excel exports of student rosters.

## 3. Architecture

### 3.1 Data Flow
- **Authentication**: Uses `getServerSession` to identify the logged-in teacher's `employee.id`.
- **Semester Context**: Leverages the global `SemesterSelector` to filter classes.
- **Server Actions (`src/actions/course.ts`)**:
    - `getTeacherClasses(semesterId)`: Fetches `courseClass` records where `teacherId` matches the session user, joined with `subject` and `schedule`.
    - `getClassStudents(classId)`: Fetches `enrollment` records for a class, joined with `student` and `profile`.

### 3.2 Key Components
- **TeacherClassTable**: A DataTable displaying the teacher's classes.
- **StudentRosterTable**: A DataTable displaying students in a specific class.
- **ExcelExportButton**: A component that triggers the generation and download of an Excel student list.

## 4. UI Design

### 4.1 Classes List Page (`/teacher/classes`)
- **Header**: Title "My Classes" and Semester Selector.
- **Table Columns**:
    - **Class Code**: Navigates to `/teacher/classes/[id]`.
    - **Subject**: Course name.
    - **Capacity**: Formatted as `currentSlot / cap`.
    - **Schedule**: Summary of time and room (e.g., "Mon (1-3) - Room A101").
    - **Status**: Opened/Closed.

### 4.2 Class Detail Page (`/teacher/classes/[id]`)
- **Header**: Breadcrumbs and class identity (Subject Name - Code).
- **Roster Section**:
    - **Search**: Filter students by name or MSSV.
    - **Export**: "Export to Excel" button.
    - **Table Columns**:
        - **MSSV**: Student ID.
        - **Full Name**: Student name.
        - **Gender**: Displayed as localized text.
        - **Enrollment Date**: Formatted date.

## 5. Implementation Strategy
1.  Extend `src/actions/course.ts` with teacher-specific fetching logic.
2.  Implement the `/teacher/classes` page with the class list table.
3.  Create the dynamic route `/teacher/classes/[id]` for the roster view.
4.  Integrate the Excel export service for the roster.
5.  Ensure RBAC checks so teachers only see their own classes.

## 6. Testing Plan
- **Security**: Verify that a teacher cannot access the roster of a class they are not teaching.
- **UI**: Ensure the semester filter correctly updates the class list without a full page reload (if using transitions).
- **Data**: Confirm that the student roster accurately reflects current enrollments.
