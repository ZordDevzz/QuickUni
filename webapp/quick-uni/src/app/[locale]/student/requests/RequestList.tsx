"use client";

import { useTranslations } from "next-intl";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

interface RequestListProps {
  requests: any[];
}

export default function RequestList({ requests }: RequestListProps) {
  const t = useTranslations("Student.Requests");
  const tWorkflow = useTranslations("Workflow");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "type",
      header: t("Type"),
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return tWorkflow(`Type.${type}`);
      }
    },
    {
      accessorKey: "classCode",
      header: tWorkflow("DetailLabels.ClassCode"),
      cell: ({ row }) => {
        const classCode = row.original.classCode as string;
        const subjectName = row.original.subjectName as string;
        if (!classCode) return <span className="text-muted-foreground">N/A</span>;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-sm truncate max-w-[200px]">{subjectName}</span>
            <span className="text-xs text-muted-foreground">{classCode}</span>
          </div>
        );
      }
    },
    {
      accessorKey: "status",
      header: t("Status"),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variants: Record<string, "secondary" | "success" | "destructive" | "outline"> = {
          pending: "secondary",
          approved: "success",
          rejected: "destructive",
          cancelled: "outline",
        };
        return (
          <Badge variant={variants[status] || "default"}>
            {tWorkflow(`StatusLabel.${status}`)}
          </Badge>
        );
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
      cell: ({ row }) => {
        return (
          <Button variant="ghost" size="icon" onClick={() => setSelectedRequest(row.original)}>
            <Eye className="h-4 w-4" />
          </Button>
        );
      }
    }
  ];

  return (
    <>
      <DataTable 
        columns={columns} 
        data={requests} 
        searchKey="classCode"
        searchPlaceholder={tWorkflow("DetailLabels.ClassCode")}
      />

      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{tWorkflow("Details")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm font-medium text-muted-foreground">{tWorkflow("TypeHeader")}</span>
                <span className="text-sm font-semibold">{selectedRequest ? tWorkflow(`Type.${selectedRequest.type}`) : ""}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm font-medium text-muted-foreground">{tWorkflow("StatusHeader")}</span>
                {selectedRequest && (
                  <Badge variant={
                    selectedRequest.status === "pending" ? "secondary" :
                    selectedRequest.status === "approved" ? "success" :
                    selectedRequest.status === "rejected" ? "destructive" : "outline"
                  }>
                    {tWorkflow(`StatusLabel.${selectedRequest.status}`)}
                  </Badge>
                )}
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm font-medium text-muted-foreground">{tWorkflow("CreatedAt")}</span>
                <span className="text-sm text-foreground">{selectedRequest ? new Date(selectedRequest.createAt).toLocaleString() : ""}</span>
              </div>

              {selectedRequest?.classCode && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm font-medium text-muted-foreground">{tWorkflow("DetailLabels.ClassCode")}</span>
                  <span className="text-sm font-semibold text-foreground text-right max-w-[280px]">
                    {selectedRequest.subjectName} ({selectedRequest.classCode})
                  </span>
                </div>
              )}

              {selectedRequest?.type === 'student_absence' && selectedRequest?.data?.date && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm font-medium text-muted-foreground">{tWorkflow("DetailLabels.AbsenceDate")}</span>
                  <span className="text-sm font-medium text-foreground">{selectedRequest.data.date}</span>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">{tWorkflow("DetailLabels.Reason")}</span>
                <p className="text-sm bg-muted p-2.5 rounded-md text-foreground break-words min-h-[50px] whitespace-pre-wrap">
                  {selectedRequest?.data?.reason || "N/A"}
                </p>
              </div>

              {selectedRequest?.status !== 'pending' && (
                <div className="space-y-2 pt-2 border-t">
                  <span className="text-sm font-medium text-muted-foreground">{tWorkflow("Comment")}</span>
                  <p className="text-sm italic bg-accent/30 p-2.5 rounded-md text-foreground break-words min-h-[40px] whitespace-pre-wrap">
                    {selectedRequest?.comment || "N/A"}
                  </p>
                  {selectedRequest?.processedAt && (
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{tWorkflow("DetailLabels.ProcessedAt")}</span>
                      <span>{new Date(selectedRequest.processedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
              {tWorkflow("Close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
