# Bitmask Utility Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the bitmask utility by replacing magic numbers with constants, adding input validation, and expanding test coverage for edge cases.

**Architecture:** Use TDD to implement validation in `createMask` and ensure it handles the [1, 15] range correctly. Replace `0x7FFF` with a named constant `TOTAL_PERIODS_MASK`.

**Tech Stack:** TypeScript, Vitest

---

### Task 1: Refactor Magic Number

**Files:**
- Modify: `src/lib/scheduling/bitmask.ts`

- [ ] **Step 1: Define `TOTAL_PERIODS_MASK` constant**

```typescript
export const TOTAL_PERIODS_MASK = 0x7FFF; // 15 bits of 1s
```

- [ ] **Step 2: Update `getAvailableSlots` to use the constant**

```typescript
export const getAvailableSlots = (occupiedMask: number): number => {
  return (~occupiedMask) & TOTAL_PERIODS_MASK;
};
```

- [ ] **Step 3: Run existing tests to ensure no regressions**

Run: `npx vitest src/lib/scheduling/bitmask.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/scheduling/bitmask.ts
git commit -m "refactor: replace magic number with TOTAL_PERIODS_MASK"
```

### Task 2: Implement Validation and Edge Case Tests

**Files:**
- Modify: `src/lib/scheduling/bitmask.ts`
- Modify: `src/lib/scheduling/bitmask.test.ts`

- [ ] **Step 1: Write failing tests for validation and edge cases**

```typescript
  it('should throw error for invalid range', () => {
    expect(() => createMask(0, 5)).toThrow('Start and end must be between 1 and 15');
    expect(() => createMask(1, 16)).toThrow('Start and end must be between 1 and 15');
    expect(() => createMask(5, 3)).toThrow('Start must be less than or equal to end');
  });

  it('should handle edge cases for single bits', () => {
    expect(createMask(1, 1)).toBe(1); // 2^0
    expect(createMask(15, 15)).toBe(0x4000); // 2^14
  });

  it('should create full mask for 1-15 range', () => {
    expect(createMask(1, 15)).toBe(0x7FFF);
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest src/lib/scheduling/bitmask.test.ts`
Expected: FAIL (Validation tests should fail, edge cases might pass if logic already supports them but we want to be sure)

- [ ] **Step 3: Implement validation in `createMask`**

```typescript
export const createMask = (start: number, end: number): number => {
  if (start < 1 || start > 15 || end < 1 || end > 15) {
    throw new Error('Start and end must be between 1 and 15');
  }
  if (start > end) {
    throw new Error('Start must be less than or equal to end');
  }
  let mask = 0;
  for (let i = start - 1; i <= end - 1; i++) {
    mask |= (1 << i);
  }
  return mask;
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest src/lib/scheduling/bitmask.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/scheduling/bitmask.ts src/lib/scheduling/bitmask.test.ts
git commit -m "feat: add validation to createMask and expand test coverage"
```
