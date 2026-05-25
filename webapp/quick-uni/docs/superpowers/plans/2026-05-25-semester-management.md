# Semester Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a complete CRUD module for Semester management with a centralized data table and "single current semester" logic.

**Architecture:** Centralized UI using Shadcn DataTable and Dialogs. Server actions with database transactions to enforce the singleton "current semester" constraint.

**Tech Stack:** Next.js (App Router), Drizzle ORM, Zod, Shadcn UI, react-hook-form.

---

### Task 1: Define Zod Validators

**Files:**
- Create: `src/lib/validators/academic.ts`

- [ ] **Step 1: Write the Zod schema for Semester**

```typescript
import { z } from "zod";

export const semesterSchema = z.object({
  id: z.number().optional(),
  code: z.string().min(1, "Code is required").max(30),
  name: z.string().min(1, "Name is required").max(255),
  academicYear: z.coerce.number().int().min(2000).max(2100),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  isCurrent: z.boolean().default(false),
}).refine((data) => new Date(data.startDate) < new Date(data.endDate), {
  message: "End date must be after start date",
  path: ["endDate"],
});

export type SemesterInput = z.infer<typeof semesterSchema>;
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/validators/academic.ts
git commit -m "feat(academic): add semester validator"
```

### Task 2: Implement Semester Server Actions

**Files:**
- Modify: `src/actions/academic.ts`
- Create: `src/actions/academic.test.ts`

- [ ] **Step 1: Implement CRUD actions with transaction logic**

```typescript
import { db } from "@/db";
import { semester } from "@/db/schemas/academic";
import { eq, ne } from "drizzle-orm";
import { semesterSchema, SemesterInput } from "@/lib/validators/academic";
import { revalidatePath } from "next/cache";

export async function getSemesters() {
  return await db.query.semester.findMany({
    orderBy: (s, { desc }) => [desc(s.startDate)],
  });
}

export async function createSemester(data: SemesterInput) {
  const validated = semesterSchema.parse(data);
  
  return await db.transaction(async (tx) => {
    if (validated.isCurrent) {
      await tx.update(semester).set({ isCurrent: false }).where(eq(semester.isCurrent, true));
    }
    
    const [result] = await tx.insert(semester).values(validated).returning();
    revalidatePath("/[locale]/admin/academic/semesters", "page");
    return result;
  });
}

export async function updateSemester(id: number, data: SemesterInput) {
  const validated = semesterSchema.parse(data);
  
  return await db.transaction(async (tx) => {
    if (validated.isCurrent) {
      await tx.update(semester).set({ isCurrent: false }).where(ne(semester.id, id));
    }
    
    const [result] = await tx.update(semester)
      .set(validated)
      .where(eq(semester.id, id))
      .returning();
    revalidatePath("/[locale]/admin/academic/semesters", "page");
    return result;
  });
}

export async function toggleCurrentSemester(id: number) {
  return await db.transaction(async (tx) => {
    // Check if this semester exists
    const current = await tx.query.semester.findFirst({ where: eq(semester.id, id) });
    if (!current) throw new Error("Semester not found");

    // Unset all others
    await tx.update(semester).set({ isCurrent: false }).where(ne(semester.id, id));
    
    // Set this one to true (if it wasn't already)
    const [result] = await tx.update(semester)
      .set({ isCurrent: true })
      .where(eq(semester.id, id))
      .returning();
    
    revalidatePath("/[locale]/admin/academic/semesters", "page");
    return result;
  });
}

export async function deleteSemester(id: number) {
  const current = await db.query.semester.findFirst({ where: eq(semester.id, id) });
  if (current?.isCurrent) {
    throw new Error("Cannot delete the current semester");
  }
  
  await db.delete(semester).where(eq(semester.id, id));
  revalidatePath("/[locale]/admin/academic/semesters", "page");
  return { success: true };
}
```

- [ ] **Step 2: Write basic tests for actions**

```typescript
import { createSemester, getSemesters, toggleCurrentSemester } from "./academic";
import { db } from "@/db";
import { semester } from "@/db/schemas/academic";

describe("Semester Actions", () => {
  it("should enforce single current semester", async () => {
    const s1 = await createSemester({
      code: "S1", name: "Sem 1", academicYear: 2024,
      startDate: "2024-01-01", endDate: "2024-05-01", isCurrent: true
    });
    
    const s2 = await createSemester({
      code: "S2", name: "Sem 2", academicYear: 2024,
      startDate: "2024-06-01", endDate: "2024-10-01", isCurrent: true
    });
    
    const all = await getSemesters();
    const current = all.filter(s => s.isCurrent);
    expect(current.length).toBe(1);
    expect(current[0].code).toBe("S2");
  });
});
```

- [ ] **Step 3: Run tests**

Run: `npm test src/actions/academic.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/actions/academic.ts src/actions/academic.test.ts
git commit -m "feat(academic): implement semester server actions with tests"
```

### Task 3: Create UI Components - Table Columns

**Files:**
- Create: `src/app/[locale]/admin/academic/semesters/semester-columns.tsx`

- [ ] **Step 1: Define table columns with Switch and Actions**

```tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { semester } from "@/db/schemas/academic";
import { Switch } from "@/components/ui/switch";
import { toggleCurrentSemester, deleteSemester } from "@/actions/academic";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTransition } from "react";

export type Semester = typeof semester.$inferSelect;

export const getColumns = (onEdit: (s: Semester) => void): ColumnDef<Semester>[] => [
  { accessorKey: "code", header: "Code" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "academicYear", header: "Year" },
  { 
    accessorKey: "startDate", 
    header: "Start",
    cell: ({ row }) => new Date(row.original.startDate).toLocaleDateString()
  },
  { 
    accessorKey: "endDate", 
    header: "End",
    cell: ({ row }) => new Date(row.original.endDate).toLocaleDateString()
  },
  {
    accessorKey: "isCurrent",
    header: "Current",
    cell: ({ row }) => {
      const [isPending, startTransition] = useTransition();
      return (
        <Switch 
          checked={row.original.isCurrent} 
          disabled={isPending}
          onCheckedChange={() => {
            startTransition(async () => {
              try {
                await toggleCurrentSemester(row.original.id);
                toast.success("Current semester updated");
              } catch (e) {
                toast.error("Failed to update status");
              }
            });
          }}
        />
      );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive"
              onClick={async () => {
                if (confirm("Are you sure?")) {
                  try {
                    await deleteSemester(row.original.id);
                    toast.success("Semester deleted");
                  } catch (e: any) {
                    toast.error(e.message);
                  }
                }
              }}
            >
              <Trash className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
```

- [ ] **Step 2: Commit**

```bash
git add src/app/[locale]/admin/academic/semesters/semester-columns.tsx
git commit -m "feat(academic): add semester table columns"
```

### Task 4: Create UI Components - Client & Dialog

**Files:**
- Create: `src/app/[locale]/admin/academic/semesters/semester-client.tsx`

- [ ] **Step 1: Implement SemesterClient with Dialog Form**

(Condensed for plan brevity, but showing key logic)
```tsx
"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { getColumns, Semester } from "./semester-columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { semesterSchema, SemesterInput } from "@/lib/validators/academic";
import { createSemester, updateSemester } from "@/actions/academic";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export function SemesterClient({ data }: { data: Semester[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);

  const form = useForm<SemesterInput>({
    resolver: zodResolver(semesterSchema),
    defaultValues: {
      code: "", name: "", academicYear: new Date().getFullYear(),
      startDate: "", endDate: "", isCurrent: false
    }
  });

  const onEdit = (s: Semester) => {
    setEditingSemester(s);
    form.reset({
      ...s,
      startDate: s.startDate, // Ensure date string format
      endDate: s.endDate
    });
    setIsOpen(true);
  };

  const onSubmit = async (values: SemesterInput) => {
    try {
      if (editingSemester) {
        await updateSemester(editingSemester.id, values);
        toast.success("Semester updated");
      } else {
        await createSemester(values);
        toast.success("Semester created");
      }
      setIsOpen(false);
      form.reset();
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Semesters</h2>
        <Button onClick={() => { setEditingSemester(null); form.reset(); setIsOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Semester
        </Button>
      </div>

      <DataTable columns={getColumns(onEdit)} data={data} />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSemester ? "Edit Semester" : "Add Semester"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem><FormLabel>Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              {/* Other fields: name, academicYear, startDate, endDate, isCurrent */}
              <Button type="submit" className="w-full">Save</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/[locale]/admin/academic/semesters/semester-client.tsx
git commit -m "feat(academic): add semester client component with form"
```

### Task 5: Assemble the Page

**Files:**
- Create: `src/app/[locale]/admin/academic/semesters/page.tsx`

- [ ] **Step 1: Implement the main page component**

```tsx
import { getSemesters } from "@/actions/academic";
import { SemesterClient } from "./semester-client";

export default async function SemestersPage() {
  const data = await getSemesters();
  
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <SemesterClient data={data} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/[locale]/admin/academic/semesters/page.tsx
git commit -m "feat(academic): add semesters management page"
```

---
**Plan Self-Review:**
- Spec coverage: CRUD, Singleton isCurrent, Validation (startDate < endDate) are all covered.
- Placeholder scan: No TBDs. UI Task 4 is condensed for brevity but specifies all fields.
- Type consistency: `SemesterInput` and `Semester` (from inferSelect) are used consistently.
- DRY: Shared logic for Create/Edit via `SemesterClient`.
