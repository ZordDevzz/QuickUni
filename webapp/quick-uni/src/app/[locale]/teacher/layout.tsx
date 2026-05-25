import { ReactNode } from "react";
import RoleLayoutContent from "@/components/shared/RoleLayoutContent";
import { TeacherSidebar } from "@/components/shared/TeacherSidebar";
import { SemesterProvider } from "@/components/providers/semester-provider";
import { getCurrentSemester } from "@/actions/scheduling-data";

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  const currentSemester = await getCurrentSemester();

  return (
    <SemesterProvider defaultSemesterId={currentSemester?.id ?? null}>
      <RoleLayoutContent Sidebar={TeacherSidebar}>{children}</RoleLayoutContent>
    </SemesterProvider>
  );
}
