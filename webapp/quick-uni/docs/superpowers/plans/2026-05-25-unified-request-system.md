# Unified Request System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a centralized request and approval workflow for student absences, class cancellations, and teacher schedule changes.

**Architecture:** Flexible `request` table with JSONB data payloads. Role-based routing for approvals (Teacher vs. Academic Office). Integration with notification and auditing services.

**Tech Stack:** Next.js (App Router), Drizzle ORM, Zod, Shadcn UI, Next-Auth.

---

### Task 1: Database Schema & Enums

**Files:**
- Modify: `src/db/schemas/enums.ts`
- Modify: `src/db/schemas/communication.ts`

- [ ] **Step 1: Define new enums in `enums.ts`**
Add `enumRequestType` (`student_absence`, `class_cancellation`, `teacher_schedule_change`) and `enumWorkflowStatus` (`pending`, `approved`, `rejected`, `cancelled`).

- [ ] **Step 2: Add `request` table to `communication.ts`**

```typescript
export const request = communicationSchema.table(
  "request",
  {
    id: uuid().primaryKey().notNull(),
    senderId: uuid("sender_id").notNull(),
    type: enumRequestType().notNull(),
    status: enumWorkflowStatus().default("pending").notNull(),
    targetId: uuid("target_id"), // Reviewer (Teacher ID or NULL for PĐT)
    data: jsonb().notNull(), // { classId, date, reason, oldSchedule, newSchedule, etc. }
    comment: text(),
    createAt: timestamp("create_at", { withTimezone: true, mode: "string" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updateAt: timestamp("update_at", { withTimezone: true, mode: "string" }),
    processedAt: timestamp("processed_at", { withTimezone: true, mode: "string" }),
    processedBy: uuid("processed_by"),
  },
  (table) => [
    foreignKey({
      columns: [table.senderId],
      foreignColumns: [account.id],
      name: "fk_request_sender_id_account_id",
    }),
    foreignKey({
      columns: [table.processedBy],
      foreignColumns: [account.id],
      name: "fk_request_processed_by_account_id",
    }),
  ],
);
```

- [ ] **Step 3: Commit**
```bash
git add src/db/schemas/enums.ts src/db/schemas/communication.ts
git commit -m "feat(db): add request table and workflow enums"
```

### Task 2: Implement Workflow Server Actions

**Files:**
- Create: `src/actions/workflow.ts`

- [ ] **Step 1: Implement `submitRequest`**
Handles different types, determines the `targetId` (e.g., finding the teacher for an absence), and saves the payload.

- [ ] **Step 2: Implement `getRequestsForReviewer`**
Fetches requests where `targetId` matches current user OR `targetId` is NULL (for PĐT role).

- [ ] **Step 3: Implement `processRequest`**
Updates status and triggers side effects based on type (e.g., recording absence).

- [ ] **Step 4: Commit**
```bash
git add src/actions/workflow.ts
git commit -m "feat(workflow): implement core request processing actions"
```

### Task 3: Student Request Interface

**Files:**
- Create: `src/app/[locale]/student/requests/page.tsx`
- Create: `src/app/[locale]/student/requests/RequestWizard.tsx`

- [ ] **Step 1: Create request history list**
Show existing requests with status and details.

- [ ] **Step 2: Implement Request Wizard**
A dialog/form to select type and fill data (Absence, Cancellation).

- [ ] **Step 3: Commit**
```bash
git add src/app/[locale]/student/requests
git commit -m "feat(student): add request management UI"
```

### Task 4: Teacher & Academic Approval UIs

**Files:**
- Create: `src/app/[locale]/teacher/requests/page.tsx`
- Create: `src/app/[locale]/academic/requests/page.tsx`

- [ ] **Step 1: Implement Teacher Review Inbox**
Filter for `student_absence` requests targeted at the teacher.

- [ ] **Step 2: Implement Academic Office Request Console**
Filter for `class_cancellation` and `teacher_schedule_change`.

- [ ] **Step 3: Commit**
```bash
git add src/app/[locale]/teacher/requests src/app/[locale]/academic/requests
git commit -m "feat(workflow): add approval interfaces for teachers and pdv"
```

### Task 5: Notifications & Side Effects

**Files:**
- Modify: `src/actions/workflow.ts`

- [ ] **Step 1: Integrate Notification Service**
Send in-app notifications on submission and processing.

- [ ] **Step 2: Implement Approval Side Effects**
For `teacher_schedule_change`, update the `weekly_template` automatically upon PĐT approval.

- [ ] **Step 3: Commit**
```bash
git add src/actions/workflow.ts
git commit -m "feat(workflow): integrate notifications and automated side effects"
```
