"use client";

import { ColumnDef } from "@tanstack/react-table";
import { subject } from "@/db/schemas/academic";
import { deleteSubject } from "@/actions/academic";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type SubjectWithRelations = typeof subject.$inferSelect & {
  subjectPrerequisites_subjectId: {
    prerequisiteId: string;
    type: string | null;
    subject_prerequisiteId: typeof subject.$inferSelect;
  }[];
};

export const getColumns = (
  onEdit: (s: SubjectWithRelations) => void,
  t: (key: string, values?: any) => string
): ColumnDef<SubjectWithRelations>[] => [
  {
    accessorKey: "code",
    header: t("Code"),
    cell: ({ row }) => (
      <span className="font-mono font-bold text-foreground bg-muted/50 px-2 py-1 rounded select-all">
        {row.original.code}
      </span>
    ),
  },
  {
    accessorKey: "name",
    header: t("Name"),
    cell: ({ row }) => <span className="font-semibold">{row.original.name}</span>,
  },
  {
    accessorKey: "credits",
    header: t("Credits"),
    cell: ({ row }) => (
      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary">
        {row.original.credits} {row.original.credits > 1 ? "credits" : "credit"}
      </span>
    ),
  },
  {
    accessorKey: "recommendedSemesterIndex",
    header: t("RecommendedSemester"),
    cell: ({ row }) => row.original.recommendedSemesterIndex || "-",
  },
  {
    id: "prerequisites",
    header: t("Prerequisites"),
    cell: ({ row }) => {
      const prerequisites = row.original.subjectPrerequisites_subjectId;
      if (!prerequisites || prerequisites.length === 0) {
        return <span className="text-muted-foreground text-xs">{t("NoPrerequisites")}</span>;
      }

      return (
        <div className="flex flex-wrap gap-1.5 max-w-[300px]">
          {prerequisites.map((p) => {
            const reqSubject = p.subject_prerequisiteId;
            if (!reqSubject) return null;
            const isPre = p.type !== "COREQUISITE";

            return (
              <Badge
                key={p.prerequisiteId}
                variant="secondary"
                className={
                  isPre
                    ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/10 border-blue-500/20"
                    : "bg-purple-500/10 text-purple-700 dark:text-purple-400 hover:bg-purple-500/10 border-purple-500/20"
                }
              >
                {reqSubject.code} ({isPre ? t("Prerequisite") : t("Corequisite")})
              </Badge>
            );
          })}
        </div>
      );
    },
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
              <Pencil className="mr-2 h-4 w-4" /> {t("Save") === "Lưu" ? "Sửa" : "Edit"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={async () => {
                if (confirm(t("DeleteDescription", { name: row.original.name }))) {
                  try {
                    await deleteSubject(row.original.id);
                    toast.success(t("DeleteSuccess"));
                  } catch (e: unknown) {
                    const errorMessage = e instanceof Error ? e.message : "Failed to delete subject";
                    toast.error(errorMessage);
                  }
                }
              }}
            >
              <Trash className="mr-2 h-4 w-4" /> {t("Save") === "Lưu" ? "Xóa" : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
