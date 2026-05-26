# Teacher's Classes & Student Roster Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a dedicated workspace for Teachers to view their assigned classes and student rosters with Excel export support.

**Architecture:** Teacher-specific routes under `/teacher/classes`. Server actions with session-based filtering to ensure teachers only see their own classes. Reusable DataTable for rosters.

**Tech Stack:** Next.js (App Router), Drizzle ORM, Next-Auth, Shadcn UI, ExcelJS (via existing service).

---

### Task 1: Extend Server Actions for Teacher Data

**Files:**
- Modify: `src/actions/course.ts`

- [ ] **Step 1: Implement `getTeacherClasses`**

```typescript
export async function getTeacherClasses(semesterId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Get the employee ID for the logged-in user
  const emp = await db.query.employee.findFirst({
    where: eq(employee.accountId, session.user.id)
  });
  if (!emp) return [];

  return await db.query.courseClass.findMany({
    where: and(
      eq(courseClass.teacherId, emp.id),
      eq(courseClass.semesterId, semesterId),
      isNull(courseClass.deletedAt)
    ),
    with: {
      subject: true,
      // Include schedule information if needed for summary
    }
  });
}
```

- [ ] **Step 2: Implement `getClassStudents`**

```typescript
export async function getClassStudents(classId: string) {
  return await db.query.enrollment.findMany({
    where: and(
      eq(enrollment.courseClassId, classId),
      isNull(enrollment.deletedAt)
    ),
    with: {
      student: {
        with: {
          profile: true
        }
      }
    },
    orderBy: (e) => [asc(e.createAt)]
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/actions/course.ts
git commit -m "feat(teacher): add server actions for classes and rosters"
```

### Task 2: Implement Teacher Classes List Page

**Files:**
- Create: `src/app/[locale]/teacher/classes/page.tsx`
- Create: `src/app/[locale]/teacher/classes/teacher-class-columns.tsx`
- Create: `src/app/[locale]/teacher/classes/TeacherClassClient.tsx`

- [ ] **Step 1: Define Columns for Teacher Classes**
Include: Code (as link), Subject Name, Capacity (current/max), Status.

- [ ] **Step 2: Implement TeacherClassClient**
Uses `DataTable` and handles semester context.

- [ ] **Step 3: Create the Main Page**
Fetches data using `getTeacherClasses` and renders the client component.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/teacher/classes
git commit -m "feat(teacher): add classes list page"
```

### Task 3: Implement Student Roster Detail Page

**Files:**
- Create: `src/app/[locale]/teacher/classes/[id]/page.tsx`
- Create: `src/app/[locale]/teacher/classes/[id]/roster-columns.tsx`
- Create: `src/app/[locale]/teacher/classes/[id]/RosterClient.tsx`

- [ ] **Step 1: Define Columns for Student Roster**
Include: MSSV, Full Name, Gender, Enrollment Date.

- [ ] **Step 2: Implement RosterClient**
Displays the `DataTable` of students and includes the "Export to Excel" button.

- [ ] **Step 3: Create the Dynamic Page**
Fetches student list and class details, ensuring the teacher is authorized to view this class.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/teacher/classes/[id]
git commit -m "feat(teacher): add student roster detail page"
```

### Task 4: Integrate Excel Export for Rosters

**Files:**
- Modify: `src/app/[locale]/teacher/classes/[id]/RosterClient.tsx`
- Create: `src/actions/export.ts` (if needed for cleaner separation)

- [ ] **Step 1: Create client-side export handler**
Use the existing `excel.ts` service or create a specialized action to generate the buffer.

- [ ] **Step 2: Add Export Button to Roster UI**
Trigger the download with a descriptive filename (e.g., `Roster_[ClassCode].xlsx`).

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/teacher/classes/[id]/RosterClient.tsx
git commit -m "feat(teacher): add excel export for student rosters"
```

---
**Plan Self-Review:**
- Spec coverage: Classes list, dynamic roster page, and Excel export are all covered.
- Placeholder scan: No TBDs. Key code structures are defined.
- Type consistency: Uses existing DB types for classes and enrollments.
- DRY: Reuses `DataTable` and translation patterns.
