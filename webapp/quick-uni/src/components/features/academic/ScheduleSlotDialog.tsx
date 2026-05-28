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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  getRooms, 
  getCourseClasses, 
  getScheduleTypes,
  upsertWeeklyTemplate,
  deleteWeeklyTemplate,
  validateWeeklyTemplateEdit
} from "@/actions/scheduling-data";
import { upsertActualScheduleAction, deleteActualScheduleAction } from "@/actions/actual-schedule";
import { weeklyTemplateValidator, WeeklyTemplateInput } from "@/lib/validators/scheduling";
import { Loader2, Trash2, RefreshCw, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduleSlotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Partial<WeeklyTemplateInput & { scheduleTypeId?: number; schDate?: string }> | null;
  semesterId: number | null;
  onSuccess: () => void;
  viewMode?: 'template' | 'actual';
}

type RoomOption = Awaited<ReturnType<typeof getRooms>>[number];
type CourseClassOption = Awaited<ReturnType<typeof getCourseClasses>>[number];
type ScheduleTypeOption = Awaited<ReturnType<typeof getScheduleTypes>>[number];

export function ScheduleSlotDialog({ 
  isOpen, 
  onClose, 
  initialData, 
  semesterId,
  onSuccess,
  viewMode
}: ScheduleSlotDialogProps) {
  const t = useTranslations("Admin");
  const tSM = useTranslations("ScheduleManager");
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [courseClasses, setCourseClasses] = useState<CourseClassOption[]>([]);
  const [scheduleTypes, setScheduleTypes] = useState<ScheduleTypeOption[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadOptions() {
    await Promise.resolve();
    setLoading(true);
    try {
      const [roomsData, typesData] = await Promise.all([
        getRooms(),
        getScheduleTypes(),
      ]);
      setRooms(roomsData);
      setScheduleTypes(typesData);

      if (semesterId) {
        const classesData = await getCourseClasses(semesterId);
        setCourseClasses(classesData);
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to load form options");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function init() {
      if (isOpen) {
        await loadOptions();
      }
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, semesterId]);

  const form = useForm({
    defaultValues: {
      id: initialData?.id,
      courseClassId: initialData?.courseClassId ?? "",
      roomId: initialData?.roomId ?? 0,
      dayOfWeek: initialData?.dayOfWeek ?? 0,
      startPeriod: initialData?.startPeriod ?? 1,
      endPeriod: initialData?.endPeriod ?? 1,
      scheduleType: (initialData as any)?.scheduleTypeId ?? 1,
    } as WeeklyTemplateInput,
    onSubmit: async ({ value }) => {
      try {
        const validation = weeklyTemplateValidator.safeParse(value);
        if (!validation.success) {
          toast.error(validation.error.issues[0].message);
          return;
        }

        if (viewMode === 'actual') {
          const schDate = (initialData as any)?.schDate;
          if (!schDate) {
            toast.error(tSM("InvalidActualDate") || "Invalid actual date");
            return;
          }

          const result = await upsertActualScheduleAction({
            id: initialData?.id,
            courseClassId: validation.data.courseClassId,
            roomId: validation.data.roomId,
            schDate,
            startPeriod: validation.data.startPeriod,
            endPeriod: validation.data.endPeriod,
            scheduleType: validation.data.scheduleType
          });

          if (result.success) {
            toast.success(initialData?.id ? t("UpdateSuccess") : t("CreateSuccess"));
            onSuccess();
            onClose();
          } else {
            toast.error(result.error || tSM("ErrorSaveActual") || "Failed to save actual schedule");
          }
          return;
        }

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast.error("Failed to save schedule slot");
      }
    },
  });

  async function handleDelete() {
    if (!initialData?.id) return;

    setIsDeleting(true);
    try {
      if (viewMode === 'actual') {
        const result = await deleteActualScheduleAction(initialData.id);
        if (result.success) {
          toast.success(t("DeleteSuccess"));
          onSuccess();
          onClose();
        } else {
          toast.error(result.error || tSM("ErrorDeleteActual") || "Failed to delete actual schedule");
        }
        return;
      }

      const result = await deleteWeeklyTemplate(initialData.id);
      if (result.success) {
        toast.success(t("DeleteSuccess"));
        onSuccess();
        onClose();
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to delete schedule slot");
    } finally {
      setIsDeleting(false);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const PERIODS = Array.from({ length: 15 }, (_, i) => i + 1);

  const getTypeColor = (typeId: number) => {
    if (typeId === 2) return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20";
    return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
  };

  const getTypeIcon = (typeId: number) => {
    return typeId === 2
      ? <RefreshCw className="h-3 w-3" />
      : <BookOpen className="h-3 w-3" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {initialData?.id ? t("EditScheduleSlot") : t("AddScheduleSlot")}
          </DialogTitle>
        </DialogHeader>

        {viewMode === 'actual' && (initialData as any)?.schDate && (
          <div className="bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 px-3 py-2 rounded-md text-xs font-semibold text-center flex items-center justify-center gap-1.5">
            {tSM("ActualDates")} <span className="underline font-bold">{(initialData as any).schDate}</span>
          </div>
        )}

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
            {/* Schedule Type Selector */}
            <form.Field name="scheduleType">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>{tSM("ScheduleType")}</Label>
                  <div className="flex gap-2">
                    {scheduleTypes.map((type) => {
                      const isSelected = field.state.value === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => field.handleChange(type.id)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all flex-1 justify-center",
                            isSelected
                              ? getTypeColor(type.id) + " border shadow-xs"
                              : "border-border/50 text-muted-foreground hover:bg-muted/20"
                          )}
                        >
                          {getTypeIcon(type.id)}
                          {type.name}
                        </button>
                      );
                    })}
                  </div>
                  {/* Live preview badge */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-muted-foreground">{tSM("DisplayOnCalendar")}</span>
                    <Badge
                      variant="outline"
                      className={cn("text-[9px] px-2 py-0 h-4 gap-1", getTypeColor(field.state.value as number))}
                    >
                      {getTypeIcon(field.state.value as number)}
                      {scheduleTypes.find(t => t.id === field.state.value)?.name ?? (tSM("MainSchedule") || "Main Schedule")}
                    </Badge>
                  </div>
                </div>
              )}
            </form.Field>

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
                        <option key={p} value={p}>{p}</option>
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
                        <option key={p} value={p}>{p}</option>
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
