import { getAuthSession } from "@/services/auth";
import { getCurrentSemester, getScheduleByRole } from "@/actions/scheduling-data";
import { TimeGrid } from "@/components/features/academic/TimeGrid";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

export default async function StudentSchedulePage() {
  const session = await getAuthSession();
  
  if (!session || session.user.type !== "student") {
    redirect("/login");
  }

  const currentSemester = await getCurrentSemester();
  
  if (!currentSemester) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">No active semester found</h1>
      </div>
    );
  }

  const { assignments } = await getScheduleByRole("student", session.user.id, currentSemester.id);
  const t = await getTranslations("Student.Schedule");

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("Title")}</h1>
          <p className="text-muted-foreground">
            {t("Description")} - {currentSemester.name}
          </p>
        </div>
      </div>
      
      <div className="bg-card rounded-lg border shadow-sm p-4">
        <TimeGrid 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
          assignments={assignments as any} 
          type="classes" 
          mode="view"
        />
      </div>
    </div>
  );
}
