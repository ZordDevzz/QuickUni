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

export default function ReviewList({ requests }: { requests: unknown[] }) {
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
      header: t("Type"),
      cell: ({ row }) => t(`Type.${row.getValue("type")}`)
    },
    {
      accessorKey: "status",
      header: t("Status"),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline" | "success"> = {
          pending: "secondary",
          approved: "default",
          rejected: "destructive",
          cancelled: "outline",
        };
        // Use custom mapping for badge variant if needed, 
        // for now sticking to what's available in standard shadcn badge
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
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">{t("Sender")}</span>
                <span className="text-sm font-semibold">{selectedRequest?.sender?.fullname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">{t("Type")}</span>
                <span className="text-sm font-semibold">{selectedRequest ? t(`Type.${selectedRequest.type}`) : ""}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">{t("CreatedAt")}</span>
                <span className="text-sm">{selectedRequest ? new Date(selectedRequest.createAt).toLocaleString() : ""}</span>
              </div>
              <div className="mt-2">
                <span className="text-sm font-medium text-muted-foreground">{t("Details")}</span>
                <pre className="mt-1 text-xs bg-muted p-2 rounded max-h-[150px] overflow-auto">
                  {JSON.stringify(selectedRequest?.data, null, 2)}
                </pre>
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
                    <p className="text-sm italic text-muted-foreground">{selectedRequest?.comment || "N/A"}</p>
                </div>
            )}
          </div>
          {selectedRequest?.status === 'pending' && (
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="destructive" onClick={() => handleProcess('rejected')} disabled={isProcessing}>
                  <X className="mr-2 h-4 w-4" /> {t("Reject")}
                </Button>
                <Button onClick={() => handleProcess('approved')} disabled={isProcessing}>
                  <Check className="mr-2 h-4 w-4" /> {t("Approve")}
                </Button>
              </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
