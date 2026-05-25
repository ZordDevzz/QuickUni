# Design Spec: Unified Workflow & Request System

**Date:** 2026-05-25  
**Status:** Draft  
**Topic:** General Purpose Request & Approval Workflow  

## 1. Overview
The Unified Request System centralizes all administrative interactions between Students, Teachers, and the Academic Office. It replaces fragmented processes with a standardized "Request -> Review -> Outcome" workflow.

## 2. Goals
- Standardize the lifecycle of all system requests.
- Support diverse data payloads using JSONB for future-proofing.
- Enable role-based approval routing (Teacher-led vs. Office-led).
- Integrated real-time notifications for status changes.

## 3. Architecture

### 3.1 Data Model
New table in `communication` or `workflow` schema (using existing schema for simplicity):
**Table: `communication.request`**
- `id`: `uuid` (Primary Key)
- `senderId`: `uuid` (Link to `auth.account`)
- `type`: `enum_request_type` (`student_absence`, `class_cancellation`, `teacher_schedule_change`)
- `status`: `enum_workflow_status` (`pending`, `approved`, `rejected`, `cancelled`)
- `targetId`: `uuid` (Target reviewer ID, e.g., Teacher ID or NULL for Academic Office)
- `data`: `jsonb` (Flexible payload for specific request details)
- `comment`: `text` (Optional feedback from reviewer)
- `createAt`, `updateAt`, `processedAt`: Timestamps.

### 3.2 Approval Routing Logic
- **`student_absence`**: 
    - Sender: Student.
    - Target: Teacher of the specific course class.
    - Outcome: Record absence record in attendance logs if approved.
- **`class_cancellation`**: 
    - Sender: Student.
    - Target: NULL (Academic Office).
    - Outcome: Remove enrollment and trigger refund logic if applicable.
- **`teacher_schedule_change`**: 
    - Sender: Teacher.
    - Target: NULL (Academic Office).
    - Outcome: Update `weekly_template` and re-run conflict checks.

### 3.3 Server Actions (`src/actions/workflow.ts`)
- `submitRequest(type, data)`: Logic to determine target reviewer and store payload.
- `getRequestsForReviewer()`: Fetches pending requests for the current user (based on role).
- `processRequest(requestId, status, comment)`: Updates status and triggers post-approval side effects.

## 4. UI Design

### 4.1 Student Workspace (`/student/requests`)
- History list with color-coded status badges.
- New Request Wizard:
    1. Select Type.
    2. Fill specific fields (Class, Date, Reason).
    3. Submit.

### 4.2 Teacher Workspace (`/teacher/requests`)
- Review inbox for student absences.
- "Schedule Change" tool integrated into the personal timetable view.

### 4.3 Academic Workspace (`/academic/requests`)
- Management console with filtering by Type and Status.
- Detail view showing JSONB data formatted based on the request type.

## 5. Implementation Strategy
1.  Define new Enums and migrate database to add `request` table.
2.  Implement standardized server actions in `src/actions/workflow.ts`.
3.  Build the Student Request UI (List + Form).
4.  Build the Approval interfaces for Teachers and PĐT.
5.  Integrate with the `notification` service.

## 6. Testing Plan
- **Workflow**: Ensure state transitions (`pending` -> `approved`) are restricted to authorized roles.
- **Data Integrity**: Verify JSONB payloads are correctly parsed and displayed in the review UI.
- **Side Effects**: Confirm that approving a schedule change actually updates the timetable.
