# Profile Structure Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Profile Structure management into a unified Master-Detail Workspace with hierarchical sections and drag-and-drop support.

**Architecture:** 
- New `profile_section` table for grouping.
- Enhanced `profile_schema_field` for ordering and section assignment.
- Unified React Workspace at `/admin/profiles/structure` using `@dnd-kit`.
- Batch update server action for efficient structure persistence.

**Tech Stack:** Next.js (App Router), Drizzle ORM, PostgreSQL, `@dnd-kit/core`, `@dnd-kit/sortable`, TanStack Table (optional, mostly custom DND list), Tailwind CSS.

---

### Task 1: Database Migration & Schema Update

**Files:**
- Modify: `src/db/schemas/user.ts`

- [ ] **Step 1: Define `profile_section` table**

```typescript
// Add to src/db/schemas/user.ts
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

- [ ] **Step 2: Update `profile_schema_field` table**

```typescript
// Modify src/db/schemas/user.ts
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
    // ... existing FKs ...
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

- [ ] **Step 3: Generate and run migration**

Run: `npx drizzle-kit generate && npx drizzle-kit push`
Expected: Database updated with new table and columns.

- [ ] **Step 4: Commit**

```bash
git add src/db/schemas/user.ts
git commit -m "db: add profile_section table and structure fields"
```

---

### Task 2: Validators & Server Actions for Structure

**Files:**
- Create: `src/lib/validators/profile-structure.ts`
- Create: `src/actions/profile-structure.ts`

- [ ] **Step 1: Create validators for Sections and Batch Updates**

```typescript
import { z } from "zod";

export const profileSectionValidator = z.object({
  name: z.string().min(1),
  schemaId: z.number(),
  order: z.number(),
});

export const structureBatchUpdateValidator = z.object({
  schemaId: z.number(),
  sections: z.array(z.object({
    id: z.number().optional(), // New sections won't have ID
    name: z.string(),
    order: z.number(),
    fields: z.array(z.object({
      fieldId: z.number(),
      order: z.number(),
      isRequired: z.boolean(),
    })),
  })),
});
```

- [ ] **Step 2: Implement `updateProfileStructureAction`**

```typescript
"use server";
import { db } from "@/db";
import { profileSection, profileSchemaField } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateProfileStructureAction(data: any) {
  const validated = structureBatchUpdateValidator.parse(data);
  return await db.transaction(async (tx) => {
    for (const section of validated.sections) {
      let sId = section.id;
      if (!sId) {
        const [newSec] = await tx.insert(profileSection).values({
          name: section.name,
          schemaId: validated.schemaId,
          order: section.order,
        }).returning();
        sId = newSec.id;
      } else {
        await tx.update(profileSection).set({
          name: section.name,
          order: section.order,
          updateAt: new Date().toISOString(),
        }).where(eq(profileSection.id, sId));
      }

      // Update fields for this section
      for (const field of section.fields) {
        await tx.insert(profileSchemaField).values({
          schemaId: validated.schemaId,
          fieldId: field.fieldId,
          sectionId: sId,
          order: field.order,
          isRequired: field.isRequired,
        }).onConflictDoUpdate({
          target: [profileSchemaField.fieldId, profileSchemaField.schemaId],
          set: { sectionId: sId, order: field.order, isRequired: field.isRequired },
        });
      }
    }
    revalidatePath("/admin/profiles/structure");
    return { success: true };
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/validators/profile-structure.ts src/actions/profile-structure.ts
git commit -m "feat: add validators and server actions for profile structure"
```

---

### Task 4: Workspace UI Shell & Master Sidebar

**Files:**
- Create: `src/app/[locale]/admin/profiles/structure/page.tsx`
- Create: `src/components/features/admin/profiles/StructureWorkspace.tsx`

- [ ] **Step 1: Implement the main page and Sidebar**
Fetch schemas and pass to the client component.

```typescript
// src/app/[locale]/admin/profiles/structure/page.tsx
export default async function StructurePage() {
  const schemas = await db.query.profileSchema.findMany();
  return <StructureWorkspace schemas={schemas} />;
}
```

- [ ] **Step 2: Build the Sidebar for Schema selection**

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/admin/profiles/structure/page.tsx src/components/features/admin/profiles/StructureWorkspace.tsx
git commit -m "feat: add profile structure workspace shell"
```

---

### Task 5: Drag-and-Drop Canvas (Sections & Fields)

**Files:**
- Create: `src/components/features/admin/profiles/SectionCard.tsx`
- Modify: `src/components/features/admin/profiles/StructureWorkspace.tsx`

- [ ] **Step 1: Integrate `@dnd-kit` for Section reordering**

- [ ] **Step 2: Implement nested Field reordering within Sections**

- [ ] **Step 3: Add "Add Section" and "Add Field" buttons**

- [ ] **Step 4: Commit**

```bash
git add src/components/features/admin/profiles/SectionCard.tsx
git commit -m "feat: implement drag-and-drop for sections and fields"
```

---

### Task 6: Property Drawer & Final Polish

**Files:**
- Create: `src/components/features/admin/profiles/PropertyDrawer.tsx`

- [ ] **Step 1: Implement Field property editing in Drawer**

- [ ] **Step 2: Implement "Save" logic using `updateProfileStructureAction`**

- [ ] **Step 3: Add loading states and success toasts**

- [ ] **Step 4: Commit**

```bash
git add src/components/features/admin/profiles/PropertyDrawer.tsx
git commit -m "feat: add property drawer and finalize workspace"
```
