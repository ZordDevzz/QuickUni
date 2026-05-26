# Modular Test Data Seeder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the main orchestrator for the modular test data seeder to allow structured and reproducible database seeding.

**Architecture:** A central `main` function in `src/db/seed.ts` that coordinates multiple specialized seeder modules (system, org, people, academic, scheduling) and handles database migrations/clearing.

**Tech Stack:** TypeScript, Drizzle ORM, Node.js.

---

### Task 1: Update src/db/seed.ts

**Files:**
- Modify: `src/db/seed.ts`

- [ ] **Step 1: Replace content of src/db/seed.ts with the modular orchestrator**

```typescript
import { clearDatabase } from "./seeders/clear";
import { seedSystem } from "./seeders/system";
import { seedOrg } from "./seeders/org";
import { seedPeople } from "./seeders/people";
import { seedAcademic } from "./seeders/academic";
import { seedScheduling } from "./seeders/scheduling";
import { execSync } from "child_process";
import { db } from "./index";
import { employee } from "./schema";
import { sql } from "drizzle-orm";

const runMigration = () => {
  try {
    console.log("🔄 Running migrations (drizzle-kit push)...");
    execSync("npx drizzle-kit push", { stdio: "inherit" });
    return true;
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    return false;
  }
};

const emergencyReset = async () => {
  console.log("🚨 EMERGENCY RESET: Wiping database structure...");
  const schemas = ["users", "academic", "course", "schedule", "auth", "system", "drizzle"];
  for (const schema of schemas) {
    try {
      await db.execute(sql.raw(`DROP SCHEMA IF EXISTS ${schema} CASCADE`));
    } catch (e) {
      console.warn(`Could not drop schema ${schema}:`, e.message);
    }
  }
  console.log("✅ Database structure wiped.");
  runMigration();
};

const main = async () => {
  console.log("🌱 STARTING MODULAR SEEDING...");

  const syncSuccess = runMigration();
  if (!syncSuccess) {
    await emergencyReset();
  } else {
    await clearDatabase();
  }

  try {
    const { schemaId, roles } = await seedSystem();
    const { rooms } = await seedOrg();
    await seedPeople(schemaId, roles);
    const { semesterId, subjects } = await seedAcademic();
    
    const teachers = await db.select().from(employee);
    await seedScheduling(semesterId, subjects, teachers, rooms);

    console.log("✨ SEEDING COMPLETED SUCCESSFULLY.");
    process.exit(0);
  } catch (error) {
    console.error("❌ SEEDING FAILED AT EXECUTION:", error);
    process.exit(1);
  }
};

main();
```

- [ ] **Step 2: Verify compilation**

Run: `npx tsc src/db/seed.ts --noEmit --esModuleInterop --skipLibCheck` (or similar check)

- [ ] **Step 3: Commit changes**

```bash
git add src/db/seed.ts
git commit -m "feat: implement modular test data seeder orchestrator"
```
