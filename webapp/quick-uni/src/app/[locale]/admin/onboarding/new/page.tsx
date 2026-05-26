import { getProfileSchemasAction } from "@/actions/profile-schema";
import { OnboardingWizard } from "@/components/features/admin/onboarding/OnboardingWizard";
import { AdminHeader } from "@/components/shared/AdminHeader";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export default async function NewOnboardingPage() {
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const t = await getTranslations("Onboarding");
  const result = await getProfileSchemasAction();
  const schemas = result.success ? result.data : [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AdminHeader setIsMobileOpen={() => {}} />
      <div className="py-4 flex-1 overflow-auto">
        <div className="container mx-auto">
          <OnboardingWizard schemas={schemas || []} />
        </div>
      </div>
    </div>
  );
}
