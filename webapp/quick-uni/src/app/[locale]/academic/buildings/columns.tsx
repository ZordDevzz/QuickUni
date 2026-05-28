"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BuildingRowActions } from "@/components/features/academic/BuildingRowActions";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useTranslations } from "next-intl";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const columns: ColumnDef<any>[] = [
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
    accessorKey: "name",
    header: () => {
      const t = useTranslations("Admin");
      return t("Name");
    },
  },
  {
    accessorKey: "des",
    header: () => {
      const t = useTranslations("Admin");
      return t("Description");
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <div className="text-right"><BuildingRowActions building={row.original} /></div>,
  },
];
