import { getSubjects } from "@/actions/academic";
import { SubjectClient } from "./subject-client";

export default async function SubjectsPage() {
  const data = await getSubjects();
  
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <SubjectClient data={data} />
    </div>
  );
}
