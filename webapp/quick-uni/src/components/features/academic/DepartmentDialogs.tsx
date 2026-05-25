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
  departmentSchema, 
  DepartmentInput,
  majorSchema,
  MajorInput,
  departmentEmploymentSchema,
  DepartmentEmploymentInput
} from "@/lib/validators/academic";
import { 
  upsertDepartment, 
  upsertMajor, 
  assignStaffToDepartment 
} from "@/actions/academic";
import { getPeople } from "@/actions/people";
import { notify } from "@/lib/custom-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

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
      notify(initialData?.id ? "Department updated" : "Department created", { type: "success" });
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      notify(error.message || "Failed to save department", { type: "error" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData?.id ? t("EditDepartment") : t("AddDepartment")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Code")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Name")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="des"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Description")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t("Cancel")}
              </Button>
              <Button type="submit">{t("Save")}</Button>
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
      notify(initialData?.id ? "Major updated" : "Major created", { type: "success" });
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      notify(error.message || "Failed to save major", { type: "error" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData?.id ? t("EditMajor") : t("AddMajor")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Code")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="des"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Description")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t("Cancel")}
              </Button>
              <Button type="submit">{t("Save")}</Button>
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

export function StaffAssignmentDialog({ open, onOpenChange, departmentId, initialData, onSuccess }: StaffAssignmentDialogProps) {
  const t = useTranslations("Admin");
  const [employees, setEmployees] = useState<any[]>([]);
  
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

  useEffect(() => {
    if (open) {
      form.reset(initialData || {
        employeeId: "",
        departmentId: departmentId,
        assignDate: new Date().toISOString().split('T')[0],
        roleCode: "",
        roleName: "",
      });
      
      const loadEmployees = async () => {
        const data = await getPeople("employee");
        setEmployees(data);
      };
      loadEmployees();
    }
  }, [open, initialData, departmentId, form]);

  async function onSubmit(data: DepartmentEmploymentInput) {
    try {
      await assignStaffToDepartment(data);
      notify("Staff assigned successfully", { type: "success" });
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      notify(error.message || "Failed to assign staff", { type: "error" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("AssignStaff")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Staff")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("SelectStaff")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.profile?.fullname} ({emp.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roleCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("RoleCode")}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("RoleName")}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assignDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("AssignDate")}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t("Cancel")}
              </Button>
              <Button type="submit">{t("Save")}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
