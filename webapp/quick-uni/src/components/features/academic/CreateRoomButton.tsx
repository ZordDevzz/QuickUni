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
import { RoomForm } from "./RoomForm";
import { building } from "@/db/schemas/schedule";
import { useTranslations } from "next-intl";

export function CreateRoomButton({ buildings }: { buildings: (typeof building.$inferSelect)[] }) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("Admin");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> {t("AddRoom")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("AddRoom")}</DialogTitle>
        </DialogHeader>
        <RoomForm buildings={buildings} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
