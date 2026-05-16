import { db } from "@/db";
import { StructureWorkspace } from "@/components/features/admin/profiles/StructureWorkspace";

export default async function StructurePage() {
  const schemas = await db.query.profileSchema.findMany({
    orderBy: (profileSchema, { asc }) => [asc(profileSchema.schemaCode)],
  });

  return (
    <div className="container mx-auto py-6">
      <StructureWorkspace schemas={schemas} />
    </div>
  );
}
