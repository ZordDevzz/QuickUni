# People Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a unified People management module for Teachers and Students with merged profile creation and dynamic field support.

**Architecture:** Shared UI components for `employee` and `student` entities. Unified Server Actions with database transactions to link `profile` and role-specific records. Configuration-based default schemas for dynamic fields.

**Tech Stack:** Next.js (App Router), Drizzle ORM, Zod, Shadcn UI, react-hook-form.

---

### Task 1: Setup Default Schema Configuration

**Files:**
- Modify: `src/actions/admin.ts` (or create a settings action)

- [ ] **Step 1: Implement action to get/set default schemas**
Add helpers to manage `DEFAULT_EMPLOYEE_SCHEMA_ID` and `DEFAULT_STUDENT_SCHEMA_ID` in `system_setting`.

```typescript
import { db } from "@/db";
import { systemSetting } from "@/db/schemas/system";
import { eq } from "drizzle-orm";

export async function getDefaultSchemaId(type: 'employee' | 'student') {
  const key = type === 'employee' ? 'DEFAULT_EMPLOYEE_SCHEMA_ID' : 'DEFAULT_STUDENT_SCHEMA_ID';
  const setting = await db.query.systemSetting.findFirst({ where: eq(systemSetting.key, key) });
  return setting?.value as number | null;
}
```

- [ ] **Step 2: Commit**
```bash
git add src/actions/admin.ts
git commit -m "feat(system): add helpers for default schema settings"
```

### Task 2: Implement Unified People Server Actions

**Files:**
- Create: `src/actions/people.ts`

- [ ] **Step 1: Implement `createPerson` with transaction logic**

```typescript
"use server";

import { db } from "@/db";
import { profile, employee, student } from "@/db/schemas/user";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

export async function createPerson(type: 'employee' | 'student', data: any) {
  return await db.transaction(async (tx) => {
    const profileId = randomUUID();
    
    // 1. Create Profile
    await tx.insert(profile).values({
      id: profileId,
      fullname: data.fullname,
      gender: data.gender,
      dob: data.dob,
      nationalId: data.nationalId,
      schemaId: data.schemaId,
      dynamicData: data.dynamicData || {},
    });

    // 2. Create Entity
    if (type === 'employee') {
      await tx.insert(employee).values({
        id: randomUUID(),
        code: data.code,
        profileId: profileId,
      });
    } else {
      await tx.insert(student).values({
        id: randomUUID(),
        code: data.code,
        profileId: profileId,
      });
    }

    revalidatePath(`/[locale]/academic/people/${type}s`, "page");
    return { success: true };
  });
}
```

- [ ] **Step 2: Implement `getPeople` with JOINs**
- [ ] **Step 3: Commit**
```bash
git add src/actions/people.ts
git commit -m "feat(people): implement unified server actions for person creation"
```

### Task 3: Create Shared PersonForm Component

**Files:**
- Create: `src/components/features/academic/people/PersonForm.tsx`

- [ ] **Step 1: Implement form with fixed and dynamic fields**
Fetch the schema fields and render them alongside the core identity fields.

- [ ] **Step 2: Commit**
```bash
git add src/components/features/academic/people/PersonForm.tsx
git commit -m "feat(people): add shared PersonForm with dynamic fields"
```

### Task 4: Implement Teacher Management Page

**Files:**
- Create: `src/app/[locale]/academic/people/teachers/page.tsx`
- Create: `src/app/[locale]/academic/people/teachers/teacher-client.tsx`
- Create: `src/app/[locale]/academic/people/teachers/columns.tsx`

- [ ] **Step 1: Define Columns**
- [ ] **Step 2: Implement TeacherClient with Dialog**
- [ ] **Step 3: Create the Main Page**
- [ ] **Step 4: Commit**
```bash
git add src/app/[locale]/academic/people/teachers
git commit -m "feat(people): add teacher management page"
```

### Task 5: Implement Student Management Page

**Files:**
- Create: `src/app/[locale]/academic/people/students/page.tsx`
- ... (similar structure to Teachers)

- [ ] **Step 1: Clone and adapt teacher management files for students**
- [ ] **Step 2: Commit**
```bash
git add src/app/[locale]/academic/people/students
git commit -m "feat(people): add student management page"
```
