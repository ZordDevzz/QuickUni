"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProfileForm } from "./ProfileForm";
import { useTranslations } from "next-intl";

interface CreateProfileButtonProps {
  schemas?: { id: number; schemaCode: string }[];
}

export function CreateProfileButton({ schemas = [] }: CreateProfileButtonProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("Profile");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" /> {t("AddProfile")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("AddProfile")}</DialogTitle>
        </DialogHeader>
        <ProfileForm schemas={schemas} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
