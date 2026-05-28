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
import { Button } from "@/components/ui/button";
import { 
  mainClassSchema, 
  MainClassInput
} from "@/lib/validators/academic";
import { 
  upsertMainClass,
  getMajors,
  getEducationTypes
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

interface ClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: MainClassInput;
  onSuccess?: () => void;
}

export function ClassDialog({ open, onOpenChange, initialData, onSuccess }: ClassDialogProps) {
  const t = useTranslations("Admin");
  const tClass = useTranslations("MainClasses");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [majors, setMajors] = useState<any[]>([]);
  const [eduTypes, setEduTypes] = useState<any[]>([]);

  const form = useForm<any>({
    resolver: zodResolver(mainClassSchema),
    defaultValues: initialData || {
      code: "",
      teacher: "",
      typeId: undefined as any,
      majorId: "",
      academicYear: new Date().getFullYear(),
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(initialData ? {
        id: initialData.id,
        code: initialData.code || "",
        teacher: initialData.teacher || "",
        typeId: initialData.typeId,
        majorId: initialData.majorId || "",
        academicYear: initialData.academicYear || new Date().getFullYear(),
      } : {
        code: "",
        teacher: "",
        typeId: undefined as any,
        majorId: "",
        academicYear: new Date().getFullYear(),
      });

      const loadOptions = async () => {
        try {
          const [teachersList, majorsList, eduTypesList] = await Promise.all([
            getPeople("employee"),
            getMajors(),
            getEducationTypes()
          ]);
          setTeachers(teachersList);
          setMajors(majorsList);
          setEduTypes(eduTypesList);
        } catch (error) {
          console.error("Failed to load options for ClassDialog", error);
        }
      };
      loadOptions();
    }
  }, [open, initialData, form]);

  async function onSubmit(data: MainClassInput) {
    try {
      await upsertMainClass(data);
      notify(initialData?.id ? tClass("ToastUpdateSuccess") : tClass("ToastCreateSuccess"), { type: "success" });
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      notify((error as Error).message || tClass("ToastSaveFailed"), { type: "error" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData?.id ? tClass("EditClass") : tClass("AddClass")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tClass("Code")}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={tClass("CodePlaceholder")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teacher"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tClass("Teacher")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={tClass("SelectTeacher")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teachers.map((teach) => (
                        <SelectItem key={teach.id} value={teach.id}>
                          {teach.profile?.fullname} ({teach.code})
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
              name="majorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tClass("Major")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={tClass("SelectMajor")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {majors.map((major) => (
                        <SelectItem key={major.id} value={major.id}>
                          {major.des || major.code} ({major.code})
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
              name="typeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tClass("EducationType")}</FormLabel>
                  <Select 
                    onValueChange={(val) => field.onChange(parseInt(val))} 
                    value={field.value ? field.value.toString() : ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={tClass("SelectEduType")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eduTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name} ({type.code})
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
              name="academicYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tClass("AcademicYear")} {tClass("AcademicYearSuffix")}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
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
