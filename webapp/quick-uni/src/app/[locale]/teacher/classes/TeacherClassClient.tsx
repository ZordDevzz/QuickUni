"use client";

import { DataTable } from "@/components/ui/data-table";
import { TeacherClass, useTeacherClassColumns } from "./teacher-class-columns";
import { useTranslations } from "next-intl";

interface TeacherClassClientProps {
  data: TeacherClass[];
}

export function TeacherClassClient({ data }: TeacherClassClientProps) {
  const t = useTranslations("Teacher");
  const columns = useTeacherClassColumns();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("ClassesTitle")}</h2>
          <p className="text-muted-foreground">
            {t("ClassesDescription")}
          </p>
        </div>
      </div>
      <DataTable 
        columns={columns} 
        data={data} 
        searchKey="code"
      />
    </div>
  );
}
