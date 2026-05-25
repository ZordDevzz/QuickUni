import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getScheduleByRole } from "@/actions/scheduling-data";
import { TimeGrid } from "@/components/features/academic/TimeGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

export default async function TeacherDashboard() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations("Teacher");
  
  if (!session?.user?.id) return null;

  // For the dashboard, we show a summary. 
  // In a real scenario, we'd pass the current semester ID here.
  const { assignments, availability } = await getScheduleByRole('teacher', session.user.id, null);

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
          <CardTitle>{t("WeeklyOverview")}</CardTitle>
        </CardHeader>
        <CardContent>
          <TimeGrid 
            type="teachers"
            assignments={assignments}
            availability={availability.map(a => a.occupiedMask)}
            mode="view"
          />
        </CardContent>
      </Card>
    </div>
  );
}
