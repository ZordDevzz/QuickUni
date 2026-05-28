"use client";

import { useState } from "react";
import { 
  Pencil, 
  UserPlus, 
  MoreHorizontal,
  GraduationCap,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfileForm } from "./ProfileForm";
import { ProfileWithAccount } from "@/types/profile";
import { useTranslations } from "next-intl";
import { AccountForm } from "../auth/AccountForm";

interface ProfileRowActionsProps {
  profile: ProfileWithAccount;
}

export function ProfileRowActions({ profile }: ProfileRowActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const t = useTranslations("Profile");
  const accT = useTranslations("Account");
  const tCommon = useTranslations("Common");

  return (
    <div className="flex justify-end gap-2">
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-150">
          <DialogHeader>
            <DialogTitle>{t("EditTitle", { name: profile.fullname || "N/A" })}</DialogTitle>
          </DialogHeader>
          <ProfileForm profile={profile} onSuccess={() => setIsEditOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isAccountOpen} onOpenChange={setIsAccountOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>{accT("CreateTitle")}</DialogTitle>
          </DialogHeader>
          <AccountForm 
            onSuccess={() => setIsAccountOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">{tCommon("OpenMenu")}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t("Actions")}</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            {t("EditProfile")}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {!profile.accountId && (
            <DropdownMenuItem onClick={() => setIsAccountOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              {t("IssueAccount")}
            </DropdownMenuItem>
          )}

          <DropdownMenuItem>
            <GraduationCap className="mr-2 h-4 w-4" />
            {t("LinkToStudent")}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Briefcase className="mr-2 h-4 w-4" />
            {t("LinkToEmployee")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}