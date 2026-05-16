# Database Migration & Schema Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `profile_section` table and update `profile_schema_field` to support hierarchical profile structure.

**Architecture:** Moving from a flat list of fields to a hierarchical structure with Sections. `profile_section` will group fields within a `profile_schema`.

**Tech Stack:** Drizzle ORM, PostgreSQL.

---

### Task 1: Update Schema in `src/db/schemas/user.ts`

**Files:**
- Modify: `src/db/schemas/user.ts`

- [ ] **Step 1: Add `profileSection` table definition**
Add `profileSection` table and its Zod schemas at the end of `src/db/schemas/user.ts`.

```typescript
export const profileSection = usersSchema.table("profile_section", {
  id: bigserial({ mode: "number" }).primaryKey().notNull(),
  schemaId: bigint("schema_id", { mode: "number" }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  order: integer().default(0).notNull(),
  createAt: timestamp("create_at", { withTimezone: true, mode: "string" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updateAt: timestamp("update_at", { withTimezone: true, mode: "string" }),
}, (table) => [
  foreignKey({
    columns: [table.schemaId],
    foreignColumns: [profileSchema.id],
    name: "fk_profile_section_schema_id",
  }),
]);

export const insertProfileSection = createInsertSchema(profileSection);
export const selectProfileSection = createSelectSchema(profileSection);
```

- [ ] **Step 2: Update `profileSchemaField` table definition**
Modify `profileSchemaField` to add `sectionId` and `order`.

```typescript
export const profileSchemaField = usersSchema.table(
  "profile_schema_field",
  {
    fieldId: bigint("field_id", { mode: "number" }).notNull(),
    schemaId: bigint("schema_id", { mode: "number" }).notNull(),
    sectionId: bigint("section_id", { mode: "number" }), // Nullable initially for migration
    order: integer().default(0).notNull(),
    isRequired: boolean("is_required").default(false).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.fieldId],
      foreignColumns: [profileField.id],
      name: "fk_profile_schema_field_field_id_profile_field_id",
    }),
    foreignKey({
      columns: [table.schemaId],
      foreignColumns: [profileSchema.id],
      name: "fk_profile_schema_field_schema_id_profile_schema_id",
    }),
    foreignKey({
      columns: [table.sectionId],
      foreignColumns: [profileSection.id],
      name: "fk_profile_schema_field_section_id",
    }),
    primaryKey({
      columns: [table.fieldId, table.schemaId],
      name: "profile_schema_field_pkey",
    }),
  ],
);
```

### Task 2: Database Migration

- [ ] **Step 1: Generate migration**
Run: `npx drizzle-kit generate`
Expected: A new SQL migration file is created in `drizzle/`.

- [ ] **Step 2: Push migration to database**
Run: `npx drizzle-kit push`
Expected: Database schema is updated successfully.

### Task 3: Verification & Commit

- [ ] **Step 1: Verify schema changes**
Run a simple script or check `drizzle/` snapshots to ensure the schema matches expectations. (Since `npx drizzle-kit push` succeeds, it's usually enough).

- [ ] **Step 2: Commit changes**
Run:
```bash
git add src/db/schemas/user.ts
git commit -m "db: add profile_section table and structure fields"
```
