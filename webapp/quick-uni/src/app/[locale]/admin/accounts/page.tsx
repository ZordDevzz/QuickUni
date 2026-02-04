import { getAccounts } from "@/services/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateAccountButton } from "@/components/features/auth/CreateAccountButton";
import { getTranslations } from "next-intl/server";
import { Account } from "@/types/profile";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

export default async function AccountsPage() {
  const accounts = (await getAccounts()) as Account[];
  const t = await getTranslations("Account");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t("AddAccount")}</h2>
        <CreateAccountButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("SystemAccounts")}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={accounts} searchKey="username" />
        </CardContent>
      </Card>
    </div>
  );
}
