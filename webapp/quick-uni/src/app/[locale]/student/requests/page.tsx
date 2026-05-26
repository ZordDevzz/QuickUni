import { getTranslations } from "next-intl/server";
import { getStudentRequests } from "@/actions/workflow";
import { getCurrentSemester } from "@/actions/scheduling-data";
import { getStudentEnrollments } from "@/actions/course";
import RequestList from "./RequestList";
import RequestWizard from "./RequestWizard";

export default async function StudentRequestsPage() {
  const t = await getTranslations("Student.Requests");
  const requests = await getStudentRequests();
  const currentSemester = await getCurrentSemester();
  
  let enrollments: Awaited<ReturnType<typeof getStudentEnrollments>> = [];
  if (currentSemester) {
    enrollments = await getStudentEnrollments(currentSemester.id);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t("Title")}</h1>
          <p className="text-muted-foreground">{t("Description")}</p>
        </div>
        <RequestWizard enrollments={enrollments} />
      </div>

      <RequestList requests={requests} />
    </div>
  );
}
