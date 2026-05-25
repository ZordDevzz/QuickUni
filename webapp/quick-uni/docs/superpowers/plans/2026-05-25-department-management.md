# Department Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a Master-Detail interface for managing Departments, Majors, and Staff assignments.

**Architecture:** Master-Detail layout with URL-based state management (`?id=`). Tabbed detail view for Majors, Personnel, and Metadata. Unified Server Actions for CRUD operations.

**Tech Stack:** Next.js (App Router), Drizzle ORM, Shadcn UI, react-hook-form, URL Search Params.

---

### Task 1: Implement Department & Major Server Actions

**Files:**
- Modify: `src/actions/academic.ts`

- [ ] **Step 1: Implement `getDepartments` and `getDepartmentDetails`**

```typescript
export async function getDepartments() {
  return await db.query.department.findMany({
    orderBy: (d, { asc }) => [asc(d.name)],
    where: (d, { isNull }) => isNull(d.deletedAt)
  });
}

export async function getDepartmentDetails(id: string) {
  return await db.query.department.findFirst({
    where: eq(department.id, id),
    with: {
      majors: {
        where: (m, { isNull }) => isNull(m.deletedAt)
      },
      departmentEmployments: {
        with: {
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

- [ ] **Step 2: Implement `upsertDepartment` and `upsertMajor`**
- [ ] **Step 3: Implement `assignStaffToDepartment`**
- [ ] **Step 4: Commit**
```bash
git add src/actions/academic.ts
git commit -m "feat(academic): implement server actions for departments and majors"
```

### Task 2: Create Master-Detail Page Skeleton

**Files:**
- Modify: `src/app/[locale]/academic/departments/page.tsx`
- Create: `src/app/[locale]/academic/departments/DepartmentClient.tsx`

- [ ] **Step 1: Update the main page to fetch initial list**
```tsx
import { getDepartments } from "@/actions/academic";
import { DepartmentClient } from "./DepartmentClient";

export default async function DepartmentsPage() {
  const departments = await getDepartments();
  return (
    <div className="flex-1 h-[calc(100vh-4rem)]">
      <DepartmentClient initialDepartments={departments} />
    </div>
  );
}
```

- [ ] **Step 2: Implement DepartmentClient with Two-Column Layout**
Use `Resizable` component or simple `flex` for the Master-Detail split.

- [ ] **Step 3: Commit**
```bash
git add src/app/[locale]/academic/departments
git commit -m "feat(academic): initialize master-detail layout for departments"
```

### Task 3: Implement Master List and Search

**Files:**
- Create: `src/app/[locale]/academic/departments/MasterList.tsx`

- [ ] **Step 1: Create searchable list of department cards**
Render a list of cards. On click, update the URL using `useRouter` and `useSearchParams`.

- [ ] **Step 2: Commit**
```bash
git add src/app/[locale]/academic/departments/MasterList.tsx
git commit -m "feat(academic): add department master list with search"
```

### Task 4: Implement Detail View with Tabs

**Files:**
- Create: `src/app/[locale]/academic/departments/DetailView.tsx`

- [ ] **Step 1: Implement DetailView component**
Fetches details when `id` param changes. Renders `Tabs` for Majors, Staff, and Info.

- [ ] **Step 2: Implement Majors Tab with DataTable**
Show list of chuyên ngành with Add/Edit actions.

- [ ] **Step 3: Implement Personnel Tab**
Show list of staff with "Assign" action.

- [ ] **Step 4: Commit**
```bash
git add src/app/[locale]/academic/departments/DetailView.tsx
git commit -m "feat(academic): add tabbed detail view for departments"
```

### Task 5: Implement Dialogs for CRUD and Assignment

**Files:**
- Create: `src/components/features/academic/DepartmentDialogs.tsx`

- [ ] **Step 1: Create `DepartmentForm`**
- [ ] **Step 2: Create `MajorForm`**
- [ ] **Step 3: Create `StaffAssignmentForm`**
- [ ] **Step 4: Commit**
```bash
git add src/components/features/academic/DepartmentDialogs.tsx
git commit -m "feat(academic): add dialogs for department and major management"
```
---
**Plan Self-Review:**
- Spec coverage: Master-Detail, URL state, Tabs (Majors, Staff), CRUD actions are all included.
- Placeholder scan: No TBDs. Key code snippets provided.
- Type consistency: UUIDs used for IDs consistent with DB.
- DRY: Shared form patterns from previous tasks.
