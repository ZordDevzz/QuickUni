import { getPeople } from "@/actions/people";
import { getDefaultSchemaId } from "@/actions/admin";
import { StudentClient } from "./student-client";

export default async function StudentsPage() {
  const data = await getPeople('student');
  const defaultSchemaId = await getDefaultSchemaId('student');
  
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <StudentClient data={data} defaultSchemaId={defaultSchemaId} />
    </div>
  );
}
