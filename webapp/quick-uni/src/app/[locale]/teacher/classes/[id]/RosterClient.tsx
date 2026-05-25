"use client";

import { DataTable } from "@/components/ui/data-table";
import { getRosterColumns } from "./roster-columns";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";

interface RosterClientProps {
  data: any[];
}

export function RosterClient({ data }: RosterClientProps) {
  const t = useTranslations("Profile");
  const teacherT = useTranslations("Teacher");
  const columns = getRosterColumns(t);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{teacherT("StudentRoster") || "Student Roster"}</h2>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          {teacherT("ExportExcel") || "Export to Excel"}
        </Button>
      </div>
      <DataTable 
        columns={columns} 
        data={data} 
      />
    </div>
  );
}
