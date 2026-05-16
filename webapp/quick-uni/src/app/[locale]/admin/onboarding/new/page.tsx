import { getProfileSchemasAction } from "@/actions/profile-schema";
import { OnboardingWizard } from "@/components/features/admin/onboarding/OnboardingWizard";
import { AdminHeader } from "@/components/shared/AdminHeader";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export default async function NewOnboardingPage() {
  const t = await getTranslations("Onboarding");
  const result = await getProfileSchemasAction();
  const schemas = result.success ? result.data : [];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <AdminHeader
        title={t("NewOnboardingTitle")}
        description={t("NewOnboardingDescription")}
      />
      <div className="py-4">
        <OnboardingWizard schemas={schemas || []} />
      </div>
    </div>
  );
}
