"use client";

import { useState, useEffect } from "react";
import { Pencil, Trash2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { AccountForm } from "./AccountForm";
import { deleteAccountAction } from "@/actions/admin";
import { getRolesAction, getUserRolesAction, updateUserRolesAction } from "@/actions/role";
import { notify } from "@/lib/custom-toast";
import { useRouter } from "next/navigation";
import { Account } from "@/types/profile";
import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AccountRowActionsProps {
  account: Account;
}

interface Role {
  id: number;
  name: string | null;
}

export function AccountRowActions({ account }: AccountRowActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isRolesOpen, setIsRolesOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [userRoles, setUserRoles] = useState<number[]>([]);

  const router = useRouter();
  const t = useTranslations("Account");
  const tr = useTranslations("Role");
  const toastT = useTranslations("Toast");

  const loadRoles = async () => {
    setIsLoadingRoles(true);
    try {
      const [roles, currentUserRoles] = await Promise.all([
        getRolesAction(),
        getUserRolesAction(account.id)
      ]);
      setAllRoles(roles);
      setUserRoles(currentUserRoles);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      notify("Failed to load roles", { type: "error" });
    } finally {
      setIsLoadingRoles(false);
    }
  };

  useEffect(() => {
    async function init() {
      if (isRolesOpen) {
        await loadRoles();
      }
    }
    init();
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRolesOpen]);

  const handleUpdateRoles = async () => {
    setIsLoadingRoles(true);
    try {
      const result = await updateUserRolesAction({
        userId: account.id,
        roleIds: userRoles
      });
      if (result.success) {
        notify(tr("UpdateAuthoritiesSuccess"), { type: "success" });
        setIsRolesOpen(false);
      } else {
        notify(result.error || "Failed to update roles", { type: "error" });
      }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      notify("System error", { type: "error" });
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const toggleRole = (roleId: number) => {
    setUserRoles(prev => 
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
    );
  };

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
      <Dialog open={isRolesOpen} onOpenChange={setIsRolesOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" title={tr("Roles")}>
            <Shield className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tr("Roles")}: {account.username}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4 py-4">
              {allRoles.map((role) => (
                <div key={role.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`role-${role.id}`} 
                    checked={userRoles.includes(role.id)}
                    onCheckedChange={() => toggleRole(role.id)}
                  />
                  <Label htmlFor={`role-${role.id}`}>{role.name}</Label>
                </div>
              ))}
              {allRoles.length === 0 && !isLoadingRoles && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No roles found.
                </p>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRolesOpen(false)}>
              {t("Cancel")}
            </Button>
            <Button onClick={handleUpdateRoles} disabled={isLoadingRoles}>
              {isLoadingRoles ? t("Saving") : tr("UpdateAuthorities")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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