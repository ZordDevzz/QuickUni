"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  User, 
  Users, 
  LayoutDashboard, 
  Settings, 
  Calendar,
  Building,
  BookOpen,
  CreditCard,
  Clock,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";

const navItems = [
  { key: "Overview", href: "/admin", icon: LayoutDashboard },
  { key: "Accounts", href: "/admin/accounts", icon: Users, category: "UserManagement" },
  { key: "Profiles", href: "/admin/profiles", icon: User },
  { key: "Semesters", href: "/admin/academic/semesters", icon: Calendar, category: "Academic" },
  { key: "Departments", href: "/admin/academic/departments", icon: Building },
  { key: "CourseClasses", href: "/admin/courses/classes", icon: BookOpen, category: "Curriculum" },
  { key: "Finance", href: "/admin/finance/invoices", icon: CreditCard, category: "Operations" },
  { key: "Schedule", href: "/admin/schedule", icon: Clock },
  { key: "Settings", href: "/admin/system/settings", icon: Settings, category: "System" },
];

interface AdminSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export function AdminSidebar({ 
  isCollapsed, 
  setIsCollapsed, 
  isMobileOpen, 
  setIsMobileOpen 
}: AdminSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("Admin");

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-background transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/admin" className={cn("flex items-center gap-2 font-bold transition-opacity", isCollapsed && "opacity-0 lg:hidden")}>
             <LayoutDashboard className="h-6 w-6 text-primary" />
             <span className="truncate">QuickUni</span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden lg:flex" 
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden" 
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Separator />

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto overflow-x-hidden scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Handle locale prefix in pathname comparison
            const isActive = pathname.endsWith(item.href);
            const label = t(item.key);
            
            return (
              <div key={item.href}>
                {item.category && !isCollapsed && (
                  <div className="mt-4 mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t(item.category)}
                  </div>
                )}
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    isCollapsed && "justify-center px-2"
                  )}
                  title={isCollapsed ? label : undefined}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                  {!isCollapsed && <span className="truncate">{label}</span>}
                </Link>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}