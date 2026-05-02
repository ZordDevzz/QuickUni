# Scheduling System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement an automated and manual scheduling system using 15-bit masks and a backtracking algorithm for a "sample week" that populates the actual schedule.

**Architecture:** 
- **Time Representation:** 15-bit integers (bits 0-14 for periods 1-15).
- **Core Algorithm:** Backtracking with MRV (Minimum Remaining Values) heuristic for weekly template generation.
- **Workflow:** Define availability -> Generate weekly template -> Publish to schedule table.

**Tech Stack:** Next.js (Node.js), Drizzle ORM, TypeScript, Vitest.

---

### Task 1: Database Schema Updates

**Files:**
- Modify: `src/db/schemas/schedule.ts`

- [ ] **Step 1: Add new tables and enums to schedule schema**

```typescript
// src/db/schemas/schedule.ts additions

export const availabilityEntityType = pgSchema("schedule").enum("availability_entity_type", [
  "teacher",
  "room",
  "subject",
  "global",
]);

export const availability = scheduleSchema.table("availability", {
  id: uuid().primaryKey().defaultRandom(),
  entityId: uuid("entity_id").notNull(),
  entityType: availabilityEntityType("entity_type").notNull(),
  dayOfWeek: smallint("day_of_week").notNull(), // 0-6
  occupiedMask: integer("occupied_mask").default(0).notNull(),
});

export const weeklyTemplate = scheduleSchema.table("weekly_template", {
  id: uuid().primaryKey().defaultRandom(),
  courseClassId: uuid("course_class_id").notNull(),
  roomId: smallint("room_id").notNull(),
  dayOfWeek: smallint("day_of_week").notNull(),
  startPeriod: smallint("start_period").notNull(),
  endPeriod: smallint("end_period").notNull(),
  occupyMask: integer("occupy_mask").notNull(),
});

export const holidayBlacklist = scheduleSchema.table("holiday_blacklist", {
  id: serial().primaryKey(),
  date: date("date").notNull(),
  name: varchar({ length: 255 }),
  isGlobal: boolean("is_global").default(true),
});
```

- [ ] **Step 2: Commit schema changes**

```bash
git add src/db/schemas/schedule.ts
git commit -m "db: add availability, weekly_template, and holiday_blacklist tables"
```

---

### Task 2: Bitmask Utility Functions

**Files:**
- Create: `src/lib/scheduling/bitmask.ts`
- Test: `src/lib/scheduling/bitmask.test.ts`

- [ ] **Step 1: Implement bitmask helper functions**

```typescript
// src/lib/scheduling/bitmask.ts
export const createMask = (start: number, end: number): number => {
  let mask = 0;
  for (let i = start - 1; i <= end - 1; i++) {
    mask |= (1 << i);
  }
  return mask;
};

export const hasCollision = (maskA: number, maskB: number): boolean => {
  return (maskA & maskB) !== 0;
};

export const getAvailableSlots = (occupiedMask: number): number => {
  return (~occupiedMask) & 0x7FFF; // 15 bits of 1s
};
```

- [ ] **Step 2: Write tests for bitmask utilities**

```typescript
// src/lib/scheduling/bitmask.test.ts
import { describe, it, expect } from 'vitest';
import { createMask, hasCollision } from './bitmask';

describe('Bitmask Utils', () => {
  it('should create correct mask for range', () => {
    expect(createMask(1, 3)).toBe(7); // 1 | 2 | 4
    expect(createMask(2, 2)).toBe(2);
  });

  it('should detect collisions', () => {
    expect(hasCollision(createMask(1, 3), createMask(3, 5))).toBe(true);
    expect(hasCollision(createMask(1, 2), createMask(3, 4))).toBe(false);
  });
});
```

- [ ] **Step 3: Run tests and commit**

Run: `npx vitest run src/lib/scheduling/bitmask.test.ts`
Expected: PASS

```bash
git add src/lib/scheduling/bitmask.ts src/lib/scheduling/bitmask.test.ts
git commit -m "feat: add bitmask utility functions for scheduling"
```

---

### Task 3: Slot Search Algorithm (Sliding Window)

**Files:**
- Create: `src/lib/scheduling/slot-finder.ts`
- Test: `src/lib/scheduling/slot-finder.test.ts`

- [ ] **Step 1: Implement search for empty time slots**

```typescript
// src/lib/scheduling/slot-finder.ts
import { hasCollision, createMask } from './bitmask';

export function findEmptySlots(occupiedMask: number, duration: number): number[] {
  const possibleStarts: number[] = [];
  for (let start = 1; start <= 16 - duration; start++) {
    const candidateMask = createMask(start, start + duration - 1);
    if (!hasCollision(occupiedMask, candidateMask)) {
      possibleStarts.push(start);
    }
  }
  return possibleStarts;
}
```

- [ ] **Step 2: Write tests for slot finder**

```typescript
// src/lib/scheduling/slot-finder.test.ts
import { describe, it, expect } from 'vitest';
import { findEmptySlots } from './slot-finder';
import { createMask } from './bitmask';

describe('Slot Finder', () => {
  it('should find all available slots for duration', () => {
    const occupied = createMask(1, 5) | createMask(10, 15);
    const slots = findEmptySlots(occupied, 3);
    expect(slots).toEqual([6, 7]); // Period 6-8 and 7-9 are free
  });
});
```

- [ ] **Step 3: Run tests and commit**

Run: `npx vitest run src/lib/scheduling/slot-finder.test.ts`
Expected: PASS

```bash
git add src/lib/scheduling/slot-finder.ts src/lib/scheduling/slot-finder.test.ts
git commit -m "feat: add slot-finder algorithm using sliding window on bitmasks"
```

---

### Task 4: Weekly Template Backtracking Algorithm

**Files:**
- Create: `src/services/scheduler.ts`
- Test: `src/services/scheduler.test.ts`

- [ ] **Step 1: Implement core backtracking logic for sample week**

```typescript
// src/services/scheduler.ts (Condensed version for plan)
export interface ScheduleRequest {
  classes: { id: string; teacherId: string; periods: number }[];
  rooms: { id: number; capacity: number }[];
  availability: Map<string, number[]>; // entityId -> 7-day masks
}

export function solveWeekly(request: ScheduleRequest) {
  // 1. Sort classes by MRV (e.g., classes with fewest potential room/time slots)
  // 2. Recursive backtrack function:
  //    - Base case: all classes assigned
  //    - Try assigning class to each (day, startPeriod, room) combination
  //    - Check constraints using Bitmasks
  //    - If valid, recurse
  //    - If fail, backtrack
}
```

- [ ] **Step 2: Write integration test for scheduler**

```typescript
// src/services/scheduler.test.ts
import { describe, it, expect } from 'vitest';
import { solveWeekly } from './scheduler';

describe('Scheduler Service', () => {
  it('should generate a conflict-free weekly template', () => {
    // Mock classes, rooms, and availability
    // Verify results have no overlapping masks for same teacher or room
  });
});
```

- [ ] **Step 3: Run tests and commit**

Run: `npx vitest run src/services/scheduler.test.ts`
Expected: PASS

```bash
git add src/services/scheduler.ts src/services/scheduler.test.ts
git commit -m "feat: implement backtracking scheduler for weekly template"
```

---

### Task 5: Publish Template to Schedule

**Files:**
- Create: `src/actions/schedule-publish.ts`

- [ ] **Step 1: Implement publishing logic**

```typescript
// src/actions/schedule-publish.ts
// 1. Get Semester start/end dates
// 2. For each date in semester:
//    - If day not in holiday_blacklist:
//      - Get dayOfWeek
//      - Find entries in weekly_template for that dayOfWeek
//      - Insert into schedule table with sch_date
```

- [ ] **Step 2: Commit publish action**

```bash
git add src/actions/schedule-publish.ts
git commit -m "feat: add publish action to populate semester schedule from template"
```

---

### Task 6: Manual Override and Validation

**Files:**
- Create: `src/services/schedule-validation.ts`

- [ ] **Step 1: Add collision detection for manual edits**

```typescript
// src/services/schedule-validation.ts
// Function to check if a specific manual change conflicts with existing schedule
// uses the same Bitmask logic.
```

- [ ] **Step 2: Commit validation service**

```bash
git add src/services/schedule-validation.ts
git commit -m "feat: add validation service for manual schedule overrides"
```
