"use client";

import { useTranslations } from "next-intl";
import { ProfileWithAccount } from "@/types/profile";
import { DataTable } from "@/components/ui/data-table";
import { useMemo, useState } from "react";
import { getColumns } from "./columns";
import { TranslationFunction } from "@/types/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  Building, 
  GraduationCap, 
  Layers, 
  UserCheck, 
  FilterX,
  ShieldCheck,
  Search,
  BookOpen
} from "lucide-react";

interface ProfileTableProps {
  data: ProfileWithAccount[];
  isStudent?: boolean;
}

export function ProfileTable({ data, isStudent }: ProfileTableProps) {
  const t = useTranslations("Profile");

  // Filter States
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedMajor, setSelectedMajor] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedAccountStatus, setSelectedAccountStatus] = useState("all");
  const [selectedSchema, setSelectedSchema] = useState("all");

  const columns = useMemo(() => getColumns(t as unknown as TranslationFunction, isStudent), [t, isStudent]);

  // Extract unique metadata from data dynamically for Student profiles
  const uniqueMetadata = useMemo(() => {
    if (!isStudent) {
      // For Personnel: extract unique schemas
      const schemas = new Set<string>();
      data.forEach((p: any) => {
        if (p.profileSchema?.schemaCode) {
          schemas.add(p.profileSchema.schemaCode);
        }
      });
      return { schemas: Array.from(schemas).sort() };
    }

    const classes = new Set<string>();
    const majors = new Set<string>();
    const departments = new Set<string>();

    data.forEach((p: any) => {
      const studentObj = p.students?.[0];
      const mainClass = studentObj?.mainClassMembers?.[0]?.mainClass;
      
      if (mainClass?.code) classes.add(mainClass.code);
      
      const major = mainClass?.major;
      if (major) {
        const majorLabel = major.des || major.code;
        majors.add(JSON.stringify({ code: major.code, label: majorLabel }));
      }

      if (major?.department?.name) {
        departments.add(major.department.name);
      }
    });

    return {
      classes: Array.from(classes).sort(),
      majors: Array.from(majors).map(m => JSON.parse(m)).sort((a, b) => a.label.localeCompare(b.label)),
      departments: Array.from(departments).sort()
    };
  }, [data, isStudent]);

  // Filter logic
  const filteredData = useMemo(() => {
    return data.filter((p: any) => {
      // 1. Filter by Account Status
      if (selectedAccountStatus !== "all") {
        const hasAccount = !!p.accountId;
        if (selectedAccountStatus === "issued" && !hasAccount) return false;
        if (selectedAccountStatus === "not_issued" && hasAccount) return false;
      }

      if (isStudent) {
        const studentObj = p.students?.[0];
        const mainClass = studentObj?.mainClassMembers?.[0]?.mainClass;

        // 2. Filter by Class
        if (selectedClass !== "all") {
          const classCode = mainClass?.code || "";
          if (classCode !== selectedClass) return false;
        }

        // 3. Filter by Major
        if (selectedMajor !== "all") {
          const majorCode = mainClass?.major?.code || "";
          if (majorCode !== selectedMajor) return false;
        }

        // 4. Filter by Department
        if (selectedDepartment !== "all") {
          const deptName = mainClass?.major?.department?.name || "";
          if (deptName !== selectedDepartment) return false;
        }
      } else {
        // 5. Filter by Schema/Role for Personnel
        if (selectedSchema !== "all") {
          const schemaCode = p.profileSchema?.schemaCode || "";
          if (schemaCode !== selectedSchema) return false;
        }
      }

      return true;
    });
  }, [data, isStudent, selectedAccountStatus, selectedClass, selectedMajor, selectedDepartment, selectedSchema]);

  // Check if any filter is active
  const hasActiveFilters = 
    selectedAccountStatus !== "all" ||
    selectedClass !== "all" ||
    selectedMajor !== "all" ||
    selectedDepartment !== "all" ||
    selectedSchema !== "all";

  // Reset all filters
  const resetFilters = () => {
    setSelectedClass("all");
    setSelectedMajor("all");
    setSelectedDepartment("all");
    setSelectedAccountStatus("all");
    setSelectedSchema("all");
  };

  return (
    <div className="space-y-6">
      {/* Visual Premium Filter Panel */}
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
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-8 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 gap-1.5 font-bold transition-all rounded-lg"
            >
              <FilterX className="h-3.5 w-3.5" /> Xóa bộ lọc
            </Button>
          )}
        </div>

        {isStudent ? (
          /* Student Filters */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Account Status Filter */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-emerald-500" /> Trạng thái cấp tài khoản
              </label>
              <Select value={selectedAccountStatus} onValueChange={setSelectedAccountStatus}>
                <SelectTrigger className="h-9.5 rounded-xl border-border/50 bg-background/50 hover:bg-background/80 hover:border-border transition-all">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/40">
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="issued">Đã cấp tài khoản</SelectItem>
                  <SelectItem value="not_issued">Chưa cấp tài khoản</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Department Filter */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-indigo-500" /> Khoa / Ban
              </label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="h-9.5 rounded-xl border-border/50 bg-background/50 hover:bg-background/80 hover:border-border transition-all">
                  <SelectValue placeholder="Tất cả Khoa" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/40">
                  <SelectItem value="all">Tất cả Khoa</SelectItem>
                  {uniqueMetadata.departments?.map(d => (
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
              <Select value={selectedMajor} onValueChange={setSelectedMajor}>
                <SelectTrigger className="h-9.5 rounded-xl border-border/50 bg-background/50 hover:bg-background/80 hover:border-border transition-all">
                  <SelectValue placeholder="Tất cả ngành" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/40">
                  <SelectItem value="all">Tất cả ngành</SelectItem>
                  {uniqueMetadata.majors?.map(m => (
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
                  {uniqueMetadata.classes?.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          /* Personnel Filters */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Account Status Filter */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-emerald-500" /> Trạng thái cấp tài khoản
              </label>
              <Select value={selectedAccountStatus} onValueChange={setSelectedAccountStatus}>
                <SelectTrigger className="h-9.5 rounded-xl border-border/50 bg-background/50 hover:bg-background/80 hover:border-border transition-all">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/40">
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="issued">Đã cấp tài khoản</SelectItem>
                  <SelectItem value="not_issued">Chưa cấp tài khoản</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Schema Filter (Teacher/Employee role structure) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" /> Cấu trúc hồ sơ
              </label>
              <Select value={selectedSchema} onValueChange={setSelectedSchema}>
                <SelectTrigger className="h-9.5 rounded-xl border-border/50 bg-background/50 hover:bg-background/80 hover:border-border transition-all">
                  <SelectValue placeholder="Tất cả loại hồ sơ" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/40">
                  <SelectItem value="all">Tất cả loại hồ sơ</SelectItem>
                  {uniqueMetadata.schemas?.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Main Table rendering filtered data */}
      <DataTable columns={columns} data={filteredData} searchKey="fullname" />
    </div>
  );
}
