"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { ProfileTab } from "./ProfileTab";
import { SecurityTab } from "./SecurityTab";
import { PreferencesTab } from "./PreferencesTab";

interface AccountClientProps {
  profile: any;
  schemaFields: any[];
}

export function AccountClient({ profile, schemaFields }: AccountClientProps) {
  const t = useTranslations("AccountSettings");
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "profile";
  
  return (
    <Tabs defaultValue={defaultTab} className="w-full flex flex-col md:flex-row gap-6">
      <TabsList className="flex md:flex-col h-auto md:w-64 bg-transparent gap-1">
        <TabsTrigger 
          value="profile" 
          className="w-full justify-start gap-2 data-[state=active]:bg-muted"
        >
          <User className="h-4 w-4" />
          {t("Profile")}
        </TabsTrigger>
        <TabsTrigger 
          value="security" 
          className="w-full justify-start gap-2 data-[state=active]:bg-muted"
        >
          <Shield className="h-4 w-4" />
          {t("Security")}
        </TabsTrigger>
        <TabsTrigger 
          value="preferences" 
          className="w-full justify-start gap-2 data-[state=active]:bg-muted"
        >
          <Settings className="h-4 w-4" />
          {t("Preferences")}
        </TabsTrigger>
      </TabsList>
      
      <div className="flex-1">
        <TabsContent value="profile" className="mt-0">
          <ProfileTab profile={profile} fields={schemaFields} />
        </TabsContent>
        <TabsContent value="security" className="mt-0">
          <SecurityTab />
        </TabsContent>
        <TabsContent value="preferences" className="mt-0">
          <PreferencesTab />
        </TabsContent>
      </div>
    </Tabs>
  );
}
