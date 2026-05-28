import { getProfileSchemasAction } from "@/actions/profile-schema";
import { OnboardingWizard } from "@/components/features/admin/onboarding/OnboardingWizard";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

interface NewOnboardingPageProps {
  searchParams: Promise<{ sessionId?: string }>;
}

export default async function NewOnboardingPage({ searchParams }: NewOnboardingPageProps) {
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const t = await getTranslations("Onboarding");
  const result = await getProfileSchemasAction();
  const schemas = result.success ? result.data : [];
  const { sessionId } = await searchParams;

  return (
    <div className="py-4 flex-1 overflow-auto">
      <div className="container mx-auto">
        <OnboardingWizard schemas={schemas || []} initialSessionId={sessionId} />
      </div>
    </div>
  );
}
