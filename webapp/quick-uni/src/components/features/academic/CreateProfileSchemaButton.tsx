"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { ProfileSchemaForm } from "./ProfileSchemaForm";

export function CreateProfileSchemaButton() {
  const t = useTranslations("Profile");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> {t("AddSchema")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("AddSchema")}</DialogTitle>
        </DialogHeader>
        <ProfileSchemaForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
