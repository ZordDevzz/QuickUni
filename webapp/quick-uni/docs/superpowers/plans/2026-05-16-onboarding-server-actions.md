# Onboarding Session Server Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement server actions to manage the lifecycle of an onboarding session, from creation to Excel validation and execution of the provisioning pipeline.

**Architecture:** Next.js Server Actions with Drizzle ORM, using existing business logic workflows in `src/services/onboarding.ts` and `src/services/user.ts`.

**Tech Stack:** TypeScript, Next.js, Drizzle ORM, XLSX.

---

### Task 1: Create Onboarding Session Server Action

**Files:**
- Create: `src/actions/onboarding.ts`
- Test: `src/actions/onboarding.test.ts` (if applicable, otherwise manual verification)

- [ ] **Step 1: Define `createOnboardingSession` action**
Implement basic session creation with initial status 'draft'.

```typescript
"use server";

import { db } from "@/db";
import { onboardingSession, systemAuditLog } from "@/db/schema";
import { getAuthSession } from "@/services/auth";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

export async function createOnboardingSession(data: { 
  name: string, 
  entityType: 'student' | 'employee', 
  schemaId: number 
}) {
  const session = await getAuthSession();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const sessionId = randomUUID();
  await db.insert(onboardingSession).values({
    id: sessionId,
    name: data.name,
    entityType: data.entityType,
    schemaId: data.schemaId,
    status: 'draft',
    createBy: session.user.id,
  });

  await db.insert(systemAuditLog).values({
    actorId: session.user.id,
    action: "create_onboarding_session",
    targetResource: "onboarding_session",
    targetId: sessionId,
    payload: data,
  });

  revalidatePath("/admin/onboarding");
  return { success: true, sessionId };
}
```

### Task 2: Validate Onboarding Excel Server Action

**Files:**
- Modify: `src/actions/onboarding.ts`

- [ ] **Step 1: Implement `validateOnboardingExcel` action**
This action reads the Excel file, validates it using `parseAndValidateOnboardingExcel`, and updates the session summary.

```typescript
import { parseAndValidateOnboardingExcel } from "@/services/excel";
import { eq } from "drizzle-orm";
import { profileSchemaField } from "@/db/schema";

export async function validateOnboardingExcel(sessionId: string, formData: FormData) {
  const sessionUser = await getAuthSession();
  if (!sessionUser?.user?.id) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");

  const buffer = Buffer.from(await file.arrayBuffer());

  const session = await db.query.onboardingSession.findFirst({
    where: eq(onboardingSession.id, sessionId),
  });
  if (!session) throw new Error("Session not found");

  const schemaFields = await db.query.profileSchemaField.findMany({
    where: eq(profileSchemaField.schemaId, session.schemaId),
    with: {
      profileField: true,
    }
  });

  const fields = schemaFields.map(sf => ({
    label: sf.profileField.label || sf.profileField.name,
    name: sf.profileField.name,
    isRequired: sf.isRequired,
  }));

  const validationResults = await parseAndValidateOnboardingExcel(buffer, fields);

  const total = validationResults.length;
  const validCount = validationResults.filter(r => r.isValid).length;
  const errorCount = total - validCount;

  const summary = {
    total,
    valid: validCount,
    error: errorCount,
    results: validationResults,
  };

  await db.update(onboardingSession)
    .set({
      summary,
      status: validCount > 0 ? "ready" : "validating",
      updateBy: sessionUser.user.id,
      updateAt: new Date().toISOString(),
    })
    .where(eq(onboardingSession.id, sessionId));

  revalidatePath(`/admin/onboarding/${sessionId}`);
  return { success: true, summary };
}
```

### Task 3: Execute Onboarding Session Server Action

**Files:**
- Modify: `src/actions/onboarding.ts`

- [ ] **Step 1: Implement `executeOnboardingSession` action**
Iterate through the validated data and call workflows to create profiles, entities, and accounts.

```typescript
import { 
  createProfileWorkflow, 
  linkProfileToEntity, 
  issueAccountWorkflow 
} from "@/services/onboarding";
import { headers } from "next/headers";

export async function executeOnboardingSession(sessionId: string) {
  const sessionUser = await getAuthSession();
  if (!sessionUser?.user?.id) throw new Error("Unauthorized");

  const headerList = await headers();
  const ipAddress = headerList.get("x-forwarded-for")?.split(",")[0] || null;
  const userAgent = headerList.get("user-agent");

  const session = await db.query.onboardingSession.findFirst({
    where: eq(onboardingSession.id, sessionId),
  });
  if (!session) throw new Error("Session not found");
  if (session.status !== "ready") throw new Error("Session is not ready for execution");

  const summary = session.summary as any;
  if (!summary || !summary.results) throw new Error("No validated data found");

  await db.update(onboardingSession)
    .set({ status: "processing" })
    .where(eq(onboardingSession.id, sessionId));

  let successCount = 0;
  let failCount = 0;
  const finalResults = [];

  for (const row of summary.results) {
    if (!row.isValid) {
        finalResults.push({ ...row, processed: false, error: "Skipped (invalid)" });
        continue;
    }

    try {
      const rowData = row.data;
      
      // 1. Create Profile
      const profile = await createProfileWorkflow({
        fullName: rowData["Full Name"],
        gender: rowData["Gender"]?.toLowerCase(),
        dob: rowData["DOB"],
        nationalId: rowData["National ID"],
        address: rowData["Address"],
        ethnic: rowData["Ethnic"],
        religious: rowData["Religious"],
        schemaId: session.schemaId,
        dynamicData: rowData, // Pass the whole row, workflows will pick what they need
      });

      // 2. Link Profile to Entity
      await linkProfileToEntity(profile.id, session.entityType as any, {
        code: rowData["Entity Code"],
      });

      // 3. Issue Account
      const password = rowData["National ID"] || rowData["Entity Code"];
      await issueAccountWorkflow(
        {
          username: rowData["Entity Code"],
          password: password,
          type: session.entityType as any,
          status: "active",
        },
        profile.id,
        {
          performedBy: sessionUser.user.id,
          ipAddress,
          userAgent,
        }
      );

      successCount++;
      finalResults.push({ ...row, processed: true });
    } catch (e: any) {
      failCount++;
      finalResults.push({ ...row, processed: false, error: e.message });
    }
  }

  const finalSummary = {
    ...summary,
    success: successCount,
    failed: failCount,
    executionResults: finalResults,
  };

  await db.update(onboardingSession)
    .set({
      status: failCount === 0 ? "completed" : "failed",
      summary: finalSummary,
      updateBy: sessionUser.user.id,
      updateAt: new Date().toISOString(),
    })
    .where(eq(onboardingSession.id, sessionId));

  await db.insert(systemAuditLog).values({
    actorId: sessionUser.user.id,
    action: "execute_onboarding_session",
    targetResource: "onboarding_session",
    targetId: sessionId,
    payload: { successCount, failCount },
  });

  revalidatePath(`/admin/onboarding/${sessionId}`);
  return { success: true, summary: finalSummary };
}
```

### Task 4: Final Polish and Imports

**Files:**
- Modify: `src/actions/onboarding.ts`

- [ ] **Step 1: Consolidate imports and ensure type safety**
Ensure all necessary imports from `@/db/schema` and other services are present and correct. Handle the `schemaFields` mapping carefully to ensure `profileField` properties are accessed correctly.

- [ ] **Step 2: Add authorization checks**
Verify that the user has admin privileges before performing any actions (e.g., using an `isAdmin` check if available).
