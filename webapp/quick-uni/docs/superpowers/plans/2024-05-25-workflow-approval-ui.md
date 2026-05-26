# Teacher & Academic Approval UIs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create approval interfaces for Teachers and Academic Office to process student requests.

**Architecture:** Server Components for data fetching and Client Components for interactive DataTables with approval/rejection dialogs.

**Tech Stack:** Next.js (App Router), Drizzle ORM, Shadcn UI (DataTable, Dialog, Form), Lucide React.

---

### Task 1: Teacher Request Interface

**Files:**
- Create: `src/app/[locale]/teacher/requests/page.tsx`
- Create: `src/app/[locale]/teacher/requests/ReviewList.tsx`

- [ ] **Step 1: Create Teacher Request Page**
```tsx
import { getRequestsForReviewer } from "@/actions/workflow";
import ReviewList from "./ReviewList";

export default async function TeacherRequestsPage() {
  const requests = await getRequestsForReviewer();
  // Filter for student_absence for teachers, although getRequestsForReviewer handles targetId
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Student Requests</h2>
      </div>
      <ReviewList requests={requests} />
    </div>
  );
}
```

- [ ] **Step 2: Create ReviewList Component**
```tsx
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

export default function ReviewList({ requests }: { requests: any[] }) {
  const t = useTranslations("Workflow");
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
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

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
        return <Badge variant={status === 'pending' ? 'secondary' : status === 'approved' ? 'default' : 'destructive'}>{t(`StatusLabel.${status}`)}</Badge>;
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
        <Button variant="ghost" size="icon" onClick={() => setSelectedRequest(row.original)}>
          <Eye className="h-4 w-4" />
        </Button>
      )
    }
  ];

  return (
    <>
      <DataTable columns={columns} data={requests} searchKey="sender_fullname" />
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ReviewTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm font-medium">{t("Sender")}: {selectedRequest?.sender?.fullname}</p>
              <p className="text-sm font-medium">{t("Type")}: {t(`Type.${selectedRequest?.type}`)}</p>
              <p className="text-sm font-medium">{t("Details")}:</p>
              <pre className="mt-1 text-xs bg-muted p-2 rounded">{JSON.stringify(selectedRequest?.data, null, 2)}</pre>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("Comment")}</label>
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t("CommentPlaceholder")} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleProcess('rejected')} disabled={isProcessing}>
              <X className="mr-2 h-4 w-4" /> {t("Reject")}
            </Button>
            <Button onClick={() => handleProcess('approved')} disabled={isProcessing}>
              <Check className="mr-2 h-4 w-4" /> {t("Approve")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

- [ ] **Step 3: Update i18n messages**
Modify `messages/vi.json` and `messages/en.json` to include "Workflow" translations.

### Task 2: Academic Office Request Interface

**Files:**
- Create: `src/app/[locale]/academic/requests/page.tsx`
- Create: `src/app/[locale]/academic/requests/AdminRequestList.tsx`

- [ ] **Step 1: Create Academic Office Request Page**
```tsx
import { getRequestsForReviewer } from "@/actions/workflow";
import AdminRequestList from "./AdminRequestList";

export default async function AcademicRequestsPage() {
  const requests = await getRequestsForReviewer();
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">All Requests</h2>
      </div>
      <AdminRequestList requests={requests} />
    </div>
  );
}
```

- [ ] **Step 2: Create AdminRequestList Component**
(Similar to `ReviewList` but with potential adjustments for more request types)

---

### Task 3: Verification

- [ ] **Step 1: Verify UI and Functionality**
- Log in as teacher, check `/teacher/requests`.
- Log in as employee (Academic Office), check `/academic/requests`.
- Approve/Reject a request and verify database state and UI updates.
