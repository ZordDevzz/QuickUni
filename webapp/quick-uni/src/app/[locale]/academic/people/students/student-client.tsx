"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PersonForm } from "@/components/features/academic/people/PersonForm";
import { useTranslations } from "next-intl";

export function StudentClient({ data, defaultSchemaId }: { data: any[]; defaultSchemaId: number | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("Profile");
  const commonT = useTranslations("Admin");
  const columns = getColumns(t);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{commonT("Students") || "Students"}</h2>
          <p className="text-muted-foreground">
            {commonT("ManageStudentsDescription") || "Manage student profiles and information."}
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button disabled={!defaultSchemaId}>
              <Plus className="mr-2 h-4 w-4" /> {commonT("Add") || "Add Student"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("AddProfile") || "Add New Student"}</DialogTitle>
            </DialogHeader>
            {defaultSchemaId && (
              <PersonForm 
                type="student" 
                schemaId={defaultSchemaId} 
                onSuccess={() => setIsOpen(false)} 
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={data} searchKey="profile_fullname" />
    </div>
  );
}
