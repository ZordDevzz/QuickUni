"use client";

import { EntityType } from "./ScheduleManager";
import { getWeeklyTemplateByEntity } from "@/actions/scheduling-data";
import { useTranslations } from "next-intl";
import { Loader2, RefreshCw, BookOpen } from "lucide-react";
import { hasCollision, createMask } from "@/lib/scheduling/bitmask";
import { cn, stringToHslColor } from "@/lib/utils";
import { format, addDays, parseISO } from "date-fns";

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
    <div className="flex flex-col border rounded-lg bg-background overflow-hidden h-[calc(100vh-250px)] relative">
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
              const bgColor = subjectId ? stringToHslColor(subjectId, 70, 90) : "hsl(var(--muted))";
              const borderColor = subjectId ? stringToHslColor(subjectId, 70, 60) : "hsl(var(--primary))";
              const textColor = subjectId ? stringToHslColor(subjectId, 80, 20) : "hsl(var(--primary))";

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
                    className="h-full w-full rounded-md border-2 p-2 overflow-hidden shadow-sm transition-all cursor-pointer group hover:brightness-95"
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
                          className="inline-flex items-center gap-0.5 text-[8px] font-bold uppercase px-1 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                        >
                          <RefreshCw className="h-2 w-2" />
                          {tSM("Makeup")}
                        </span>
                      </div>
                    )}
                    <div className="text-[10px] font-bold truncate uppercase pr-6" style={{ color: borderColor }}>
                        {assignment.courseClass?.code}
                    </div>
                    <div className="text-[9px] font-medium leading-tight line-clamp-2 mt-1">
                        {assignment.courseClass?.subject?.name}
                    </div>
                    
                    {/* Active Period / Week range display */}
                    {assignment.courseClass?.startDate && (
                      <div className="text-[8px] font-semibold mt-1 opacity-70 truncate" style={{ color: borderColor }}>
                        📅 {assignment.courseClass.startDate.substring(5)} → {assignment.courseClass.endDate?.substring(5)}
                      </div>
                    )}

                    {type !== 'rooms' && (
                      <div className="text-[9px] mt-0.5 truncate opacity-80">
                        📍 {assignment.room?.code}
                      </div>
                    )}
                    {type !== 'teachers' && (
                      <div className="text-[9px] mt-0.5 truncate opacity-80">
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
  );
}
