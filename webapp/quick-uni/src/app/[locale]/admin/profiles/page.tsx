import { getProfiles } from "@/services/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { ProfileWithAccount } from "@/types/profile";
import { getTranslations } from "next-intl/server";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

export default async function ProfilesPage() {
  const profiles = (await getProfiles()) as ProfileWithAccount[];
  const t = await getTranslations("Profile");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t("UserProfiles")}</h2>
        <Button className="gap-2" variant="outline" disabled title="Requires Profile Schema">
          <UserPlus className="h-4 w-4" /> {t("AddProfile")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("UserProfiles")}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={profiles} searchKey="fullname" />
        </CardContent>
      </Card>
    </div>
  );
}