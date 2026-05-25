"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { Plus, Loader2 } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitRequest } from "@/actions/workflow";
import { notify } from "@/lib/custom-toast";

const requestSchema = z.object({
  type: z.enum(["student_absence", "class_cancellation"]),
  classId: z.string().min(1, "Required"),
  date: z.string().optional(),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
});

type RequestFormValues = z.infer<typeof requestSchema>;

interface RequestWizardProps {
  enrollments: any[];
}

export default function RequestWizard({ enrollments }: RequestWizardProps) {
  const t = useTranslations("Student.Requests.Wizard");
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      type: "student_absence",
      classId: "",
      date: new Date().toISOString().split('T')[0],
      reason: "",
    },
  });

  const selectedType = form.watch("type");

  async function onSubmit(data: RequestFormValues) {
    setIsSubmitting(true);
    try {
      await submitRequest(data.type, {
        classId: data.classId,
        date: data.date,
        reason: data.reason
      });
      
      notify(t("Success"), { type: "success" });
      setOpen(false);
      form.reset();
      setStep(1);
    } catch (error: any) {
      console.error(error);
      notify(t("Error"), { type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  const nextStep = async () => {
    const typeValid = await form.trigger("type");
    if (typeValid) {
      setStep(2);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) {
        setStep(1);
        form.reset();
      }
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t("Submit")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? t("Step1Title") : t("Step2Title")}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {step === 1 && (
              <div className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("SelectType")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("SelectType")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="student_absence">{t("StudentAbsence")}</SelectItem>
                          <SelectItem value="class_cancellation">{t("ClassCancellation")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="classId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Class")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("SelectClass")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {enrollments.map((en) => (
                            <SelectItem key={en.courseClass.id} value={en.courseClass.id}>
                              {en.courseClass.subject.name} ({en.courseClass.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedType === 'student_absence' && (
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Date")}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Reason")}</FormLabel>
                      <FormControl>
                        <textarea
                          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder={t("ReasonPlaceholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <DialogFooter>
              {step === 1 ? (
                <Button type="button" onClick={nextStep}>
                  {t("Next")}
                </Button>
              ) : (
                <>
                  <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={isSubmitting}>
                    {t("Previous")}
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("Submit")}
                  </Button>
                </>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
