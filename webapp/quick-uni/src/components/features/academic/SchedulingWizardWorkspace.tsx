"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { autoGenerateWeeklyAction } from "@/actions/schedule-generate";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useSemester } from "@/components/providers/semester-provider";
import { useTranslations } from "next-intl";
import { 
  getRoomsSetup, 
  updateRoomAvailabilityAction,
  getTeachersSetup,
  updateTeacherSetupAction,
  getCourseClassesSetup,
  updateCourseClassSetupAction
} from "@/actions/scheduling-setup";
import { 
  Loader2, 
  Building, 
  Users, 
  BookOpen, 
  Clock, 
  Check, 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  Lock,
  Search,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "Rooms", icon: Building },
  { key: "Teachers", icon: Users },
  { key: "Classes", icon: BookOpen },
  { key: "Launch", icon: Play }
];

const DAYS = [
  { key: "Mon", dbIndex: 1 },
  { key: "Tue", dbIndex: 2 },
  { key: "Wed", dbIndex: 3 },
  { key: "Thu", dbIndex: 4 },
  { key: "Fri", dbIndex: 5 },
  { key: "Sat", dbIndex: 6 },
  { key: "Sun", dbIndex: 0 }
];

const PERIODS = Array.from({ length: 15 }, (_, i) => i + 1);

export function SchedulingWizardWorkspace() {
  const { selectedSemesterId } = useSemester();
  const t = useTranslations("SchedulingWizard");
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // --- Step 1: Rooms State ---
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomSearch, setRoomSearch] = useState("");
  const [roomTogglingId, setRoomTogglingId] = useState<number | null>(null);

  // --- Step 2: Teachers State ---
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [teacherPrefs, setTeacherPrefs] = useState<Record<string, number>>({});
  
  // Current teacher editing state
  const [prefDays, setPrefDays] = useState(2);
  const [busyMasks, setBusyMasks] = useState<number[]>(new Array(7).fill(0));

  // --- Step 3: Classes State ---
  const [classes, setClasses] = useState<any[]>([]);
  const [classSearch, setClassSearch] = useState("");
  const [classSavingId, setClassSavingId] = useState<string | null>(null);

  // --- Load Data ---
  useEffect(() => {
    loadRooms();
    loadTeachers();
    if (selectedSemesterId) {
      loadClasses(selectedSemesterId);
    }
  }, [selectedSemesterId]);

  async function loadRooms() {
    setLoading(true);
    try {
      const data = await getRoomsSetup();
      setRooms(data);
    } catch (error) {
      toast.error(t("ErrorLoadRooms") || "Failed to load rooms");
    } finally {
      setLoading(false);
    }
  }

  async function loadTeachers() {
    try {
      const data = await getTeachersSetup();
      setTeachers(data);
      
      const defaultPrefs: Record<string, number> = {};
      data.forEach(t => {
        defaultPrefs[t.id] = 2; // Default consecutive days is 2
      });
      setTeacherPrefs(defaultPrefs);

      if (data.length > 0 && !selectedTeacherId) {
        selectTeacher(data[0], defaultPrefs);
      }
    } catch (error) {
      toast.error(t("ErrorLoadTeachers") || "Failed to load teachers");
    }
  }

  async function loadClasses(semId: number) {
    try {
      const data = await getCourseClassesSetup(semId);
      setClasses(data);
    } catch (error) {
      toast.error(t("ErrorLoadClasses") || "Failed to load classes");
    }
  }

  const selectTeacher = (teacher: any, currentPrefs?: Record<string, number>) => {
    setSelectedTeacherId(teacher.id);
    const prefs = currentPrefs || teacherPrefs;
    setPrefDays(prefs[teacher.id] || 2);
    setBusyMasks([...teacher.busyMasks]);
  };

  // --- Actions ---
  const handleToggleRoom = async (roomId: number, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setRoomTogglingId(roomId);
    
    // Optimistic update
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, isAvailable: nextStatus } : r));

    try {
      const res = await updateRoomAvailabilityAction(roomId, nextStatus);
      if (res.success) {
        toast.success(t("SuccessUpdateRoom", { code: rooms.find(r => r.id === roomId)?.code }) || `Updated room ${rooms.find(r => r.id === roomId)?.code}`);
      } else {
        throw new Error(res.error);
      }
    } catch (error) {
      toast.error(t("ErrorUpdateRoom") || "Failed to update room");
      // Rollback
      setRooms(prev => prev.map(r => r.id === roomId ? { ...r, isAvailable: currentStatus } : r));
    } finally {
      setRoomTogglingId(null);
    }
  };

  const handleBulkToggleRoomsInBuilding = async (buildingId: number, targetStatus: boolean) => {
    const roomsInBuilding = rooms.filter(r => r.buildingId === buildingId);
    if (roomsInBuilding.length === 0) return;

    const promise = Promise.all(
      roomsInBuilding.map(r => updateRoomAvailabilityAction(r.id, targetStatus))
    );

    toast.promise(promise, {
      loading: t("UpdatingAllRooms") || "Updating all rooms...",
      success: () => {
        setRooms(prev => prev.map(r => r.buildingId === buildingId ? { ...r, isAvailable: targetStatus } : r));
        return `Đã cập nhật trạng thái toàn bộ phòng trong tòa nhà thành công!`;
      },
      error: t("ErrorBulkUpdate") || "Failed to bulk update rooms"
    });
  };

  const handleToggleTeacherSlot = async (dayOfWeek: number, period: number) => {
    if (!selectedTeacherId) return;
    const mask = 1 << (period - 1);
    
    // Compute next busy masks
    const nextBusyMasks = [...busyMasks];
    nextBusyMasks[dayOfWeek] = nextBusyMasks[dayOfWeek] ^ mask;
    
    // Update local states immediately (instant UI feedback)
    setBusyMasks(nextBusyMasks);
    setTeachers(prev => prev.map(t => t.id === selectedTeacherId ? { ...t, busyMasks: nextBusyMasks } : t));
    
    // Save silently in the background
    try {
      await updateTeacherSetupAction(selectedTeacherId, nextBusyMasks);
    } catch (error) {
      console.error("Failed to save teacher setup in background:", error);
    }
  };

  const handleUpdateClassSettings = async (
    classId: string,
    minPeriods: number,
    allowEvening: boolean,
    allowWeekend?: boolean,
    preferredStartPeriod?: number | null
  ) => {
    setClassSavingId(classId);
    try {
      const res = await updateCourseClassSetupAction(classId, minPeriods, allowEvening, allowWeekend, preferredStartPeriod);
      if (res.success) {
        setClasses(prev => prev.map(c => c.id === classId ? {
          ...c,
          minSessionPeriods: minPeriods,
          allowEvening,
          allowWeekend: allowWeekend ?? false,
          preferredStartPeriod: preferredStartPeriod ?? null
        } : c));
        toast.success(t("SuccessSaveClass") || "Class settings saved", { duration: 1000 });
      } else {
        toast.error(res.error || t("ErrorSaveClass") || "Failed to save class");
      }
    } catch (error) {
      toast.error(t("ErrorSaveClass") || "Failed to save class");
    } finally {
      setClassSavingId(null);
    }
  };

  const handleStartScheduling = () => {
    if (!selectedSemesterId) return;
    
    startTransition(async () => {
      const promise = autoGenerateWeeklyAction(selectedSemesterId, teacherPrefs);
      
      toast.promise(promise, {
        loading: t("Processing") || "Processing optimization scheduling...",
        success: (res) => {
          if (res.success) {
            onSuccessRedirect();
            return t("SuccessScheduling") || "Scheduling successful!";
          } else {
            throw new Error(res.error || t("ErrorNoSolution") || "No optimal solution found.");
          }
        },
        error: (err) => err.message || t("ErrorScheduling") || "Scheduling failed."
      });
    });
  };

  const onSuccessRedirect = () => {
    // Redirect back to dashboard after brief delay
    setTimeout(() => {
      window.location.href = "/academic/schedule";
    }, 1500);
  };

  // --- Group Rooms by Building ---
  const buildingsMap: Record<number, { name: string; code: string; rooms: any[] }> = {};
  rooms.forEach(r => {
    if (!buildingsMap[r.buildingId]) {
      buildingsMap[r.buildingId] = {
        name: r.building?.name || r.building?.code || "Tòa nhà ẩn",
        code: r.building?.code || "",
        rooms: []
      };
    }
    buildingsMap[r.buildingId].rooms.push(r);
  });

  // --- Filtering ---
  const filteredBuildings = Object.entries(buildingsMap).map(([id, b]) => {
    const matchedRooms = b.rooms.filter(r => 
      r.code.toLowerCase().includes(roomSearch.toLowerCase()) || 
      b.name.toLowerCase().includes(roomSearch.toLowerCase()) ||
      b.code.toLowerCase().includes(roomSearch.toLowerCase())
    );
    return {
      id: parseInt(id),
      name: b.name,
      code: b.code,
      rooms: matchedRooms
    };
  }).filter(b => b.rooms.length > 0);

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(teacherSearch.toLowerCase()) || 
    t.code.toLowerCase().includes(teacherSearch.toLowerCase())
  );

  const filteredClasses = classes.filter(c => 
    c.code.toLowerCase().includes(classSearch.toLowerCase()) || 
    c.subject?.name?.toLowerCase().includes(classSearch.toLowerCase()) ||
    c.employee?.profile?.fullname?.toLowerCase().includes(classSearch.toLowerCase())
  );

  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);

  // --- Calculate counts of busy periods per teacher ---
  const getBusySlotsCount = (masks: number[]) => {
    let count = 0;
    masks.forEach(mask => {
      for (let p = 0; p < 15; p++) {
        if ((mask & (1 << p)) !== 0) count++;
      }
    });
    return count;
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      
      {/* Sticky Top Interactive Workspace Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/40 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/academic/schedule">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-muted/40 hover:bg-muted shrink-0">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight flex items-center gap-2">
              {t("Title")}
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/15">
                {t("Upgrade")}
              </span>
            </h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">{t("Subtitle")}</p>
          </div>
        </div>

        {/* Stepper Breadcrumbs */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;
            return (
              <div key={step.key} className="flex items-center">
                <button
                  disabled={isPending}
                  onClick={() => setCurrentStep(idx)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-300",
                    isCurrent 
                      ? "border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 shadow-xs"
                      : isCompleted 
                        ? "border-emerald-500/20 bg-muted/50 text-emerald-600 dark:text-emerald-400/80"
                        : "border-border/50 text-muted-foreground/50 hover:bg-muted/10"
                  )}
                >
                  <div className={cn(
                    "rounded-md p-1 shrink-0",
                    isCurrent 
                      ? "bg-emerald-500 text-white" 
                      : isCompleted 
                        ? "bg-emerald-500/10 text-emerald-500" 
                        : "bg-muted text-muted-foreground/60"
                  )}>
                    {isCompleted ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                  </div>
                  <span className="truncate max-w-[120px]">{t(`Step${step.key}`)}</span>
                </button>
                {idx < STEPS.length - 1 && (
                  <ChevronRight className="h-3.5 w-3.5 mx-1 text-muted-foreground/30 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </header>

      {/* Main Workspace Body - Takes up remaining screen */}
      <main className="flex-1 overflow-hidden min-h-0 relative">
        {loading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex flex-col items-center justify-center z-50 space-y-3">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
            <p className="text-xs text-muted-foreground font-semibold">{t("LoadingData")}</p>
          </div>
        )}

        <div className="h-full overflow-y-auto p-6">
          
          {/* --- STEP 1: ROOMS WORKSPACE (GRID CARDS WITH BUILDINGS) --- */}
          {currentStep === 0 && !loading && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border/20 pb-4">
                <div>
                  <h2 className="text-base font-bold text-foreground">{t("RoomsTitle")}</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{t("RoomsDescription")}</p>
                </div>
                <div className="relative w-80">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={t("SearchRooms")}
                    value={roomSearch}
                    onChange={e => setRoomSearch(e.target.value)}
                    className="pl-9 h-9 text-xs rounded-lg"
                  />
                </div>
              </div>

              {/* Building Sections Grid */}
              <div className="space-y-8">
                {filteredBuildings.map((building) => {
                  const activeRoomsCount = building.rooms.filter(r => r.isAvailable).length;
                  const allActive = activeRoomsCount === building.rooms.length;
                  const noneActive = activeRoomsCount === 0;

                  return (
                    <div key={building.id} className="space-y-4">
                      {/* Building Header Card */}
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <Building className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-sm text-foreground">Tòa nhà {building.code} - {building.name}</h3>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{t("BuildingConfig")} <strong className="text-emerald-600 dark:text-emerald-400">{activeRoomsCount} / {building.rooms.length} phòng</strong> hoạt động.</p>
                          </div>
                        </div>

                        {/* Bulk actions inside Building */}
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="xs"
                            disabled={allActive}
                            onClick={() => handleBulkToggleRoomsInBuilding(building.id, true)}
                            className="text-[10px] font-bold text-emerald-600 hover:text-emerald-500 hover:bg-emerald-500/5"
                          >
                            {t("EnableAll")}
                          </Button>
                          <span className="text-muted-foreground/30 text-xs">|</span>
                          <Button
                            variant="ghost"
                            size="xs"
                            disabled={noneActive}
                            onClick={() => handleBulkToggleRoomsInBuilding(building.id, false)}
                            className="text-[10px] font-bold text-destructive hover:text-destructive/80 hover:bg-destructive/5"
                          >
                            {t("LockAll")}
                          </Button>
                        </div>
                      </div>

                      {/* Rooms inside Building Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {building.rooms.map((room) => {
                          const isToggling = roomTogglingId === room.id;
                          return (
                            <Card 
                              key={room.id} 
                              className={cn(
                                "relative overflow-hidden border transition-all duration-300 hover:shadow-xs",
                                room.isAvailable 
                                  ? "border-emerald-500/15 bg-background/50 hover:border-emerald-500/30" 
                                  : "border-border bg-muted/20 opacity-70 hover:opacity-100"
                              )}
                            >
                              {/* Left Colored Ribbon */}
                              <div className={cn(
                                "absolute top-0 left-0 h-full w-1 transition-colors",
                                room.isAvailable ? "bg-emerald-500" : "bg-muted-foreground"
                              )} />

                              <CardContent className="p-4 pl-5 space-y-3">
                                <div className="flex justify-between items-start gap-1">
                                  <div>
                                    <h4 className="font-extrabold text-sm text-foreground flex items-center gap-1">
                                      {room.code}
                                    </h4>
                                    <span className="text-[9px] text-muted-foreground uppercase font-semibold">{room.type || "Tiêu chuẩn"}</span>
                                  </div>

                                  <Switch
                                    disabled={isToggling}
                                    checked={room.isAvailable}
                                    onCheckedChange={() => handleToggleRoom(room.id, room.isAvailable)}
                                    size="sm"
                                  />
                                </div>

                                <div className="flex items-center justify-between text-[10px] border-t border-border/20 pt-2 text-muted-foreground mt-2">
                                  <span>{t("Seats")} <strong className="text-foreground">{room.capacity || "N/A"}</strong></span>
                                  <span className={cn(
                                    "font-bold text-[9px] px-1 rounded-sm",
                                    room.isAvailable ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                                  )}>
                                    {room.isAvailable ? t("Available") : t("BusyLocked")}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {filteredBuildings.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-2xl bg-muted/5 text-muted-foreground text-center">
                    <Building className="h-10 w-10 text-muted-foreground/30 mb-2" />
                    <p className="text-xs font-semibold">{t("NoRoomsFound")}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- STEP 2: TEACHERS WORKSPACE (SPLIT SCREEN FULL HEIGHT) --- */}
          {currentStep === 1 && !loading && (
            <div className="flex flex-col lg:flex-row border border-border/40 rounded-2xl overflow-hidden h-[calc(100vh-170px)] bg-background">
              
              {/* Left Column: Teacher List Sidebar */}
              <div className="w-full lg:w-80 border-r border-border/40 bg-muted/10 flex flex-col h-full shrink-0">
                <div className="p-4 border-b border-border/30 bg-background/50 space-y-2 shrink-0">
                  <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">{t("TeacherList")}</h3>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={t("SearchTeachers")}
                      value={teacherSearch}
                      onChange={e => setTeacherSearch(e.target.value)}
                      className="pl-9 h-9 text-xs rounded-lg bg-background"
                    />
                  </div>
                </div>

                {/* Scrollable List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {filteredTeachers.map((teacher) => {
                    const busyCount = getBusySlotsCount(teacher.busyMasks);
                    const isSelected = selectedTeacherId === teacher.id;
                    const initials = teacher.name.split(" ").pop()?.substring(0, 2).toUpperCase() || "";

                    return (
                      <button
                        key={teacher.id}
                        onClick={() => selectTeacher(teacher)}
                        className={cn(
                          "w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group",
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-sm"
                            : "border-border/30 bg-background hover:bg-muted/40 text-muted-foreground"
                        )}
                      >
                        <div className="flex items-center gap-3 truncate">
                          {/* Circle initials avatar */}
                          <div className={cn(
                            "h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                            isSelected 
                              ? "bg-emerald-500 text-white" 
                              : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/10"
                          )}>
                            {initials}
                          </div>

                          <div className="truncate">
                            <p className="font-bold truncate text-foreground text-xs">{teacher.name}</p>
                            <p className="text-[9px] text-muted-foreground truncate mt-0.5">{t("TeacherCode")} {teacher.code}</p>
                          </div>
                        </div>

                        {/* Badges for busy count and pref */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                          <span className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0",
                            busyCount > 0 
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" 
                              : "bg-muted text-muted-foreground/60"
                          )}>
                            {busyCount > 0 ? t("BusyPeriodsCount", { count: busyCount }) : t("FreeAllWeek")}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  {filteredTeachers.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                      <Users className="h-8 w-8 text-muted-foreground/30 mb-2" />
                      <p className="text-xs">{t("NoTeachersFound")}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Interactive Detail Setup Workspace */}
              <div className="flex-1 flex flex-col h-full bg-background min-w-0">
                {selectedTeacher ? (
                  <>
                    {/* Header Panel for Selected Teacher */}
                    <div className="p-4 border-b border-border/30 bg-muted/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                          {selectedTeacher.name.split(" ").pop()?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-foreground leading-none">{selectedTeacher.name}</h4>
                          <p className="text-[10px] text-muted-foreground mt-1">Mã GV: {selectedTeacher.code} | {t("TotalBusyPeriods")} <strong className="text-amber-600 dark:text-amber-400">{getBusySlotsCount(busyMasks)} tiết</strong>.</p>
                        </div>
                      </div>

                      {/* Controls inside Detail Header */}
                      <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end">
                        <div className="flex items-center gap-2.5">
                          <Label className="text-xs font-bold shrink-0">{t("PrefConsecutiveDays")}</Label>
                          <select
                            value={prefDays}
                            onChange={e => {
                              const val = parseInt(e.target.value);
                              setPrefDays(val);
                              setTeacherPrefs(prev => ({ ...prev, [selectedTeacherId!]: val }));
                            }}
                            className="h-8 w-24 rounded-lg border border-border/40 text-xs px-2 focus:ring-1 focus:ring-emerald-500 outline-none bg-background cursor-pointer"
                          >
                            <option value={1}>{t("Day1")}</option>
                            <option value={2}>{t("Day2")}</option>
                            <option value={3}>{t("Day3")}</option>
                            <option value={4}>{t("Day4")}</option>
                            <option value={5}>{t("Day5")}</option>
                          </select>
                        </div>

                        <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/15 tracking-wider shrink-0 select-none">
                          {t("AutoSave")}
                        </span>
                      </div>
                    </div>

                    {/* Interactive Large Weekly Blacklist Grid */}
                    <div className="flex-1 overflow-auto p-4 min-h-0 relative">
                      <div className="min-w-[700px] border border-border/30 rounded-xl overflow-hidden shadow-xs">
                        <table className="w-full border-collapse text-left table-fixed text-[11px]">
                          <thead className="bg-muted/80 sticky top-0 z-20 border-b border-border/30 backdrop-blur-xs">
                            <tr>
                              <th className="p-3 border-r border-border/30 font-bold bg-muted/90 w-20 text-muted-foreground text-center">{t("PeriodHeader")}</th>
                              {DAYS.map(day => (
                                <th key={day.key} className="p-3 border-r last:border-r-0 border-border/30 font-bold text-muted-foreground text-center uppercase tracking-wider">
                                  {t(day.key)}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/20">
                            {PERIODS.map(p => {
                              const isEvening = p >= 11;
                              return (
                                <tr key={p} className={cn("hover:bg-muted/5 transition-colors", isEvening && "bg-muted/10")}>
                                  <td className="p-2 border-r border-border/30 font-extrabold bg-muted/40 text-muted-foreground text-center relative h-12 flex flex-col items-center justify-center">
                                    <span>{t("PeriodLabel")} {p}</span>
                                    {isEvening && (
                                      <span className="text-[7.5px] font-bold uppercase text-amber-600 dark:text-amber-500 bg-amber-500/10 px-1 py-0.2 rounded mt-0.5">{t("Evening")}</span>
                                    )}
                                  </td>
                                  {DAYS.map(day => {
                                    const isBlocked = (busyMasks[day.dbIndex] & (1 << (p - 1))) !== 0;
                                    return (
                                      <td
                                        key={day.dbIndex}
                                        onClick={() => handleToggleTeacherSlot(day.dbIndex, p)}
                                        className={cn(
                                          "p-1.5 border-r last:border-r-0 border-border/15 cursor-pointer select-none transition-all relative h-12 group/cell",
                                          isBlocked 
                                            ? "bg-destructive/15 hover:bg-destructive/20 text-destructive font-extrabold diagonal-stripes"
                                            : "hover:bg-emerald-500/5 bg-background text-muted-foreground/40"
                                        )}
                                      >
                                        {isBlocked ? (
                                          <div className="h-full w-full flex items-center justify-center p-1">
                                            <span className="flex items-center justify-center gap-1 text-red-600 font-extrabold text-[8.5px] bg-red-100 dark:bg-red-950/80 w-full h-full rounded border border-red-300/20 shadow-xs uppercase">
                                              <Lock className="h-2.5 w-2.5" /> {t("BusyLocked")}
                                            </span>
                                          </div>
                                        ) : (
                                          <div className="h-full w-full flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity">
                                            <span className="text-[8px] text-emerald-600 font-extrabold uppercase border border-emerald-500/20 px-1.5 py-0.5 rounded bg-emerald-500/5">
                                              {t("LockPeriod")}
                                            </span>
                                          </div>
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-xs">
                    <Users className="h-12 w-12 text-muted-foreground/20 mb-3 animate-pulse" />
                    <p className="font-bold">{t("NoTeacherSelected")}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{t("NoTeacherSelectedDesc")}</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* --- STEP 3: COURSE CLASSES (FULL WIDTH SLEEK DATA TABLE) --- */}
          {currentStep === 2 && !loading && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border/20 pb-4">
                <div>
                  <h2 className="text-base font-bold text-foreground">{t("ClassConfigTitle")}</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{t("ClassConfigDesc")}</p>
                </div>
                <div className="relative w-80">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={t("SearchClasses")}
                    value={classSearch}
                    onChange={e => setClassSearch(e.target.value)}
                    className="pl-9 h-9 text-xs rounded-lg"
                  />
                </div>
              </div>

              {/* Data Table */}
              <div className="border border-border/40 rounded-xl overflow-hidden shadow-xs bg-background">
                 <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border/30">
                    <tr>
                      <th className="p-4 font-bold text-muted-foreground w-32">{t("ClassCodeCol")}</th>
                      <th className="p-4 font-bold text-muted-foreground">{t("SubjectCol")}</th>
                      <th className="p-4 font-bold text-muted-foreground">{t("TeacherCol")}</th>
                      <th className="p-4 font-bold text-muted-foreground w-40">{t("MinPeriodsCol")}</th>
                      <th className="p-4 font-bold text-muted-foreground w-44">{t("PreferredStartPeriodCol")}</th>
                      <th className="p-4 font-bold text-muted-foreground text-right w-44">{t("AllowEveningCol")}</th>
                      <th className="p-4 font-bold text-muted-foreground text-right w-44">{t("AllowWeekendCol")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {filteredClasses.map((c) => {
                      const isSaving = classSavingId === c.id;
                      return (
                        <tr key={c.id} className="hover:bg-muted/5 transition-colors">
                          <td className="p-4 font-extrabold text-foreground">{c.code}</td>
                          <td className="p-4 font-bold text-foreground">{c.subject?.name}</td>
                          <td className="p-4 font-medium">{c.employee?.profile?.fullname || c.employee?.code || "Chưa phân công"}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <select
                                disabled={isSaving}
                                value={c.minSessionPeriods}
                                onChange={e => handleUpdateClassSettings(c.id, parseInt(e.target.value), c.allowEvening, c.allowWeekend, c.preferredStartPeriod)}
                                className="h-8 w-24 rounded-lg border border-border/40 text-xs px-2 focus:ring-1 focus:ring-emerald-500 outline-none bg-background cursor-pointer"
                              >
                                <option value={1}>{t("Period1")}</option>
                                <option value={2}>{t("Period2")}</option>
                                <option value={3}>{t("Period3")}</option>
                                <option value={4}>{t("Period4")}</option>
                                <option value={5}>{t("Period5")}</option>
                              </select>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <select
                                disabled={isSaving}
                                value={c.preferredStartPeriod ?? ""}
                                onChange={e => handleUpdateClassSettings(
                                  c.id,
                                  c.minSessionPeriods,
                                  c.allowEvening,
                                  c.allowWeekend,
                                  e.target.value === "" ? null : parseInt(e.target.value)
                                )}
                                className="h-8 w-36 rounded-lg border border-border/40 text-xs px-2 focus:ring-1 focus:ring-emerald-500 outline-none bg-background cursor-pointer"
                              >
                                <option value="">{t("NoPreferenceDefault")}</option>
                                {Array.from({ length: 10 }, (_, i) => i + 1).map(p => (
                                  <option key={p} value={p}>{t("PeriodSlot", { period: p })}</option>
                                ))}
                              </select>
                              {isSaving && <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="inline-flex items-center gap-3">
                              <span className={cn(
                                "text-[9.5px] font-bold px-2 py-0.5 rounded-full shrink-0",
                                c.allowEvening 
                                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-500 border border-amber-500/10" 
                                  : "bg-muted text-muted-foreground/60"
                              )}>
                                {c.allowEvening ? t("AllowEvening") : (t("DefaultNoEvening") || "Default no evening")}
                              </span>
                              <Switch
                                disabled={isSaving}
                                checked={c.allowEvening}
                                onCheckedChange={(checked) => handleUpdateClassSettings(c.id, c.minSessionPeriods, checked, c.allowWeekend, c.preferredStartPeriod)}
                              />
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="inline-flex items-center gap-3">
                              <span className={cn(
                                "text-[9.5px] font-bold px-2 py-0.5 rounded-full shrink-0",
                                c.allowWeekend 
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10" 
                                  : "bg-muted text-muted-foreground/60"
                              )}>
                                {c.allowWeekend ? t("AllowWeekendClasses") : (t("DefaultNoWeekend") || "Default no weekend")}
                              </span>
                              <Switch
                                disabled={isSaving}
                                checked={c.allowWeekend}
                                onCheckedChange={(checked) => handleUpdateClassSettings(c.id, c.minSessionPeriods, c.allowEvening, checked, c.preferredStartPeriod)}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredClasses.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-muted-foreground font-semibold bg-muted/5">
                          {t("NoClassesFound")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- STEP 4: SUMMARY & START (BEAUTIFUL HIGH-PREMIUM DASHBOARD) --- */}
          {currentStep === 3 && !loading && (
            <div className="max-w-4xl mx-auto space-y-8 py-6">
              
              {/* Grand Announcement Panel */}
              <div className="text-center space-y-3">
                <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 mb-2 relative">
                  <Play className="h-10 w-10 fill-emerald-500/20 text-emerald-600 animate-pulse" />
                  <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping"></div>
                </div>

                <h2 className="text-xl font-black text-foreground tracking-tight">{t("ReadyTitle")}</h2>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-xl mx-auto">
                  {t("ReadyDescription")}
                </p>
              </div>

              {/* Data Visualization Metrics Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Available Rooms Doughnut Card */}
                <Card className="border border-border/40 shadow-xs bg-background/50 backdrop-blur-md">
                  <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
                    <p className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider">{t("AvailableRooms")}</p>
                    
                    {/* SVG Doughnut Ring */}
                    <div className="relative h-28 w-28 flex items-center justify-center">
                      {(() => {
                        const totalRooms = rooms.length;
                        const avail = rooms.filter(r => r.isAvailable).length;
                        const pct = totalRooms > 0 ? Math.round((avail / totalRooms) * 100) : 0;
                        const strokeDash = 2 * Math.PI * 40; // r=40
                        const offset = strokeDash - (pct / 100) * strokeDash;

                        return (
                          <>
                            <svg className="absolute transform -rotate-90 h-full w-full">
                              <circle cx="56" cy="56" r="40" className="stroke-muted" strokeWidth="8" fill="transparent" />
                              <circle 
                                cx="56" 
                                cy="56" 
                                r="40" 
                                className="stroke-emerald-500 transition-all duration-1000" 
                                strokeWidth="8" 
                                strokeDasharray={strokeDash}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                                fill="transparent" 
                              />
                            </svg>
                            <div className="text-center z-10">
                              <p className="text-xl font-black text-foreground">{pct}%</p>
                              <p className="text-[8px] text-muted-foreground uppercase font-bold">{t("Available")}</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    <p className="text-[11px] font-bold text-foreground text-center">
                      {t("Using")} <span className="text-emerald-500">{rooms.filter(r => r.isAvailable).length} / {rooms.length} phòng học</span>.
                    </p>
                  </CardContent>
                </Card>

                {/* Teachers Preferences Card */}
                <Card className="border border-border/40 shadow-xs bg-background/50 backdrop-blur-md">
                  <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
                    <p className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider">{t("TeacherConfig")}</p>
                    
                    <div className="relative h-28 w-28 flex items-center justify-center">
                      {(() => {
                        const totalTeachers = teachers.length;
                        // Count average consecutive preferred days
                        let sum = 0;
                        teachers.forEach(t => {
                          sum += teacherPrefs[t.id] ?? 2;
                        });
                        const avg = totalTeachers > 0 ? (sum / totalTeachers).toFixed(1) : "2.0";
                        const pct = Math.min(100, Math.round((parseFloat(avg) / 5) * 100));
                        const strokeDash = 2 * Math.PI * 40;
                        const offset = strokeDash - (pct / 100) * strokeDash;

                        return (
                          <>
                            <svg className="absolute transform -rotate-90 h-full w-full">
                              <circle cx="56" cy="56" r="40" className="stroke-muted" strokeWidth="8" fill="transparent" />
                              <circle 
                                cx="56" 
                                cy="56" 
                                r="40" 
                                className="stroke-teal-500 transition-all duration-1000" 
                                strokeWidth="8" 
                                strokeDasharray={strokeDash}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                                fill="transparent" 
                              />
                            </svg>
                            <div className="text-center z-10">
                              <p className="text-xl font-black text-foreground">{avg} ngày</p>
                              <p className="text-[8px] text-muted-foreground uppercase font-bold">{t("AvgPreference")}</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    <p className="text-[11px] font-bold text-foreground text-center">
                      {t("LinkedBusy")} <span className="text-teal-500">{teachers.length} {t("TeachersUnit")}</span>.
                    </p>
                  </CardContent>
                </Card>

                {/* Course Classes Card */}
                <Card className="border border-border/40 shadow-xs bg-background/50 backdrop-blur-md">
                  <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
                    <p className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider">{t("ClassScale")}</p>
                    
                    <div className="relative h-28 w-28 flex items-center justify-center">
                      {(() => {
                        const totalClasses = classes.length;
                        const eveningClasses = classes.filter(c => c.allowEvening).length;
                        const pct = totalClasses > 0 ? Math.round((eveningClasses / totalClasses) * 100) : 0;
                        const strokeDash = 2 * Math.PI * 40;
                        const offset = strokeDash - (pct / 100) * strokeDash;

                        return (
                          <>
                            <svg className="absolute transform -rotate-90 h-full w-full">
                              <circle cx="56" cy="56" r="40" className="stroke-muted" strokeWidth="8" fill="transparent" />
                              <circle 
                                cx="56" 
                                cy="56" 
                                r="40" 
                                className="stroke-amber-500 transition-all duration-1000" 
                                strokeWidth="8" 
                                strokeDasharray={strokeDash}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                                fill="transparent" 
                              />
                            </svg>
                            <div className="text-center z-10">
                              <p className="text-xl font-black text-foreground">{pct}%</p>
                              <p className="text-[8px] text-muted-foreground uppercase font-bold">{t("AllowEvening")}</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    <p className="text-[11px] font-bold text-foreground text-center">
                      {t("Total")} <span className="text-amber-500">{classes.length} {t("CourseClassesUnit")}</span>.
                      {classes.filter(c => c.allowWeekend).length > 0 && (
                        <span className="block text-[9px] text-emerald-600 dark:text-emerald-400 mt-1 uppercase font-extrabold tracking-wider">
                          {t("HasLabel")} {classes.filter(c => c.allowWeekend).length} {t("AllowWeekendClasses")}
                        </span>
                      )}
                    </p>
                  </CardContent>
                </Card>

              </div>

              {/* Warnings Panel */}
              <div className="p-4 rounded-xl border border-amber-500/15 bg-amber-500/5 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
                <div className="space-y-1 text-left">
                  <p className="font-extrabold text-foreground text-xs">{t("WarningTitle")}</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    {t("WarningDescription")}
                  </p>
                </div>
              </div>

              {/* Launcher CTA Button */}
              <div className="pt-2">
                <Button
                  onClick={handleStartScheduling}
                  disabled={isPending || classes.length === 0}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold h-12 rounded-xl text-xs gap-2 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 duration-300 relative group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t("Processing")}
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 fill-white" />
                      {t("LaunchButton")}
                    </>
                  )}
                </Button>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* Sticky Bottom Controls Bar */}
      <footer className="sticky bottom-0 z-40 p-4 border-t border-border/40 bg-muted/10 shrink-0 flex justify-between items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          disabled={currentStep === 0 || isPending}
          className="gap-1 text-xs rounded-lg font-semibold"
        >
          <ChevronLeft className="h-4 w-4" /> {t("BackToStep")} {currentStep}
        </Button>

        <div className="flex items-center gap-2">
          <Link href="/academic/schedule">
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              className="text-xs text-muted-foreground rounded-lg"
            >
              {t("CancelExit")}
            </Button>
          </Link>
          
          {currentStep < STEPS.length - 1 && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setCurrentStep(prev => Math.min(STEPS.length - 1, prev + 1))}
              disabled={isPending || loading}
              className="bg-emerald-600 hover:bg-emerald-500 gap-1 text-xs text-white rounded-lg font-bold shadow-xs"
            >
              {t("Next")} <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </footer>

    </div>
  );
}
