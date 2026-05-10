"use client";

import { ColumnDef } from "@tanstack/react-table";
import { RoomRowActions } from "@/components/features/academic/RoomRowActions";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Building {
  id: number;
  code: string;
  name: string | null;
  des: string | null;
}

interface Room {
  id: number;
  code: string;
  buildingId: number;
  capacity: number | null;
  type: string | null;
  building?: Building | null;
}

export const getColumns = (buildings: Building[]): ColumnDef<Room>[] => [
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
