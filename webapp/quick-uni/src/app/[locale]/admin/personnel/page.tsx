import { getPersonnelProfiles } from "@/services/profile";
import { getPersonnelAccounts } from "@/services/user";
import { db } from "@/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateAccountButton } from "@/components/features/auth/CreateAccountButton";
import { CreateProfileButton } from "@/components/features/academic/CreateProfileButton";
import { AccountTable } from "../accounts/AccountTable";
import { ProfileTable } from "../profiles/ProfileTable";
import { getTranslations } from "next-intl/server";
import { Account, ProfileWithAccount } from "@/types/profile";
import { Briefcase, UserCheck, ShieldAlert, Award } from "lucide-react";

export default async function PersonnelPage() {
  const t = await getTranslations("Admin");
  const accT = await getTranslations("Account");
  const profT = await getTranslations("Profile");

  // Fetch data for Personnel
  const profiles = (await getPersonnelProfiles()) as ProfileWithAccount[];
  const accounts = (await getPersonnelAccounts()) as Account[];
  const schemas = await db.query.profileSchema.findMany();

  // Filter schemas to personnel only (exclude STD schemas)
  const personnelSchemas = schemas.filter(s => !s.schemaCode.startsWith("STD"));

  // Calculate high-premium personnel metrics
  const totalPersonnel = profiles.length;
  const linkedAccounts = profiles.filter(p => p.accountId).length;
  const unlinkedProfiles = totalPersonnel - linkedAccounts;
  const suspendedAccounts = accounts.filter(a => a.status === "suspended" || a.status === "banned").length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-6 md:p-8 border border-indigo-500/15 dark:border-indigo-500/10 shadow-sm">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl"></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              {t("PersonnelMgmt")}
            </h1>
            <p className="text-muted-foreground text-sm max-w-2xl">
              {t("Personnel.Description")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <CreateProfileButton schemas={personnelSchemas} />
            <CreateAccountButton profiles={profiles} restrictType="personnel" />
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Personnel */}
        <Card className="relative overflow-hidden border-indigo-500/10 bg-background/50 backdrop-blur-md transition-all hover:shadow-md hover:-translate-y-0.5 duration-300">
          <div className="absolute top-0 left-0 h-full w-1 bg-indigo-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("TotalPersonnel")}</CardTitle>
            <div className="rounded-lg p-2 bg-indigo-500/10 text-indigo-500">
              <Briefcase className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{totalPersonnel}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("Personnel.ActivePersonnel")}</p>
          </CardContent>
        </Card>

        {/* Linked Accounts */}
        <Card className="relative overflow-hidden border-emerald-500/10 bg-background/50 backdrop-blur-md transition-all hover:shadow-md hover:-translate-y-0.5 duration-300">
          <div className="absolute top-0 left-0 h-full w-1 bg-emerald-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("LinkedAccounts")}</CardTitle>
            <div className="rounded-lg p-2 bg-emerald-500/10 text-emerald-500">
              <UserCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{linkedAccounts}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("Personnel.AccountsIssued")}</p>
          </CardContent>
        </Card>

        {/* Unlinked Profiles */}
        <Card className="relative overflow-hidden border-amber-500/10 bg-background/50 backdrop-blur-md transition-all hover:shadow-md hover:-translate-y-0.5 duration-300">
          <div className="absolute top-0 left-0 h-full w-1 bg-amber-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("UnlinkedProfiles")}</CardTitle>
            <div className="rounded-lg p-2 bg-amber-500/10 text-amber-500">
              <Award className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{unlinkedProfiles}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("Personnel.PendingProfiles")}</p>
          </CardContent>
        </Card>

        {/* Suspended Accounts */}
        <Card className="relative overflow-hidden border-rose-500/10 bg-background/50 backdrop-blur-md transition-all hover:shadow-md hover:-translate-y-0.5 duration-300">
          <div className="absolute top-0 left-0 h-full w-1 bg-rose-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("Personnel.LockedAccounts")}</CardTitle>
            <div className="rounded-lg p-2 bg-rose-500/10 text-rose-500">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{suspendedAccounts}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("Personnel.SuspendedAccounts")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="profiles" className="w-full">
        <TabsList className="mb-6 p-1 bg-muted/60 dark:bg-muted/30 border border-border/55 rounded-xl">
          <TabsTrigger value="profiles" className="px-6 py-2 rounded-lg text-sm font-medium transition-all">
            {t("PersonnelProfiles")}
          </TabsTrigger>
          <TabsTrigger value="accounts" className="px-6 py-2 rounded-lg text-sm font-medium transition-all">
            {t("PersonnelAccounts")}
          </TabsTrigger>
        </TabsList>

        {/* Profiles Tab Content */}
        <TabsContent value="profiles" className="focus-visible:outline-none">
          <Card className="border border-border/40 shadow-sm bg-background/40 backdrop-blur-md">
            <CardHeader className="pb-3 border-b border-border/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-lg font-bold">{t("PersonnelProfiles")}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("Personnel.ProfilesDescription")}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ProfileTable data={profiles} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accounts Tab Content */}
        <TabsContent value="accounts" className="focus-visible:outline-none">
          <Card className="border border-border/40 shadow-sm bg-background/40 backdrop-blur-md">
            <CardHeader className="pb-3 border-b border-border/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-lg font-bold">{t("PersonnelAccounts")}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("Personnel.AccountsDescription")}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <AccountTable data={accounts} restrictType="personnel" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
