import { getBuildings } from "@/actions/facility";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateBuildingButton } from "@/components/features/academic/CreateBuildingButton";
import { BuildingTable } from "./BuildingTable";
import { getTranslations } from "next-intl/server";

export default async function BuildingsPage() {
  const buildings = await getBuildings();
  const t = await getTranslations("Navigation");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t("Buildings")}</h2>
        <CreateBuildingButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("Buildings")}</CardTitle>
        </CardHeader>
        <CardContent>
          <BuildingTable data={buildings} />
        </CardContent>
      </Card>
    </div>
  );
}
