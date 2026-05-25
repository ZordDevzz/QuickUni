import { getPeople } from "@/actions/people";
import { getDefaultSchemaId } from "@/actions/admin";
import { TeacherClient } from "./teacher-client";

export default async function TeachersPage() {
  const data = await getPeople('employee');
  const defaultSchemaId = await getDefaultSchemaId('employee');
  
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <TeacherClient data={data} defaultSchemaId={defaultSchemaId} />
    </div>
  );
}
