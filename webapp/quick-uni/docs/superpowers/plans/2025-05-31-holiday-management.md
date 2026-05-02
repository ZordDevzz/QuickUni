# Holiday Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a holiday management system with date range support and semester-specific scoping, ensuring no classes are published on these dates.

**Architecture:** Update database schema for range support, add CRUD server actions, implement a management dialog in the admin UI, and refactor the publishing logic to respect holiday ranges.

**Tech Stack:** Next.js (App Router), Drizzle ORM, shadcn/ui, vitest, next-intl.

---

### Task 1: Update Database Schema

**Files:**
- Modify: `src/db/schemas/schedule.ts`

- [ ] **Step 1: Update `holidayBlacklist` table definition**
Update the table to include `startDate`, `endDate`, and `semesterId` (with FK).
```typescript
export const holidayBlacklist = scheduleSchema.table("holiday_blacklist", {
  id: bigserial({ mode: "number" }).primaryKey(),
  name: varchar({ length: 255 }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isGlobal: boolean("is_global").default(true),
  semesterId: integer("semester_id"),
}, (table) => [
  foreignKey({
    columns: [table.semesterId],
    foreignColumns: [semester.id],
    name: "fk_holiday_blacklist_semester_id",
  }),
]);
```

- [ ] **Step 2: Generate and push migration**
Run: `npx drizzle-kit generate && npx drizzle-kit push`
*(Note: Since psql is not available, we rely on drizzle-kit to handle the local dev DB)*

### Task 2: Implement Holiday Server Actions (TDD)

**Files:**
- Modify: `src/actions/scheduling-data.ts`
- Create: `src/actions/holiday.test.ts`

- [ ] **Step 1: Write failing tests for holiday CRUD**
Create `src/actions/holiday.test.ts` with tests for `getHolidays`, `addHoliday`, and `deleteHoliday`.
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getHolidays, addHoliday, deleteHoliday } from './scheduling-data';
import { db } from '../db';

vi.mock('../db', () => ({
  db: {
    query: {
      holidayBlacklist: {
        findMany: vi.fn(),
      },
    },
    insert: vi.fn(() => ({
      values: vi.fn().mockResolvedValue([{ id: 1 }]),
    })),
    delete: vi.fn(() => ({
      where: vi.fn().mockResolvedValue({ success: true }),
    })),
  },
}));

describe('Holiday Actions', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should fetch holidays filtered by semester', async () => {
    await getHolidays(1);
    expect(db.query.holidayBlacklist.findMany).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify failure**
Run: `npx vitest src/actions/holiday.test.ts`
Expected: FAIL (functions not defined)

- [ ] **Step 3: Implement actions in `src/actions/scheduling-data.ts`**
Add `getHolidays`, `addHoliday`, `deleteHoliday`.
```typescript
export async function getHolidays(semesterId?: number) {
  return await db.query.holidayBlacklist.findMany({
    where: (h, { or, eq, isNull }) => semesterId 
      ? or(eq(h.isGlobal, true), eq(h.semesterId, semesterId))
      : eq(h.isGlobal, true),
    orderBy: (h, { asc }) => [asc(h.startDate)]
  });
}

export async function addHoliday(params: { 
  name?: string, 
  startDate: string, 
  endDate: string, 
  isGlobal: boolean, 
  semesterId?: number 
}) {
  try {
    await db.insert(holidayBlacklist).values(params);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to add holiday" };
  }
}

export async function deleteHoliday(id: number) {
  try {
    await db.delete(holidayBlacklist).where(eq(holidayBlacklist.id, id));
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete holiday" };
  }
}
```

- [ ] **Step 4: Run tests to verify success**
Run: `npx vitest src/actions/holiday.test.ts`
Expected: PASS

### Task 3: Update Publishing Logic (TDD)

**Files:**
- Modify: `src/actions/schedule-publish.ts`
- Modify: `src/actions/schedule-publish.test.ts`

- [ ] **Step 1: Write failing test for holiday range skipping**
Update `src/actions/schedule-publish.test.ts` to include a test case for date ranges.
```typescript
  it('should skip dates within a holiday range', async () => {
    const semester = {
      id: 1,
      startDate: '2024-01-01',
      endDate: '2024-01-05',
    };
    const holidays = [{
      startDate: '2024-01-02',
      endDate: '2024-01-03',
      isGlobal: true
    }];
    // Mock setup...
    // Verify that Jan 2 and Jan 3 are skipped.
  });
```

- [ ] **Step 2: Run tests to verify failure**
Run: `npx vitest src/actions/schedule-publish.test.ts`
Expected: FAIL (logic uses old `date` column and single date check)

- [ ] **Step 3: Implement range skipping logic in `src/actions/schedule-publish.ts`**
Update `publishTemplateToSchedule` to use `startDate` and `endDate`.
```typescript
    const holidays = await db.query.holidayBlacklist.findMany({
      where: (h, { or, eq }) => or(eq(h.isGlobal, true), eq(h.semesterId, semesterId))
    });

    // ... in loop ...
    const isHoliday = holidays.some(h => {
      const start = h.startDate;
      const end = h.endDate;
      return dateStr >= start && dateStr <= end;
    });
    if (!isHoliday) {
       // ...
    }
```

- [ ] **Step 4: Run tests to verify success**
Run: `npx vitest src/actions/schedule-publish.test.ts`
Expected: PASS

### Task 4: Create HolidayDialog Component

**Files:**
- Create: `src/components/features/academic/HolidayDialog.tsx`

- [ ] **Step 1: Implement UI with list and form**
Use `Dialog`, `Table`, `Input`, `Select`, `Button`.
Fetch holidays on mount (or pass as prop).
Include fields: Name, Start Date, End Date, Scope (Global/Semester).

### Task 5: Integrate with ScheduleManager

**Files:**
- Modify: `src/components/features/academic/ScheduleManager.tsx`

- [ ] **Step 1: Add "Holidays" button and state**
Add button next to Semester selector.
Render `HolidayDialog`.

### Task 6: Internationalization

**Files:**
- Modify: `messages/vi.json`
- Modify: `messages/en.json`

- [ ] **Step 1: Add holiday-related keys**
`Holidays`, `AddHoliday`, `HolidayName`, `StartDate`, `EndDate`, `Scope`, `Global`, `ThisSemester`, etc.
