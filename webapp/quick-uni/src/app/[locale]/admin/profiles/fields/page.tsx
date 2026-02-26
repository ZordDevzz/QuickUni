import { db } from "@/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { CreateProfileFieldButton } from "@/components/features/academic/CreateProfileFieldButton";
import { FieldTable } from "./FieldTable";

export default async function ProfileFieldsPage() {
  const fields = await db.query.profileField.findMany({
    orderBy: (field, { desc }) => [desc(field.createAt)],
  });
  const t = await getTranslations("Profile");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t("ProfileField")}</h2>
        <CreateProfileFieldButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("SystemFields")}</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldTable data={fields} />
        </CardContent>
      </Card>
    </div>
  );
}
