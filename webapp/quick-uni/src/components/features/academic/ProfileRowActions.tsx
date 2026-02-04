"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProfileForm } from "./ProfileForm";
import { ProfileWithAccount } from "@/types/profile";
import { useTranslations } from "next-intl";

interface ProfileRowActionsProps {
  profile: ProfileWithAccount;
}

export function ProfileRowActions({ profile }: ProfileRowActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("Profile");

  return (
    <div className="flex justify-end gap-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("EditTitle", { name: profile.fullname || "N/A" })}</DialogTitle>
          </DialogHeader>
          <ProfileForm profile={profile} onSuccess={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}