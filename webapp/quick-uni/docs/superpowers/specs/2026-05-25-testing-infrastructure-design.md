# Design Spec: Centralized Testing Infrastructure & Integration Suites

**Date:** 2026-05-25  
**Status:** Draft  
**Topic:** Test Organization and Workflow Verification  

## 1. Overview
This design outlines the consolidation of all test files into a dedicated `tests/` directory at the project root and the implementation of robust integration tests for newly developed university management features.

## 2. Goals
- Centralize test management to improve project organization.
- Clearly separate unit tests from business logic integration tests.
- Empirically verify the reliability of complex workflows (e.g., class cancellations, people creation).

## 3. Directory Structure (`tests/`)

### 3.1 `tests/unit/`
Contains logic-only tests that do not require database side effects or complex session handling.
- Bitmask utilities.
- String/Date formatting.
- Zod validators.

### 3.2 `tests/integration/`
Focuses on Server Actions and Database transactions.
- `/academic`: Semester, Room, Building CRUD.
- `/people`: Teacher & Student creation (Profile linking).
- `/workflow`: Request submission, approval flows, and side effects.

### 3.3 `tests/helpers/`
Shared utilities for setting up test data (factories) and cleaning up after integration tests.

## 4. Migration Strategy
1.  Create the `tests/` directory and subfolders.
2.  Relocate 18 existing `*.test.ts*` files using `mv`.
3.  Automate the update of relative imports (e.g., `../db` -> `@/db`).
4.  Update `package.json` test scripts to point to the new location.

## 5. New Test Requirements

### 5.1 People Integration (`tests/integration/people/`)
- Verify `createPerson` atomic transaction (Profile + Entity).
- Verify `getPeople` joins profile data correctly.

### 5.2 Unified Request Workflow (`tests/integration/workflow/`)
- **Submission**: Verify correct `targetId` routing for absences.
- **Approval Logic**: 
    - Verify status change and timestamps.
    - Verify `class_cancellation` side effects:
        - `enrollment.deletedAt` is set.
        - `courseClass.currentSlot` is decremented.
- **Notification**: Verify `notification_recipient` record is created for the reviewer.

## 6. Testing Environment
- **Framework**: Vitest (Existing).
- **Database**: Use a test schema or transaction rollback to ensure clean state between runs.

## 7. Success Criteria
- All 18 existing tests pass in their new locations.
- New integration tests cover the critical "Class Cancellation" and "Teacher Assignment" workflows.
- Zero `*.test.ts*` files remain in the `src/` directory.
