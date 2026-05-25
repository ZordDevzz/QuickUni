import { ReactNode } from "react";
import RoleLayoutContent from "@/components/shared/RoleLayoutContent";
import { StudentSidebar } from "@/components/shared/StudentSidebar";
import { SemesterProvider } from "@/components/providers/semester-provider";
import { getCurrentSemester } from "@/actions/scheduling-data";

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const currentSemester = await getCurrentSemester();

  return (
    <SemesterProvider defaultSemesterId={currentSemester?.id ?? null}>
      <RoleLayoutContent Sidebar={StudentSidebar}>{children}</RoleLayoutContent>
    </SemesterProvider>
  );
}
