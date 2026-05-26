# Database Clearing Utility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a utility to clear specific database tables using TRUNCATE with CASCADE and RESTART IDENTITY.

**Architecture:** A standalone script in `src/db/seeders/clear.ts` that uses Drizzle ORM to execute a raw SQL TRUNCATE command. It can be run as a module or directly.

**Tech Stack:** Drizzle ORM, PostgreSQL, tsx.

---

### Task 1: Create the Clearing Utility

**Files:**
- Create: `src/db/seeders/clear.ts`

- [ ] **Step 1: Write the implementation**

```typescript
import { db } from "../index";
import { sql } from "drizzle-orm";

export const clearDatabase = async () => {
  console.log("🧹 Clearing database...");

  const tables = [
    '"users"."student"',
    '"users"."employee"',
    '"users"."profile"',
    '"users"."profile_schema_field"',
    '"users"."profile_field"',
    '"users"."profile_section"',
    '"users"."profile_schema"',
    '"course"."enrollment"',
    '"course"."course_class"',
    '"course"."main_class"',
    '"schedule"."schedule"',
    '"schedule"."weekly_template"',
    '"schedule"."room"',
    '"schedule"."building"',
    '"academic"."department"',
    '"academic"."major"',
    '"academic"."subject"',
    '"academic"."semester"',
    '"auth"."user_system_role"',
    '"auth"."system_role"',
    '"auth"."account"',
    '"system"."onboarding_session"',
    '"system"."system_audit_log"',
  ];

  try {
    const query = sql.raw(`TRUNCATE TABLE ${tables.join(", ")} RESTART IDENTITY CASCADE`);
    await db.execute(query);
    console.log("✅ Database cleared successfully.");
  } catch (error) {
    console.error("❌ Failed to clear database:", error);
    throw error;
  }
};

// Check if file is being run directly
const isMain = import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/'));

if (isMain) {
  clearDatabase()
    .then(() => {
      console.log("👋 Done.");
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
```

- [ ] **Step 2: Verify file creation**

Run: `ls src/db/seeders/clear.ts`
Expected: File exists and has correct content.

- [ ] **Step 3: Commit the new file**

```bash
git add src/db/seeders/clear.ts docs/superpowers/specs/2026-05-26-database-clearing-utility-design.md
git commit -m "feat: add database clearing utility for test data seeder"
```

---

### Task 2: Update Package Scripts (Optional but recommended)

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add db:clear script**

```json
"db:clear": "tsx src/db/seeders/clear.ts"
```

- [ ] **Step 2: Commit package.json**

```bash
git add package.json
git commit -m "chore: add db:clear script to package.json"
```
