import { 
  getRequestsForReviewer, 
  getTeacherSubmittedRequests, 
  getAllRooms 
} from "@/actions/workflow";
import { getCurrentSemester } from "@/actions/scheduling-data";
import { getTeacherClasses } from "@/actions/course";
import ReviewList from "./ReviewList";
import TeacherRequestWizard from "./TeacherRequestWizard";
import RequestList from "@/app/[locale]/student/requests/RequestList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTranslations } from "next-intl/server";

export default async function TeacherRequestsPage() {
  const t = await getTranslations("Workflow");
  const tAdmin = await getTranslations("Admin");

  // Fetch student requests sent to this teacher
  const studentRequests = await getRequestsForReviewer();

  // Fetch teacher's own requests sent to PĐT
  const teacherRequests = await getTeacherSubmittedRequests();

  // Load teacher classes and rooms as wizard dependencies
  const currentSemester = await getCurrentSemester();
  let teacherClasses: any[] = [];
  if (currentSemester) {
    teacherClasses = await getTeacherClasses(currentSemester.id);
  }
  const rooms = await getAllRooms();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t("ReviewTitle")}</h2>
      </div>

      <Tabs defaultValue="review" className="space-y-4">
        <TabsList className="bg-background border">
          <TabsTrigger value="review" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            {t("Tabs.ReviewRequests")}
          </TabsTrigger>
          <TabsTrigger value="my-requests" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            {t("Tabs.MyRequests")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="space-y-4">
          <ReviewList requests={studentRequests} />
        </TabsContent>

        <TabsContent value="my-requests" className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="text-lg font-medium">{t("Tabs.MyRequests")}</h3>
              <p className="text-sm text-muted-foreground">
                Gửi và theo dõi các yêu cầu xin nghỉ dạy, đổi giờ học hoặc đăng ký dạy bù.
              </p>
            </div>
            <TeacherRequestWizard classes={teacherClasses} rooms={rooms} />
          </div>
          <RequestList requests={teacherRequests} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
