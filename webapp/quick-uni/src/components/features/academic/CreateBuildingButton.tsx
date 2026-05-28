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
import { BuildingForm } from "./BuildingForm";
import { useTranslations } from "next-intl";

export function CreateBuildingButton() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("Admin");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> {t("AddBuilding")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("AddBuilding")}</DialogTitle>
        </DialogHeader>
        <BuildingForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
