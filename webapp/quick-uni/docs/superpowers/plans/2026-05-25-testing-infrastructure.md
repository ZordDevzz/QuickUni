# Centralized Testing Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centralize all project tests into a root `tests/` directory and implement key integration tests for core workflows.

**Architecture:** Split tests into `unit/` and `integration/`. Use Vitest for execution. Automated relocation of existing tests. New test suites for People and Request workflows.

**Tech Stack:** Vitest, Drizzle ORM (for integration tests).

---

### Task 1: Initialize Testing Directory and Relocate Existing Tests

**Files:**
- Create: `tests/unit`, `tests/integration/academic`, `tests/integration/people`, `tests/integration/workflow`
- Move: All existing `*.test.ts*` from `src/` to `tests/`

- [ ] **Step 1: Create directory structure**
```bash
mkdir -p tests/unit tests/integration/academic tests/integration/people tests/integration/workflow tests/helpers
```

- [ ] **Step 2: Relocate 18 existing test files**
Move files to their respective category (e.g., bitmask.test.ts -> tests/unit, academic.test.ts -> tests/integration/academic).

- [ ] **Step 3: Update relative imports**
Change imports like `import { ... } from "../db"` to `@/db` or correct relative paths.

- [ ] **Step 4: Update package.json scripts**
```json
"test": "vitest run tests"
```

- [ ] **Step 5: Commit**
```bash
git add tests/ package.json
git commit -m "refactor(test): centralize tests into root /tests directory"
```

### Task 2: Implement People Integration Tests

**Files:**
- Create: `tests/integration/people/people-workflow.test.ts`

- [ ] **Step 1: Write tests for `createPerson`**
Verify that calling `createPerson` creates both a `profile` and the specific entity (student/employee) in a single transaction.

```typescript
import { createPerson, getPeople } from "@/actions/people";
import { db } from "@/db";

describe("People Integration", () => {
  it("should create a student and its profile atomically", async () => {
    const data = {
      code: "STU001",
      fullname: "John Doe",
      gender: "male",
      dob: "2000-01-01",
      nationalId: "123456789",
    };
    await createPerson('student', data);
    
    const students = await getPeople('student');
    const john = students.find(s => s.code === "STU001");
    expect(john).toBeDefined();
    expect(john?.profile.fullname).toBe("John Doe");
  });
});
```

- [ ] **Step 2: Commit**
```bash
git add tests/integration/people/people-workflow.test.ts
git commit -m "test(people): add integration tests for person creation"
```

### Task 3: Implement Request System Integration Tests

**Files:**
- Create: `tests/integration/workflow/request-side-effects.test.ts`

- [ ] **Step 1: Test `student_absence` submission and routing**
- [ ] **Step 2: Test `class_cancellation` side effects**
Verify that approving a cancellation:
1. Updates request status to `approved`.
2. Sets `enrollment.deletedAt`.
3. Decrements `courseClass.currentSlot`.

- [ ] **Step 3: Commit**
```bash
git add tests/integration/workflow/request-side-effects.test.ts
git commit -m "test(workflow): add integration tests for request side effects"
```

### Task 4: Verify and Cleanup

- [ ] **Step 1: Run all tests in the new structure**
Run: `npm test`
Expected: ALL 18+ new tests PASS.

- [ ] **Step 2: Remove any leftover test files in `src/`**
- [ ] **Step 3: Commit**
```bash
git commit -m "chore(test): final verification and cleanup of centralized tests"
```
