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
import { getSemesters, toggleAvailabilityAction } from "@/actions/scheduling-data";
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
  const [dialogData, setDialogData] = useState<Partial<WeeklyTemplateInput> | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [semesterId, setSemesterId] = useState<number | null>(selectedSemesterId);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isEditAvailabilityMode, setIsEditAvailabilityMode] = useState(false);

  useEffect(() => {
    getSemesters().then(setSemesters);
  }, []);

  useEffect(() => {
    if (selectedSemesterId) {
      setSemesterId(selectedSemesterId);
    }
  }, [selectedSemesterId]);

  useEffect(() => {
    setSelectedId(null);
  }, [semesterId]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as EntityType);
    setSelectedId(null); // Reset selection when switching tabs
  };

  const handleCellClick = (dayIndex: number, period: number) => {
    if (isEditAvailabilityMode) return;
    
    // dayIndex is 0-6 (Mon-Sun), we need to map to DB Sunday-start (0=Sun, 1=Mon...)
    const dbDayOfWeek = (dayIndex + 1) % 7;
    
    setDialogData({
      dayOfWeek: dbDayOfWeek,
      startPeriod: period,
      endPeriod: Math.min(period + 1, 15),
      roomId: activeTab === "rooms" && selectedId ? parseInt(selectedId) : undefined,
      courseClassId: activeTab === "classes" && selectedId ? selectedId : undefined,
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

  const selectedSemester = semesters.find(s => s.id === semesterId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{t("Schedule")}</h1>
        <div className="flex gap-2">
          <Button 
            variant={isEditAvailabilityMode ? "secondary" : "outline"} 
            size="sm"
            onClick={() => setIsEditAvailabilityMode(!isEditAvailabilityMode)}
            className="gap-2"
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

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={!semesterId || isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                {t("AutoGenerate")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("ConfirmAutoGenerate")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("AutoGenerateDescription")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={handleAutoGenerate}>{t("Continue")}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

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
                key={`${activeTab}-${selectedId}-${refreshKey}-${semesterId}`}
                type={activeTab} 
                entityId={selectedId} 
                semesterId={semesterId}
                isEditMode={isEditAvailabilityMode}
                onCellClick={handleCellClick}
                onAssignmentClick={handleAssignmentClick}
                onToggleBlock={handleToggleBlock}
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
      />
    </div>
  );
}
