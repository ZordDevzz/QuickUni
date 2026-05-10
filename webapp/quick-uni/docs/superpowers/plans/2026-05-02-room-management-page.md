# Room Management Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement CRUD functionality for Buildings and Rooms to support the scheduling system's facility constraints.

**Architecture:** Create a server-side rendered page for Rooms that uses a client-side DataTable for display and management. The page will fetch data using server actions and provide buttons for creating and managing rooms.

**Tech Stack:** Next.js, TanStack Table, Lucide React, Tailwind CSS, Shadcn UI.

---

### Task 1: Implement columns definition

**Files:**
- Create: `src/app/[locale]/admin/academic/rooms/columns.tsx`

- [ ] **Step 1: Create columns.tsx**

```tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { RoomRowActions } from "@/components/features/academic/RoomRowActions";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export const getColumns = (buildings: any[]): ColumnDef<any>[] => [
  {
    accessorKey: "code",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Code
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "building",
    header: "Building",
    cell: ({ row }) => row.original.building?.code || "N/A",
  },
  {
    accessorKey: "capacity",
    header: "Capacity",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    id: "actions",
    cell: ({ row }) => <div className="text-right"><RoomRowActions room={row.original} buildings={buildings} /></div>,
  },
];
```

- [ ] **Step 2: Verify compilation**

Run: `npx tsc --noEmit src/app/[locale]/admin/academic/rooms/columns.tsx`
Expected: Success

---

### Task 2: Implement RoomTable component

**Files:**
- Create: `src/app/[locale]/admin/academic/rooms/RoomTable.tsx`

- [ ] **Step 1: Create RoomTable.tsx**

```tsx
"use client";

import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { useMemo } from "react";

export function RoomTable({ data, buildings }: { data: any[], buildings: any[] }) {
  const columns = useMemo(() => getColumns(buildings), [buildings]);
  return <DataTable columns={columns} data={data} searchKey="code" />;
}
```

- [ ] **Step 2: Verify compilation**

Run: `npx tsc --noEmit src/app/[locale]/admin/academic/rooms/RoomTable.tsx`
Expected: Success

---

### Task 3: Implement Rooms Page

**Files:**
- Create: `src/app/[locale]/admin/academic/rooms/page.tsx`

- [ ] **Step 1: Create page.tsx**

```tsx
import { getRoomsWithBuildings, getBuildings } from "@/actions/facility";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateRoomButton } from "@/components/features/academic/CreateRoomButton";
import { RoomTable } from "./RoomTable";

export default async function RoomsPage() {
  const rooms = await getRoomsWithBuildings();
  const buildings = await getBuildings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Rooms</h2>
        <CreateRoomButton buildings={buildings} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          <RoomTable data={rooms} buildings={buildings} />
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Verify compilation**

Run: `npx tsc --noEmit src/app/[locale]/admin/academic/rooms/page.tsx`
Expected: Success

---

### Task 4: Final Verification and Commit

- [ ] **Step 1: Run full lint check**

Run: `npm run lint`
Expected: Success

- [ ] **Step 2: Commit changes**

```bash
git add src/app/[locale]/admin/academic/rooms/*.tsx
git commit -m "feat: add Room management page"
```
