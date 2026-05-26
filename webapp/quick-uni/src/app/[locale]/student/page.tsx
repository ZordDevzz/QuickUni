import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { getScheduleByRole } from "@/actions/scheduling-data";
import { TimeGrid } from "@/components/features/academic/TimeGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations("Student");
  
  if (!session?.user?.id) return null;

  // For the dashboard, we show a summary.
  const { assignments, availability } = await getScheduleByRole('student', session.user.id, null);

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
            type="classes"
            assignments={assignments}
            availability={availability.map(a => a.occupiedMask)}
            mode="view"
          />
        </CardContent>
      </Card>
    </div>
  );
}
