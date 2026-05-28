import AdminSkeleton from "@/components/shared/AdminSkeleton";
import { getTranslations } from "next-intl/server";

export default async function SystemSettingsPage() {
  const t = await getTranslations("Navigation");
  return <AdminSkeleton title={t("Settings")} />;
}
