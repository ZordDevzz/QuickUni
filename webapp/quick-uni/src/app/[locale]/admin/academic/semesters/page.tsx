import { getSemesters } from "@/actions/academic";
import { SemesterClient } from "./semester-client";

export default async function SemestersPage() {
  const data = await getSemesters();
  
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <SemesterClient data={data} />
    </div>
  );
}
