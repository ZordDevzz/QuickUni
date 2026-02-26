import { db } from "@/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { CreateProfileSchemaButton } from "@/components/features/academic/CreateProfileSchemaButton";
import { SchemaTable } from "./SchemaTable";

export default async function ProfileSchemasPage() {
  const schemas = await db.query.profileSchema.findMany({
    orderBy: (schema, { desc }) => [desc(schema.createAt)],
  });
  const t = await getTranslations("Profile");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t("ProfileSchema")}</h2>
        <CreateProfileSchemaButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("SystemSchemas")}</CardTitle>
        </CardHeader>
        <CardContent>
          <SchemaTable data={schemas} />
        </CardContent>
      </Card>
    </div>
  );
}