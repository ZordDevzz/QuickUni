"use client";

import { useState, useMemo } from "react";
import { Plus, Building, FilterX, BookOpen } from "lucide-react";
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

export function TeacherClient({ data, defaultSchemaId }: { data: unknown[]; defaultSchemaId: number | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("Profile");
  const commonT = useTranslations("Admin");
  const columns = getColumns(t);

  // Filter States
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  // Extract unique departments dynamically
  const uniqueDepartments = useMemo(() => {
    const departments = new Set<string>();

    (data as any[]).forEach((emp: any) => {
      const depts = emp.departmentEmployments || [];
      depts.forEach((d: any) => {
        if (d.department?.name) {
          departments.add(d.department.name);
        }
      });
    });

    return Array.from(departments).sort();
  }, [data]);

  // Filter Logic
  const filteredData = useMemo(() => {
    return (data as any[]).filter((emp: any) => {
      if (selectedDepartment !== "all") {
        const depts = emp.departmentEmployments || [];
        const hasDept = depts.some((d: any) => d.department?.name === selectedDepartment);
        if (!hasDept) return false;
      }
      return true;
    });
  }, [data, selectedDepartment]);

  const hasActiveFilters = selectedDepartment !== "all";

  const resetFilters = () => {
    setSelectedDepartment("all");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{commonT("Teachers") || "Teachers"}</h2>
          <p className="text-muted-foreground">
            {commonT("ManageTeachersDescription") || "Manage teacher profiles and information."}
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button disabled={!defaultSchemaId}>
              <Plus className="mr-2 h-4 w-4" /> {commonT("Add") || "Add Teacher"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("AddProfile") || "Add New Teacher"}</DialogTitle>
            </DialogHeader>
            {defaultSchemaId && (
              <PersonForm 
                type="employee" 
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
              <p className="text-[10px] text-muted-foreground">Thu hẹp danh sách theo các điều kiện cụ thể</p>
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
              <Building className="h-3.5 w-3.5 text-indigo-500" /> Khoa / Phòng ban
            </label>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="h-9.5 rounded-xl border-border/50 bg-background/50 hover:bg-background/80 hover:border-border transition-all">
                <SelectValue placeholder="Tất cả Khoa" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/40">
                <SelectItem value="all">Tất cả Khoa</SelectItem>
                {uniqueDepartments.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
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
