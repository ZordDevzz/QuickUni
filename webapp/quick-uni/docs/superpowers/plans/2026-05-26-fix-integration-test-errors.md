# Fix Integration Test Errors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix type errors in integration tests to ensure clean `tsc` output and reliable testing infrastructure.

**Architecture:** Surgical application of type casts (`any`) where mocks are inherently loose, and adding missing required properties to mock data to satisfy Drizzle-ORM schema requirements.

**Tech Stack:** TypeScript, Vitest, Drizzle ORM.

---

### Task 1: Fix `academic.test.ts`

**Files:**
- Modify: `tests/integration/academic/academic.test.ts`

- [ ] **Step 1: Change `capturedTx` type to `any`**

Change `let capturedTx: unknown;` to `let capturedTx: any;` at lines 79 and 104. This allows calling `capturedTx.update` and `capturedTx.insert` without type errors in the test.

```typescript
    // Access the mock transaction object
    let capturedTx: any;
```

- [ ] **Step 2: Commit**

```bash
git add tests/integration/academic/academic.test.ts
git commit -m "test(academic): fix capturedTx type error in integration tests"
```

### Task 2: Fix `course-teacher.test.ts`

**Files:**
- Modify: `tests/integration/people/course-teacher.test.ts`

- [ ] **Step 1: Add missing properties to employee mock**

Update `vi.mocked(db.query.employee.findFirst).mockResolvedValue({ id: "emp-1" });` to include required schema fields.

```typescript
vi.mocked(db.query.employee.findFirst).mockResolvedValue({ 
  id: "emp-1", 
  code: "EMP001", 
  profileId: "prof-1",
  createAt: new Date().toISOString(),
  updateAt: null,
  deletedAt: null
});
```

- [ ] **Step 2: Add missing properties to courseClass mock**

Update `vi.mocked(db.query.courseClass.findMany).mockResolvedValue([{ id: "class-1", code: "C1" }]);` to include required schema fields.

```typescript
vi.mocked(db.query.courseClass.findMany).mockResolvedValue([{ 
  id: "class-1", 
  code: "C1",
  teacherId: "emp-1",
  subjectId: "sub-1",
  cap: 30,
  currentSlot: 0,
  status: "opened",
  type: 1,
  semesterId: 1,
  createAt: new Date().toISOString(),
  updateAt: null,
  deletedAt: null
}]);
```

- [ ] **Step 3: Commit**

```bash
git add tests/integration/people/course-teacher.test.ts
git commit -m "test(people): add missing properties to employee and courseClass mocks"
```

### Task 3: Fix `people-workflow.test.ts`

**Files:**
- Modify: `tests/integration/people/people-workflow.test.ts`

- [ ] **Step 1: Add `schemaId` to `createPerson` call data**

Update the `data` object in the first test to include `schemaId`.

```typescript
    const data = {
      code: "STU001",
      fullname: "John Doe",
      gender: "male" as const,
      dob: "2000-01-01",
      nationalId: "123456789",
      schemaId: 1, // Added schemaId
    };
```

- [ ] **Step 2: Commit**

```bash
git add tests/integration/people/people-workflow.test.ts
git commit -m "test(people): add schemaId to createPerson calls"
```

### Task 4: Fix `request-side-effects.test.ts`

**Files:**
- Modify: `tests/integration/workflow/request-side-effects.test.ts`

- [ ] **Step 1: Type the `resolve` parameter in mock `then` method**

Update line 47: `then: (resolve: unknown) => resolve([vals])` to use a typed resolve.

```typescript
            then: (resolve: (val: any) => void) => resolve([vals])
```

- [ ] **Step 2: Commit**

```bash
git add tests/integration/workflow/request-side-effects.test.ts
git commit -m "test(workflow): type resolve parameter in request-side-effects mocks"
```

### Task 5: Final Verification

- [ ] **Step 1: Run TSC on integration tests**

Run: `npx tsc --noEmit tests/integration/**/*.ts`
Expected: No errors (or at least no errors in the modified files).

- [ ] **Step 2: Run all integration tests with Vitest**

Run: `npx vitest tests/integration`
Expected: All tests pass.
