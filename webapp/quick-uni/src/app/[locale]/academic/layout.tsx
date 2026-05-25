import { ReactNode } from "react";
import RoleLayoutContent from "@/components/shared/RoleLayoutContent";
import { AcademicSidebar } from "@/components/shared/AcademicSidebar";
import { SemesterProvider } from "@/components/providers/semester-provider";
import { getCurrentSemester } from "@/actions/scheduling-data";

export default async function AcademicLayout({ children }: { children: ReactNode }) {
  const currentSemester = await getCurrentSemester();

  return (
    <SemesterProvider defaultSemesterId={currentSemester?.id ?? null}>
      <RoleLayoutContent Sidebar={AcademicSidebar}>{children}</RoleLayoutContent>
    </SemesterProvider>
  );
}
