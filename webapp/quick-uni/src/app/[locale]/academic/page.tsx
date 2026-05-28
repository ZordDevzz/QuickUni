import { getCurrentSemester, getTeachers, getRooms } from "@/actions/scheduling-data";
import { getRequestsForReviewer } from "@/actions/workflow";
import { db } from "@/db";
import { student } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Calendar, 
  GraduationCap, 
  Users, 
  ClipboardList, 
  Play, 
  MapPin, 
  Building, 
  ArrowRight,
  Clock
} from "lucide-react";
import { getAuthSession } from "@/services/auth";
import { FormattedDate } from "@/components/shared/FormattedDate";

export default async function AcademicDashboardPage() {
  const session = await getAuthSession();
  
  // Ensure the user has access to Academic Office (role ID 4)
  const roles = session?.user?.roles || [];
  if (!roles.includes(4)) {
    redirect("/login");
  }

  const t = await getTranslations("AcademicDashboard");
  
  // Fetch overview data
  const currentSemester = await getCurrentSemester();
  const teachers = await getTeachers();
  const rooms = await getRooms();
  const studentList = await db.query.student.findMany();
  const requests = await getRequestsForReviewer();

  // Metrics
  const totalStudents = studentList.length;
  const totalTeachers = teachers.length;
  const totalRooms = rooms.length;
  const pendingRequests = requests.filter(r => r.status === "pending");
  const totalPending = pendingRequests.length;

  // Format request type
  const formatRequestType = (type: string) => {
    return t(`RequestTypes.${type}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8 text-white shadow-md border border-emerald-500/10">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-6 -ml-6 h-40 w-40 rounded-full bg-teal-500/20 blur-3xl"></div>
        
        <div className="relative space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">
            {t("Welcome")}
          </h1>
          <p className="text-emerald-50/90 text-sm max-w-2xl">
            {t("WelcomeDesc")}
          </p>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Semester */}
        <Card className="relative overflow-hidden border-emerald-500/10 bg-background/50 backdrop-blur-md transition-all hover:shadow-md hover:-translate-y-0.5 duration-300">
          <div className="absolute top-0 left-0 h-full w-1 bg-emerald-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("CurrentSemester")}</CardTitle>
            <div className="rounded-lg p-2 bg-emerald-500/10 text-emerald-500">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold tracking-tight truncate">
              {currentSemester?.name || "Chưa thiết lập"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t("ActiveSemester")}</p>
          </CardContent>
        </Card>

        {/* Regular Students */}
        <Card className="relative overflow-hidden border-teal-500/10 bg-background/50 backdrop-blur-md transition-all hover:shadow-md hover:-translate-y-0.5 duration-300">
          <div className="absolute top-0 left-0 h-full w-1 bg-teal-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("RegularStudents")}</CardTitle>
            <div className="rounded-lg p-2 bg-teal-500/10 text-teal-500">
              <GraduationCap className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("EnrolledStudents")}</p>
          </CardContent>
        </Card>

        {/* Teachers */}
        <Card className="relative overflow-hidden border-cyan-500/10 bg-background/50 backdrop-blur-md transition-all hover:shadow-md hover:-translate-y-0.5 duration-300">
          <div className="absolute top-0 left-0 h-full w-1 bg-cyan-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("AcademicStaff")}</CardTitle>
            <div className="rounded-lg p-2 bg-cyan-500/10 text-cyan-500">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{totalTeachers}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("FacultyAndStaff")}</p>
          </CardContent>
        </Card>

        {/* Pending Requests */}
        <Card className="relative overflow-hidden border-amber-500/10 bg-background/50 backdrop-blur-md transition-all hover:shadow-md hover:-translate-y-0.5 duration-300">
          <div className="absolute top-0 left-0 h-full w-1 bg-amber-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("PendingRequests")}</CardTitle>
            <div className={`rounded-lg p-2 ${totalPending > 0 ? 'bg-amber-500/20 text-amber-600 animate-pulse' : 'bg-amber-500/10 text-amber-500'}`}>
              <ClipboardList className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{totalPending}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("RequestsWaiting")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Quick Actions & Recent Requests */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Quick Actions Panel */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold tracking-tight">{t("Operations")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Auto Schedule */}
            <Link href="/academic/schedule" className="group">
              <div className="flex items-start gap-4 p-5 rounded-xl border border-emerald-500/10 bg-background/40 backdrop-blur-sm transition-all hover:bg-emerald-500/5 hover:border-emerald-500/30 hover:shadow-sm duration-300">
                <div className="rounded-lg p-3 bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                  <Play className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm flex items-center gap-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {t("AutoScheduling")} <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("AutoSchedulingDesc")}
                  </p>
                </div>
              </div>
            </Link>

            {/* Students */}
            <Link href="/academic/people/students" className="group">
              <div className="flex items-start gap-4 p-5 rounded-xl border border-teal-500/10 bg-background/40 backdrop-blur-sm transition-all hover:bg-teal-500/5 hover:border-teal-500/30 hover:shadow-sm duration-300">
                <div className="rounded-lg p-3 bg-teal-500/10 text-teal-500 group-hover:scale-110 transition-transform">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm flex items-center gap-1.5 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {t("StudentProfiles")} <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("StudentProfilesDesc")}
                  </p>
                </div>
              </div>
            </Link>

            {/* Teachers */}
            <Link href="/academic/people/teachers" className="group">
              <div className="flex items-start gap-4 p-5 rounded-xl border border-cyan-500/10 bg-background/40 backdrop-blur-sm transition-all hover:bg-cyan-500/5 hover:border-cyan-500/30 hover:shadow-sm duration-300">
                <div className="rounded-lg p-3 bg-cyan-500/10 text-cyan-500 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm flex items-center gap-1.5 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    {t("TeacherProfiles")} <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("TeacherProfilesDesc")}
                  </p>
                </div>
              </div>
            </Link>

            {/* Requests */}
            <Link href="/academic/requests" className="group">
              <div className="flex items-start gap-4 p-5 rounded-xl border border-amber-500/10 bg-background/40 backdrop-blur-sm transition-all hover:bg-amber-500/5 hover:border-amber-500/30 hover:shadow-sm duration-300">
                <div className="rounded-lg p-3 bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm flex items-center gap-1.5 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {t("AbsenceRequests")} <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("AbsenceRequestsDesc")}
                  </p>
                </div>
              </div>
            </Link>

            {/* Departments */}
            <Link href="/academic/departments" className="group">
              <div className="flex items-start gap-4 p-5 rounded-xl border border-purple-500/10 bg-background/40 backdrop-blur-sm transition-all hover:bg-purple-500/5 hover:border-purple-500/30 hover:shadow-sm duration-300">
                <div className="rounded-lg p-3 bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
                  <Building className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm flex items-center gap-1.5 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {t("FacultyAndDepartments")} <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("FacultyAndDepartmentsDesc")}
                  </p>
                </div>
              </div>
            </Link>

            {/* Rooms */}
            <Link href="/academic/rooms" className="group">
              <div className="flex items-start gap-4 p-5 rounded-xl border border-blue-500/10 bg-background/40 backdrop-blur-sm transition-all hover:bg-blue-500/5 hover:border-blue-500/30 hover:shadow-sm duration-300">
                <div className="rounded-lg p-3 bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm flex items-center gap-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {t("RoomManagement")} <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("RoomManagementDesc")}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Pending Requests Card */}
        <div className="md:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">{t("LatestRequests")}</h2>
            {totalPending > 0 && (
              <Link href="/academic/requests" className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 hover:underline">
                {t("ViewAll", { count: totalPending })}
              </Link>
            )}
          </div>
          
          <Card className="border border-border/40 shadow-sm bg-background/40 backdrop-blur-md h-[408px] overflow-hidden flex flex-col">
            <CardHeader className="py-4 border-b border-border/30 shrink-0">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amber-500" /> {t("PendingReviews")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              <div className="divide-y divide-border/20">
                {pendingRequests.slice(0, 4).map((req) => (
                  <div key={req.id} className="p-4 space-y-2 hover:bg-muted/10 transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <div className="font-bold text-xs">
                        {req.sender.fullname || req.sender.username || "Người dùng ẩn"}
                      </div>
                      <div className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        <FormattedDate date={req.createAt} />
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground flex justify-between items-center">
                      <span>{t("Type", { type: formatRequestType(req.type) })}</span>
                      <Link 
                        href="/academic/requests" 
                        className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline flex items-center gap-0.5"
                      >
                        {t("Review")}
                      </Link>
                    </div>
                  </div>
                ))}
                
                {totalPending === 0 && (
                  <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                    <ClipboardList className="h-10 w-10 text-muted-foreground/30 mb-2" />
                    <p className="text-xs text-muted-foreground font-medium">{t("NoPendingRequests")}</p>
                    <p className="text-[10px] text-muted-foreground/80 mt-0.5">{t("CleanDashboard")}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
