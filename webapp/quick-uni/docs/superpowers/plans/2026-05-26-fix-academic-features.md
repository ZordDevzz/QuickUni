# Fix Academic Feature Errors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve type errors and missing imports in academic feature components to ensure `tsc` passes.

**Architecture:** Update component props and handler types using Drizzle-inferred types and correct server action imports.

**Tech Stack:** Next.js, TypeScript, Drizzle ORM, Lucide React, Shadcn UI.

---

### Task 1: Fix `RoomRowActions.tsx` types

**Files:**
- Modify: `src/components/features/academic/RoomRowActions.tsx`

- [ ] **Step 1: Update imports and props type**

```tsx
import { room as roomSchema, building as buildingSchema } from "@/db/schemas/schedule";

export function RoomRowActions({ 
  room, 
  buildings 
}: { 
  room: typeof roomSchema.$inferSelect, 
  buildings: (typeof buildingSchema.$inferSelect)[] 
}) {
  // ...
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/academic/RoomRowActions.tsx
git commit -m "fix(academic): update RoomRowActions types"
```

### Task 2: Fix `ScheduleManager.tsx` imports and types

**Files:**
- Modify: `src/components/features/academic/ScheduleManager.tsx`

- [ ] **Step 1: Add missing imports**

Add `getWeeklyTemplateByEntity` and `getAvailability` to the existing imports from `@/actions/scheduling-data`.

- [ ] **Step 2: Fix `handleAssignmentClick` types**

Change `assignment: unknown` to `assignment: any`.

```tsx
  const handleAssignmentClick = (assignment: any) => {
    if (isEditAvailabilityMode) return;
    
    setDialogData({
      id: assignment.id,
      courseClassId: assignment.courseClassId,
      roomId: assignment.roomId,
      dayOfWeek: assignment.dayOfWeek,
      startPeriod: assignment.startPeriod,
      endPeriod: assignment.endPeriod,
    });
    setIsDialogOpen(true);
  };
```

- [ ] **Step 3: Commit**

```bash
git add src/components/features/academic/ScheduleManager.tsx
git commit -m "fix(academic): resolve imports and types in ScheduleManager"
```

### Task 3: Verify and Cleanup

- [ ] **Step 1: Run type check**

Run: `npx tsc --noEmit src/components/features/academic/RoomRowActions.tsx src/components/features/academic/ScheduleManager.tsx`
Expected: No errors.

- [ ] **Step 2: Final commit**

(Only if any further adjustments were needed)
