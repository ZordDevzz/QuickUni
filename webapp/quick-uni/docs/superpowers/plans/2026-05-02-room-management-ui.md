# Room Management UI Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement CRUD functionality for Rooms to support the scheduling system's facility constraints.

**Architecture:** Create client-side React components using `@tanstack/react-form` for form management, `zod` for validation, and server actions for data persistence. UI is built with Shadcn components and dialogs.

**Tech Stack:** Next.js, React, @tanstack/react-form, Zod, Lucide-react, Shadcn UI.

---

### Task 1: Implement RoomForm Component

**Files:**
- Create: `src/components/features/academic/RoomForm.tsx`

- [ ] **Step 1: Create RoomForm.tsx**
  Implement the form component for creating and editing rooms.

```tsx
"use client";

import { useForm } from "@tanstack/react-form";
import { roomInsertSchema, roomUpdateSchema, RoomInsertInput, RoomUpdateInput } from "@/lib/validators/facility";
import { createRoomAction, updateRoomAction } from "@/actions/facility";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldContent } from "@/components/ui/field";
import { notify } from "@/lib/custom-toast";
import { useRouter } from "next/navigation";

interface RoomFormProps {
  room?: any;
  buildings: any[];
  onSuccess?: () => void;
}

export function RoomForm({ room, buildings, onSuccess }: RoomFormProps) {
  const router = useRouter();
  const isEdit = !!room;

  const form = useForm({
    defaultValues: {
      code: room?.code || "",
      buildingId: room?.buildingId || (buildings.length > 0 ? buildings[0].id : ""),
      capacity: room?.capacity || "",
      type: room?.type || "",
    },
    onSubmit: async ({ value }) => {
      try {
        const schema = isEdit ? roomUpdateSchema : roomInsertSchema;
        const validation = schema.safeParse(value);
        if (!validation.success) {
           notify(validation.error.issues[0]?.message || "Validation failed", { type: "error" });
           return;
        }

        let result;
        if (isEdit && room) {
          result = await updateRoomAction(room.id, validation.data as RoomUpdateInput);
        } else {
          result = await createRoomAction(validation.data as RoomInsertInput);
        }

        if (result.success) {
          notify("Success", { type: "success" });
          onSuccess?.();
          router.refresh();
        } else {
          notify(result.error || "Failed", { type: "error" });
        }
      } catch (error: any) {
        notify(error.message || "Failed", { type: "error" });
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field name="code">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Code</FieldLabel>
            <FieldContent>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </FieldContent>
          </Field>
        )}
      </form.Field>

      <form.Field name="buildingId">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Building</FieldLabel>
            <FieldContent>
              <select
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
                >
                  <option value="">Select Building</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.code} - {b.name}
                    </option>
                  ))}
                </select>
            </FieldContent>
          </Field>
        )}
      </form.Field>

      <form.Field name="capacity">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Capacity</FieldLabel>
            <FieldContent>
              <Input
                id={field.name}
                name={field.name}
                type="number"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value ? Number(e.target.value) : "")}
              />
            </FieldContent>
          </Field>
        )}
      </form.Field>
      
      <form.Field name="type">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Type</FieldLabel>
            <FieldContent>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </FieldContent>
          </Field>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/academic/RoomForm.tsx
git commit -m "feat: add RoomForm component"
```

### Task 2: Implement CreateRoomButton Component

**Files:**
- Create: `src/components/features/academic/CreateRoomButton.tsx`

- [ ] **Step 1: Create CreateRoomButton.tsx**
  Implement the button that opens a dialog to add a new room.

```tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RoomForm } from "./RoomForm";

export function CreateRoomButton({ buildings }: { buildings: any[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add Room
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Room</DialogTitle>
        </DialogHeader>
        <RoomForm buildings={buildings} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/academic/CreateRoomButton.tsx
git commit -m "feat: add CreateRoomButton component"
```

### Task 3: Implement RoomRowActions Component

**Files:**
- Create: `src/components/features/academic/RoomRowActions.tsx`

- [ ] **Step 1: Create RoomRowActions.tsx**
  Implement the row actions for editing and deleting rooms.

```tsx
"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RoomForm } from "./RoomForm";
import { deleteRoomAction } from "@/actions/facility";
import { notify } from "@/lib/custom-toast";

export function RoomRowActions({ room, buildings }: { room: any, buildings: any[] }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteRoomAction(room.id);
      if (result.success) {
        notify("Deleted successfully", { type: "success" });
      } else {
        notify(result.error || "Delete failed", { type: "error" });
      }
      setIsDeleteOpen(false);
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDeleteOpen(true)} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
          </DialogHeader>
          <RoomForm room={room} buildings={buildings} onSuccess={() => setIsEditOpen(false)} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/academic/RoomRowActions.tsx
git commit -m "feat: add RoomRowActions component"
```
