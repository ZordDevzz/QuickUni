"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export type TeacherClass = {
  id: string;
  code: string;
  cap: number;
  currentSlot: number;
  status: string | null;
  subject: {
    code: string;
    name: string | null;
  };
};

export const useTeacherClassColumns = (): ColumnDef<TeacherClass>[] => {
  const t = useTranslations("Teacher");

  return [
    {
      accessorKey: "code",
      header: t("ClassCode"),
      cell: ({ row }) => (
        <Link 
          href={`/teacher/classes/${row.original.id}`}
          className="font-medium text-primary hover:underline"
        >
          {row.getValue("code")}
        </Link>
      ),
    },
    {
      accessorKey: "subject.name",
      header: t("Subject"),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.subject.name}</div>
          <div className="text-xs text-muted-foreground">{row.original.subject.code}</div>
        </div>
      ),
    },
    {
      accessorKey: "cap",
      header: t("Capacity"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span>{row.original.currentSlot} / {row.original.cap}</span>
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
            <div 
              className="h-full bg-primary" 
              style={{ width: `${Math.min(100, (row.original.currentSlot / row.original.cap) * 100)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: t("Status"),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={status === "opened" ? "default" : "secondary"}>
            {status}
          </Badge>
        );
      },
    },
  ];
};
