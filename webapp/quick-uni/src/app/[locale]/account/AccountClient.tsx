"use client";

import { useState } from "react";
import { User, Shield, Settings, Mail, Phone, BadgeCheck, ArrowLeft, LayoutDashboard } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { ProfileTab } from "./ProfileTab";
import { SecurityTab } from "./SecurityTab";
import { PreferencesTab } from "./PreferencesTab";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link, useRouter, usePathname } from "@/i18n/routing";

interface AccountClientProps {
  profile: any;
  schemaFields: any[];
  recentAudits: any[];
}

export function AccountClient({ profile, schemaFields, recentAudits }: AccountClientProps) {
  const t = useTranslations("AccountSettings");
  const tAccount = useTranslations("Account");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const defaultTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.replace(`${pathname}?tab=${tab}`);
  };
  
  // Safe extraction of relations
  const account = profile?.account;
  const username = account?.username || "N/A";
  const email = account?.email || "N/A";
  const phone = account?.phone || profile?.dynamicData?.phone || "N/A";
  
  const studentCode = profile?.students?.[0]?.code;
  const employeeCode = profile?.employees?.[0]?.code;
  const userCode = studentCode || employeeCode || "N/A";

  const isStudent = !!studentCode;
  const isEmployee = !!employeeCode;
  
  // Extract role/type
  const accountType = account?.type || "user";
  const status = account?.status || "active";

  // Get initials for Avatar
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(-2)
      .join("")
      .toUpperCase();
  };

  const initials = getInitials(profile?.fullname || username);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Premium Back/Dashboard Navigation Row */}
      <div className="flex items-center justify-between flex-wrap gap-3 select-none">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all bg-card/45 backdrop-blur-md px-4 py-2 border rounded-full shadow-sm hover:shadow-md cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {locale === "vi" ? "Quay lại trang trước" : "Back to Previous"}
        </button>

        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all bg-card/45 backdrop-blur-md px-4 py-2 border rounded-full shadow-sm hover:shadow-md"
        >
          <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
          {locale === "vi" ? "Quay về Hệ thống" : "Return to System"}
        </Link>
      </div>

      {/* Premium Glassmorphic Header Card */}
      <div className="relative overflow-hidden bg-card/60 backdrop-blur-xl border border-border/80 rounded-3xl p-6 md:p-8 shadow-xl shadow-foreground/5 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
        
        {/* Background Accent Gradients */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

        {/* User Avatar with gradient ring */}
        <div className="relative group shrink-0">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-primary to-indigo-600 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-500" />
          <Avatar className="relative h-24 w-24 md:h-28 md:w-28 border-4 border-background shadow-lg">
            <AvatarFallback className="bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground text-3xl font-extrabold tracking-wider select-none">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* User Details */}
        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 justify-center md:justify-start">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
              {profile?.fullname || t("ProfileNotFound")}
            </h2>
            
            <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
              {/* Role badge */}
              <Badge variant="secondary" className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border-primary/20 flex items-center gap-1 select-none">
                <BadgeCheck className="h-3 w-3" />
                {isStudent 
                  ? tAccount("TypeStudent") 
                  : isEmployee 
                  ? tAccount("TypeEmployee") 
                  : accountType.toUpperCase()}
              </Badge>

              {/* Status badge */}
              <Badge 
                variant={status === "active" ? "default" : "destructive"} 
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold select-none flex items-center gap-1.5 ${
                  status === "active" 
                    ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/25 dark:text-emerald-400" 
                    : ""
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${status === "active" ? "bg-emerald-500" : "bg-destructive"} animate-pulse`} />
                {tAccount(status === "active" ? "StatusActive" : "StatusSuspended")}
              </Badge>
            </div>
          </div>

          {/* Quick contact and secondary details */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground select-none">{t("Username")}:</span>
              <span className="font-mono bg-muted px-2 py-0.5 rounded">{username}</span>
            </div>
            
            <div className="h-4 w-px bg-border/80 hidden md:block" />

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground select-none">{isStudent ? t("StudentId") : t("EmployeeId")}:</span>
              <span className="font-mono bg-muted px-2 py-0.5 rounded">{userCode}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-4 text-xs text-muted-foreground/80 pt-1">
            {email && email !== "N/A" && (
              <div className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-primary/75" />
                <span>{email}</span>
              </div>
            )}
            {phone && phone !== "N/A" && (
              <div className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-primary/75" />
                <span>{phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Tab Workspace using custom controlled buttons to bypass radix h-9 height constraints */}
      <div className="w-full flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Responsive Custom Navigation Sidebar */}
        <div className="flex flex-row lg:flex-col overflow-x-auto w-full lg:w-72 bg-card/45 backdrop-blur-md border border-border/80 rounded-2xl p-2 gap-1.5 shadow-md lg:sticky lg:top-6 select-none shrink-0 scrollbar-none">
          <button 
            type="button"
            onClick={() => handleTabChange("profile")}
            className={`flex-1 lg:flex-none w-full flex items-center justify-center lg:justify-start gap-3 py-3 px-4 rounded-xl font-semibold transition-all duration-300 cursor-pointer ${
              activeTab === "profile"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            <User className="h-4 w-4 shrink-0" />
            <span className="inline">{t("Profile")}</span>
          </button>
          
          <button 
            type="button"
            onClick={() => handleTabChange("security")}
            className={`flex-1 lg:flex-none w-full flex items-center justify-center lg:justify-start gap-3 py-3 px-4 rounded-xl font-semibold transition-all duration-300 cursor-pointer ${
              activeTab === "security"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            <Shield className="h-4 w-4 shrink-0" />
            <span className="inline">{t("Security")}</span>
          </button>
          
          <button 
            type="button"
            onClick={() => handleTabChange("preferences")}
            className={`flex-1 lg:flex-none w-full flex items-center justify-center lg:justify-start gap-3 py-3 px-4 rounded-xl font-semibold transition-all duration-300 cursor-pointer ${
              activeTab === "preferences"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            <Settings className="h-4 w-4 shrink-0" />
            <span className="inline">{t("Preferences")}</span>
          </button>
        </div>
        
        {/* Content Workspace */}
        <div className="flex-1 w-full min-w-0">
          {activeTab === "profile" && (
            <div className="outline-none animate-in fade-in duration-300">
              <ProfileTab profile={profile} fields={schemaFields} />
            </div>
          )}
          
          {activeTab === "security" && (
            <div className="outline-none animate-in fade-in duration-300">
              <SecurityTab audits={recentAudits} />
            </div>
          )}
          
          {activeTab === "preferences" && (
            <div className="outline-none animate-in fade-in duration-300">
              <PreferencesTab />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
