"use client";

import { useState, useEffect } from "react";
import { EntityType } from "./ScheduleManager";
import { getWeeklyTemplateByEntity } from "@/actions/scheduling-data";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

interface TimeGridProps {
  type: EntityType;
  entityId: string | null;
}

type AssignmentWithRelations = Awaited<ReturnType<typeof getWeeklyTemplateByEntity>>[number];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const PERIODS = Array.from({ length: 15 }, (_, i) => i + 1);
const PERIOD_HEIGHT = 60;

export function TimeGrid({ type, entityId }: TimeGridProps) {
  const t = useTranslations("Admin");
  const [assignments, setAssignments] = useState<AssignmentWithRelations[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadAssignments() {
      if (!entityId) {
        setAssignments([]);
        return;
      }

      setLoading(true);
      try {
        const mappedType = type === "rooms" ? "room" : type === "teachers" ? "teacher" : "class";
        const data = await getWeeklyTemplateByEntity(entityId, mappedType);
        setAssignments(data || []);
      } catch (error) {
        console.error("Failed to load assignments", error);
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    }
    loadAssignments();
  }, [entityId, type]);

  if (!entityId) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[600px] border rounded-lg bg-muted/20 text-muted-foreground">
        <p>{t("SelectEntityToView") || "Select an entity to view schedule"}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col border rounded-lg bg-background overflow-hidden h-[calc(100vh-250px)] relative">
      {loading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      {/* Header Row */}
      <div className="grid grid-cols-8 border-b bg-muted/50 sticky top-0 z-30">
        <div className="p-2 border-r text-center text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted/50">
          {t("Period") || "Period"}
        </div>
        {DAYS.map((day) => (
          <div key={day} className="p-2 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground border-r last:border-r-0">
            {t(day) || day}
          </div>
        ))}
      </div>

      {/* Grid Content */}
      <div className="relative overflow-auto flex-1">
        <div className="grid grid-cols-8 relative" style={{ height: `${PERIODS.length * PERIOD_HEIGHT}px`, minWidth: "800px" }}>
          {/* Background Grid Lines */}
          {PERIODS.map((p) => (
            <div key={p} className="contents">
              <div 
                className="border-r border-b text-center text-sm font-medium flex items-center justify-center bg-muted/30 sticky left-0 z-20"
                style={{ height: `${PERIOD_HEIGHT}px` }}
              >
                {p}
              </div>
              {DAYS.map((_, dayIndex) => (
                <div 
                  key={dayIndex} 
                  className="border-r border-b last:border-r-0 relative" 
                  style={{ height: `${PERIOD_HEIGHT}px` }}
                />
              ))}
            </div>
          ))}

          {/* Assignments Overlay */}
          {assignments.map((assignment) => {
            const dayIndex = assignment.dayOfWeek; // Assuming 0 is Mon, 6 is Sun
            const start = assignment.startPeriod;
            const end = assignment.endPeriod;
            const duration = end - start + 1;

            return (
              <div
                key={assignment.id}
                className="absolute p-1 z-10"
                style={{
                  left: `${((dayIndex + 1) * 12.5)}%`,
                  top: `${((start - 1) * PERIOD_HEIGHT)}px`,
                  width: "12.5%",
                  height: `${(duration * PERIOD_HEIGHT)}px`,
                }}
              >
                <div className="h-full w-full rounded-md border-2 border-primary bg-primary/10 p-2 overflow-hidden shadow-sm transition-all hover:bg-primary/20 cursor-pointer group">
                  <div className="text-[10px] font-bold text-primary truncate uppercase">
                      {assignment.courseClass?.code}
                  </div>
                  <div className="text-[9px] font-medium leading-tight line-clamp-2 mt-1">
                      {assignment.courseClass?.subject?.name}
                  </div>
                  {type !== 'rooms' && (
                    <div className="text-[9px] text-muted-foreground mt-1 truncate">
                      📍 {assignment.room?.code}
                    </div>
                  )}
                  {type !== 'teachers' && (
                    <div className="text-[9px] text-muted-foreground mt-1 truncate">
                      👤 {assignment.courseClass?.employee?.profile?.fullname}
                    </div>
                  )}
                  
                  {/* Tooltip on hover if content is too long */}
                  <div className="invisible group-hover:visible absolute z-50 bg-popover text-popover-foreground p-2 rounded border shadow-md text-xs w-48 left-full ml-2 top-0">
                    <p className="font-bold">{assignment.courseClass?.code}</p>
                    <p>{assignment.courseClass?.subject?.name}</p>
                    <p>📍 {assignment.room?.code}</p>
                    <p>👤 {assignment.courseClass?.employee?.profile?.fullname}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                        {DAYS[dayIndex]}, Period {start}-{end}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
