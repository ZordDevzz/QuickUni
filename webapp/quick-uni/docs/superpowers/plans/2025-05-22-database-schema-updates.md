# Database Schema Updates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add missing foreign key constraints and indexes to the scheduling system schema to ensure data integrity and improve query performance.

**Architecture:** Update Drizzle ORM schema definitions in `src/db/schemas/schedule.ts`.

**Tech Stack:** Drizzle ORM, PostgreSQL.

---

### Task 1: Update `availability` table index

**Files:**
- Modify: `src/db/schemas/schedule.ts`

- [ ] **Step 1: Add index to `availability` table**

Update the `availability` table definition to include an index on `entityId` and `entityType`.

```typescript
export const availability = scheduleSchema.table("availability", {
  id: uuid().primaryKey().defaultRandom(),
  entityId: uuid("entity_id").notNull(),
  entityType: availabilityEntityType("entity_type").notNull(),
  dayOfWeek: smallint("day_of_week").notNull(), // 0-6
  occupiedMask: integer("occupied_mask").default(0).notNull(),
}, (table) => [
  index("availability_entity_idx").on(table.entityId, table.entityType),
]);
```

- [ ] **Step 2: Commit**

```bash
git add src/db/schemas/schedule.ts
git commit -m "fix(schema): add index to availability table"
```

### Task 2: Update `weeklyTemplate` table constraints

**Files:**
- Modify: `src/db/schemas/schedule.ts`

- [ ] **Step 1: Add foreign keys to `weeklyTemplate` table**

Update the `weeklyTemplate` table definition to include foreign key constraints for `courseClassId` and `roomId`.

```typescript
export const weeklyTemplate = scheduleSchema.table("weekly_template", {
  id: uuid().primaryKey().defaultRandom(),
  courseClassId: uuid("course_class_id").notNull(),
  roomId: smallint("room_id").notNull(),
  dayOfWeek: smallint("day_of_week").notNull(),
  startPeriod: smallint("start_period").notNull(),
  endPeriod: smallint("end_period").notNull(),
  occupyMask: integer("occupy_mask").notNull(),
}, (table) => [
  foreignKey({
    columns: [table.courseClassId],
    foreignColumns: [courseClass.id],
    name: "fk_weekly_template_course_class_id_course_class_id",
  }),
  foreignKey({
    columns: [table.roomId],
    foreignColumns: [room.id],
    name: "fk_weekly_template_room_id_room_id",
  }),
]);
```

- [ ] **Step 2: Verify implementation**

Run type check to ensure no errors.
Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/db/schemas/schedule.ts
git commit -m "fix(schema): add foreign keys to weekly_template table"
```
