"use client";

import { useTranslations } from "next-intl";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface RequestListProps {
  requests: unknown[];
}

export default function RequestList({ requests }: RequestListProps) {
  const t = useTranslations("Student.Requests");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "type",
      header: t("Type"),
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        // Translate type if needed, or just show raw string
        return type === 'student_absence' ? t("Wizard.StudentAbsence") : 
               type === 'class_cancellation' ? t("Wizard.ClassCancellation") : 
               type;
      }
    },
    {
      accessorKey: "status",
      header: t("Status"),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline" | "success"> = {
          pending: "secondary",
          approved: "success",
          rejected: "destructive",
          cancelled: "outline",
        };
        // Note: Shadcn Badge doesn't have "success" by default usually, 
        // I might need to check badge.tsx or just use default/outline
        return <Badge variant={variants[status] || "default"}>{status}</Badge>;
      }
    },
    {
      accessorKey: "createAt",
      header: t("CreatedAt"),
      cell: ({ row }) => {
        const date = new Date(row.getValue("createAt"));
        return date.toLocaleString();
      }
    },
    {
      id: "actions",
      header: t("Actions"),
// eslint-disable-next-line @typescript-eslint/no-unused-vars
      cell: ({ row }) => {
        return (
          <Button variant="ghost" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
        );
      }
    }
  ];

  return (
    <DataTable 
      columns={columns} 
      data={requests} 
      searchKey="type"
      searchPlaceholder={t("Type")}
    />
  );
}
