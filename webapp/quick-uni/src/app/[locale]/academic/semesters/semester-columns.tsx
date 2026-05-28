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
  
  return (
    <Switch 
      checked={s.isCurrent || false} 
      disabled={isPending}
      onCheckedChange={() => {
        startTransition(async () => {
          try {
            await toggleCurrentSemester(s.id);
            toast.success("Current semester updated");
          } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : "Failed to update status";
            toast.error(errorMessage);
          }
        });
      }}
    />
  );
}

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
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive"
              onClick={async () => {
                if (confirm("Are you sure?")) {
                  try {
                    await deleteSemester(row.original.id);
                    toast.success("Semester deleted");
                  } catch (e: unknown) {
                    const errorMessage = e instanceof Error ? e.message : "Failed to delete semester";
                    toast.error(errorMessage);
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
