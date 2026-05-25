import { getDepartments } from "@/actions/academic";
import DepartmentClient from "./DepartmentClient";

export default async function DepartmentsPage() {
  const departments = await getDepartments();

  return <DepartmentClient initialDepartments={departments} />;
}
