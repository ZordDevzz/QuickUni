import { ReactNode } from "react";
import AdminLayoutContent from "./AdminLayoutContent";
import { SemesterProvider } from "@/components/providers/semester-provider";
import { getCurrentSemester } from "@/actions/scheduling-data";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const currentSemester = await getCurrentSemester();

  return (
    <SemesterProvider defaultSemesterId={currentSemester?.id ?? null}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SemesterProvider>
  );
}