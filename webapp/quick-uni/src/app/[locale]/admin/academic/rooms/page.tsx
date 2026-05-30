import { getRoomsWithBuildings, getBuildings } from "@/actions/facility";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateRoomButton } from "@/components/features/academic/CreateRoomButton";
import { RoomTable } from "@/app/[locale]/academic/rooms/RoomTable";
import { getTranslations } from "next-intl/server";

export default async function AdminRoomsPage() {
  const rooms = await getRoomsWithBuildings();
  const buildings = await getBuildings();
  const t = await getTranslations("Navigation");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t("Rooms")}</h2>
        <CreateRoomButton buildings={buildings} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("Rooms")}</CardTitle>
        </CardHeader>
        <CardContent>
          <RoomTable data={rooms} buildings={buildings} />
        </CardContent>
      </Card>
    </div>
  );
}
