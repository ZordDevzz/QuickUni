# Slot Finder Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add validation for `duration` in `findEmptySlots` and remove magic numbers.

**Architecture:** 
- Define `MAX_PERIODS = 15` in `slot-finder.ts`.
- Add guards for `duration <= 0` and `duration > MAX_PERIODS`.
- Use `MAX_PERIODS` instead of `15` and `16` in logic.
- Add comprehensive edge case tests.

**Tech Stack:** TypeScript, Vitest

---

### Task 1: Add validation and remove magic numbers

**Files:**
- Modify: `src/lib/scheduling/slot-finder.ts`

- [ ] **Step 1: Write the failing tests for edge cases**
Add tests for duration 0, 16 and 15 in `src/lib/scheduling/slot-finder.test.ts`.

```typescript
  it('should return empty array for invalid duration (0)', () => {
    const slots = findEmptySlots(0, 0);
    expect(slots).toEqual([]);
  });

  it('should return empty array for duration > 15 (16)', () => {
    const slots = findEmptySlots(0, 16);
    expect(slots).toEqual([]);
  });

  it('should handle duration 15 when free', () => {
    const slots = findEmptySlots(0, 15);
    expect(slots).toEqual([1]);
  });
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run src/lib/scheduling/slot-finder.test.ts`
Expected: FAIL (duration 0 and 16 might return unexpected results or loop forever if start condition was start <= 16-0 which is 16, start starts at 1. Actually duration 0 might loop 1 to 16. duration 16 will have start <= 0 which is false, returns []. So 0 is the main one that needs a guard to avoid issues).

- [ ] **Step 3: Implement validation and remove magic numbers**
Modify `src/lib/scheduling/slot-finder.ts`:

```typescript
export const MAX_PERIODS = 15;

export function findEmptySlots(occupiedMask: number, duration: number): number[] {
  if (duration <= 0 || duration > MAX_PERIODS) {
    return [];
  }
  
  const possibleStarts: number[] = [];
  for (let start = 1; start <= MAX_PERIODS - duration + 1; start++) {
    const candidateMask = createMask(start, start + duration - 1);
    if (!hasCollision(occupiedMask, candidateMask)) {
      possibleStarts.push(start);
    }
  }
  return possibleStarts;
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run src/lib/scheduling/slot-finder.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/lib/scheduling/slot-finder.ts src/lib/scheduling/slot-finder.test.ts
git commit -m "feat(scheduling): add duration validation and remove magic numbers in slot-finder"
```
