# Design Spec: Role-Based Architecture & Feature Migration

**Date:** 2026-05-25  
**Status:** Draft  
**Topic:** Role-Based Navigation & Access Structure  

## 1. Overview
This design outlines the restructuring of the QuickUni application to separate features into dedicated spaces for different actors: System Administrators, Academic Office, Teachers, and Students. This follows an "Isolated Layouts" approach for maximum flexibility and security.

## 2. Route Structure

### 2.1 System Admin (`/admin`)
Focuses on technical and system-wide management.
- `/admin/accounts`: User account management.
- `/admin/profiles`: Dynamic profile schema & structure management.
- `/admin/system/roles`: RBAC (Roles & Permissions).
- `/admin/system/logs`: Audit logs (Technical Sheet: "Xem nhật ký hệ thống").
- `/admin/onboarding`: Bulk account creation workflows.

### 2.2 Academic Office (`/academic`)
Focuses on academic operations and scheduling.
- `/academic/semesters`: Semester CRUD (Migrated from `/admin/academic`).
- `/academic/facilities`: Buildings, Rooms management (Migrated from `/admin/academic`).
- `/academic/departments`: Department management (Migrated from `/admin/academic`).
- `/academic/courses`: Course & Course Class management (Migrated from `/admin/courses`).
- `/academic/schedule`: Manual & Auto-scheduling (Migrated from `/admin/schedule`).
- `/academic/people`: Student & Teacher records management (Technical Sheet: "Quản lý Giảng viên", "Quản lý Sinh viên").

### 2.3 Teacher (`/teacher`)
Dedicated workspace for faculty.
- `/teacher/dashboard`: Schedule summary (Today/Tomorrow).
- `/teacher/schedule`: Detailed personal timetable (Read-only) + Change requests (Technical Sheet: "Đăng ký sửa đổi TKB").
- `/teacher/classes`: List of assigned classes and students (Technical Sheet: "Xem lớp và sinh viên").

### 2.4 Student (`/student`)
Dedicated workspace for students.
- `/student/dashboard`: Schedule summary.
- `/student/schedule`: Detailed personal timetable.
- `/student/classes`: Enrolled classes, attendance (Technical Sheet: "Xem thông tin lớp học phần").
- `/student/requests`: Absence requests, class cancellation requests (Technical Sheet: "Đăng ký Xin vắng", "Đăng ký Hủy lớp").

## 3. Architecture

### 3.1 Isolated Layouts
Each top-level route (`/admin`, `/academic`, `/teacher`, `/student`) will have its own:
- `layout.tsx`: Role-specific shell (Sidebar, Header).
- `SidebarComponent`: Menu items specific to the role's responsibilities.

### 3.2 Shared Timetable Component Strategy
The `TimeGrid` component will be refactored into a "Pure Component" to support multi-actor access.
- **Component:** `src/components/features/academic/TimeGrid.tsx`
- **Data Source:** Receives `events` as props from role-specific wrappers.
- **Modes:**
    - `edit`: (For Academic Office) Supports drag-and-drop, slot clicks, and manual overrides.
    - `view`: (For Teacher/Student) Read-only view of their personal schedule.
    - `summary`: (For Dashboards) Compact list or daily grid view.

### 3.3 RBAC Enforcement
- **Middleware:** Validate session and account type/role before allowing access to `/admin`, `/academic`, `/teacher`, or `/student`.
- **Server Actions:** Perform internal role checks using existing services (`isAdmin`, etc.) to prevent unauthorized mutations.

## 4. Migration Plan
1.  Create the new directory structure.
2.  Implement the new layouts for `/academic`, `/teacher`, and `/student`.
3.  Move existing academic features from `/admin` to `/academic`.
4.  Refactor `TimeGrid.tsx` for reusability.
5.  Implement Dashboard summaries for Teachers and Students.
6.  Update `AdminSidebar` to reflect the removal of academic features.

## 5. Success Criteria
- Academic Office users can manage the university without system admin tools cluttering the UI.
- Teachers and Students have a focused interface for their respective tasks.
- No unauthorized access between roles (e.g., Student cannot access `/academic`).
- Timetable data is consistent across all views.
