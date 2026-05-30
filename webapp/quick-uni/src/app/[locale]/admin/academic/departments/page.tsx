import { getDepartments } from "@/actions/academic";
import DepartmentClient from "@/app/[locale]/academic/departments/DepartmentClient";

export default async function AdminDepartmentsPage() {
  const departments = await getDepartments();

  return <DepartmentClient initialDepartments={departments} />;
}
