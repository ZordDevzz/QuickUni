"use client";

import { useState, useEffect } from "react";
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
  FormDescription
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
import { submitRequest, getClassScheduleSlots } from "@/actions/workflow";
import { notify } from "@/lib/custom-toast";

const teacherRequestSchema = z.object({
  type: z.enum(["teacher_schedule_change"]),
  classId: z.string().min(1, "Required"),
  scheduleId: z.string().min(1, "Required"),
  newDate: z.string().optional(),
  newStartPeriod: z.string().optional(),
  newEndPeriod: z.string().optional(),
  newRoomId: z.string().optional(),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
}).refine((data) => {
  if (data.type === "teacher_schedule_change") {
    return !!data.newDate && !!data.newStartPeriod && !!data.newEndPeriod;
  }
  return true;
}, {
  message: "New date, start period, and end period are required for schedule change",
  path: ["newDate"]
});

type TeacherRequestFormValues = z.infer<typeof teacherRequestSchema>;

interface TeacherRequestWizardProps {
  classes: any[];
  rooms: any[];
}

export default function TeacherRequestWizard({ classes, rooms }: TeacherRequestWizardProps) {
  const tWorkflow = useTranslations("Workflow");
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slots, setSlots] = useState<{ id: string; schDate: string; period: number; endPeriod: number; roomCode: string }[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const form = useForm<TeacherRequestFormValues>({
    resolver: zodResolver(teacherRequestSchema),
    defaultValues: {
      type: "teacher_schedule_change",
      classId: "",
      scheduleId: "",
      newDate: "",
      newStartPeriod: "1",
      newEndPeriod: "4",
      newRoomId: "",
      reason: "",
    },
  });

  const selectedType = form.watch("type");
  const selectedClassId = form.watch("classId");

  // Load schedule slots when a class is selected for cancellation or schedule change
  useEffect(() => {
    if (selectedClassId) {
      setIsLoadingSlots(true);
      getClassScheduleSlots(selectedClassId)
        .then((data) => {
          setSlots(data);
          if (data.length > 0) {
            form.setValue("scheduleId", data[0].id);
          } else {
            form.setValue("scheduleId", "");
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setIsLoadingSlots(false));
    } else {
      setSlots([]);
      form.setValue("scheduleId", "");
    }
  }, [selectedClassId, form]);

  async function onSubmit(data: TeacherRequestFormValues) {
    setIsSubmitting(true);
    try {
      await submitRequest(data.type, {
        classId: data.classId,
        scheduleId: data.scheduleId,
        newDate: data.newDate || undefined,
        newStartPeriod: data.newStartPeriod ? parseInt(data.newStartPeriod) : undefined,
        newEndPeriod: data.newEndPeriod ? parseInt(data.newEndPeriod) : undefined,
        newRoomId: data.newRoomId ? parseInt(data.newRoomId) : undefined,
        reason: data.reason
      });
      
      notify(tWorkflow("Status.approved"), { type: "success" });
      setOpen(false);
      form.reset();
      setStep(1);
    } catch (error: unknown) {
      console.error(error);
      notify((error as Error).message || tWorkflow("Status.rejected"), { type: "error" });
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
          {tWorkflow("Submit")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? tWorkflow("ReviewTitle") : tWorkflow("Details")}
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
                      <FormLabel>{tWorkflow("TypeHeader")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={tWorkflow("TypeHeader")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="teacher_schedule_change">{tWorkflow("Type.teacher_schedule_change")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 py-4 max-h-[380px] overflow-y-auto pr-1">
                <FormField
                  control={form.control}
                  name="classId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tWorkflow("Form.SelectClass")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={tWorkflow("Form.SelectClass")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classes.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.subject.name} ({c.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedClassId && (
                  (() => {
                    const todayStr = new Date().toISOString().split("T")[0];
                    const activeSlots = slots.filter((s) => s.schDate >= todayStr);
                    
                    return (
                      <FormField
                        control={form.control}
                        name="scheduleId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{tWorkflow("Form.SelectSlot")}</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              disabled={isLoadingSlots || activeSlots.length === 0}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={isLoadingSlots ? "Loading slots..." : (activeSlots.length === 0 ? "Không có buổi học sắp tới nào" : tWorkflow("Form.SelectSlotPlaceholder"))} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {activeSlots.map((s) => (
                                  <SelectItem key={s.id} value={s.id}>
                                    {s.schDate} (Tiết {s.period}-{s.endPeriod}, Phòng {s.roomCode})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    );
                  })()
                )}

                {selectedType === 'teacher_schedule_change' && (
                  <>
                    <FormField
                      control={form.control}
                      name="newDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{tWorkflow("Form.NewDate")}</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              min={new Date().toISOString().split("T")[0]} 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="newStartPeriod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tiết bắt đầu mới</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Array.from({ length: 15 }, (_, i) => i + 1).map((p) => (
                                  <SelectItem key={p} value={p.toString()}>
                                    Tiết {p}
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
                        name="newEndPeriod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tiết kết thúc mới</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Array.from({ length: 15 }, (_, i) => i + 1).map((p) => (
                                  <SelectItem key={p} value={p.toString()}>
                                    Tiết {p}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="newRoomId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{tWorkflow("Form.NewRoom")}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={tWorkflow("Form.NewRoom")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {rooms.map((r) => (
                                <SelectItem key={r.id} value={r.id.toString()}>
                                  {r.code} (Sức chứa: {r.capacity})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tWorkflow("Form.Reason")}</FormLabel>
                      <FormControl>
                        <textarea
                          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder={tWorkflow("Form.ReasonPlaceholder")}
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
                  {tWorkflow("Form.NewDate") ? "Tiếp theo" : "Next"}
                </Button>
              ) : (
                <>
                  <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={isSubmitting}>
                    Quay lại
                  </Button>
                  <Button type="submit" disabled={isSubmitting || slots.length === 0}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Gửi yêu cầu
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
