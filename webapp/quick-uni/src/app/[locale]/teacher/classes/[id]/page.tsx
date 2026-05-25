import { getClassStudents } from "@/actions/course";
import { RosterClient } from "./RosterClient";
import { notFound } from "next/navigation";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const students = await getClassStudents(id);

  if (!students) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <RosterClient data={students} />
    </div>
  );
}
