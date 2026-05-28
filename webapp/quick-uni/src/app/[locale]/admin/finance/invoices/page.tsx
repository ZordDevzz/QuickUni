import AdminSkeleton from "@/components/shared/AdminSkeleton";
import { getTranslations } from "next-intl/server";

export default async function InvoicesPage() {
  const t = await getTranslations("Navigation");
  return <AdminSkeleton title={t("Finance")} />;
}
