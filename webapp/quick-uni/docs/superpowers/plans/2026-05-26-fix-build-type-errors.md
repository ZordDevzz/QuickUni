# Fix Build Type Errors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve 32 TypeScript errors across 10 files to stabilize the build.

**Architecture:** Systematic application of proper types from Drizzle schemas, importing missing functions, and correcting test mock definitions.

**Tech Stack:** TypeScript, React, Next.js, Drizzle ORM, Vitest.

---

### Task 1: Fix Academic Feature Errors

**Files:**
- Modify: `src/components/features/academic/RoomRowActions.tsx`
- Modify: `src/components/features/academic/ScheduleManager.tsx`

- [ ] **Step 1: Fix `RoomRowActions.tsx` types**
Update the component to use proper Drizzle types for `room` and `buildings`.

```tsx
import { room, building } from "@/db/schemas/schedule";

export function RoomRowActions({ 
  room, 
  buildings 
}: { 
  room: typeof room.$inferSelect, 
  buildings: (typeof building.$inferSelect)[] 
}) {
  // ...
}
```

- [ ] **Step 2: Fix `ScheduleManager.tsx` imports and types**
Add missing imports and cast `assignment` to `any` or a specific type in `handleAssignmentClick`.

```tsx
import { getWeeklyTemplateByEntity, getAvailability } from "@/actions/scheduling-data";

// ... inside handleAssignmentClick
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

- [ ] **Step 3: Verify Academic fixes**
Run: `npx tsc --noEmit src/components/features/academic/RoomRowActions.tsx src/components/features/academic/ScheduleManager.tsx`
Expected: No errors in these files.

- [ ] **Step 4: Commit**
```bash
git add src/components/features/academic/RoomRowActions.tsx src/components/features/academic/ScheduleManager.tsx
git commit -m "fix(types): resolve type errors in academic components"
```

### Task 2: Fix Onboarding UI and Action Errors

**Files:**
- Modify: `src/actions/onboarding.ts`
- Modify: `src/components/features/admin/onboarding/OnboardingStep1.tsx`
- Modify: `src/components/features/admin/onboarding/OnboardingStep2.tsx`
- Modify: `src/components/features/admin/onboarding/OnboardingStep3.tsx`
- Modify: `src/components/features/admin/onboarding/OnboardingWizard.tsx`

- [ ] **Step 1: Improve `getSessionAction` return type**
Update `src/actions/onboarding.ts` to return typed data.

```typescript
import { onboardingSession } from "@/db/schema";

export async function getSessionAction(sessionId: string): Promise<ActionResponse & { data?: typeof onboardingSession.$inferSelect }> {
  // ...
}
```

- [ ] **Step 2: Fix Onboarding components**
Use the typed results and cast `unknown` where necessary.

```tsx
// Example for OnboardingStep1.tsx
const [name, setName] = useState((initialData as any)?.name || "");
// ... apply similar fixes for entityType, schemaId, sessionId
```

- [ ] **Step 3: Verify Onboarding fixes**
Run: `npx tsc --noEmit src/actions/onboarding.ts src/components/features/admin/onboarding/*.tsx`
Expected: No errors in these files.

- [ ] **Step 4: Commit**
```bash
git add src/actions/onboarding.ts src/components/features/admin/onboarding/*.tsx
git commit -m "fix(types): resolve type errors in onboarding workflow"
```

### Task 3: Fix Integration Test Errors

**Files:**
- Modify: `tests/integration/academic/academic.test.ts`
- Modify: `tests/integration/people/course-teacher.test.ts`
- Modify: `tests/integration/people/people-workflow.test.ts`
- Modify: `tests/integration/workflow/request-side-effects.test.ts`

- [ ] **Step 1: Fix `academic.test.ts`**
Cast `capturedTx` to `any` to satisfy the `PgTransaction` requirement in mocks.

```typescript
    let capturedTx: any;
    vi.mocked(db.transaction).mockImplementationOnce(async (cb) => {
      // ...
      return cb(capturedTx);
    });
```

- [ ] **Step 2: Fix `course-teacher.test.ts`**
Add missing properties to mock objects.

```typescript
vi.mocked(db.query.employee.findFirst).mockResolvedValue({ 
  id: "emp-1", 
  code: "EMP001", 
  createAt: new Date().toISOString(),
  updateAt: null,
  deletedAt: null,
  profileId: "prof-1"
});
```

- [ ] **Step 3: Fix `people-workflow.test.ts`**
Add `schemaId` to `createPerson` calls.

- [ ] **Step 4: Fix `request-side-effects.test.ts`**
Type the `resolve` parameter.

```typescript
then: (resolve: (val: any) => void) => resolve([vals])
```

- [ ] **Step 5: Verify Test fixes**
Run: `npx tsc --noEmit tests/integration/**/*.ts`
Expected: No errors in tests.

- [ ] **Step 6: Commit**
```bash
git add tests/integration
git commit -m "test(types): fix type errors in integration tests"
```

### Task 4: Final Verification

- [ ] **Step 1: Run full build check**
Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 2: Run all tests**
Run: `npm test`
Expected: All tests pass.
