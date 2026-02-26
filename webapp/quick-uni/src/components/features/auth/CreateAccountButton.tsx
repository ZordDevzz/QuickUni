"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AccountForm } from "./AccountForm";
import { useTranslations } from "next-intl";
import { Profile } from "@/types/profile";

interface CreateAccountButtonProps {
  profiles?: Profile[];
}

export function CreateAccountButton({ profiles = [] }: CreateAccountButtonProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("Account");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> {t("AddAccount")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{t("CreateTitle")}</DialogTitle>
        </DialogHeader>
        <AccountForm profiles={profiles} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}