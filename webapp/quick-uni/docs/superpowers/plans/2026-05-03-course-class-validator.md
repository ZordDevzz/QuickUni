# Course Class Validator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Zod validators for Course Class to ensure data integrity during CRUD operations.

**Architecture:** Use `drizzle-zod` to create base schemas from Drizzle ORM definitions and refine them with custom Zod validations.

**Tech Stack:** Zod, drizzle-zod, vitest.

---

### Task 1: Initialize Validator and Test

**Files:**
- Create: `src/lib/validators/course.ts`
- Create: `src/lib/validators/course.test.ts`

- [ ] **Step 1: Write failing tests for Course Class validation**

```typescript
import { describe, it, expect } from "vitest";
import { courseClassInsertSchema } from "./course";

describe("courseClassInsertSchema", () => {
  it("should validate a valid course class input", () => {
    const validData = {
      code: "CS101",
      teacherId: "550e8400-e29b-41d4-a716-446655440000",
      subjectId: "550e8400-e29b-41d4-a716-446655440001",
      cap: 30,
      type: 1,
      semesterId: 1,
      status: "opened",
    };
    const result = courseClassInsertSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should fail if code is missing", () => {
    const invalidData = {
      teacherId: "550e8400-e29b-41d4-a716-446655440000",
      subjectId: "550e8400-e29b-41d4-a716-446655440001",
      cap: 30,
      type: 1,
      semesterId: 1,
    };
    const result = courseClassInsertSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.find(i => i.path.includes("code"))?.message).toBe("Code is required");
    }
  });

  it("should fail if cap is less than 1", () => {
    const invalidData = {
      code: "CS101",
      teacherId: "550e8400-e29b-41d4-a716-446655440000",
      subjectId: "550e8400-e29b-41d4-a716-446655440001",
      cap: 0,
      type: 1,
      semesterId: 1,
    };
    const result = courseClassInsertSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.find(i => i.path.includes("cap"))?.message).toBe("Capacity must be greater than 0");
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/lib/validators/course.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement the validator**

```typescript
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { courseClass } from "@/db/schemas/course";

export const courseClassInsertSchema = createInsertSchema(courseClass, {
  code: z.string().min(1, "Code is required").max(30, "Code is too long"),
  teacherId: z.string().uuid("Teacher is required"),
  subjectId: z.string().uuid("Subject is required"),
  cap: z.coerce.number().min(1, "Capacity must be greater than 0"),
  type: z.coerce.number().min(1, "Type is required"),
  semesterId: z.coerce.number().min(1, "Semester is required"),
  status: z.string().default("opened"),
}).omit({ id: true, createAt: true, updateAt: true, deletedAt: true, currentSlot: true });

export const courseClassUpdateSchema = courseClassInsertSchema.partial();

export type CourseClassInsertInput = z.infer<typeof courseClassInsertSchema>;
export type CourseClassUpdateInput = z.infer<typeof courseClassUpdateSchema>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/lib/validators/course.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/validators/course.ts src/lib/validators/course.test.ts
git commit -m "feat: add Zod validators for course classes"
```
