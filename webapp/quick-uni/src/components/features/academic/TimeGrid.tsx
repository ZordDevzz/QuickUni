"use client";

import { useState } from "react";
import { EntityType } from "./ScheduleManager";
import { getWeeklyTemplateByEntity } from "@/actions/scheduling-data";
import { useTranslations } from "next-intl";
import { Loader2, RefreshCw, BookOpen } from "lucide-react";
import { hasCollision, createMask } from "@/lib/scheduling/bitmask";
import { cn, stringToHslColor } from "@/lib/utils";
import { format, addDays, parseISO } from "date-fns";
import { FormattedDate } from "@/components/shared/FormattedDate";
import { useTheme } from "next-themes";

export type AssignmentWithRelations = Awaited<ReturnType<typeof getWeeklyTemplateByEntity>>[number] & {
  startDate?: string | null;
  endDate?: string | null;
  schDate?: string;
};

interface TimeGridProps {
  assignments: AssignmentWithRelations[];
  availability?: number[];
  loading?: boolean;
  mode?: 'view' | 'edit';
  type: EntityType;
  isEditAvailabilityMode?: boolean;
  onCellClick?: (dayIndex: number, period: number) => void;
  onAssignmentClick?: (assignment: AssignmentWithRelations) => void;
  onToggleBlock?: (dayIndex: number, period: number) => void;
  emptyStateMessage?: string;
  showEmptyState?: boolean;
  weekStartDate?: string; // YYYY-MM-DD for current week Monday
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const PERIODS = Array.from({ length: 15 }, (_, i) => i + 1);
const PERIOD_HEIGHT = 60;

export function TimeGrid({ 
  assignments,
  availability = new Array(7).fill(0),
  loading,
  mode = 'view',
  type, 
  isEditAvailabilityMode,
  onCellClick, 
  onAssignmentClick,
  onToggleBlock,
  emptyStateMessage,
  showEmptyState,
  weekStartDate
}: TimeGridProps) {
  const t = useTranslations("Admin");
  const tSM = useTranslations("ScheduleManager");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Get current day of week (Monday = 0, Sunday = 6)
  const getTodayDayIndex = () => {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1;
  };

  const [activeDayIndex, setActiveDayIndex] = useState(getTodayDayIndex());

  if (showEmptyState) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[600px] border rounded-lg bg-muted/20 text-muted-foreground">
        <p>{emptyStateMessage || t("SelectEntityToView")}</p>
      </div>
    );
  }

  // Pre-process to group overlapping templates side-by-side
  const slotGroups: Record<string, typeof assignments> = {};
  assignments.forEach(a => {
    const dayIndex = (a.dayOfWeek + 6) % 7; 
    const key = `${dayIndex}-${a.startPeriod}`;
    if (!slotGroups[key]) slotGroups[key] = [];
    slotGroups[key].push(a);
  });

  const getDayLabel = (day: string, index: number) => {
    if (!weekStartDate) return t(day);
    try {
      const date = addDays(parseISO(weekStartDate), index);
      return `${t(day)} (${format(date, "dd/MM")})`;
    } catch (e) {
      return t(day);
    }
  };

  return (
    <div className="w-full max-w-full overflow-hidden relative space-y-4">
      {/* Mobile Day-by-Day View */}
      <div className="block md:hidden w-full max-w-full overflow-hidden space-y-4">
        {/* Horizontal Days Navigation */}
        <div className="flex w-full max-w-full space-x-1.5 overflow-x-auto pb-2 scrollbar-none border-b shrink-0">
          {DAYS.map((day, index) => {
            const isActive = index === activeDayIndex;
            const dayClasses = assignments.filter(a => ((a.dayOfWeek + 6) % 7) === index);
            
            return (
              <button
                key={day}
                type="button"
                onClick={() => setActiveDayIndex(index)}
                className={cn(
                  "flex-1 min-w-[85px] py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 shrink-0 active:scale-95",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md scale-102" 
                    : "bg-muted/60 hover:bg-muted text-muted-foreground"
                )}
              >
                <span>{t(day)}</span>
                {dayClasses.length > 0 ? (
                  <span className={cn(
                    "text-[9px] px-2 py-0.5 rounded-full font-bold",
                    isActive ? "bg-primary-foreground/25 text-primary-foreground" : "bg-primary/10 text-primary"
                  )}>
                    {dayClasses.length}
                  </span>
                ) : (
                  <span className="text-[9px] opacity-40 font-normal">—</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Day's Class Cards */}
        <div className="space-y-3 min-h-[200px]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (() => {
            const dayClasses = assignments
              .filter(a => ((a.dayOfWeek + 6) % 7) === activeDayIndex)
              .sort((a, b) => a.startPeriod - b.startPeriod);

            if (dayClasses.length === 0) {
              return (
                <div className="text-center py-12 px-4 border border-dashed rounded-xl bg-muted/15 text-muted-foreground">
                  <BookOpen className="h-8 w-8 mx-auto opacity-30 mb-2" />
                  <p className="text-sm font-medium">{tSM("NoClassesToday") || "No classes scheduled for today."}</p>
                </div>
              );
            }

            return dayClasses.map((a) => {
              const start = a.startPeriod;
              const end = a.endPeriod;
              const subjectId = a.courseClass?.subject?.id;
              const borderLeftColor = subjectId 
                ? stringToHslColor(subjectId, isDark ? 65 : 65, isDark ? 50 : 55) 
                : "hsl(var(--primary))";
              const labelColor = subjectId 
                ? stringToHslColor(subjectId, isDark ? 85 : 65, isDark ? 80 : 40) 
                : "hsl(var(--primary))";
              const cardBg = subjectId 
                ? stringToHslColor(subjectId, isDark ? 45 : 65, isDark ? 12 : 98) 
                : "hsl(var(--card))";

              return (
                <div
                  key={a.id}
                  onClick={() => onAssignmentClick?.(a)}
                  className="rounded-xl border p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col gap-2 relative active:scale-[0.99]"
                  style={{
                    borderLeftWidth: "5px",
                    borderLeftColor: borderLeftColor,
                    backgroundColor: cardBg
                  }}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground tracking-wide font-mono block uppercase">
                        {a.courseClass?.code}
                      </span>
                      <h4 className="font-extrabold text-sm leading-snug mt-0.5 pr-4" style={{ color: labelColor }}>
                        {a.courseClass?.subject?.name}
                      </h4>
                    </div>
                    {a.scheduleTypeId === 2 && (
                      <span className="inline-flex items-center gap-0.5 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 border border-amber-500/20 shrink-0">
                        <RefreshCw className="h-2 w-2" />
                        {tSM("Makeup")}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2 pt-2 border-t border-muted/65 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-semibold text-foreground">{t("Period")}:</span>
                      <span className="font-mono text-foreground font-bold">{start} - {end}</span>
                    </div>
                    {type !== 'rooms' && (
                      <div className="flex items-center space-x-1">
                        <span className="text-foreground">📍</span>
                        <span className="font-semibold text-foreground truncate">{a.room?.code}</span>
                      </div>
                    )}
                    {type !== 'teachers' && (
                      <div className="col-span-2 flex items-center space-x-1 truncate mt-0.5">
                        <span className="text-foreground">👤</span>
                        <span className="truncate text-foreground/90 font-medium">{a.courseClass?.employee?.profile?.fullname}</span>
                      </div>
                    )}
                    {a.courseClass?.startDate && (
                      <div className="col-span-2 text-[10px] text-muted-foreground/80 mt-0.5 flex items-center gap-1">
                        <span>📅</span>
                        <span>
                          <FormattedDate date={a.courseClass.startDate} /> – <FormattedDate date={a.courseClass.endDate || ''} />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Desktop Grid View */}
      <div className="hidden md:flex flex-col border rounded-lg bg-background overflow-hidden h-[calc(100vh-250px)] relative">
        {loading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-50">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        
        <div className="overflow-auto flex-1 relative">
          <div className="min-w-[1000px] relative">
            {/* Header Row - Sticky Top */}
            <div className="grid grid-cols-8 border-b bg-muted/50 sticky top-0 z-30">
              <div className="p-2 border-r text-center text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted/50 sticky left-0 z-50">
                {t("Period")}
              </div>
            {DAYS.map((day, index) => (
              <div key={day} className="p-2 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground border-r last:border-r-0">
                {getDayLabel(day, index)}
              </div>
            ))}
          </div>
 
          {/* Grid Content */}
          <div className="grid grid-cols-8 relative" style={{ height: `${PERIODS.length * PERIOD_HEIGHT}px` }}>
            {/* Background Grid Lines */}
            {PERIODS.map((p) => (
              <div key={p} className="contents">
                <div 
                  className="border-r border-b text-center text-sm font-medium flex items-center justify-center bg-muted/30 sticky left-0 z-40"
                  style={{ height: `${PERIOD_HEIGHT}px` }}
                >
                  {p}
                </div>
                {DAYS.map((_, dayIndex) => {
                  const dbDayOfWeek = (dayIndex + 1) % 7;
                  const isBlocked = hasCollision(availability[dbDayOfWeek], createMask(p, p));
                  
                  return (
                    <div 
                      key={dayIndex} 
                      className={cn(
                        "border-r border-b last:border-r-0 relative hover:bg-muted/50 transition-colors",
                        mode === 'edit' && "cursor-pointer",
                        isBlocked && "diagonal-stripes"
                      )} 
                      style={{ height: `${PERIOD_HEIGHT}px` }}
                      onClick={() => {
                        if (mode !== 'edit') return;
                        
                        if (isEditAvailabilityMode) {
                          onToggleBlock?.(dayIndex, p);
                        } else {
                          onCellClick?.(dayIndex, p);
                        }
                      }}
                    >
                      {isBlocked && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                          <span className="text-[8px] font-bold uppercase rotate-45">{t("Occupied")}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
 
            {/* Assignments Overlay */}
            {assignments.map((assignment) => {
              // Mapping DB Sunday-start (0) to UI Monday-start (Mon=0, Sun=6)
              const dayIndex = (assignment.dayOfWeek + 6) % 7; 
              const start = assignment.startPeriod;
              const end = assignment.endPeriod;
              const duration = end - start + 1;
 
              const subjectId = assignment.courseClass?.subject?.id;
              
              // Dynamic HSL lightness/saturation for desktop grid overlay on Dark Mode
              const bgLightness = isDark ? 16 : 92;
              const borderLightness = isDark ? 30 : 75;
              const textLightness = isDark ? 88 : 15;
              const saturation = isDark ? 55 : 65;
              const textSaturation = isDark ? 85 : 85;

              const bgColor = subjectId ? stringToHslColor(subjectId, saturation, bgLightness) : "hsl(var(--muted))";
              const borderColor = subjectId ? stringToHslColor(subjectId, saturation, borderLightness) : "hsl(var(--primary))";
              const textColor = subjectId ? stringToHslColor(subjectId, textSaturation, textLightness) : "hsl(var(--primary))";

              // Calculate width and left offset for side-by-side rendering
              const key = `${dayIndex}-${start}`;
              const group = slotGroups[key] || [assignment];
              const groupIndex = group.indexOf(assignment);
              const groupCount = group.length;

              const widthPercent = 12.5 / groupCount;
              const leftPercent = (dayIndex + 1) * 12.5 + groupIndex * widthPercent;
  
              return (
                <div
                  key={assignment.id}
                  className="absolute p-1 z-10"
                  style={{
                    left: `${leftPercent}%`,
                    top: `${((start - 1) * PERIOD_HEIGHT)}px`,
                    width: `${widthPercent}%`,
                    height: `${(duration * PERIOD_HEIGHT)}px`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssignmentClick?.(assignment);
                  }}
                >
                  <div 
                    className="h-full w-full rounded-md border p-2 overflow-hidden shadow-xs transition-all cursor-pointer group hover:brightness-95 hover:shadow-sm"
                    style={{
                      backgroundColor: bgColor,
                      borderColor: borderColor,
                      color: textColor,
                    }}
                  >
                    {/* Schedule Type badge */}
                    {assignment.scheduleTypeId === 2 && (
                      <div className="absolute top-1 right-1">
                        <span
                          title={tSM("MakeupClass")}
                          className="inline-flex items-center gap-0.5 text-[8px] font-bold uppercase px-1 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-400 border border-amber-500/20"
                        >
                          <RefreshCw className="h-2 w-2" />
                          {tSM("Makeup")}
                        </span>
                      </div>
                    )}
                    <div className="text-[10px] font-extrabold truncate uppercase pr-6 tracking-wide opacity-90">
                        {assignment.courseClass?.code}
                    </div>
                    <div className="text-[9.5px] font-bold leading-snug line-clamp-2 mt-0.5 opacity-95">
                        {assignment.courseClass?.subject?.name}
                    </div>
                    
                    {/* Active Period / Week range display */}
                    {assignment.courseClass?.startDate && (
                      <div className="text-[8px] font-bold mt-1 opacity-75 truncate">
                        📅 {assignment.courseClass.startDate.substring(5)} → {assignment.courseClass.endDate?.substring(5)}
                      </div>
                    )}

                    {type !== 'rooms' && (
                      <div className="text-[9px] mt-0.5 truncate font-semibold opacity-85">
                        📍 {assignment.room?.code}
                      </div>
                    )}
                    {type !== 'teachers' && (
                      <div className="text-[9px] mt-0.5 truncate font-semibold opacity-85">
                        👤 {assignment.courseClass?.employee?.profile?.fullname}
                      </div>
                    )}
                    
                    {/* Tooltip on hover if content is too long */}
                    <div className="invisible group-hover:visible absolute z-50 bg-popover text-popover-foreground p-2 rounded border shadow-md text-xs w-48 left-full ml-2 top-0">
                      <p className="font-bold">{assignment.courseClass?.code}</p>
                      <p>{assignment.courseClass?.subject?.name}</p>
                      <p>📍 {assignment.room?.code}</p>
                      <p>👤 {assignment.courseClass?.employee?.profile?.fullname}</p>
                      {assignment.courseClass?.startDate && (
                        <p className="mt-1 text-[10px] text-emerald-600 font-semibold">
                          {tSM("EffectiveRange")} {assignment.courseClass.startDate} {tSM("RangeTo")} {assignment.courseClass.endDate}
                        </p>
                      )}
                      <p className="mt-1 text-[10px] text-muted-foreground">
                          {t(DAYS[dayIndex])}, {t("Period")} {start}-{end}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
