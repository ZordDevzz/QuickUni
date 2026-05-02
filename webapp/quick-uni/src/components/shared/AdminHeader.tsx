"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./UserMenu";
import { SemesterSelector } from "./SemesterSelector";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export function AdminHeader({ setIsMobileOpen }: { setIsMobileOpen: (open: boolean) => void }) {
  const pathname = usePathname();
  const t = useTranslations("Admin");
  
  // Format title from pathname
  const segments = pathname.split('/').filter(Boolean);
  // Last segment after locale
  const lastSegment = segments[segments.length - 1];
  
  // Map segments to translation keys
  const segmentToKey: Record<string, string> = {
    "admin": "Dashboard",
    "accounts": "Accounts",
    "profiles": "Profiles",
    "semesters": "Semesters",
    "departments": "Departments",
    "classes": "CourseClasses",
    "invoices": "Finance",
    "schedule": "Schedule",
    "settings": "Settings"
  };

  const titleKey = segmentToKey[lastSegment] || "Dashboard";
  let title = "Dashboard";
  try {
    title = t(titleKey);
  } catch {
    // Fallback if key not found
    title = lastSegment ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1) : "Dashboard";
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="mr-2 lg:hidden"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      
      <div className="flex flex-1 items-center gap-4 md:gap-8">
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <SemesterSelector />
        <UserMenu />
      </div>
    </header>
  );
}