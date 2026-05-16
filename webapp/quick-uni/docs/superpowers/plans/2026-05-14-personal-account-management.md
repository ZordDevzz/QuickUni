# Personal Account Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a comprehensive account management page where users can update their profile, change their password, and customize UI preferences.

**Architecture:** A tab-based layout using Next.js App Router. Data is fetched via Server Components, and mutations are handled through Server Actions. Dynamic Profile logic is reused to render user-specific fields.

**Tech Stack:** Next.js, Drizzle ORM, Zod, React Hook Form, Shadcn UI.

---

### Task 1: Validation Schemas

**Files:**
- Create: `src/lib/validators/account.ts`
- Test: `src/lib/validators/account.test.ts` (New)

- [ ] **Step 1: Write validation tests**

```typescript
import { describe, it, expect } from "vitest";
import { changePasswordSchema, profileUpdateSchema } from "./account";

describe("Account Validators", () => {
  it("should validate password change correctly", () => {
    const valid = changePasswordSchema.safeParse({
      currentPassword: "old-password",
      newPassword: "new-password-123",
      confirmPassword: "new-password-123",
    });
    expect(valid.success).toBe(true);
    
    const mismatch = changePasswordSchema.safeParse({
      currentPassword: "old-password",
      newPassword: "new-password-123",
      confirmPassword: "mismatch",
    });
    expect(mismatch.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run src/lib/validators/account.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement validators**

```typescript
import { z } from "zod";

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const profileUpdateSchema = z.record(z.any());

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
```

- [ ] **Step 4: Run test to verify success**

Run: `npx vitest run src/lib/validators/account.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/validators/account.ts src/lib/validators/account.test.ts
git commit -m "feat(account): add validation schemas"
```

---

### Task 2: Server Actions

**Files:**
- Create: `src/actions/account.ts`
- Modify: `src/services/user.ts` (Ensure `getUserById` returns `pwdHash`)

- [ ] **Step 1: Add updatePassword action**

```typescript
"use server";

import { auth } from "@/auth"; // Assuming auth helper exists
import { db } from "@/db";
import { account, profile } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hash, compare } from "bcryptjs";
import { changePasswordSchema, ChangePasswordInput, profileUpdateSchema, ProfileUpdateInput } from "@/lib/validators/account";
import { revalidatePath } from "next/cache";

export async function changePasswordAction(data: ChangePasswordInput) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const validated = changePasswordSchema.parse(data);
    const user = await db.query.account.findFirst({
      where: eq(account.id, session.user.id),
    });

    if (!user || !user.pwdHash) return { success: false, error: "User not found" };

    const isMatch = await compare(validated.currentPassword, user.pwdHash);
    if (!isMatch) return { success: false, error: "Incorrect current password" };

    const newHash = await hash(validated.newPassword, 10);
    await db.update(account).set({ pwdHash: newHash }).where(eq(account.id, session.user.id));

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

- [ ] **Step 2: Add updatePersonalProfileAction**

```typescript
export async function updatePersonalProfileAction(data: ProfileUpdateInput) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const validated = profileUpdateSchema.parse(data);
    
    // Hardcoded protected fields for safety
    const protectedFields = ["msv", "employee_id", "username", "role"];
    const filteredData = { ...validated };
    protectedFields.forEach(field => delete filteredData[field]);

    await db.update(profile)
      .set({ dynamicData: filteredData, updateAt: new Date().toISOString() })
      .where(eq(profile.accountId, session.user.id));

    revalidatePath("/account");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/actions/account.ts
git commit -m "feat(account): add server actions for profile and password"
```

---

### Task 3: Account Page & UI

**Files:**
- Create: `src/app/[locale]/account/page.tsx`
- Create: `src/app/[locale]/account/AccountClient.tsx`
- Create: `src/app/[locale]/account/ProfileTab.tsx`
- Create: `src/app/[locale]/account/SecurityTab.tsx`
- Create: `src/app/[locale]/account/PreferencesTab.tsx`

- [ ] **Step 1: Implement the main Account Page (Server Component)**
- [ ] **Step 2: Implement AccountClient with Tabs layout**
- [ ] **Step 3: Implement ProfileTab using Dynamic Schema logic**
- [ ] **Step 4: Implement SecurityTab with password change form**
- [ ] **Step 5: Implement PreferencesTab for Theme/Language**

- [ ] **Step 6: Update UserMenu.tsx to link to /account**

- [ ] **Step 7: Add translations**
Add keys to `en.json` and `vi.json` under `UserMenu`, `Account`, and a new `AccountSettings` section.

- [ ] **Step 8: Final Verification**
Run build and check for type errors.
Run: `npm run build`

- [ ] **Step 9: Commit UI**
```bash
git add src/app/[locale]/account/ src/components/shared/UserMenu.tsx messages/
git commit -m "feat(account): implement account management UI and translations"
```
