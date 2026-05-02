# Scheduling System Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement multi-semester support, interactive constraint management (availability/holidays), and subject-based color coding in the scheduling system.

**Architecture:** Dual-layer semester management (Global Context + Local Override), integrated "Edit Availability" mode in the TimeGrid, and stable HSL color generation from subject IDs.

**Tech Stack:** React Context, Next.js Server Actions, Drizzle ORM, Lucide icons, Tailwind CSS (for TimeGrid patterns).

---

### Task 1: Color Hashing Utility

**Files:**
- Modify: `src/lib/utils.ts`
- Test: `src/lib/utils.test.ts` (Create)

- [ ] **Step 1: Create unit test for color hashing**
```typescript
import { stringToHslColor } from './utils';

describe('stringToHslColor', () => {
  it('should return stable HSL color for the same string', () => {
    const color1 = stringToHslColor('subject-123');
    const color2 = stringToHslColor('subject-123');
    expect(color1).toBe(color2);
  });
});
```

- [ ] **Step 2: Implement `stringToHslColor` in `src/lib/utils.ts`**
```typescript
export function stringToHslColor(str: string, s = 70, l = 85) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, ${s}%, ${l}%)`;
}
```

- [ ] **Step 3: Verify tests pass**
Run: `npm test src/lib/utils.test.ts`

- [ ] **Step 4: Commit**
```bash
git add src/lib/utils.ts src/lib/utils.test.ts
git commit -m "feat: add stringToHslColor utility"
```

---

### Task 2: Global Semester State

**Files:**
- Create: `src/components/providers/semester-provider.tsx`
- Modify: `src/app/[locale]/admin/layout.tsx`
- Modify: `src/components/shared/AdminHeader.tsx`
- Modify: `src/actions/scheduling-data.ts`

- [ ] **Step 1: Add `getSemesters` action in `src/actions/scheduling-data.ts`**
```typescript
export async function getSemesters() {
  return await db.query.semester.findMany({
    orderBy: (s, { desc }) => [desc(s.startDate)]
  });
}
```

- [ ] **Step 2: Create `SemesterProvider`**
Implement React Context to store `selectedSemesterId` and `setSemesterId`, defaulting to the current semester.

- [ ] **Step 3: Wrap `AdminLayout` with `SemesterProvider`**
Pass the initial current semester fetched server-side to the provider.

- [ ] **Step 4: Add Selector to `AdminHeader`**
Add a Radix UI Select component (via shadcn) to the header to switch the global semester.

- [ ] **Step 5: Commit**
```bash
git add src/components/providers/semester-provider.tsx src/app/\[locale\]/admin/layout.tsx src/components/shared/AdminHeader.tsx src/actions/scheduling-data.ts
git commit -m "feat: implement global semester context and selector"
```

---

### Task 3: Local Semester Override in ScheduleManager

**Files:**
- Modify: `src/components/features/academic/ScheduleManager.tsx`

- [ ] **Step 1: Update `ScheduleManager` to use Global Context as initial value**
Use `useContext(SemesterContext)` to initialize local `semesterId`.

- [ ] **Step 2: Add local semester dropdown in `ScheduleManager` toolbar**
This dropdown only affects the `ScheduleManager` state.

- [ ] **Step 3: Commit**
```bash
git commit -m "feat: add local semester override to ScheduleManager"
```

---

### Task 4: Availability Toggle Action

**Files:**
- Modify: `src/actions/scheduling-data.ts`
- Modify: `src/db/schemas/schedule.ts` (ensure `availability` table is exported)

- [ ] **Step 1: Implement `toggleAvailabilityAction`**
```typescript
export async function toggleAvailabilityAction(params: {
  entityId: string,
  entityType: 'teacher' | 'room' | 'subject' | 'global',
  dayOfWeek: number,
  slotMask: number
}) {
  const existing = await db.query.availability.findFirst({
    where: (a, { and, eq }) => and(
      eq(a.entityId, params.entityId),
      eq(a.entityType, params.entityType),
      eq(a.dayOfWeek, params.dayOfWeek)
    )
  });

  if (existing) {
    const newMask = existing.occupiedMask ^ params.slotMask;
    await db.update(availability)
      .set({ occupiedMask: newMask })
      .where(eq(availability.id, existing.id));
  } else {
    await db.insert(availability).values({
      entityId: params.entityId,
      entityType: params.entityType,
      dayOfWeek: params.dayOfWeek,
      occupiedMask: params.slotMask
    });
  }
  return { success: true };
}
```

- [ ] **Step 2: Commit**
```bash
git commit -m "feat: add toggleAvailabilityAction"
```

---

### Task 5: "Edit Availability" Mode UI

**Files:**
- Modify: `src/components/features/academic/ScheduleManager.tsx`
- Modify: `src/components/features/academic/TimeGrid.tsx`

- [ ] **Step 1: Add "Edit Availability" toggle button to `ScheduleManager`**
Add a state `isEditAvailabilityMode`.

- [ ] **Step 2: Pass mode to `TimeGrid`**
Modify `TimeGrid` to accept `isEditMode` and a `onToggleBlock` callback.

- [ ] **Step 3: Update `TimeGrid` cell rendering**
Render blocked slots with a CSS pattern. Use `diagonal-stripes` class (need to add to `globals.css`).

- [ ] **Step 4: Update `TimeGrid` click handler**
If `isEditMode`, call `onToggleBlock` instead of `onCellClick`.

- [ ] **Step 5: Commit**
```bash
git commit -m "feat: implement interactive Edit Availability mode"
```

---

### Task 6: Holiday Management

**Files:**
- Create: `src/components/features/academic/HolidayDialog.tsx`
- Modify: `src/actions/schedule-publish.ts`
- Modify: `src/actions/scheduling-data.ts`

- [ ] **Step 1: Add Holiday actions**
`getHolidays`, `addHoliday`, `deleteHoliday`.

- [ ] **Step 2: Create `HolidayDialog`**
A dialog with a list of holidays and a date picker to add new ones.

- [ ] **Step 3: Update `publishTemplateToSchedule`**
Fetch holidays and filter out dates that fall on a holiday.

- [ ] **Step 4: Commit**
```bash
git commit -m "feat: add holiday management and respect it during publishing"
```

---

### Task 7: Visual Polish (Color Coding)

**Files:**
- Modify: `src/components/features/academic/TimeGrid.tsx`

- [ ] **Step 1: Apply `stringToHslColor` to assignment blocks**
Use `assignment.courseClass.subject.id` as the seed.

- [ ] **Step 2: Commit**
```bash
git commit -m "style: add subject-based color coding to TimeGrid"
```
