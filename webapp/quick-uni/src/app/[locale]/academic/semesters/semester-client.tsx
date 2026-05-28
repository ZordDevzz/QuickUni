"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { getColumns, Semester } from "./semester-columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { semesterSchema, SemesterInput } from "@/lib/validators/academic";
import { createSemester, updateSemester } from "@/actions/academic";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";

export function SemesterClient({ data }: { data: Semester[] }) {
  const t = useTranslations("Semesters");
  const [isOpen, setIsOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);

  const form = useForm<SemesterInput>({
    resolver: zodResolver(semesterSchema),
    defaultValues: {
      code: "", 
      name: "", 
      academicYear: new Date().getFullYear(),
      startDate: "", 
      endDate: "", 
      isCurrent: false
    }
  });

  const onEdit = (s: Semester) => {
    setEditingSemester(s);
    form.reset({
      code: s.code,
      name: s.name,
      academicYear: s.academicYear,
      startDate: s.startDate,
      endDate: s.endDate,
      isCurrent: s.isCurrent || false
    });
    setIsOpen(true);
  };

  const onSubmit = async (values: SemesterInput) => {
    try {
      if (editingSemester) {
        await updateSemester(editingSemester.id, values);
        toast.success("Semester updated");
      } else {
        await createSemester(values);
        toast.success("Semester created");
      }
      setIsOpen(false);
      form.reset();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "An error occurred";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("Title")}</h2>
        <Button onClick={() => { 
          setEditingSemester(null); 
          form.reset({
            code: "", 
            name: "", 
            academicYear: new Date().getFullYear(),
            startDate: "", 
            endDate: "", 
            isCurrent: false
          }); 
          setIsOpen(true); 
        }}>
          <Plus className="mr-2 h-4 w-4" /> {t("AddSemester")}
        </Button>
      </div>

      <DataTable columns={getColumns(onEdit)} data={data} />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingSemester ? t("Edit") + " " + t("Title").toLowerCase().slice(0, -1) : t("AddSemester")}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Code")}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t("CodePlaceholder")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Name")}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t("NamePlaceholder")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="academicYear" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Year")}</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="isCurrent" render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-8">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>{t("IsCurrent")}</FormLabel>
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="startDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("StartDate")}</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="endDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("EndDate")}</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">{t("Save")}</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
