"use client";

import { useTranslations } from "next-intl";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, Check, X } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { processRequest } from "@/actions/workflow";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

export default function AdminRequestList({ requests }: { requests: unknown[] }) {
  const t = useTranslations("Workflow");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [comment, setComment] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = async (status: 'approved' | 'rejected') => {
    if (!selectedRequest) return;
    setIsProcessing(true);
    try {
      await processRequest(selectedRequest.id, status, comment);
      toast.success(t(`Status.${status}`));
      setSelectedRequest(null);
      setComment("");
    } catch (error: unknown) {
      toast.error((error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "sender.fullname",
      header: t("Sender"),
    },
    {
      accessorKey: "type",
      header: t("TypeHeader"),
      cell: ({ row }) => t(`Type.${row.getValue("type")}`)
    },
    {
      accessorKey: "status",
      header: t("StatusHeader"),
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
            {t(`StatusLabel.${status}`)}
          </Badge>
        );
      }
    },
    {
      accessorKey: "createAt",
      header: t("CreatedAt"),
      cell: ({ row }) => new Date(row.getValue("createAt")).toLocaleString()
    },
    {
      id: "actions",
      header: t("Actions"),
      cell: ({ row }) => (
        <Button variant="ghost" size="icon" onClick={() => {
            setSelectedRequest(row.original);
            setComment(row.original.comment || "");
        }}>
          <Eye className="h-4 w-4" />
        </Button>
      )
    }
  ];

  return (
    <>
      <DataTable columns={columns} data={requests} searchKey="sender_fullname" />
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("ReviewTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm font-medium text-muted-foreground">{t("Sender")}</span>
                <span className="text-sm font-semibold">{selectedRequest?.sender?.fullname}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm font-medium text-muted-foreground">{t("TypeHeader")}</span>
                <span className="text-sm font-semibold">{selectedRequest ? t(`Type.${selectedRequest.type}`) : ""}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm font-medium text-muted-foreground">{t("CreatedAt")}</span>
                <span className="text-sm">{selectedRequest ? new Date(selectedRequest.createAt).toLocaleString() : ""}</span>
              </div>

              {/* Class withdrawals or Absence details */}
              {selectedRequest?.classCode && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm font-medium text-muted-foreground">{t("DetailLabels.ClassCode")}</span>
                  <span className="text-sm font-semibold text-right max-w-[280px]">
                    {selectedRequest.subjectName} ({selectedRequest.classCode})
                  </span>
                </div>
              )}

              {/* Leave absence date specific */}
              {selectedRequest?.type === 'student_absence' && selectedRequest?.data?.date && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm font-medium text-muted-foreground">{t("DetailLabels.AbsenceDate")}</span>
                  <span className="text-sm font-semibold">{selectedRequest.data.date}</span>
                </div>
              )}

              {/* Schedule changes proposed details */}
              {selectedRequest?.type === 'teacher_schedule_change' && selectedRequest?.data && (
                <div className="flex flex-col border-b pb-2 space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">{t("DetailLabels.NewSchedule")}</span>
                  <div className="grid grid-cols-3 gap-2 bg-muted p-2 rounded text-xs">
                    <div><strong>{t("DetailLabels.Date")}:</strong> {selectedRequest.data.newDate}</div>
                    <div><strong>{t("DetailLabels.Periods")}:</strong> {selectedRequest.data.newStartPeriod} - {selectedRequest.data.newEndPeriod}</div>
                    <div><strong>{t("DetailLabels.Room")}:</strong> {selectedRequest.data.newRoomId ? `Room ID ${selectedRequest.data.newRoomId}` : "N/A"}</div>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">{t("DetailLabels.Reason")}</span>
                <p className="text-sm bg-muted p-2.5 rounded-md text-foreground break-words min-h-[50px] whitespace-pre-wrap">
                  {selectedRequest?.data?.reason || "N/A"}
                </p>
              </div>
            </div>
            
            {selectedRequest?.status === 'pending' ? (
                <div className="space-y-2 pt-2 border-t">
                  <label className="text-sm font-medium">{t("Comment")}</label>
                  <Textarea 
                    value={comment} 
                    onChange={(e) => setComment(e.target.value)} 
                    placeholder={t("CommentPlaceholder")} 
                    rows={3}
                  />
                </div>
            ) : (
                <div className="space-y-2 pt-2 border-t">
                    <span className="text-sm font-medium text-muted-foreground">{t("Comment")}</span>
                    <p className="text-sm italic text-muted-foreground bg-accent/30 p-2 rounded">{selectedRequest?.comment || "N/A"}</p>
                </div>
            )}
          </div>
          {selectedRequest?.status === 'pending' ? (
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="destructive" onClick={() => handleProcess('rejected')} disabled={isProcessing}>
                  <X className="mr-2 h-4 w-4" /> {t("Reject")}
                </Button>
                <Button onClick={() => handleProcess('approved')} disabled={isProcessing}>
                  <Check className="mr-2 h-4 w-4" /> {t("Approve")}
                </Button>
              </DialogFooter>
          ) : (
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                  {t("Close")}
                </Button>
              </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
