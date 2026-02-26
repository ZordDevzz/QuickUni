"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AccountForm } from "./AccountForm";
import { deleteAccountAction } from "@/actions/admin";
import { notify } from "@/lib/custom-toast";
import { useRouter } from "next/navigation";
import { Account } from "@/types/profile";
import { useTranslations } from "next-intl";

interface AccountRowActionsProps {
  account: Account;
}

export function AccountRowActions({ account }: AccountRowActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const t = useTranslations("Account");
  const toastT = useTranslations("Toast");

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteAccountAction(account.id);
      if (result.success) {
        notify(toastT("AccountDeleted"), { type: "success" });
        setIsDeleteOpen(false);
        router.refresh();
      } else {
        notify(result.error || toastT("DeleteFailed"), { type: "error" });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : toastT("DeleteFailed");
      notify(message, { type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex justify-end gap-2">
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>{t("EditTitle", { username: account.username })}</DialogTitle>
          </DialogHeader>
          <AccountForm account={account} onSuccess={() => setIsEditOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("DeleteTitle")}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              {t("DeleteDescription", { username: account.username })}
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              {t("Cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? t("Deleting") : t("DeleteButton")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}