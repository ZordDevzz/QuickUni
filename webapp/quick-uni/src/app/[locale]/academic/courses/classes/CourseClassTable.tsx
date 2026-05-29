"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { Dependencies } from "@/components/features/academic/CourseClassForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { School, GraduationCap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSemester } from "@/components/providers/semester-provider";

export function CourseClassTable({ data, dependencies }: { data: any[], dependencies: Dependencies }) {
  const { selectedSemesterId } = useSemester();
  const columns = useMemo(() => getColumns(dependencies), [dependencies]);

  const [selectedDeptId, setSelectedDeptId] = useState<string>("ALL");
  const [selectedMajorId, setSelectedMajorId] = useState<string>("ALL");

  // Destructure departments and majors from dependencies
  const departments = dependencies.departments || [];
  const majors = dependencies.majors || [];

  // Find selected department & major details
  const selectedDept = useMemo(() => departments.find(d => String(d.id) === selectedDeptId), [departments, selectedDeptId]);
  const selectedMajor = useMemo(() => majors.find(m => String(m.id) === selectedMajorId), [majors, selectedMajorId]);

  // Filter majors dropdown based on selected department
  const filteredMajorsList = useMemo(() => {
    if (selectedDeptId === "ALL") return majors;
    return majors.filter(m => (m as any).departmentId === selectedDeptId);
  }, [majors, selectedDeptId]);

  // Reset major filter if the currently selected major is not in the filtered majors list
  const handleDeptChange = (deptId: string) => {
    setSelectedDeptId(deptId);
    if (deptId !== "ALL") {
      const isMajorInDept = majors.some(m => String(m.id) === selectedMajorId && (m as any).departmentId === deptId);
      if (!isMajorInDept) {
        setSelectedMajorId("ALL");
      }
    }
  };

  // Helper to map subject code to department and major codes
  const getSubjectMetadata = (subjCode: string) => {
    const code = subjCode.toUpperCase();
    if (code.startsWith("IT4")) {
      return { deptCode: "FITI", majorCode: "ATTT" };
    }
    if (code.startsWith("IT")) {
      return { deptCode: "FITI", majorCode: "CNTT" };
    }
    if (code.startsWith("MATH")) {
      return { deptCode: "FITI", majorCode: "CNTT" };
    }
    if (code.startsWith("BA")) {
      return { deptCode: "FBA", majorCode: "QTKD" };
    }
    if (code.startsWith("EL")) {
      return { deptCode: "FFL", majorCode: "NNA" };
    }
    return { deptCode: "FITI", majorCode: "CNTT" };
  };

  // Filter classes dynamically
  const filteredClasses = useMemo(() => {
    return data.filter(c => {
      // Filter by semester
      if (selectedSemesterId && c.semesterId !== selectedSemesterId) return false;

      const subjectCode = c.subject?.code || "";
      const meta = getSubjectMetadata(subjectCode);

      // Filter by department
      if (selectedDeptId !== "ALL" && selectedDept) {
        if (meta.deptCode !== selectedDept.code) return false;
      }

      // Filter by major
      if (selectedMajorId !== "ALL" && selectedMajor) {
        if (meta.majorCode !== selectedMajor.code) return false;
      }

      return true;
    });
  }, [data, selectedSemesterId, selectedDeptId, selectedMajorId, selectedDept, selectedMajor]);

  const handleResetFilters = () => {
    setSelectedDeptId("ALL");
    setSelectedMajorId("ALL");
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-border bg-card/60 backdrop-blur-md shadow-xs items-end md:items-center justify-between transition-all duration-300">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Department Filter */}
          <div className="space-y-1.5 min-w-[220px]">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-primary/75" />
              Khoa / Phòng Ban
            </label>
            <Select value={selectedDeptId} onValueChange={handleDeptChange}>
              <SelectTrigger className="w-full h-10 border-border/80 bg-background/50 hover:bg-background/90 transition-all rounded-lg text-xs font-medium">
                <SelectValue placeholder="Tất cả các khoa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs font-semibold">Tất cả khoa</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)} className="text-xs font-medium">
                    {d.name} ({d.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Major Filter */}
          <div className="space-y-1.5 min-w-[220px]">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-primary/75" />
              Chuyên ngành
            </label>
            <Select value={selectedMajorId} onValueChange={setSelectedMajorId}>
              <SelectTrigger className="w-full h-10 border-border/80 bg-background/50 hover:bg-background/90 transition-all rounded-lg text-xs font-medium">
                <SelectValue placeholder="Tất cả chuyên ngành" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs font-semibold">Tất cả chuyên ngành</SelectItem>
                {filteredMajorsList.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)} className="text-xs font-medium">
                    {(m as any).des || m.code} ({m.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Controls */}
        {(selectedDeptId !== "ALL" || selectedMajorId !== "ALL") && (
          <Button
            variant="ghost"
            onClick={handleResetFilters}
            className="h-10 text-xs font-semibold hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-4 rounded-lg shrink-0 w-full sm:w-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Main Data Table */}
      <DataTable columns={columns} data={filteredClasses} searchKey="code" />
    </div>
  );
}
