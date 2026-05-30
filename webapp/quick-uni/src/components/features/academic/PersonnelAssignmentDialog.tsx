"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  departmentEmploymentSchema, 
  DepartmentEmploymentInput
} from "@/lib/validators/academic";
import { 
  assignStaffToDepartment, 
  getDepartments,
  getDepartmentPositions
} from "@/actions/academic";
import { notify } from "@/lib/custom-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Building, KeyRound, Calendar, Shield, Briefcase } from "lucide-react";

// Standard Academic Positions List
const ACADEMIC_ROLES = [
  { code: "TRUONG_KHOA", name: "Trưởng khoa" },
  { code: "PHO_KHOA", name: "Phó Trưởng khoa" },
  { code: "TRUONG_BO_MON", name: "Trưởng bộ môn" },
  { code: "GIANG_VIEN", name: "Giảng viên" },
  { code: "TRO_GIANG", name: "Trợ giảng" },
  { code: "GIAO_VU", name: "Giáo vụ khoa" },
  { code: "NHAN_VIEN", name: "Nhân viên" },
];

// Standard Administrative Positions List
const ADMIN_ROLES = [
  { code: "TRUONG_PHONG", name: "Trưởng phòng" },
  { code: "PHO_PHONG", name: "Phó Trưởng phòng" },
  { code: "CHUYEN_VIEN", name: "Chuyên viên" },
  { code: "NHAN_VIEN", name: "Nhân viên" },
];

interface PersonnelAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  employeeName: string;
  onSuccess?: () => void;
}

export function PersonnelAssignmentDialog({ 
  open, 
  onOpenChange, 
  employeeId, 
  employeeName, 
  onSuccess 
}: PersonnelAssignmentDialogProps) {
  const t = useTranslations("Admin");
  const [departments, setDepartments] = useState<any[]>([]);
  const [dbPositions, setDbPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Track if a custom role is being entered manually
  const [selectedRoleType, setSelectedRoleType] = useState<string>("");

  const form = useForm<DepartmentEmploymentInput>({
    resolver: zodResolver(departmentEmploymentSchema),
    defaultValues: {
      employeeId: employeeId,
      departmentId: "",
      assignDate: new Date().toISOString().split('T')[0],
      roleCode: "",
      roleName: "",
    },
  });

  const selectedDeptId = form.watch("departmentId");

  // Determine whether the selected department is academic (Faculty/Khoa)
  const selectedDept = departments.find(d => d.id === selectedDeptId);
  const isAcademic = selectedDept 
    ? (selectedDept.name?.toLowerCase().includes("khoa") || 
       selectedDept.code?.toLowerCase().startsWith("k") || 
       selectedDept.name?.toLowerCase().includes("faculty") || 
       selectedDept.name?.toLowerCase().includes("bộ môn") || 
       selectedDept.name?.toLowerCase().includes("subject"))
    : true; // Default to academic list

  const activeRoles = dbPositions.length > 0 
    ? dbPositions 
    : (isAcademic ? ACADEMIC_ROLES : ADMIN_ROLES);

  useEffect(() => {
    if (open) {
      setSelectedRoleType("");
      setDbPositions([]);
      form.reset({
        employeeId: employeeId,
        departmentId: "",
        assignDate: new Date().toISOString().split('T')[0],
        roleCode: "",
        roleName: "",
      });
      
      const loadDepartments = async () => {
        try {
          const data = await getDepartments();
          setDepartments(data);
        } catch (error) {
          notify("Không thể tải danh sách Khoa/Phòng", { type: "error" });
        }
      };
      loadDepartments();
    }
  }, [open, employeeId, form]);

  // Reset selected role and load positions whenever the department selection changes
  useEffect(() => {
    if (selectedDeptId) {
      setSelectedRoleType("");
      form.setValue("roleCode", "");
      form.setValue("roleName", "");
      
      const loadPositions = async () => {
        try {
          const positionsData = await getDepartmentPositions(selectedDeptId);
          setDbPositions(positionsData);
        } catch (error) {
          console.error("Failed to load department positions", error);
        }
      };
      loadPositions();
    } else {
      setDbPositions([]);
    }
  }, [selectedDeptId, form]);

  const handleRoleSelect = (value: string) => {
    setSelectedRoleType(value);
    if (value === "custom") {
      form.setValue("roleCode", "");
      form.setValue("roleName", "");
    } else {
      const selected = activeRoles.find(r => r.code === value);
      if (selected) {
        form.setValue("roleCode", selected.code);
        form.setValue("roleName", selected.name);
      }
    }
  };

  async function onSubmit(data: DepartmentEmploymentInput) {
    try {
      setLoading(true);
      await assignStaffToDepartment(data);
      notify("Gán nhân sự vào Khoa/Phòng thành công", { type: "success" });
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      notify((error as Error).message || "Không thể gán nhân sự", { type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] border border-border/40 bg-background/95 backdrop-blur-md shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-200">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-border/25">
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2.5">
            <Building className="h-5.5 w-5.5 text-indigo-500" />
            Phân bổ Khoa / Phòng ban
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Bổ nhiệm vị trí công tác cho cán bộ <strong className="text-foreground font-semibold">{employeeName}</strong>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-3">
            {/* Department Selection */}
            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-indigo-500" />
                    Chọn Khoa / Phòng ban trực thuộc
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 rounded-xl border-border/50 bg-background/50 hover:bg-background/80 hover:border-border transition-all">
                        <SelectValue placeholder="Chọn một Khoa / Phòng ban..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-border/40">
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name} ({dept.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Position Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-purple-500" />
                Chức vụ / Vị trí bổ nhiệm
              </label>
              <Select onValueChange={handleRoleSelect} value={selectedRoleType}>
                <SelectTrigger className="h-10 rounded-xl border-border/50 bg-background/50 hover:bg-background/80 hover:border-border transition-all">
                  <SelectValue placeholder="Chọn chức vụ..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/40">
                  {activeRoles.map((role) => (
                    <SelectItem key={role.code} value={role.code}>
                      {role.name} ({role.code})
                    </SelectItem>
                  ))}
                  <SelectItem value="custom" className="font-semibold text-indigo-600 dark:text-indigo-400">
                    ✨ Tự nhập chức vụ khác
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Role Code & Name (Rendered only when custom selected) */}
            {selectedRoleType === "custom" && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <FormField
                  control={form.control}
                  name="roleCode"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-bold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
                        <KeyRound className="h-3.5 w-3.5 text-purple-500" />
                        Mã vai trò (Role Code)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="VD: TRUONG_KHOA" 
                          className="h-10 rounded-xl border-border/50 bg-background/50 hover:bg-background/80 hover:border-border focus:border-indigo-500 transition-all" 
                          {...field} 
                          value={field.value || ""} 
                        />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roleName"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-bold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 text-pink-500" />
                        Tên chức vụ
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="VD: Trưởng khoa" 
                          className="h-10 rounded-xl border-border/50 bg-background/50 hover:bg-background/80 hover:border-border focus:border-indigo-500 transition-all" 
                          {...field} 
                          value={field.value || ""} 
                        />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Assign Date */}
            <FormField
              control={form.control}
              name="assignDate"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-teal-500" />
                    Ngày bắt đầu bổ nhiệm
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      className="h-10 rounded-xl border-border/50 bg-background/50 hover:bg-background/80 hover:border-border focus:border-indigo-500 transition-all" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-border/25 mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="px-5 rounded-xl border border-border/60 hover:bg-muted text-sm font-medium transition-all"
              >
                {t("Cancel")}
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !form.watch("departmentId") || !selectedRoleType}
                className="px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300"
              >
                {loading ? "Đang lưu..." : t("Save")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
