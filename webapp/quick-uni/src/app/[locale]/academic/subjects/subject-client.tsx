"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { getColumns, SubjectWithRelations } from "./subject-columns";
import { Button } from "@/components/ui/button";
import { Plus, GraduationCap } from "lucide-react";
import { useTranslations } from "next-intl";
import { SubjectFormDialog } from "./subject-form-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SubjectClient({ data }: { data: SubjectWithRelations[] }) {
  const t = useTranslations("Subject");
  const [isOpen, setIsOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectWithRelations | null>(null);

  const onEdit = (s: SubjectWithRelations) => {
    setEditingSubject(s);
    setIsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            {t("Subjects")}
          </h2>
          <p className="text-muted-foreground">
            {t("Save") === "Lưu" 
              ? "Quản lý danh mục môn học, số tín chỉ và điều kiện tiên quyết trong hệ thống."
              : "Manage subject catalog, credits, and prerequisites settings in the system."}
          </p>
        </div>
        <Button onClick={() => {
          setEditingSubject(null);
          setIsOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> {t("AddSubject")}
        </Button>
      </div>

      <Card className="border-muted/40 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>{t("Save") === "Lưu" ? "Danh sách môn học" : "Subjects List"}</CardTitle>
          <CardDescription>
            {t("Save") === "Lưu"
              ? "Tổng hợp toàn bộ các môn học đang hoạt động trong chương trình đào tạo."
              : "Comprehensive list of all active subjects within the curriculum."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={getColumns(onEdit, t)} data={data} />
        </CardContent>
      </Card>

      <SubjectFormDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        editingSubject={editingSubject}
        subjects={data}
      />
    </div>
  );
}
