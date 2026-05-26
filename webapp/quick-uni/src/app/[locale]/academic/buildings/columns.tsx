"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BuildingRowActions } from "@/components/features/academic/BuildingRowActions";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const columns: ColumnDef<any>[] = [
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
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "des",
    header: "Description",
  },
  {
    id: "actions",
    cell: ({ row }) => <div className="text-right"><BuildingRowActions building={row.original} /></div>,
  },
];
