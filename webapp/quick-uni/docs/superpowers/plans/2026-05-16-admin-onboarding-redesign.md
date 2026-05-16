# Admin Onboarding Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a session-based batch onboarding system for Students and Staff using Excel integration and a 3-step Wizard.

**Architecture:** 
- New `onboarding_session` table to track batch operations.
- Service layer for Excel generation (based on Profile Schemas) and validation.
- Server Actions to orchestrate the 3-phase pipeline (Profile -> Entity -> Account).
- React-based Wizard UI with real-time validation and progress tracking.

**Tech Stack:** Next.js (App Router), Drizzle ORM, PostgreSQL, `xlsx` (SheetJS), TanStack Table, Sonner.

---

### Task 1: Database Migration

**Files:**
- Modify: `src/db/schemas/system.ts`
- Modify: `src/db/schemas/user.ts`

- [ ] **Step 1: Define `onboarding_session` table in `src/db/schemas/system.ts`**

```typescript
// Add to src/db/schemas/system.ts
import { pgEnum } from "drizzle-orm/pg-core";

export const onboardingSessionStatus = pgEnum("onboarding_session_status", [
  "draft", "validating", "ready", "processing", "completed", "failed"
]);

export const onboardingSession = systemSchema.table("onboarding_session", {
  id: uuid().primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
  entityType: varchar("entity_type", { length: 20 }).notNull(), // 'student' | 'employee'
  schemaId: bigint("schema_id", { mode: "number" }).notNull(),
  status: onboardingSessionStatus("status").default("draft").notNull(),
  config: jsonb("config"),
  summary: jsonb("summary"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("create_at", { withTimezone: true, mode: "string" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("update_at", { withTimezone: true, mode: "string" }),
});
```

- [ ] **Step 2: Add `sessionId` to `profile` table in `src/db/schemas/user.ts`**

```typescript
// Modify src/db/schemas/user.ts
// In profile table definition:
sessionId: uuid("session_id"),
// Add foreign key in table callback:
foreignKey({
  columns: [table.sessionId],
  foreignColumns: [onboardingSession.id],
  name: "fk_profile_onboarding_session_id",
}),
```

- [ ] **Step 3: Generate and run migration**

Run: `npx drizzle-kit generate && npx drizzle-kit push`
Expected: Database schema updated.

- [ ] **Step 4: Commit**

```bash
git add src/db/schemas/system.ts src/db/schemas/user.ts
git commit -m "db: add onboarding_session table and profile.session_id"
```

---

### Task 2: Excel Template Generation Service

**Files:**
- Create: `src/services/excel.ts`
- Test: `src/services/excel.test.ts`

- [ ] **Step 1: Write test for template generation**

```typescript
import { generateOnboardingTemplate } from "./excel";
import { describe, it, expect } from "vitest";

describe("Excel Service", () => {
  it("should generate a buffer for a valid schema", async () => {
    // Mock schema fields...
    const fields = [
      { label: "Full Name", name: "fullname", isRequired: true },
      { label: "Phone", name: "phone", isRequired: false }
    ];
    const buffer = await generateOnboardingTemplate(fields);
    expect(buffer).toBeInstanceOf(Buffer);
  });
});
```

- [ ] **Step 2: Implement `generateOnboardingTemplate`**

```typescript
import * as XLSX from "xlsx";

export async function generateOnboardingTemplate(fields: any[]) {
  const headers = ["Full Name", "Gender", "DOB", "National ID", "Address", "Entity Code", ...fields.map(f => f.label)];
  const worksheet = XLSX.utils.aoa_to_sheet([headers]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}
```

- [ ] **Step 3: Run tests**

Run: `npm test src/services/excel.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/services/excel.ts src/services/excel.test.ts
git commit -m "feat: add excel template generation service"
```

---

### Task 3: Excel Parsing & Validation Logic

**Files:**
- Modify: `src/services/excel.ts`

- [ ] **Step 1: Implement `parseAndValidateExcel`**

```typescript
export async function parseAndValidateExcel(buffer: Buffer, schemaFields: any[]) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  const results = data.map((row: any) => {
    const errors = [];
    if (!row["Full Name"]) errors.push("Missing Full Name");
    if (!row["National ID"]) errors.push("Missing National ID");
    // Add logic for dynamic fields validation...
    return { ...row, errors, isValid: errors.length === 0 };
  });
  
  return results;
}
```

- [ ] **Step 2: Add tests for validation**

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: add excel parsing and validation logic"
```

---

### Task 4: Onboarding Session Server Actions

**Files:**
- Create: `src/actions/onboarding.ts`

- [ ] **Step 1: Implement `createOnboardingSession`**

```typescript
export async function createOnboardingSession(data: { name: string, entityType: string, schemaId: number }) {
  // DB Insert...
}
```

- [ ] **Step 2: Implement `executeOnboardingSession`**
Iterate through validated data, call `createProfileWorkflow`, `linkProfileToEntity`, and `issueAccountWorkflow`. Update session status and summary.

---

### Task 5: Onboarding Wizard UI - Step 1 & 2

**Files:**
- Create: `src/app/[locale]/admin/onboarding/new/page.tsx`
- Create: `src/components/features/admin/OnboardingWizard.tsx`

- [ ] **Step 1: Build Step 1 Form (Session Config)**
- [ ] **Step 2: Build Step 2 Data Table (Preview & Inline Edit)**
Use `tanstack/react-table` to show uploaded data and errors.

---

### Task 6: Onboarding Wizard UI - Step 3 & Dashboard

**Files:**
- Create: `src/app/[locale]/admin/onboarding/page.tsx`

- [ ] **Step 1: Build Session Dashboard**
- [ ] **Step 2: Build Step 3 Progress UI**
Use a polling mechanism or server-sent events to track `processing` status.
