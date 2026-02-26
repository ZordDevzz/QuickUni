import { getProfiles } from "@/services/profile";
import { db } from "@/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileWithAccount } from "@/types/profile";
import { getTranslations } from "next-intl/server";
import { ProfileTable } from "./ProfileTable";
import { CreateProfileButton } from "@/components/features/academic/CreateProfileButton";

export default async function ProfilesPage() {
  const profiles = (await getProfiles()) as ProfileWithAccount[];
  const schemas = await db.query.profileSchema.findMany();
  const t = await getTranslations("Profile");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t("UserProfiles")}</h2>
        <CreateProfileButton schemas={schemas} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("UserProfiles")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileTable data={profiles} />
        </CardContent>
      </Card>
    </div>
  );
}