import { getAuthSession } from "@/services/auth";
import { getCurrentSemester } from "@/actions/scheduling-data";
import { getActualScheduleByRole } from "@/actions/actual-schedule";
import { TimeGrid } from "@/components/features/academic/TimeGrid";
import { WeekSelector } from "@/components/features/academic/WeekSelector";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { parseISO, format, addDays, startOfWeek } from 'date-fns';

interface PageProps {
  searchParams: Promise<{ weekIndex?: string }>;
}

export default async function StudentSchedulePage({ searchParams }: PageProps) {
  const session = await getAuthSession();
  
  if (!session || session.user.type !== "student") {
    redirect("/login");
  }

  const currentSemester = await getCurrentSemester();
  
  if (!currentSemester) {
    const tCommon = await getTranslations('Common');
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">{tCommon('NoActiveSemester')}</h1>
      </div>
    );
  }

  const t = await getTranslations("Student.Schedule");
  const tSM = await getTranslations('ScheduleManager');

  // Compute weeks dynamically
  const weeks: { index: number; label: string; start: string; end: string }[] = [];
  try {
    const start = parseISO(currentSemester.startDate);
    const end = parseISO(currentSemester.endDate);
    let currentMonday = startOfWeek(start, { weekStartsOn: 1 });
    let index = 1;
    while (currentMonday <= end) {
      const weekStartStr = format(currentMonday, "yyyy-MM-dd");
      const weekEndStr = format(addDays(currentMonday, 6), "yyyy-MM-dd");
      weeks.push({
        index,
        label: `${tSM("Week")} ${index} (${format(currentMonday, "dd/MM")} - ${format(addDays(currentMonday, 6), "dd/MM")})`,
        start: weekStartStr,
        end: weekEndStr
      });
      currentMonday = addDays(currentMonday, 7);
      index++;
    }
  } catch (e) {
    console.error("Error computing weeks:", e);
  }

  // Determine active week index
  const params = await searchParams;
  let activeWeekIndex = 0;
  
  if (params.weekIndex !== undefined) {
    const parsed = parseInt(params.weekIndex);
    if (!isNaN(parsed) && parsed >= 0 && parsed < weeks.length) {
      activeWeekIndex = parsed;
    }
  } else {
    // Find current calendar week containing today
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const foundIdx = weeks.findIndex(w => todayStr >= w.start && todayStr <= w.end);
    if (foundIdx !== -1) {
      activeWeekIndex = foundIdx;
    }
  }

  const activeWeek = weeks[activeWeekIndex];

  // Fetch actual schedule for the selected week
  let assignments: any[] = [];
  let availability: any[] = [];
  
  if (activeWeek) {
    const data = await getActualScheduleByRole(
      "student", 
      session.user.id, 
      currentSemester.id, 
      activeWeek.start, 
      activeWeek.end
    );
    assignments = data.assignments;
    availability = data.availability;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("Title")}</h1>
          <p className="text-muted-foreground">
            {t("Description")} - {currentSemester.name}
          </p>
        </div>
        {weeks.length > 0 && (
          <WeekSelector weeks={weeks} initialWeekIndex={activeWeekIndex} />
        )}
      </div>
      
      <div className="bg-card rounded-lg border shadow-sm p-4">
        <TimeGrid 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
          assignments={assignments as any} 
          availability={availability.map(a => a.occupiedMask)}
          type="classes" 
          mode="view"
          weekStartDate={activeWeek?.start}
        />
      </div>
    </div>
  );
}
