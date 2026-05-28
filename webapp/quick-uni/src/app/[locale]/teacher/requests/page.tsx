import { getRequestsForReviewer } from "@/actions/workflow";
import ReviewList from "./ReviewList";
import { getTranslations } from "next-intl/server";

export default async function TeacherRequestsPage() {
  const requests = await getRequestsForReviewer();
  const t = await getTranslations("Admin");

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t("StudentRequests")}</h2>
      </div>
      <ReviewList requests={requests} />
    </div>
  );
}
