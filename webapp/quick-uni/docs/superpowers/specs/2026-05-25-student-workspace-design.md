# Design Spec: Student Workspace (Classes & Timetable)

**Date:** 2026-05-25  
**Status:** Draft  
**Topic:** Student-specific Learning Management  

## 1. Overview
The Student Workspace provides students with a user-friendly interface to track their academic progress. It focuses on class visibility through an intuitive Card Grid and personal schedule management.

## 2. Goals
- Offer a visually engaging way to view enrolled classes.
- Provide easy access to class details, including materials and grades.
- Ensure students have a clear, real-time view of their personal timetable.

## 3. Architecture

### 3.1 Data Flow
- **Authentication**: Uses `getServerSession` to identify the logged-in student's `student.id`.
- **Semester Context**: Uses the global `SemesterSelector` to filter enrollments.
- **Server Actions (`src/actions/course.ts`)**:
    - `getStudentEnrollments(semesterId)`: Fetches `enrollment` records joined with `courseClass`, `subject`, and the teacher's `profile`.
    - `getStudentClassDetails(classId)`: Fetches specific details for an enrolled class, including materials and personal grades.

### 3.2 Key Components
- **ClassCardGrid**: A grid layout for displaying `ClassCard` components.
- **ClassCard**: A visually rich card showing class basics (Subject, Teacher, Summary Schedule).
- **ClassDetailDialog**: A modal displaying detailed class info when a card is clicked.
- **StudentTimeGrid**: A wrapper around the shared `TimeGrid` component in `view` mode.

## 4. UI Design

### 4.1 My Classes (`/student/classes`)
- **Header**: "My Classes" title and Semester Selector.
- **Main View**: Responsive grid of cards.
- **Card Content**:
    - Subject Name (Large font).
    - Class Code & Teacher Name.
    - Next Session (e.g., "Today at 08:00").
    - "View Details" button.

### 4.2 Timetable (`/student/schedule`)
- **Header**: "My Schedule" title.
- **Main View**: Full-page `TimeGrid` component.
- **Functionality**: Read-only access to the student's own schedule assignments.

## 5. Implementation Strategy
1.  Implement `getStudentEnrollments` and `getStudentClassDetails` in server actions.
2.  Create the `ClassCard` and `ClassCardGrid` components.
3.  Implement the `/student/classes` page.
4.  Implement the `/student/schedule` page using the refactored `TimeGrid`.
5.  Add localization for student-specific terms.

## 6. Testing Plan
- **Security**: Ensure students can only see their own enrollments.
- **UI**: Verify the card grid handles various screen sizes.
- **Integration**: Confirm that `TimeGrid` correctly filters for the logged-in student.
