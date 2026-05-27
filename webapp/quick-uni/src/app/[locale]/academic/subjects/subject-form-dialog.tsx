"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Plus, Trash, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { subjectSchema, SubjectInput } from "@/lib/validators/academic";
import { upsertSubject } from "@/actions/academic";
import { toast } from "sonner";
import { useTransition, useEffect } from "react";

interface SubjectFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingSubject: any | null;
  subjects: any[];
}

export function SubjectFormDialog({ isOpen, onOpenChange, editingSubject, subjects }: SubjectFormDialogProps) {
  const t = useTranslations("Subject");
  const [isPending, startTransition] = useTransition();

  const form = useForm<SubjectInput>({
    resolver: zodResolver(subjectSchema) as any,
    defaultValues: {
      code: "",
      name: "",
      credits: 3,
      des: "",
      recommendedSemesterIndex: null,
      prerequisites: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "prerequisites"
  });

  useEffect(() => {
    if (isOpen) {
      if (editingSubject) {
        form.reset({
          code: editingSubject.code,
          name: editingSubject.name,
          credits: editingSubject.credits,
          des: editingSubject.des || "",
          recommendedSemesterIndex: editingSubject.recommendedSemesterIndex || null,
          prerequisites: editingSubject.subjectPrerequisites_subjectId?.map((p: any) => ({
            prerequisiteId: p.prerequisiteId,
            type: p.type || "PREREQUISITE"
          })) || []
        });
      } else {
        form.reset({
          code: "",
          name: "",
          credits: 3,
          des: "",
          recommendedSemesterIndex: null,
          prerequisites: []
        });
      }
    }
  }, [isOpen, editingSubject, form]);

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
  };

  const onSubmit = async (values: SubjectInput) => {
    startTransition(async () => {
      try {
        const payload = {
          ...values,
          id: editingSubject?.id,
        };
        await upsertSubject(payload);
        toast.success(editingSubject ? t("UpdateSuccess") : t("CreateSuccess"));
        handleOpenChange(false);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "An error occurred";
        toast.error(errorMessage);
      }
    });
  };

  // Filter available subjects for prerequisites (exclude the current subject itself)
  const availablePrerequisites = subjects.filter(s => s.id !== editingSubject?.id);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingSubject ? t("EditSubject") : t("AddSubject")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control as any} name="code" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Code")}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t("CodePlaceholder")} disabled={isPending} className="font-mono font-bold uppercase" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control as any} name="credits" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Credits")}</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" placeholder={t("CreditsPlaceholder")} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control as any} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Name")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("NamePlaceholder")} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control as any} name="recommendedSemesterIndex" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("RecommendedSemester")}</FormLabel>
                  <FormControl>
                    <Input 
                      value={field.value ?? ""} 
                      onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                      type="number" 
                      placeholder={t("SemesterPlaceholder")} 
                      disabled={isPending} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control as any} name="des" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Description")}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} placeholder={t("DesPlaceholder")} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Prerequisites Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <FormLabel className="text-base font-semibold">{t("Prerequisites")}</FormLabel>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => append({ prerequisiteId: "", type: "PREREQUISITE" })}
                  disabled={isPending || availablePrerequisites.length === 0}
                >
                  <Plus className="mr-2 h-4 w-4" /> {t("AddSubject")}
                </Button>
              </div>

              {fields.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">{t("NoPrerequisites")}</p>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-3 items-end">
                      <FormField control={form.control as any} name={`prerequisites.${index}.prerequisiteId`} render={({ field: selectField }) => (
                        <FormItem className="flex-1">
                          <Select 
                            value={selectField.value} 
                            onValueChange={selectField.onChange} 
                            disabled={isPending}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("AddSubject")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availablePrerequisites.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                  [{s.code}] {s.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control as any} name={`prerequisites.${index}.type`} render={({ field: typeField }) => (
                        <FormItem className="w-[150px]">
                          <Select 
                            value={typeField.value} 
                            onValueChange={typeField.onChange} 
                            disabled={isPending}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="PREREQUISITE">{t("Prerequisite")}</SelectItem>
                              <SelectItem value="COREQUISITE">{t("Corequisite")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => remove(index)}
                        disabled={isPending}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
                {t("Cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("Save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
