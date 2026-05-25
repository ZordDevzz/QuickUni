import { getStudentEnrollments } from "@/actions/course";
import { getCurrentSemester } from "@/actions/scheduling-data";
import { SemesterSelector } from "@/components/shared/SemesterSelector";
import { ClassCardGrid } from "./ClassCardGrid";
import { getTranslations } from "next-intl/server";

export default async function MyClassesPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Student.Classes" });
  const currentSemester = await getCurrentSemester();
  
  const enrollments = currentSemester 
    ? await getStudentEnrollments(currentSemester.id)
    : [];

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Title") || "My Classes"}</h1>
          <p className="text-muted-foreground">
            {currentSemester ? currentSemester.name : t("NoActiveSemester") || "No active semester"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SemesterSelector />
        </div>
      </div>

      <ClassCardGrid enrollments={enrollments} />
    </div>
  );
}
