"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { getRosterColumns, StudentRosterData } from "./roster-columns";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { exportRosterAction } from "@/actions/course";
import { toast } from "sonner";

interface RosterClientProps {
  data: unknown[];
}

export function RosterClient({ data }: RosterClientProps) {
  const t = useTranslations("Profile");
  const teacherT = useTranslations("Teacher");
  const columns = getRosterColumns(t);
  const { id: classId } = useParams();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportRosterAction(classId as string);
      if (result.success && result.data) {
        const link = document.createElement('a');
        link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${result.data}`;
        link.download = `roster-${classId}.xlsx`;
        link.click();
        toast.success("Exported successfully");
      } else {
        toast.error(result.error || "Export failed");
      }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("An error occurred during export");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{teacherT("StudentRoster") || "Student Roster"}</h2>
        <Button 
          variant="outline" 
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {teacherT("ExportExcel") || "Export to Excel"}
        </Button>
      </div>
      <DataTable<StudentRosterData, unknown>
        columns={columns} 
        data={data as StudentRosterData[]} 
      />
    </div>
  );
}
