"use client";

import { useState } from "react";
import { MoreHorizontal, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PersonForm } from "@/components/features/academic/people/PersonForm";
import { useTranslations } from "next-intl";

export function TeacherRowActions({ teacher }: { teacher: any }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const t = useTranslations("Admin");
  const profileT = useTranslations("Profile");

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> {t("Edit")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{profileT("EditProfile") || "Edit Teacher"}</DialogTitle>
          </DialogHeader>
          <PersonForm 
            type="employee" 
            schemaId={teacher.profile.schemaId} 
            initialData={teacher} 
            onSuccess={() => setIsEditOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
