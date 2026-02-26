"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash, MoreHorizontal } from "lucide-react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import { profileSchema } from "@/db/schema";
import { ProfileSchemaForm } from "./ProfileSchemaForm";
import { SchemaFieldManager } from "./SchemaFieldManager";
import { deleteProfileSchemaAction } from "@/actions/profile-schema";
import { toast } from "sonner";

type ProfileSchemaType = typeof profileSchema.$inferSelect;

interface ProfileSchemaRowActionsProps {
  schema: ProfileSchemaType;
}

export function ProfileSchemaRowActions({ schema }: ProfileSchemaRowActionsProps) {
  const t = useTranslations("Profile");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deleteProfileSchemaAction(schema.id);
      if (result.success) {
        toast.success(t("DeleteSuccess"));
        setShowDeleteDialog(false);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" /> {t("Edit")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" /> {t("Delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-175">
          <DialogHeader>
            <DialogTitle>{t("EditSchema")}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">{t("Details")}</TabsTrigger>
              <TabsTrigger value="fields">{t("Fields")}</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <ProfileSchemaForm
                initialData={schema}
                onSuccess={() => {
                  // Don't close immediately, maybe just toast? 
                  // Or if it's just "Save", we might close.
                  // For now let's keep it open to allow field editing.
                  // Actually, ProfileSchemaForm calls onSuccess which closes the dialog in Create flow.
                  // In Edit flow, we might want to keep it open.
                  // Let's change the onSuccess handler in the Dialog below.
                  setShowEditDialog(false); 
                }}
              />
            </TabsContent>
            <TabsContent value="fields" className="mt-4">
              <SchemaFieldManager schemaId={schema.id} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ConfirmDelete")}</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground">
            {t("DeleteSchemaWarning", { code: schema.schemaCode })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
              {t("Cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={onDelete}
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