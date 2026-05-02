"use client";

import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useTranslations } from "next-intl";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  getRooms, 
  getCourseClasses, 
  upsertWeeklyTemplate,
  deleteWeeklyTemplate,
  validateWeeklyTemplateEdit
} from "@/actions/scheduling-data";
import { weeklyTemplateValidator, WeeklyTemplateInput } from "@/lib/validators/scheduling";
import { Loader2, Trash2 } from "lucide-react";

interface ScheduleSlotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Partial<WeeklyTemplateInput> | null;
  semesterId: number | null;
  onSuccess: () => void;
}

type RoomOption = Awaited<ReturnType<typeof getRooms>>[number];
type CourseClassOption = Awaited<ReturnType<typeof getCourseClasses>>[number];

export function ScheduleSlotDialog({ 
  isOpen, 
  onClose, 
  initialData, 
  semesterId,
  onSuccess 
}: ScheduleSlotDialogProps) {
  const t = useTranslations("Admin");
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [courseClasses, setCourseClasses] = useState<CourseClassOption[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadOptions();
    }
  }, [isOpen]);

  async function loadOptions() {
    setLoading(true);
    try {
      const roomsData = await getRooms();
      setRooms(roomsData);
      
      if (semesterId) {
        const classesData = await getCourseClasses(semesterId);
        setCourseClasses(classesData);
      }
    } catch (error) {
      toast.error("Failed to load form options");
    } finally {
      setLoading(false);
    }
  }

  const form = useForm({
    defaultValues: {
      id: initialData?.id,
      courseClassId: initialData?.courseClassId ?? "",
      roomId: initialData?.roomId ?? 0,
      dayOfWeek: initialData?.dayOfWeek ?? 0,
      startPeriod: initialData?.startPeriod ?? 1,
      endPeriod: initialData?.endPeriod ?? 1,
    } as WeeklyTemplateInput,
    onSubmit: async ({ value }) => {
      try {
        const validation = weeklyTemplateValidator.safeParse(value);
        if (!validation.success) {
          toast.error(validation.error.issues[0].message);
          return;
        }

        // Validate collisions
        const validationResult = await validateWeeklyTemplateEdit(validation.data);
        if (!validationResult.valid) {
          toast.error(validationResult.reason);
          return;
        }

        const result = await upsertWeeklyTemplate(validation.data);
        if (result.success) {
          toast.success(initialData?.id ? t("UpdateSuccess") : t("CreateSuccess"));
          onSuccess();
          onClose();
        }
      } catch (error) {
        toast.error("Failed to save schedule slot");
      }
    },
  });

  async function handleDelete() {
    if (!initialData?.id) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteWeeklyTemplate(initialData.id);
      if (result.success) {
        toast.success(t("DeleteSuccess"));
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error("Failed to delete schedule slot");
    } finally {
      setIsDeleting(false);
    }
  }

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const PERIODS = Array.from({ length: 15 }, (_, i) => i + 1);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? t("EditScheduleSlot") : t("AddScheduleSlot")}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <form.Field name="courseClassId">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>{t("CourseClass")}</Label>
                  <select
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">{t("SelectCourseClass")}</option>
                    {courseClasses.map((cc) => (
                      <option key={cc.id} value={cc.id}>
                        {cc.code} - {cc.subject?.name} ({cc.employee?.profile?.fullname})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </form.Field>

            <form.Field name="roomId">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>{t("Room")}</Label>
                  <select
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="0">{t("SelectRoom")}</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.code} ({room.building?.name})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </form.Field>

            <div className="grid grid-cols-3 gap-4">
              <form.Field name="dayOfWeek">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>{t("Day")}</Label>
                    <select
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {/* Mapping UI Monday-start to DB Sunday-start (0-6) */}
                      {/* 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 0=Sun */}
                      <option value="1">{t("Mon")}</option>
                      <option value="2">{t("Tue")}</option>
                      <option value="3">{t("Wed")}</option>
                      <option value="4">{t("Thu")}</option>
                      <option value="5">{t("Fri")}</option>
                      <option value="6">{t("Sat")}</option>
                      <option value="0">{t("Sun")}</option>
                    </select>
                  </div>
                )}
              </form.Field>

              <form.Field name="startPeriod">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>{t("StartPeriod")}</Label>
                    <select
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {PERIODS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </form.Field>

              <form.Field name="endPeriod">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>{t("EndPeriod")}</Label>
                    <select
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {PERIODS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </form.Field>
            </div>

            <DialogFooter className="flex justify-between items-center sm:justify-between">
              {initialData?.id ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  <span className="ml-2">{t("Delete")}</span>
                </Button>
              ) : (
                <div />
              )}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  {t("Cancel")}
                </Button>
                <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                  {([canSubmit, isSubmitting]) => (
                    <Button type="submit" disabled={!canSubmit || isSubmitting}>
                      {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      {initialData?.id ? t("Save") : t("Add")}
                    </Button>
                  )}
                </form.Subscribe>
              </div>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
