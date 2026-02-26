"use client";

import { useState } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { profileField } from "@/db/schema";
import { deleteProfileFieldAction } from "@/actions/profile-field";
import { toast } from "sonner";
import { ProfileFieldForm } from "./ProfileFieldForm";

type ProfileFieldType = typeof profileField.$inferSelect;

interface ProfileFieldRowActionsProps {
  data: ProfileFieldType;
}

export function ProfileFieldRowActions({ data }: ProfileFieldRowActionsProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const t = useTranslations("Profile");

  const onDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deleteProfileFieldAction(data.id);
      if (result.success) {
        toast.success(t("DeleteSuccess"));
        setShowDelete(false);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to delete profile field");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowEdit(true)}>
            <Edit className="mr-2 h-4 w-4" />
            {t("Update")}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setShowDelete(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            {t("Delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("EditField")}</DialogTitle>
          </DialogHeader>
          <ProfileFieldForm 
            initialData={data} 
            onSuccess={() => setShowEdit(false)} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ConfirmDelete")}</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground">
            {t("DeleteFieldWarning", { name: (data.label || data.name) ?? "" })}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDelete(false)} 
              disabled={isDeleting}
            >
              {t("Cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                onDelete();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "..." : t("Delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}