"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  User, 
  Users, 
  UserPlus,
  LayoutDashboard, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Briefcase,
  GraduationCap,
  FolderTree,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface NavItem {
  key: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  category?: string;
  items?: Omit<NavItem, "icon">[];
}

const navItems: NavItem[] = [
  { key: "Overview", href: "/admin", icon: LayoutDashboard },
  { 
    key: "PersonnelMgmt", 
    href: "/admin/personnel", 
    icon: Briefcase, 
    category: "UserManagement" 
  },
  { 
    key: "StudentMgmt", 
    href: "/admin/students", 
    icon: GraduationCap 
  },
  { 
    key: "Onboarding", 
    href: "/admin/onboarding", 
    icon: UserPlus 
  },
  { 
    key: "Academic", 
    href: "/admin/academic", 
    icon: BookOpen,
    category: "Academic",
    items: [
      { key: "Departments", href: "/admin/academic/departments" },
      { key: "Rooms", href: "/admin/academic/rooms" },
      { key: "Buildings", href: "/admin/academic/buildings" },
      { key: "Semesters", href: "/admin/academic/semesters" },
    ]
  },
  { key: "Settings", href: "/admin/system/settings", icon: Settings, category: "System" },
  { key: "Roles", href: "/admin/system/roles", icon: Users },
  { 
    key: "ProfileConfig", 
    href: "/admin/profiles/structure", 
    icon: FolderTree,
    items: [
      { key: "Structure", href: "/admin/profiles/structure" },
      { key: "ProfileSchema", href: "/admin/profiles/schemas" },
      { key: "ProfileField", href: "/admin/profiles/fields" },
    ]
  },
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
  const t = useTranslations("Navigation");
  const [expandedItems, setExpandedItems] = useState<string[]>(["Profiles", "Academic"]);

  const toggleExpand = (key: string) => {
    setExpandedItems(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

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
            const isChildActive = item.items?.some(subItem => pathname.endsWith(subItem.href) || pathname.includes(subItem.href));
            const isActive = pathname.endsWith(item.href) || (item.href !== "/admin" && item.href !== "/academic" && pathname.includes(item.href)) || isChildActive;
            const hasSubItems = item.items && item.items.length > 0;
            const isExpanded = expandedItems.includes(item.key);
            const label = t(item.key);
            
            return (
              <div key={item.key}>
                {item.category && !isCollapsed && (
                  <div className="mt-4 mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t(item.category)}
                  </div>
                )}
                {hasSubItems && !isCollapsed ? (
                  <>
                    <button
                      onClick={() => toggleExpand(item.key)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        isActive && "text-foreground font-semibold"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                        <span className="truncate">{label}</span>
                      </div>
                      <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                    </button>
                    {isExpanded && (
                      <div className="mt-1 ml-4 space-y-1 border-l pl-4">
                        {item.items!.map((subItem) => {
                          const isSubActive = pathname.endsWith(subItem.href) || pathname.includes(subItem.href);
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={cn(
                                "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                isSubActive 
                                  ? "text-primary font-semibold" 
                                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                              )}
                            >
                              {t(subItem.key)}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
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
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}