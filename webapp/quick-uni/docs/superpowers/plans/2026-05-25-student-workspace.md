# Student Workspace (Classes & Timetable) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a dedicated workspace for Students to view their enrolled classes via a Card Grid and access their personal timetable.

**Architecture:** Student-specific routes under `/student/classes` and `/student/schedule`. Server actions with session-based filtering to ensure students only see their own data. Reusable `TimeGrid` for personal schedule.

**Tech Stack:** Next.js (App Router), Drizzle ORM, Next-Auth, Shadcn UI (Card, Dialog, Tabs).

---

### Task 1: Implement Student Server Actions

**Files:**
- Modify: `src/actions/course.ts`

- [ ] **Step 1: Implement `getStudentEnrollments`**

```typescript
export async function getStudentEnrollments(semesterId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Get the student ID for the logged-in user
  const stu = await db.query.student.findFirst({
    where: eq(student.accountId, session.user.id)
  });
  if (!stu) return [];

  return await db.query.enrollment.findMany({
    where: and(
      eq(enrollment.studentId, stu.id),
      isNull(enrollment.deletedAt)
    ),
    with: {
      courseClass: {
        where: eq(courseClass.semesterId, semesterId),
        with: {
          subject: true,
          employee: {
            with: {
              profile: true
            }
          }
        }
      }
    }
  });
}
```

- [ ] **Step 2: Implement `getStudentClassDetails`**
Fetch class materials and grades for the student.

- [ ] **Step 3: Commit**
```bash
git add src/actions/course.ts
git commit -m "feat(student): add server actions for enrollments and class details"
```

### Task 2: Create ClassCard & Grid Components

**Files:**
- Create: `src/app/[locale]/student/classes/ClassCard.tsx`
- Create: `src/app/[locale]/student/classes/ClassCardGrid.tsx`

- [ ] **Step 1: Implement `ClassCard`**
A visual card showing Subject Name, Code, Teacher, and a "View Details" button.

- [ ] **Step 2: Implement `ClassCardGrid`**
A responsive grid container for `ClassCard` items.

- [ ] **Step 3: Commit**
```bash
git add src/app/[locale]/student/classes/ClassCard*.tsx
git commit -m "feat(student): add class card and grid components"
```

### Task 3: Implement My Classes Page

**Files:**
- Create: `src/app/[locale]/student/classes/page.tsx`

- [ ] **Step 1: Implement the main page**
Fetches enrollment data using `getStudentEnrollments` and renders `ClassCardGrid`. Integrates the global `SemesterSelector`.

- [ ] **Step 2: Commit**
```bash
git add src/app/[locale]/student/classes/page.tsx
git commit -m "feat(student): add my classes page with card grid"
```

### Task 4: Implement Class Detail Dialog

**Files:**
- Create: `src/app/[locale]/student/classes/ClassDetailDialog.tsx`
- Modify: `src/app/[locale]/student/classes/ClassCard.tsx`

- [ ] **Step 1: Implement `ClassDetailDialog`**
A modal showing Teacher Info, Schedule, Materials, and Grades.

- [ ] **Step 2: Integrate into ClassCard**
Trigger the dialog when "View Details" is clicked.

- [ ] **Step 3: Commit**
```bash
git add src/app/[locale]/student/classes/ClassDetailDialog.tsx src/app/[locale]/student/classes/ClassCard.tsx
git commit -m "feat(student): add class detail dialog"
```

### Task 5: Implement Student Timetable Page

**Files:**
- Create: `src/app/[locale]/student/schedule/page.tsx`

- [ ] **Step 1: Implement the Timetable page**
Uses the existing `getScheduleByRole('student', userId, semesterId)` action and renders the refactored `TimeGrid` in `view` mode.

- [ ] **Step 2: Commit**
```bash
git add src/app/[locale]/student/schedule/page.tsx
git commit -m "feat(student): add detailed timetable page"
```

### Task 6: Finalize Translations

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/vi.json`

- [ ] **Step 1: Add student-specific labels**
"MyClasses", "ViewDetails", "NoEnrollments", "ClassMaterials", "MyGrades", etc.

- [ ] **Step 2: Commit**
```bash
git add messages/*.json
git commit -m "i18n: add student workspace translations"
```
