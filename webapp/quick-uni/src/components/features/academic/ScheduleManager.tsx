"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EntitySidebar } from "./EntitySidebar";
import { TimeGrid } from "./TimeGrid";
import { useState, useEffect, useTransition } from "react";
import { useTranslations } from "next-intl";
import { ScheduleSlotDialog } from "./ScheduleSlotDialog";
import { HolidayDialog } from "./HolidayDialog";
import { WeeklyTemplateInput } from "@/lib/validators/scheduling";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { autoGenerateWeeklyAction } from "@/actions/schedule-generate";
import { publishTemplateToSchedule } from "@/actions/schedule-publish";
import { getSemesters, toggleAvailabilityAction, getWeeklyTemplateByEntity, getAvailability } from "@/actions/scheduling-data";
import { getActualScheduleByEntity } from "@/actions/actual-schedule";
import { parseISO, format, addDays, startOfWeek } from "date-fns";
import { toast } from "sonner";
import { Loader2, Play, Send, Calendar, ChevronDown, Lock, Unlock } from "lucide-react";
import { useSemester } from "@/components/providers/semester-provider";
import { createMask } from "@/lib/scheduling/bitmask";

export type EntityType = "rooms" | "teachers" | "classes";

export function ScheduleManager() {
  const t = useTranslations("Admin");
  const { selectedSemesterId } = useSemester();
  const [activeTab, setActiveTab] = useState<EntityType>("rooms");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [semesterId, setSemesterId] = useState<number | null>(selectedSemesterId);
  const [prevSelectedSemesterId, setPrevSelectedSemesterId] = useState<number | null>(selectedSemesterId);
  const [prevSemesterId, setPrevSemesterId] = useState<number | null>(semesterId);

  const [viewMode, setViewMode] = useState<"template" | "actual">("template");
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(0);

  if (selectedSemesterId !== prevSelectedSemesterId) {
    setPrevSelectedSemesterId(selectedSemesterId);
    setSemesterId(selectedSemesterId);
  }

  if (semesterId !== prevSemesterId) {
    setPrevSemesterId(semesterId);
    setSelectedId(null);
    setSelectedWeekIndex(0);
  }

  const [semesters, setSemesters] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isEditAvailabilityMode, setIsEditAvailabilityMode] = useState(false);

  const [assignments, setAssignments] = useState<any[]>([]);
  const [availability, setAvailability] = useState<number[]>(new Array(7).fill(0));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getSemesters().then(setSemesters);
  }, []);

  const selectedSemester = semesters.find(s => s.id === semesterId);

  // Compute weeks dynamically
  const weeks: { index: number; label: string; start: string; end: string }[] = [];
  if (selectedSemester) {
    try {
      const start = parseISO(selectedSemester.startDate);
      const end = parseISO(selectedSemester.endDate);
      let currentMonday = startOfWeek(start, { weekStartsOn: 1 });
      let index = 1;
      while (currentMonday <= end) {
        const weekStartStr = format(currentMonday, "yyyy-MM-dd");
        const weekEndStr = format(addDays(currentMonday, 6), "yyyy-MM-dd");
        weeks.push({
          index,
          label: `Tuần ${index} (${format(currentMonday, "dd/MM")} - ${format(addDays(currentMonday, 6), "dd/MM")})`,
          start: weekStartStr,
          end: weekEndStr
        });
        currentMonday = addDays(currentMonday, 7);
        index++;
      }
    } catch (e) {
      console.error("Error computing weeks:", e);
    }
  }

  useEffect(() => {
    async function loadData() {
      if (!selectedId) {
        setAssignments([]);
        setAvailability(new Array(7).fill(0));
        return;
      }

      setIsLoading(true);
      try {
        const mappedType = activeTab === "rooms" ? "room" : activeTab === "teachers" ? "teacher" : "class";
        
        if (viewMode === "template") {
          const [templates, availData] = await Promise.all([
            getWeeklyTemplateByEntity(selectedId, mappedType as any, semesterId),
            getAvailability(selectedId, mappedType as any)
          ]);
          
          setAssignments(templates || []);
          
          const availMasks = new Array(7).fill(0);
          availData.forEach(a => {
            availMasks[a.dayOfWeek] = a.occupiedMask;
          });
          setAvailability(availMasks);
        } else {
          // Actual Mode
          const currentWeek = weeks[selectedWeekIndex];
          if (!currentWeek) {
            setAssignments([]);
            setIsLoading(false);
            return;
          }
          const [actuals, availData] = await Promise.all([
            getActualScheduleByEntity(selectedId, mappedType as any, currentWeek.start, currentWeek.end),
            getAvailability(selectedId, mappedType as any)
          ]);
          
          setAssignments(actuals || []);
          
          const availMasks = new Array(7).fill(0);
          availData.forEach(a => {
            availMasks[a.dayOfWeek] = a.occupiedMask;
          });
          setAvailability(availMasks);
        }
      } catch (error) {
        console.error("Failed to load data", error);
        setAssignments([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [selectedId, activeTab, semesterId, refreshKey, viewMode, selectedWeekIndex, weeks.length]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as EntityType);
    setSelectedId(null);
  };

  const handleCellClick = (dayIndex: number, period: number) => {
    if (isEditAvailabilityMode) return;
    
    const dbDayOfWeek = (dayIndex + 1) % 7;
    
    let schDate: string | undefined = undefined;
    if (viewMode === "actual" && weeks[selectedWeekIndex]) {
      schDate = format(addDays(parseISO(weeks[selectedWeekIndex].start), dayIndex), "yyyy-MM-dd");
    }

    setDialogData({
      dayOfWeek: dbDayOfWeek,
      startPeriod: period,
      endPeriod: Math.min(period + 1, 15),
      roomId: activeTab === "rooms" && selectedId ? parseInt(selectedId) : undefined,
      courseClassId: activeTab === "classes" && selectedId ? selectedId : undefined,
      schDate,
    });
    setIsDialogOpen(true);
  };

  const handleToggleBlock = async (dayIndex: number, period: number) => {
    if (!selectedId) return;
    
    const dbDayOfWeek = (dayIndex + 1) % 7;
    const slotMask = createMask(period, period);
    const mappedType = activeTab === "rooms" ? "room" : activeTab === "teachers" ? "teacher" : "class";
    
    const result = await toggleAvailabilityAction({
      entityId: selectedId,
      entityType: mappedType as any,
      dayOfWeek: dbDayOfWeek,
      slotMask
    });
    
    if (result.success) {
      setRefreshKey(prev => prev + 1);
    } else {
      toast.error(result.error || "Failed to toggle availability");
    }
  };

  const handleAssignmentClick = (assignment: any) => {
    if (isEditAvailabilityMode) return;
    
    setDialogData({
      id: assignment.id,
      courseClassId: assignment.courseClassId,
      roomId: assignment.roomId,
      dayOfWeek: assignment.dayOfWeek,
      startPeriod: assignment.startPeriod,
      endPeriod: assignment.endPeriod,
      scheduleTypeId: assignment.scheduleTypeId ?? 1,
      schDate: assignment.schDate,
    });
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleAutoGenerate = () => {
    if (!semesterId) return;
    startTransition(async () => {
      const result = await autoGenerateWeeklyAction(semesterId);
      if (result.success) {
        toast.success("Schedule generated successfully");
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error(result.error || "Failed to generate schedule");
      }
    });
  };

  const handlePublish = () => {
    if (!semesterId) return;
    startTransition(async () => {
      const result = await publishTemplateToSchedule(semesterId);
      if (result.success) {
        toast.success("Schedule published successfully");
      } else {
        toast.error(result.error || "Failed to publish schedule");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Schedule")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý lịch giảng dạy của giảng viên, phòng học và lớp học phần.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex bg-muted p-1 rounded-lg border">
            <Button
              variant={viewMode === "template" ? "default" : "ghost"}
              size="sm"
              className="h-7 text-xs px-3"
              onClick={() => {
                setViewMode("template");
                setSelectedId(null);
              }}
            >
              Bản mẫu tuần
            </Button>
            <Button
              variant={viewMode === "actual" ? "default" : "ghost"}
              size="sm"
              className="h-7 text-xs px-3"
              onClick={() => {
                setViewMode("actual");
                setSelectedId(null);
              }}
            >
              Lịch thực tế
            </Button>
          </div>

          {/* Week Selector for Actual Mode */}
          {viewMode === "actual" && weeks.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1 pr-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-semibold">
                    {weeks[selectedWeekIndex]?.label || "Chọn tuần"}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
                {weeks.map((w, idx) => (
                  <DropdownMenuItem 
                    key={w.index} 
                    onClick={() => setSelectedWeekIndex(idx)}
                    className={idx === selectedWeekIndex ? "bg-accent" : ""}
                  >
                    {w.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button 
            variant={isEditAvailabilityMode ? "secondary" : "outline"} 
            size="sm"
            onClick={() => setIsEditAvailabilityMode(!isEditAvailabilityMode)}
            className="gap-2"
            disabled={viewMode === "actual"} // Availability blocking only in template/setup
          >
            {isEditAvailabilityMode ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            <span className="hidden sm:inline-block">
              {isEditAvailabilityMode ? t("EditingAvailability") : t("EditAvailability")}
            </span>
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsHolidayDialogOpen(true)}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline-block">{t("Holidays")}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1 pr-2">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">
                  {selectedSemester?.name || t("SelectSemester")}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
              {semesters.map((s) => (
                <DropdownMenuItem 
                  key={s.id} 
                  onClick={() => setSemesterId(s.id)}
                  className={s.id === semesterId ? "bg-accent" : ""}
                >
                  {s.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {viewMode === "template" && (
            <>
              <Link href="/academic/schedule/wizard">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={!semesterId || isPending}
                  className="gap-2"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  <span>Thiết lập & Xếp lịch tự động</span>
                </Button>
              </Link>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="default" size="sm" disabled={!semesterId || isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    {t("Publish")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("ConfirmPublish")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("PublishDescription")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePublish}>{t("Continue")}</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="rooms">{t("Rooms")}</TabsTrigger>
          <TabsTrigger value="teachers">{t("Teachers")}</TabsTrigger>
          <TabsTrigger value="classes">{t("CourseClasses")}</TabsTrigger>
        </TabsList>
        
        <div className="flex flex-col lg:flex-row gap-6 mt-6 min-h-[600px]">
          <div className="w-full lg:w-64 shrink-0">
            <EntitySidebar 
                type={activeTab} 
                onSelect={setSelectedId} 
                selectedId={selectedId}
                semesterId={semesterId}
            />
          </div>
          <div className="flex-1">
            <TimeGrid 
                type={activeTab} 
                assignments={assignments}
                availability={availability}
                loading={isLoading}
                mode="edit"
                isEditAvailabilityMode={isEditAvailabilityMode}
                onCellClick={handleCellClick}
                onAssignmentClick={handleAssignmentClick}
                onToggleBlock={handleToggleBlock}
                showEmptyState={!selectedId}
                weekStartDate={viewMode === "actual" && weeks[selectedWeekIndex] ? weeks[selectedWeekIndex].start : undefined}
            />
          </div>
        </div>
      </Tabs>

      <HolidayDialog 
        isOpen={isHolidayDialogOpen}
        onClose={() => setIsHolidayDialogOpen(false)}
        semesterId={semesterId}
      />

      <ScheduleSlotDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        initialData={dialogData}
        semesterId={semesterId}
        onSuccess={handleSuccess}
        viewMode={viewMode}
      />
    </div>
  );
}
