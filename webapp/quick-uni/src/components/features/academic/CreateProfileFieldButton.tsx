"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProfileFieldForm } from "./ProfileFieldForm";

export function CreateProfileFieldButton() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("Profile");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t("AddField")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("AddField")}</DialogTitle>
        </DialogHeader>
        <ProfileFieldForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
