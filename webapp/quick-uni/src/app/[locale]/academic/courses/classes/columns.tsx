"use client";

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CourseClassRowActions } from "@/components/features/academic/CourseClassRowActions";
import { Dependencies } from "@/components/features/academic/CourseClassForm";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getColumns = (dependencies: Dependencies, t: any): ColumnDef<any>[] => [
  {
    accessorKey: "code",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {t("ClassCode")}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "subject",
    header: t("Subject"),
    cell: ({ row }) => {
      const subject = row.original.subject;
      return subject ? `${subject.code} - ${subject.name}` : "N/A";
    }
  },
  {
    accessorKey: "teacher",
    header: t("Teacher"),
    cell: ({ row }) => {
      const emp = row.original.employee;
      return emp?.profile?.fullname || emp?.code || "N/A";
    }
  },
  {
    accessorKey: "semester",
    header: t("Semester"),
    cell: ({ row }) => row.original.semester?.name || "N/A",
  },
  {
    accessorKey: "cap",
    header: t("Capacity"),
    cell: ({ row }) => `${row.original.currentSlot} / ${row.original.cap}`,
  },
  {
    accessorKey: "status",
    header: t("Status"),
    cell: ({ row }) => {
      const status = row.original.status as string;
      const statusLabel =
        status === "opened"
          ? t("Opened")
          : status === "closed"
          ? t("Closed")
          : status === "cancelled"
          ? t("Cancelled")
          : status;
      return (
        <Badge variant={status === 'opened' ? 'success' : status === 'closed' ? 'secondary' : 'destructive'}>
          {statusLabel}
        </Badge>
      );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => <div className="text-right"><CourseClassRowActions courseClass={row.original} dependencies={dependencies} /></div>,
  },
];
