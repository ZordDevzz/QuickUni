import { getAccounts } from "@/services/user";
import { getProfiles } from "@/services/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateAccountButton } from "@/components/features/auth/CreateAccountButton";
import { getTranslations } from "next-intl/server";
import { Account, Profile } from "@/types/profile";
import { AccountTable } from "./AccountTable";

export default async function AccountsPage() {
  const accounts = (await getAccounts()) as Account[];
  const profiles = (await getProfiles()) as Profile[];
  const t = await getTranslations("Account");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t("AddAccount")}</h2>
        <CreateAccountButton profiles={profiles} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("SystemAccounts")}</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountTable data={accounts} />
        </CardContent>
      </Card>
    </div>
  );
}
