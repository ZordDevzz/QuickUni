import { db } from "@/db";
import { StructureWorkspace } from "@/components/features/admin/profiles/StructureWorkspace";

export default async function StructurePage() {
  const schemas = await db.query.profileSchema.findMany({
    orderBy: (profileSchema, { asc }) => [asc(profileSchema.schemaCode)],
    with: {
      profileSections: {
        orderBy: (sections, { asc }) => [asc(sections.order)],
        with: {
          profileSchemaFields: {
            orderBy: (fields, { asc }) => [asc(fields.order)],
            with: {
              profileField: true,
            },
          },
        },
      },
    },
  });
  
  const allFields = await db.query.profileField.findMany();

  return (
    <div className="container mx-auto py-6">
      <StructureWorkspace initialSchemas={schemas} allFields={allFields} />
    </div>
  );
}
