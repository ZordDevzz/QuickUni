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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  departmentSchema, 
  DepartmentInput,
  majorSchema,
  MajorInput,
  departmentEmploymentSchema,
  DepartmentEmploymentInput,
  departmentPositionSchema,
  DepartmentPositionInput,
} from "@/lib/validators/academic";
import { 
  upsertDepartment, 
  upsertMajor, 
  assignStaffToDepartment,
  getDepartmentDetails,
  getDepartmentPositions,
  upsertDepartmentPosition,
  deleteDepartmentPosition,
} from "@/actions/academic";
import { getPeople } from "@/actions/people";
import { notify } from "@/lib/custom-toast";
import { Building, GraduationCap, Briefcase, KeyRound, Shield, Calendar, UserPlus, FileText } from "lucide-react";

interface DepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: DepartmentInput;
  onSuccess?: () => void;
}

export function DepartmentDialog({ open, onOpenChange, initialData, onSuccess }: DepartmentDialogProps) {
  const t = useTranslations("Admin");
  const form = useForm<DepartmentInput>({
    resolver: zodResolver(departmentSchema),
    defaultValues: initialData || {
      code: "",
      name: "",
      des: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(initialData || {
        code: "",
        name: "",
        des: "",
      });
    }
  }, [open, initialData, form]);

  async function onSubmit(data: DepartmentInput) {
    try {
      await upsertDepartment(data);
      notify(initialData?.id ? "Đã cập nhật thông tin Khoa/Phòng" : "Đã tạo Khoa/Phòng mới", { type: "success" });
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      notify((error as Error).message || "Không thể lưu Khoa/Phòng", { type: "error" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] border border-border/40 bg-background/95 backdrop-blur-md shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-200">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-border/25">
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2.5">
            <Building className="h-5.5 w-5.5 text-indigo-500" />
            {initialData?.id ? "Chỉnh sửa Khoa / Phòng" : "Thêm Khoa / Phòng ban mới"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Thiết lập thông tin mã, tên và mô tả chi tiết cho đơn vị
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-3">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold tracking-wider uppercase text-muted-foreground">{t("Code")}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="VD: KCNTT, PHC" 
                      className="h-10 rounded-xl border-border/50 bg-background/50 hover:bg-background/80 hover:border-border focus:border-indigo-500 transition-all" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold tracking-wider uppercase text-muted-foreground">{t("Name")}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="VD: Khoa Công nghệ thông tin, Phòng Hành chính" 
                      className="h-10 rounded-xl border-border/50 bg-background/50 hover:bg-background/80 hover:border-border focus:border-indigo-500 transition-all" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="des"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold tracking-wider uppercase text-muted-foreground">{t("Description")}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Mô tả tóm tắt về chức năng, nhiệm vụ..." 
                      className="min-h-[80px] rounded-xl border-border/50 bg-background/50 hover:bg-background/80 hover:border-border focus:border-indigo-500 transition-all resize-none" 
                      {...field} 
                      value={field.value || ""} 
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
                className="px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300"
              >
                {t("Save")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface MajorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentId: string;
  initialData?: MajorInput;
  onSuccess?: () => void;
}

export function MajorDialog({ open, onOpenChange, departmentId, initialData, onSuccess }: MajorDialogProps) {
  const t = useTranslations("Admin");
  const form = useForm<MajorInput>({
    resolver: zodResolver(majorSchema),
    defaultValues: initialData || {
      code: "",
      departmentId: departmentId,
      des: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(initialData || {
        code: "",
        departmentId: departmentId,
        des: "",
      });
    }
  }, [open, initialData, departmentId, form]);

  async function onSubmit(data: MajorInput) {
    try {
      await upsertMajor(data);
      notify(initialData?.id ? "Đã cập nhật chuyên ngành" : "Đã tạo chuyên ngành mới", { type: "success" });
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      notify((error as Error).message || "Không thể lưu chuyên ngành", { type: "error" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] border border-border/40 bg-background/95 backdrop-blur-md shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-200">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-border/25">
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2.5">
            <GraduationCap className="h-5.5 w-5.5 text-indigo-500" />
            {initialData?.id ? "Chỉnh sửa chuyên ngành" : "Thêm chuyên ngành mới"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Thiết lập mã ngành và mô tả chi tiết thuộc khoa hiện tại
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-3">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold tracking-wider uppercase text-muted-foreground">{t("Code")}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="VD: CNTT, KHMT, DTVT" 
                      className="h-10 rounded-xl border-border/50 bg-background/50 hover:bg-background/80 hover:border-border focus:border-indigo-500 transition-all" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="des"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold tracking-wider uppercase text-muted-foreground">{t("Description")}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Mô tả chi tiết định hướng chuyên ngành..." 
                      className="min-h-[80px] rounded-xl border-border/50 bg-background/50 hover:bg-background/80 hover:border-border focus:border-indigo-500 transition-all resize-none" 
                      {...field} 
                      value={field.value || ""} 
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
                className="px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300"
              >
                {t("Save")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface StaffAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentId: string;
  initialData?: DepartmentEmploymentInput;
  onSuccess?: () => void;
}

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

export function StaffAssignmentDialog({ open, onOpenChange, departmentId, initialData, onSuccess }: StaffAssignmentDialogProps) {
  const t = useTranslations("Admin");
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedRoleType, setSelectedRoleType] = useState<string>("");
  const [dept, setDept] = useState<any>(null);
  const [dbPositions, setDbPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const form = useForm<DepartmentEmploymentInput>({
    resolver: zodResolver(departmentEmploymentSchema),
    defaultValues: initialData || {
      employeeId: "",
      departmentId: departmentId,
      assignDate: new Date().toISOString().split('T')[0],
      roleCode: "",
      roleName: "",
    },
  });

  // Determine whether the department is academic
  const isAcademic = dept
    ? (dept.name?.toLowerCase().includes("khoa") || 
       dept.code?.toLowerCase().startsWith("k") || 
       dept.name?.toLowerCase().includes("faculty") || 
       dept.name?.toLowerCase().includes("bộ môn") || 
       dept.name?.toLowerCase().includes("subject"))
    : true; // Default to academic list until fetched

  const activeRoles = dbPositions.length > 0 
    ? dbPositions 
    : (isAcademic ? ACADEMIC_ROLES : ADMIN_ROLES);

  useEffect(() => {
    if (open) {
      setSelectedRoleType(initialData?.roleCode || "");
      form.reset(initialData || {
        employeeId: "",
        departmentId: departmentId,
        assignDate: new Date().toISOString().split('T')[0],
        roleCode: "",
        roleName: "",
      });
      
      const loadData = async () => {
        try {
          // Fetch employees
          const data = await getPeople("employee");
          setEmployees(data);
          
          // Fetch current department details to check name/code
          const departmentData = await getDepartmentDetails(departmentId);
          setDept(departmentData);

          // Fetch database roles/positions
          const positionsData = await getDepartmentPositions(departmentId);
          setDbPositions(positionsData);
        } catch (error) {
          notify("Không thể tải thông tin đơn vị", { type: "error" });
        }
      };
      loadData();
    }
  }, [open, initialData, departmentId, form]);

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
      notify("Nhân sự đã được gán thành công", { type: "success" });
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
            <UserPlus className="h-5.5 w-5.5 text-indigo-500" />
            {t("AssignStaff")}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Bổ nhiệm nhân sự vào đơn vị <strong className="text-foreground font-semibold">{dept?.name || "..."}</strong>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-3">
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold tracking-wider uppercase text-muted-foreground">{t("Staff")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 rounded-xl border-border/50 bg-background/50 hover:bg-background/80 hover:border-border transition-all">
                        <SelectValue placeholder={t("SelectStaff")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-border/40">
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.profile?.fullname} ({emp.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Position Selector */}
            <div className="space-y-1.5">
              <FormLabel className="text-xs font-bold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-purple-500" />
                Chức vụ / Vị trí bổ nhiệm
              </FormLabel>
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

            {/* Custom inputs */}
            {selectedRoleType === "custom" && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <FormField
                  control={form.control}
                  name="roleCode"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-bold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
                        <KeyRound className="h-3.5 w-3.5 text-purple-500" />
                        {t("RoleCode")}
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
                        {t("RoleName")}
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

            <FormField
              control={form.control}
              name="assignDate"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-teal-500" />
                    {t("AssignDate")}
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
                disabled={loading || !form.watch("employeeId") || !selectedRoleType}
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

interface PositionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentId: string;
  initialData?: DepartmentPositionInput;
  onSuccess?: () => void;
}

export function PositionDialog({ open, onOpenChange, departmentId, initialData, onSuccess }: PositionDialogProps) {
  const t = useTranslations("Admin");
  const [loading, setLoading] = useState(false);

  const form = useForm<DepartmentPositionInput>({
    resolver: zodResolver(departmentPositionSchema),
    defaultValues: initialData || {
      departmentId,
      code: "",
      name: "",
      des: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(initialData || {
        departmentId,
        code: "",
        name: "",
        des: "",
      });
    }
  }, [open, initialData, departmentId, form]);

  async function onSubmit(data: DepartmentPositionInput) {
    try {
      setLoading(true);
      await upsertDepartmentPosition(data);
      notify(initialData?.id ? "Đã cập nhật chức vụ" : "Đã thêm chức vụ mới", { type: "success" });
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      notify((error as Error).message || "Không thể lưu chức vụ", { type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] border border-border/40 bg-background/95 backdrop-blur-md shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-200">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-border/25">
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2.5">
            <Briefcase className="h-5.5 w-5.5 text-indigo-500" />
            {initialData?.id ? "Chỉnh sửa chức vụ" : "Thêm chức vụ mới"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Quản lý chức danh chuyên môn trong cơ cấu tổ chức khoa/phòng ban
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-3">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-indigo-500" />
                    Mã chức vụ (Role Code)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="VD: TRUONG_KHOA, CHUYEN_VIEN" 
                      className="h-10 rounded-xl border-border/50 bg-background/50 hover:bg-background/80 hover:border-border focus:border-indigo-500 transition-all" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-indigo-500" />
                    Tên chức danh / Chức vụ
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="VD: Trưởng khoa, Chuyên viên phân tích" 
                      className="h-10 rounded-xl border-border/50 bg-background/50 hover:bg-background/80 hover:border-border focus:border-indigo-500 transition-all" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="des"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-indigo-500" />
                    Mô tả chức năng nhiệm vụ
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Mô tả tóm tắt quyền hạn, nhiệm vụ của chức danh..." 
                      className="min-h-[80px] rounded-xl border-border/50 bg-background/50 hover:bg-background/80 hover:border-border focus:border-indigo-500 transition-all resize-none" 
                      {...field} 
                      value={field.value || ""} 
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
                disabled={loading}
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
