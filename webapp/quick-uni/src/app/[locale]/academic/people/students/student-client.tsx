"use client";

import { useState, useMemo } from "react";
import { Plus, Building, GraduationCap, Layers, FilterX, BookOpen } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function StudentClient({ data, defaultSchemaId }: { data: unknown[]; defaultSchemaId: number | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("Profile");
  const commonT = useTranslations("Admin");
  const columns = getColumns(t);

  // Filter States
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedMajor, setSelectedMajor] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  // Extract structured and associated metadata
  const allMetadata = useMemo(() => {
    const items: Array<{
      classCode: string;
      majorCode: string;
      majorLabel: string;
      deptName: string;
    }> = [];

    (data as any[]).forEach((s: any) => {
      const mainClass = s.mainClassMembers?.[0]?.mainClass;
      const major = mainClass?.major;
      if (mainClass?.code && major?.code && major?.department?.name) {
        items.push({
          classCode: mainClass.code,
          majorCode: major.code,
          majorLabel: major.des || major.code,
          deptName: major.department.name,
        });
      }
    });
    return items;
  }, [data]);

  // Compute cascading options dynamically
  const departmentOptions = useMemo(() => {
    const depts = new Set<string>();
    allMetadata.forEach(item => depts.add(item.deptName));
    return Array.from(depts).sort();
  }, [allMetadata]);

  const majorOptions = useMemo(() => {
    const majorsMap = new Map<string, string>(); // majorCode -> majorLabel
    allMetadata.forEach(item => {
      if (selectedDepartment === "all" || item.deptName === selectedDepartment) {
        majorsMap.set(item.majorCode, item.majorLabel);
      }
    });
    return Array.from(majorsMap.entries())
      .map(([code, label]) => ({ code, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [allMetadata, selectedDepartment]);

  const classOptions = useMemo(() => {
    const classes = new Set<string>();
    allMetadata.forEach(item => {
      const matchDept = selectedDepartment === "all" || item.deptName === selectedDepartment;
      const matchMajor = selectedMajor === "all" || item.majorCode === selectedMajor;
      if (matchDept && matchMajor) {
        classes.add(item.classCode);
      }
    });
    return Array.from(classes).sort();
  }, [allMetadata, selectedDepartment, selectedMajor]);

  // Handlers for cascading selects
  const handleDepartmentChange = (dept: string) => {
    setSelectedDepartment(dept);
    
    // Cascading reset: If selectedMajor doesn't belong to the newly selected department, reset it
    if (dept !== "all") {
      const majorsInDept = allMetadata
        .filter(item => item.deptName === dept)
        .map(item => item.majorCode);
      if (selectedMajor !== "all" && !majorsInDept.includes(selectedMajor)) {
        setSelectedMajor("all");
        setSelectedClass("all");
      }
    }
  };

  const handleMajorChange = (major: string) => {
    setSelectedMajor(major);

    // Cascading reset: If selectedClass doesn't belong to the newly selected major, reset it
    if (major !== "all") {
      const classesInMajor = allMetadata
        .filter(item => item.majorCode === major)
        .map(item => item.classCode);
      if (selectedClass !== "all" && !classesInMajor.includes(selectedClass)) {
        setSelectedClass("all");
      }
    }
  };

  // Filter Logic for table display
  const filteredData = useMemo(() => {
    return (data as any[]).filter((s: any) => {
      const mainClass = s.mainClassMembers?.[0]?.mainClass;

      // 1. Filter by Department
      if (selectedDepartment !== "all") {
        const deptName = mainClass?.major?.department?.name || "";
        if (deptName !== selectedDepartment) return false;
      }

      // 2. Filter by Major
      if (selectedMajor !== "all") {
        const majorCode = mainClass?.major?.code || "";
        if (majorCode !== selectedMajor) return false;
      }

      // 3. Filter by Class
      if (selectedClass !== "all") {
        const classCode = mainClass?.code || "";
        if (classCode !== selectedClass) return false;
      }

      return true;
    });
  }, [data, selectedClass, selectedMajor, selectedDepartment]);

  const hasActiveFilters = selectedClass !== "all" || selectedMajor !== "all" || selectedDepartment !== "all";

  const resetFilters = () => {
    setSelectedClass("all");
    setSelectedMajor("all");
    setSelectedDepartment("all");
  };

  return (
    <div className="space-y-6">
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
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
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

      {/* Advanced Filter Panel */}
      <div className="p-5 bg-background/30 dark:bg-muted/10 border border-border/40 dark:border-border/10 rounded-2xl backdrop-blur-md shadow-sm transition-all duration-300">
        <div className="flex items-center justify-between mb-4 border-b border-border/20 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Bộ lọc nâng cao</h3>
              <p className="text-[10px] text-muted-foreground">Thu hẹp danh sách theo các điều kiện cụ thể (Ràng buộc thực tế)</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            disabled={!hasActiveFilters}
            className="h-8 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 disabled:opacity-50 disabled:hover:bg-transparent disabled:text-muted-foreground gap-1.5 font-bold transition-all rounded-lg"
          >
            <FilterX className="h-3.5 w-3.5" /> Xóa bộ lọc
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Department Filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
              <Building className="h-3.5 w-3.5 text-indigo-500" /> Khoa / Ban
            </label>
            <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
              <SelectTrigger className="h-9.5 rounded-xl border-border/50 bg-background/50 hover:bg-background/80 hover:border-border transition-all">
                <SelectValue placeholder="Tất cả Khoa" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/40">
                <SelectItem value="all">Tất cả Khoa</SelectItem>
                {departmentOptions.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Major Filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-purple-500" /> Ngành / Chuyên ngành
            </label>
            <Select value={selectedMajor} onValueChange={handleMajorChange}>
              <SelectTrigger className="h-9.5 rounded-xl border-border/50 bg-background/50 hover:bg-background/80 hover:border-border transition-all">
                <SelectValue placeholder="Tất cả chuyên ngành" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/40">
                <SelectItem value="all">Tất cả chuyên ngành</SelectItem>
                {majorOptions.map(m => (
                  <SelectItem key={m.code} value={m.code}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Class Filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-teal-500" /> Lớp hành chính
            </label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="h-9.5 rounded-xl border-border/50 bg-background/50 hover:bg-background/80 hover:border-border transition-all">
                <SelectValue placeholder="Tất cả lớp" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/40">
                <SelectItem value="all">Tất cả lớp</SelectItem>
                {classOptions.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={filteredData} searchKey="profile_fullname" />
    </div>
  );
}
