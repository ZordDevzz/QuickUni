# Role-Based Architecture & Feature Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the application into isolated spaces for Admin, Academic Office, Teachers, and Students, migrating existing features and establishing a multi-actor scheduling view.

**Architecture:** Isolated Layouts for each role (`/admin`, `/academic`, `/teacher`, `/student`) with dedicated sidebars. Shared `TimeGrid` component refactored for "Pure UI" reuse across roles.

**Tech Stack:** Next.js (App Router), Shadcn UI, Lucide Icons, Next-Auth, Drizzle ORM.

---

### Task 1: Create Basic Route Structure and Layouts

**Files:**
- Create: `src/components/shared/AcademicSidebar.tsx`
- Create: `src/components/shared/TeacherSidebar.tsx`
- Create: `src/components/shared/StudentSidebar.tsx`
- Create: `src/app/[locale]/academic/layout.tsx`
- Create: `src/app/[locale]/teacher/layout.tsx`
- Create: `src/app/[locale]/student/layout.tsx`

- [ ] **Step 1: Create AcademicSidebar (Based on AdminSidebar but with Academic focus)**
Create `src/components/shared/AcademicSidebar.tsx` with menu items: Dashboard, Semesters, Facilities, Departments, Courses, Schedule, People.

- [ ] **Step 2: Create TeacherSidebar**
Create `src/components/shared/TeacherSidebar.tsx` with menu items: Dashboard, My Schedule, My Classes.

- [ ] **Step 3: Create StudentSidebar**
Create `src/components/shared/StudentSidebar.tsx` with menu items: Dashboard, My Schedule, My Classes, Requests.

- [ ] **Step 4: Create Layouts for Academic, Teacher, and Student**
Create `layout.tsx` in each respective folder, utilizing the new sidebar components and a shared `Shell` component (or duplicating the responsive logic from `AdminLayoutContent.tsx`).

- [ ] **Step 5: Commit**
```bash
git add src/components/shared/*Sidebar.tsx src/app/[locale]/*/layout.tsx
git commit -m "feat(layout): initialize role-specific routes and sidebars"
```

### Task 2: Migrate Academic Features from /admin to /academic

**Files:**
- Move: `src/app/[locale]/admin/academic/*` -> `src/app/[locale]/academic/*`
- Move: `src/app/[locale]/admin/courses/*` -> `src/app/[locale]/academic/courses/*`
- Move: `src/app/[locale]/admin/schedule/*` -> `src/app/[locale]/academic/schedule/*`
- Modify: `src/components/shared/AdminSidebar.tsx` (Remove academic items)

- [ ] **Step 1: Move files and update imports**
Use `mv` to relocate directories. Update relative imports in all moved files.

- [ ] **Step 2: Update AdminSidebar**
Remove "Semesters", "Departments", "Buildings", "Rooms", "CourseClasses", and "Schedule" from `navItems` in `src/components/shared/AdminSidebar.tsx`.

- [ ] **Step 3: Commit**
```bash
git add src/app/[locale]
git commit -m "refactor(routes): migrate academic features to dedicated /academic route"
```

### Task 3: Refactor TimeGrid for Multi-Actor Reuse

**Files:**
- Modify: `src/components/features/academic/TimeGrid.tsx`
- Create: `src/components/features/academic/ScheduleViewWrapper.tsx`

- [ ] **Step 1: Make TimeGrid a "Pure UI" Component**
Refactor `TimeGrid.tsx` to receive `events` and `mode` (edit/view) as props instead of fetching data internally.

- [ ] **Step 2: Create ScheduleViewWrapper**
Implement a wrapper that handles data fetching based on `role` and `userId`, then renders `TimeGrid`.

- [ ] **Step 3: Update existing Academic Schedule page**
Update `src/app/[locale]/academic/schedule/page.tsx` to use the new wrapper with `mode="edit"`.

- [ ] **Step 4: Commit**
```bash
git add src/components/features/academic/TimeGrid.tsx src/components/features/academic/ScheduleViewWrapper.tsx
git commit -m "refactor(schedule): make TimeGrid reusable for multiple roles"
```

### Task 5: Finalize Dashboard Summaries and RBAC

**Files:**
- Create: `src/app/[locale]/teacher/page.tsx`
- Create: `src/app/[locale]/student/page.tsx`
- Modify: `middleware.ts` (or relevant auth logic)

- [ ] **Step 1: Implement Teacher Dashboard**
Create a dashboard with a "Today's Schedule" summary using a compact version of `TimeGrid` or a simple list component.

- [ ] **Step 2: Implement Student Dashboard**
Similar to Teacher dashboard, showing the student's own schedule summary.

- [ ] **Step 3: Update RBAC Logic**
Ensure that the `isCurrentAccountType('student')` helper exists and is used in the middleware/layouts to protect the new routes.

- [ ] **Step 4: Commit**
```bash
git add src/app/[locale]/teacher/page.tsx src/app/[locale]/student/page.tsx
git commit -m "feat(dashboard): add teacher and student dashboard summaries"
```
