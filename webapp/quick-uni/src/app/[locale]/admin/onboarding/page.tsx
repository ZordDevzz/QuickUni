import { OnboardingDashboard } from "@/components/features/admin/onboarding/OnboardingDashboard";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("Onboarding");
  return {
    title: `${t("DashboardTitle")} | QuickUni Admin`,
  };
}

export default function OnboardingPage() {
  return (
    <div className="p-6">
      <OnboardingDashboard />
    </div>
  );
}
