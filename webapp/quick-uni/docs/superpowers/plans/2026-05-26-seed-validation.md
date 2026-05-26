# Validation Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a seed validation engine and integrate it into the seeding process to ensure data integrity.

**Architecture:** A new module `src/db/seeders/validate.ts` will contain the validation logic. `src/db/seed.ts` will be updated to import and execute this validation after seeding completes.

**Tech Stack:** TypeScript, Drizzle ORM (implicit).

---

### Task 1: Create `src/db/seeders/validate.ts`

**Files:**
- Create: `src/db/seeders/validate.ts`

- [ ] **Step 1: Create the validation module**

```typescript
import { db } from "../index";
import { roles, users } from "../schema";
import { eq } from "drizzle-orm";

export const validateSeed = async () => {
  console.log("🔍 Validating Seed Data...");
  
  // Example validation: Check if 'admin' role exists
  const adminRole = await db.select().from(roles).where(eq(roles.name, 'admin'));
  if (adminRole.length === 0) {
    throw new Error("Validation Failed: Admin role missing.");
  }
  
  console.log("✅ Seed Data Validated.");
};
```

### Task 2: Modify `src/db/seed.ts`

**Files:**
- Modify: `src/db/seed.ts`

- [ ] **Step 1: Import and call `validateSeed`**

```typescript
// Add to imports
import { validateSeed } from "./seeders/validate";

// Call after seed completes
async function runSeed() {
  // ... existing seeding logic ...
  
  await validateSeed();
}
```

### Task 3: Commit Changes

**Files:**
- None (git operations)

- [ ] **Step 1: Stage and Commit**

```bash
git add src/db/seeders/validate.ts src/db/seed.ts
git commit -m "feat: implement seed validation engine"
```
