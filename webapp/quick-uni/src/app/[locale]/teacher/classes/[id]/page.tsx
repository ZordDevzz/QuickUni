import { getAuthSession } from "@/services/auth";
import { db } from "@/db";
import { courseClass } from "@/db/schemas/course";
import { profile } from "@/db/schemas/user";
import { getClassStudents } from "@/actions/course";
import { eq, and, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FormattedDate } from "@/components/shared/FormattedDate";
import { ClassStudentsTable } from "./ClassStudentsTable";
import { ArrowLeft, BookOpen, Users, Calendar, Award } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TeacherClassDetailPage({ params }: PageProps) {
  const session = await getAuthSession();
  
  if (!session || (session.user.type as string) !== "employee") {
    redirect("/login");
  }

  const { id } = await params;

  // Verify teacher identity
  const emp = await db.query.employee.findFirst({
    where: (emp, { exists }) => exists(
      db.select()
        .from(profile)
        .where(
          and(
            eq(profile.id, emp.profileId),
            eq(profile.accountId, session.user.id)
          )
        )
    )
  });

  if (!emp) {
    redirect("/login");
  }

  // Fetch class details belonging to this teacher
  const classInfo = await db.query.courseClass.findFirst({
    where: and(
      eq(courseClass.id, id),
      eq(courseClass.teacherId, emp.id),
      isNull(courseClass.deletedAt)
    ),
    with: {
      subject: true,
      semester: true
    }
  });

  if (!classInfo) {
    redirect("/teacher/classes");
  }

  const students = await getClassStudents(id);
  const t = await getTranslations("Teacher");

  // Format student records for the client component
  const studentData = students.map((enroll, idx) => ({
    stt: idx + 1,
    id: enroll.student.id,
    code: enroll.student.code,
    fullname: enroll.student.profile.fullname || "N/A",
    gender: enroll.student.profile.gender || "N/A",
    birthday: enroll.student.profile.dob || "N/A",
    email: enroll.student.profile.account?.email || "N/A",
    status: enroll.status ? enroll.status.toString() : "active",
  }));

  const capacityProgress = (classInfo.currentSlot / classInfo.cap) * 100;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Back Button & Title */}
      <div className="flex items-center gap-4">
        <Link 
          href="/teacher/classes" 
          className="p-2 border border-primary/20 bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-all shadow-xs"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <span className="text-[10px] font-bold text-primary tracking-widest font-mono uppercase bg-primary/10 px-2.5 py-1 rounded-full">
            {classInfo.code}
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1.5">
            {classInfo.subject.name}
          </h1>
        </div>
      </div>

      {/* Class Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Course Info Card */}
        <Card className="border-primary/10 shadow-xs rounded-2xl overflow-hidden bg-card/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold tracking-wide uppercase text-muted-foreground">{t("Subject")}</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-extrabold truncate text-foreground">{classInfo.subject.name}</div>
            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{classInfo.subject.code}</p>
          </CardContent>
        </Card>

        {/* Capacity / Student Slots */}
        <Card className="border-primary/10 shadow-xs rounded-2xl overflow-hidden bg-card/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold tracking-wide uppercase text-muted-foreground">{t("Capacity")}</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-xl font-extrabold text-foreground">
              {classInfo.currentSlot} <span className="text-xs font-medium text-muted-foreground">/ {classInfo.cap} sinh viên</span>
            </div>
            <div className="space-y-1">
              <Progress value={capacityProgress} className="h-2" />
              <div className="text-[9px] text-right text-muted-foreground font-semibold">
                {Math.round(capacityProgress)}% Đầy
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Semester Card */}
        <Card className="border-primary/10 shadow-xs rounded-2xl overflow-hidden bg-card/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold tracking-wide uppercase text-muted-foreground">Học kỳ</CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-extrabold text-foreground truncate">{classInfo.semester.name}</div>
            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
              Từ <FormattedDate date={classInfo.semester.startDate} /> đến <FormattedDate date={classInfo.semester.endDate} />
            </p>
          </CardContent>
        </Card>

        {/* Start / End Dates */}
        <Card className="border-primary/10 shadow-xs rounded-2xl overflow-hidden bg-card/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold tracking-wide uppercase text-muted-foreground">Thời gian học</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {classInfo.startDate ? (
              <div className="space-y-1">
                <div className="text-xs font-bold text-foreground">
                  Bắt đầu: <span className="font-semibold text-muted-foreground"><FormattedDate date={classInfo.startDate} /></span>
                </div>
                <div className="text-xs font-bold text-foreground">
                  Kết thúc: <span className="font-semibold text-muted-foreground"><FormattedDate date={classInfo.endDate || ""} /></span>
                </div>
              </div>
            ) : (
              <div className="text-xs font-medium text-muted-foreground py-2">
                Chưa cài đặt thời gian bắt đầu/kết thúc cụ thể.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Student List Section */}
      <Card className="border-primary/10 shadow-md rounded-2xl overflow-hidden bg-card/40 backdrop-blur-md">
        <CardHeader className="border-b border-primary/5 bg-muted/20">
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Danh sách thành viên lớp học</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ClassStudentsTable 
            students={studentData} 
            classCode={classInfo.code} 
            subjectName={classInfo.subject.name || "Class"} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
