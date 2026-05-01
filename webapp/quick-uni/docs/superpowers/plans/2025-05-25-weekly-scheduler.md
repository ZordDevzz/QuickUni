# Weekly Template Backtracking Algorithm Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a backtracking algorithm to generate a conflict-free weekly schedule template.

**Architecture:** Recursive backtracking with a duration-based heuristic (longest classes first). Tracks teacher and room occupancy using bitmasks.

**Tech Stack:** TypeScript, Vitest.

---

### Task 1: Core Types and Stub

**Files:**
- Create: `src/services/scheduler.ts`
- Create: `src/services/scheduler.test.ts`

- [ ] **Step 1: Write a failing test for the existence of solveWeekly**

```typescript
// src/services/scheduler.test.ts
import { describe, it, expect } from 'vitest';
import { solveWeekly } from './scheduler';

describe('Scheduler Service', () => {
  it('should be defined', () => {
    expect(solveWeekly).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/services/scheduler.test.ts`
Expected: FAIL (module not found or export missing)

- [ ] **Step 3: Define types and stub in scheduler.ts**

```typescript
// src/services/scheduler.ts
import { hasCollision, createMask } from '../lib/scheduling/bitmask';
import { findEmptySlots } from '../lib/scheduling/slot-finder';

export interface ClassRequest {
  id: string;
  teacherId: string;
  periods: number;
}

export interface RoomRequest {
  id: number;
}

export interface ScheduleRequest {
  classes: ClassRequest[];
  rooms: RoomRequest[];
  availability: Map<string, number[]>; // entityId -> 7-day masks
}

export interface Assignment {
  courseClassId: string;
  roomId: number;
  dayOfWeek: number;
  startPeriod: number;
  endPeriod: number;
  occupyMask: number;
}

export function solveWeekly(request: ScheduleRequest): Assignment[] | null {
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/services/scheduler.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/scheduler.ts src/services/scheduler.test.ts
git commit -m "feat: add scheduler types and stub"
```

---

### Task 2: Implement Initial Setup and Pre-processing

**Files:**
- Modify: `src/services/scheduler.ts`

- [ ] **Step 1: Implement sorting and occupancy initialization**

```typescript
// src/services/scheduler.ts
// ... (imports and types)

export function solveWeekly(request: ScheduleRequest): Assignment[] | null {
  const classes = [...request.classes].sort((a, b) => b.periods - a.periods);
  
  const teacherOccupancy = new Map<string, number[]>();
  const roomOccupancy = new Map<number, number[]>();

  // Initialize teacher occupancy from availability or with zeros
  const allTeacherIds = new Set(classes.map(c => c.teacherId));
  for (const tId of allTeacherIds) {
    teacherOccupancy.set(tId, request.availability.get(tId) || new Array(7).fill(0));
  }

  // Initialize room occupancy from availability or with zeros
  for (const room of request.rooms) {
    roomOccupancy.set(room.id, request.availability.get(room.id.toString()) || new Array(7).fill(0));
  }

  const assignments: Assignment[] = [];

  function backtrack(classIndex: number): boolean {
    // To be implemented in next task
    return classIndex === classes.length;
  }

  if (backtrack(0)) return assignments;
  return null;
}
```

- [ ] **Step 2: Verify with a test for empty classes**

```typescript
// src/services/scheduler.test.ts
// ...
  it('should return empty assignments for empty classes', () => {
    const request: any = {
      classes: [],
      rooms: [],
      availability: new Map(),
    };
    expect(solveWeekly(request)).toEqual([]);
  });
// ...
```

- [ ] **Step 3: Commit**

```bash
git commit -am "feat: implement scheduler pre-processing"
```

---

### Task 3: Implement Backtracking Logic

**Files:**
- Modify: `src/services/scheduler.ts`
- Modify: `src/services/scheduler.test.ts`

- [ ] **Step 1: Implement the full backtracking function**

```typescript
// src/services/scheduler.ts
// ...
  function backtrack(classIndex: number): boolean {
    if (classIndex === classes.length) return true;

    const currentClass = classes[classIndex];
    const tOccupancy = teacherOccupancy.get(currentClass.teacherId)!;

    for (let day = 0; day < 7; day++) {
      for (const room of request.rooms) {
        const rOccupancy = roomOccupancy.get(room.id)!;
        const combinedMask = tOccupancy[day] | rOccupancy[day];
        
        const possibleStarts = findEmptySlots(combinedMask, currentClass.periods);
        
        for (const start of possibleStarts) {
          const occupyMask = createMask(start, start + currentClass.periods - 1);
          
          // Apply
          tOccupancy[day] |= occupyMask;
          rOccupancy[day] |= occupyMask;
          assignments.push({
            courseClassId: currentClass.id,
            roomId: room.id,
            dayOfWeek: day,
            startPeriod: start,
            endPeriod: start + currentClass.periods - 1,
            occupyMask,
          });

          if (backtrack(classIndex + 1)) return true;

          // Backtrack
          tOccupancy[day] &= ~occupyMask;
          rOccupancy[day] &= ~occupyMask;
          assignments.pop();
        }
      }
    }

    return false;
  }
// ...
```

- [ ] **Step 2: Write integration test for successful scheduling**

```typescript
// src/services/scheduler.test.ts
// ...
  it('should generate a conflict-free weekly template', () => {
    const request = {
      classes: [
        { id: 'A', teacherId: 'T1', periods: 4 },
        { id: 'B', teacherId: 'T1', periods: 2 },
        { id: 'C', teacherId: 'T2', periods: 3 },
      ],
      rooms: [{ id: 101 }, { id: 102 }],
      availability: new Map(),
    };
    
    const result = solveWeekly(request);
    expect(result).not.toBeNull();
    expect(result?.length).toBe(3);
    
    // Verify T1 has no overlaps
    const t1Assignments = result!.filter(a => request.classes.find(c => c.id === a.courseClassId)?.teacherId === 'T1');
    for (let i = 0; i < t1Assignments.length; i++) {
        for (let j = i + 1; j < t1Assignments.length; j++) {
            if (t1Assignments[i].dayOfWeek === t1Assignments[j].dayOfWeek) {
                expect(t1Assignments[i].occupyMask & t1Assignments[j].occupyMask).toBe(0);
            }
        }
    }
  });
// ...
```

- [ ] **Step 3: Run tests**

Run: `npx vitest run src/services/scheduler.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git commit -am "feat: implement full backtracking logic"
```

---

### Task 4: Advanced Scenarios and Edge Cases

**Files:**
- Modify: `src/services/scheduler.test.ts`

- [ ] **Step 1: Test room constraints**

```typescript
// src/services/scheduler.test.ts
// ...
  it('should respect room capacity (no overlapping in same room)', () => {
    const request = {
      classes: [
        { id: 'A', teacherId: 'T1', periods: 8 },
        { id: 'B', teacherId: 'T2', periods: 8 },
      ],
      rooms: [{ id: 101 }], // Only one room
      availability: new Map(),
    };
    
    const result = solveWeekly(request);
    expect(result).not.toBeNull();
    // They must be on different days or different times (but 8+8=16 > 15, so different days)
    expect(result![0].dayOfWeek).not.toBe(result![1].dayOfWeek);
  });
// ...
```

- [ ] **Step 2: Test no solution**

```typescript
// src/services/scheduler.test.ts
// ...
  it('should return null when no solution exists', () => {
    const request = {
      classes: [
        { id: 'A', teacherId: 'T1', periods: 10 },
        { id: 'B', teacherId: 'T1', periods: 10 },
      ],
      rooms: [{ id: 101 }],
      availability: new Map([
          ['T1', [0x7FFF, 0x7FFF, 0x7FFF, 0x7FFF, 0x7FFF, 0x7FFF, 0x7FFF]] // T1 busy all week
      ]),
    };
    
    const result = solveWeekly(request);
    expect(result).toBeNull();
  });
// ...
```

- [ ] **Step 3: Run all tests**

Run: `npx vitest run src/services/scheduler.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git commit -am "test: add edge cases for scheduler"
```
