import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { getCurrentSemester } from "@/actions/scheduling-data";
import { getActualScheduleByRole } from "@/actions/actual-schedule";
import { TimeGrid } from "@/components/features/academic/TimeGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { format, startOfWeek, addDays } from "date-fns";

export default async function TeacherDashboard() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations("Teacher");
  
  if (!session?.user?.id) return null;

  const currentSemester = await getCurrentSemester();
  const semesterId = currentSemester?.id ?? null;

  // Calculate current week boundaries
  const today = new Date();
  const monday = startOfWeek(today, { weekStartsOn: 1 });
  const sunday = addDays(monday, 6);
  const startStr = format(monday, "yyyy-MM-dd");
  const endStr = format(sunday, "yyyy-MM-dd");

  let assignments: any[] = [];
  let availability: any[] = [];

  if (semesterId) {
    const data = await getActualScheduleByRole('teacher', session.user.id, semesterId, startStr, endStr);
    assignments = data.assignments;
    availability = data.availability;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">{t("Dashboard")}</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("TodaySchedule")}</CardTitle>
          </CardHeader>
          <CardContent>
            {assignments.length > 0 ? (
              <p>{t("YouHaveClasses", { count: assignments.length })}</p>
            ) : (
              <p className="text-muted-foreground">{t("NoClassesToday")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("WeeklyOverview")} ({format(monday, "dd/MM")} - {format(sunday, "dd/MM")})</CardTitle>
        </CardHeader>
        <CardContent>
          <TimeGrid 
            type="teachers"
            assignments={assignments}
            availability={availability.map(a => a.occupiedMask)}
            mode="view"
            weekStartDate={startStr}
          />
        </CardContent>
      </Card>
    </div>
  );
}
