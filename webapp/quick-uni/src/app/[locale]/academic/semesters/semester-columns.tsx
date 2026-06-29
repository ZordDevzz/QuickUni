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
import { useTranslations } from "next-intl";

export type Semester = typeof semester.$inferSelect;

function CurrentSemesterSwitch({ semester: s }: { semester: Semester }) {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("Semesters");
  
  return (
    <Switch 
      checked={s.isCurrent || false} 
      disabled={isPending}
      onCheckedChange={() => {
        startTransition(async () => {
          try {
            await toggleCurrentSemester(s.id);
            toast.success(t("CurrentSemesterUpdated"));
          } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : t("FailedToUpdateStatus");
            toast.error(errorMessage);
          }
        });
      }}
    />
  );
}

export const getColumns = (onEdit: (s: Semester) => void, t: any): ColumnDef<Semester>[] => [
  { accessorKey: "code", header: t("Code") },
  { accessorKey: "name", header: t("Name") },
  { accessorKey: "academicYear", header: t("Year") },
  { 
    accessorKey: "startDate", 
    header: t("StartDate"),
    cell: ({ row }) => new Date(row.original.startDate).toLocaleDateString()
  },
  { 
    accessorKey: "endDate", 
    header: t("EndDate"),
    cell: ({ row }) => new Date(row.original.endDate).toLocaleDateString()
  },
  {
    accessorKey: "isCurrent",
    header: t("IsCurrent"),
    cell: ({ row }) => <CurrentSemesterSwitch semester={row.original} />
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
              <Pencil className="mr-2 h-4 w-4" /> {t("Edit")}
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive"
              onClick={async () => {
                if (confirm(t("ConfirmDelete"))) {
                  try {
                    await deleteSemester(row.original.id);
                    toast.success(t("SemesterDeleted"));
                  } catch (e: unknown) {
                    const errorMessage = e instanceof Error ? e.message : t("FailedToDeleteSemester");
                    toast.error(errorMessage);
                  }
                }
              }}
            >
              <Trash className="mr-2 h-4 w-4" /> {t("Delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
