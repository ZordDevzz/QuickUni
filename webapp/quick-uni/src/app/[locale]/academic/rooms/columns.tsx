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
  isAvailable: boolean;
  building?: Building | null;
}

import { useTranslations } from "next-intl";

export const getColumns = (buildings: Building[]): ColumnDef<Room>[] => [
  {
    accessorKey: "code",
    header: ({ column }) => {
      const t = useTranslations("Admin");
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          {t("Code")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "building",
    header: () => {
      const t = useTranslations("Admin");
      return t("Building");
    },
    cell: ({ row }) => row.original.building?.code || "N/A",
  },
  {
    accessorKey: "capacity",
    header: () => {
      const t = useTranslations("Admin");
      return t("Capacity");
    },
  },
  {
    accessorKey: "type",
    header: () => {
      const t = useTranslations("Admin");
      return t("Type");
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <div className="text-right"><RoomRowActions room={row.original} buildings={buildings} /></div>,
  },
];
