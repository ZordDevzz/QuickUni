# Academic & Scheduling Seeder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement modular seeders for academic data (semesters, subjects) and scheduling data (course classes, weekly templates).

**Architecture:** Create two new seeder files in `src/db/seeders/` that export async functions for seeding their respective domains. These will be used by a main seeder to populate the database.

**Tech Stack:** TypeScript, Drizzle ORM, @faker-js/faker, crypto.

---

### Task 1: Implement Academic Seeder

**Files:**
- Create: `src/db/seeders/academic.ts`

- [ ] **Step 1: Create `src/db/seeders/academic.ts` with `seedAcademic` function**

```typescript
import { db } from "../index";
import { semester, subject } from "../schema";
import { faker } from "@faker-js/faker";
import { randomUUID } from "crypto";

export const seedAcademic = async () => {
  console.log("📚 Seeding academic data...");
  const [currentSemester] = await db.insert(semester).values({
    name: "Học kỳ 1 năm học 2025-2026",
    code: "2025.1",
    academicYear: 2025,
    startDate: "2025-08-15",
    endDate: "2026-01-15",
    isCurrent: true,
  }).returning();

  const subjects = Array.from({ length: 10 }).map(() => ({
    id: randomUUID(),
    name: faker.company.catchPhrase(),
    code: faker.string.alphanumeric(6).toUpperCase(),
    credits: faker.number.int({ min: 2, max: 4 }),
    des: faker.lorem.sentence(),
  }));
  const insertedSubjects = await db.insert(subject).values(subjects).returning();

  console.log("✅ Academic data seeded.");
  return { semesterId: currentSemester.id, subjects: insertedSubjects };
};
```

- [ ] **Step 2: Commit Academic Seeder**

```bash
git add src/db/seeders/academic.ts
git commit -m "feat(seeder): add academic data seeder"
```

### Task 2: Implement Scheduling Seeder

**Files:**
- Create: `src/db/seeders/scheduling.ts`

- [ ] **Step 1: Create `src/db/seeders/scheduling.ts` with `seedScheduling` function**

```typescript
import { db } from "../index";
import { courseClass, courseClassType, weeklyTemplate } from "../schema";
import { faker } from "@faker-js/faker";
import { randomUUID } from "crypto";

export const seedScheduling = async (semesterId: number, subjects: any[], teachers: any[], rooms: any[]) => {
  console.log("🗓️ Seeding scheduling data...");
  
  // 1. Ensure course class types exist
  const classTypes = [
    { id: 1, code: "LEC", name: "Lecture", des: "Theoretical session" },
    { id: 2, code: "LAB", name: "Laboratory", des: "Practical session" },
  ];
  await db.insert(courseClassType).values(classTypes).onConflictDoNothing();

  // 2. Create Course Classes
  for (const s of subjects) {
    const classId = randomUUID();
    const teacher = faker.helpers.arrayElement(teachers);
    
    await db.insert(courseClass).values({
      id: classId,
      code: `${s.code}-L01`,
      subjectId: s.id,
      semesterId: semesterId,
      teacherId: teacher.id,
      type: 1, // Lecture
      cap: 40,
      status: "opened",
    });

    // 3. Create Weekly Template
    const startPeriod = faker.number.int({ min: 1, max: 5 });
    const duration = 3;
    await db.insert(weeklyTemplate).values({
      courseClassId: classId,
      roomId: faker.helpers.arrayElement(rooms).id,
      dayOfWeek: faker.number.int({ min: 1, max: 6 }),
      startPeriod: startPeriod,
      endPeriod: startPeriod + duration - 1,
      occupyMask: 0x07 << (startPeriod - 1), // Simple bitmask
    });
  }
  console.log("✅ Scheduling data seeded.");
};
```

- [ ] **Step 2: Commit Scheduling Seeder**

```bash
git add src/db/seeders/scheduling.ts
git commit -m "feat(seeder): add scheduling data seeder"
```

### Task 3: Verification (Optional but recommended)

Since I don't have a way to run the full seeder easily without potentially breaking things (I don't know the main entry point yet), I should check if there is a `system.ts` or `seed.ts` that I should update to include these.

- [ ] **Step 1: Read `src/db/seed.ts` to see if it needs update**
- [ ] **Step 2: Read `src/db/seeders/system.ts` to see if it needs update**

---
