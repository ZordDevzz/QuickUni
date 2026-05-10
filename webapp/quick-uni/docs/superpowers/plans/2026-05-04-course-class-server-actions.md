# Course Class Server Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement CRUD functionality for Course Classes, allowing the Training Department to manage class instances, assign teachers, and link them to subjects and semesters.

**Architecture:** Next.js Server Actions using Drizzle ORM for database operations and Zod for input validation.

**Tech Stack:** Next.js, Drizzle ORM, Zod, Vitest.

---

### Task 1: Implement Course Class Server Actions

**Files:**
- Modify: `src/actions/course.ts`

- [ ] **Step 1: Implement Server Actions and Dependencies**

```typescript
"use server";

import { db } from "@/db";
import { courseClass, courseClassType } from "@/db/schemas/course";
import { employee } from "@/db/schemas/user";
import { subject, semester } from "@/db/schemas/academic";
import { eq, and, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { 
  CourseClassInsertInput, 
  CourseClassUpdateInput,
  courseClassInsertSchema,
  courseClassUpdateSchema
} from "@/lib/validators/course";
import { randomUUID } from "crypto";

export type ActionResponse = {
  success: boolean;
  error?: string;
};

// --- Dependencies ---

export async function getCourseClassFormDependencies() {
  const [teachers, subjects, semesters, types] = await Promise.all([
    db.query.employee.findMany({ with: { profile: true } }),
    db.query.subject.findMany({ where: isNull(subject.deletedAt), orderBy: (s, { asc }) => [asc(s.code)] }),
    db.query.semester.findMany({ orderBy: (s, { desc }) => [desc(s.startDate)] }),
    db.query.courseClassType.findMany(),
  ]);

  return { teachers, subjects, semesters, types };
}

// --- Course Classes ---

export async function getCourseClassesWithRelations() {
  return await db.query.courseClass.findMany({
    where: isNull(courseClass.deletedAt),
    orderBy: (cc, { asc }) => [asc(cc.code)],
    with: {
      subject: true,
      semester: true,
      employee: {
        with: {
          profile: true
        }
      }
    }
  });
}

export async function createCourseClassAction(data: CourseClassInsertInput): Promise<ActionResponse> {
  try {
    const validatedData = courseClassInsertSchema.parse(data);
    await db.insert(courseClass).values({
      ...validatedData,
      id: randomUUID()
    });
    revalidatePath("/admin/courses/classes");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create course class:", error);
    return { success: false, error: error?.message || "Failed to create course class" };
  }
}

export async function updateCourseClassAction(id: string, data: CourseClassUpdateInput): Promise<ActionResponse> {
  try {
    const validatedData = courseClassUpdateSchema.parse(data);
    await db.update(courseClass)
      .set({ ...validatedData, updateAt: new Date().toISOString() })
      .where(eq(courseClass.id, id));
    revalidatePath("/admin/courses/classes");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update course class:", error);
    return { success: false, error: error?.message || "Failed to update course class" };
  }
}

export async function deleteCourseClassAction(id: string): Promise<ActionResponse> {
  try {
    await db.update(courseClass)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(courseClass.id, id));
    revalidatePath("/admin/courses/classes");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete course class:", error);
    return { success: false, error: error?.message || "Failed to delete course class." };
  }
}
```

- [ ] **Step 2: Commit changes**

```bash
git add src/actions/course.ts
git commit -m "feat: add Server Actions for course classes"
```

---

### Task 2: Verify Server Actions with Tests

**Files:**
- Create: `src/actions/course.test.ts`

- [ ] **Step 1: Write verification tests**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getCourseClassFormDependencies, 
  getCourseClassesWithRelations,
  createCourseClassAction,
  updateCourseClassAction,
  deleteCourseClassAction
} from './course';
import { db } from '@/db';
import { revalidatePath } from 'next/cache';

vi.mock('@/db', () => ({
  db: {
    query: {
      employee: { findMany: vi.fn() },
      subject: { findMany: vi.fn() },
      semester: { findMany: vi.fn() },
      courseClassType: { findMany: vi.fn() },
      courseClass: { findMany: vi.fn() },
    },
    insert: vi.fn(() => ({
      values: vi.fn().mockResolvedValue({}),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn().mockResolvedValue({}),
      })),
    })),
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('course actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getCourseClassFormDependencies should fetch all dependencies', async () => {
    await getCourseClassFormDependencies();
    expect(db.query.employee.findMany).toHaveBeenCalled();
    expect(db.query.subject.findMany).toHaveBeenCalled();
    expect(db.query.semester.findMany).toHaveBeenCalled();
    expect(db.query.courseClassType.findMany).toHaveBeenCalled();
  });

  it('getCourseClassesWithRelations should fetch course classes with relations', async () => {
    await getCourseClassesWithRelations();
    expect(db.query.courseClass.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        with: expect.objectContaining({
          subject: true,
          semester: true,
          employee: expect.any(Object),
        }),
      })
    );
  });

  it('createCourseClassAction should insert new course class', async () => {
    const data = {
      code: 'CS101-L01',
      teacherId: '00000000-0000-0000-0000-000000000001',
      subjectId: '00000000-0000-0000-0000-000000000002',
      cap: 30,
      type: 1,
      semesterId: 1,
      status: 'opened'
    };
    const response = await createCourseClassAction(data);
    expect(db.insert).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/admin/courses/classes');
    expect(response.success).toBe(true);
  });

  it('updateCourseClassAction should update existing course class', async () => {
    const id = '00000000-0000-0000-0000-000000000003';
    const data = { cap: 35 };
    const response = await updateCourseClassAction(id, data);
    expect(db.update).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/admin/courses/classes');
    expect(response.success).toBe(true);
  });

  it('deleteCourseClassAction should soft-delete course class', async () => {
    const id = '00000000-0000-0000-0000-000000000003';
    const response = await deleteCourseClassAction(id);
    expect(db.update).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/admin/courses/classes');
    expect(response.success).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run src/actions/course.test.ts`
Expected: PASS

- [ ] **Step 3: Commit tests**

```bash
git add src/actions/course.test.ts
git commit -m "test: add tests for course class server actions"
```
