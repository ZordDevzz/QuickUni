# Fix Lint and Type Errors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve 161 lint errors and 85 warnings to stabilize the codebase following the Role-Based Architecture migration.

**Architecture:** Systematic replacement of `any` with specific types from Drizzle schemas, refactoring React components to avoid `set-state-in-effect`, and correcting Hook usage in table columns.

**Tech Stack:** TypeScript, React, Next.js, Drizzle ORM, TanStack Table.

---

### Task 1: Fix Lint Errors in Server Actions

**Files:**
- Modify: `src/actions/account.ts`
- Modify: `src/actions/course.ts`
- Modify: `src/actions/onboarding.ts`
- Modify: `src/actions/people.ts`
- Modify: `src/actions/role.ts`
- Modify: `src/actions/scheduling-data.ts`
- Modify: `src/actions/workflow.ts`

- [ ] **Step 1: Fix `src/actions/account.ts`**
Replace `any` in `updateAccount` and other functions with `Partial<Account>` or specific input types.

- [ ] **Step 2: Fix `src/actions/course.ts`**
Replace `any` with `Course`, `CourseClass`, or inferred types from Drizzle.

- [ ] **Step 3: Fix `src/actions/onboarding.ts`**
Define interfaces for Excel row data and session configuration instead of `any`.

- [ ] **Step 4: Fix `src/actions/people.ts`, `src/actions/role.ts`, `src/actions/scheduling-data.ts`, `src/actions/workflow.ts`**
Apply similar type corrections.

- [ ] **Step 5: Run lint to verify**
Run: `npx eslint src/actions`
Expected: No errors in the modified files.

- [ ] **Step 6: Commit**
```bash
git add src/actions/*.ts
git commit -m "chore(types): fix explicit any errors in server actions"
```

### Task 2: Fix React Hook Violations in Academic Components

**Files:**
- Modify: `src/app/[locale]/academic/departments/DetailView.tsx`
- Modify: `src/components/features/academic/ScheduleManager.tsx`
- Modify: `src/components/features/academic/ScheduleSlotDialog.tsx`
- Modify: `src/components/features/academic/SchemaFieldManager.tsx`

- [ ] **Step 1: Fix `DetailView.tsx`**
Remove `load()` from `useEffect` body if it causes synchronous state updates. Use a wrapper or `useCallback`.
Actually, ensure it doesn't trigger "cascading renders".

- [ ] **Step 2: Fix `ScheduleManager.tsx`**
Address `set-state-in-effect` by moving state initialization or using `useMemo` where appropriate.

- [ ] **Step 3: Fix `ScheduleSlotDialog.tsx` and `SchemaFieldManager.tsx`**
Apply similar fixes for effect-based state updates.

- [ ] **Step 4: Commit**
```bash
git add src/app/[locale]/academic src/components/features/academic
git commit -m "refactor(ui): fix React Hook violations in academic components"
```

### Task 3: Fix Rules of Hooks and Types in Tables

**Files:**
- Modify: `src/app/[locale]/academic/semesters/semester-columns.tsx`
- Modify: `src/components/features/auth/AccountRowActions.tsx`

- [ ] **Step 1: Fix `semester-columns.tsx`**
Extract the cell content that uses `useTransition` into a separate sub-component (e.g., `StatusCell`) so it follows the rules of hooks.

- [ ] **Step 2: Fix `AccountRowActions.tsx`**
Fix the "access before declaration" for `loadRoles`. Move the declaration above the `useEffect`.

- [ ] **Step 3: Commit**
```bash
git add src/app/[locale]/academic/semesters/semester-columns.tsx src/components/features/auth/AccountRowActions.tsx
git commit -m "fix(ui): correct hook usage and variable declaration order"
```

### Task 4: Fix Types in API Routes and Services

**Files:**
- Modify: `src/app/api/admin/onboarding/report/[sessionId]/route.ts`
- Modify: `src/app/api/admin/onboarding/template/[sessionId]/route.ts`
- Modify: `src/services/excel.ts`

- [ ] **Step 1: Fix API Routes**
Replace `any` with specific types for request/response bodies.

- [ ] **Step 2: Fix `src/services/excel.ts`**
Replace `any` in sheet processing logic with generic types or specific interfaces.

- [ ] **Step 3: Commit**
```bash
git add src/app/api src/services/excel.ts
git commit -m "chore(types): fix explicit any errors in API and services"
```

### Task 5: Final Cleanup of Tests and Warnings

**Files:**
- Modify: `tests/integration/academic/academic.test.ts`
- Modify: `tests/integration/workflow/request-side-effects.test.ts`
- Modify: `src/components/shared/AdminSidebar.tsx` (unused imports)

- [ ] **Step 1: Fix Test Types**
Resolve `any` usage in test setups.

- [ ] **Step 2: Remove Unused Variables**
Clean up `AdminSidebar.tsx` and other files with `no-unused-vars` warnings.

- [ ] **Step 3: Final Verification**
Run: `npm run lint`
Expected: 0 errors, 0 warnings.

- [ ] **Step 4: Commit**
```bash
git add tests src/components/shared
git commit -m "chore(lint): final cleanup of unused variables and test types"
```
