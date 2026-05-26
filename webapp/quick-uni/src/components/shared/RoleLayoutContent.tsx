"use client";

import { ReactNode, useState } from "react";
import { RoleHeader } from "@/components/shared/RoleHeader";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface RoleLayoutContentProps {
  children: ReactNode;
  Sidebar: React.ComponentType<{
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
    isMobileOpen: boolean;
    setIsMobileOpen: (open: boolean) => void;
  }>;
}

export default function RoleLayoutContent({ children, Sidebar }: RoleLayoutContentProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  const isWizard = pathname?.endsWith("/academic/schedule/wizard");

  if (isWizard) {
    return (
      <div className="w-full min-h-screen bg-background">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      
      <div className={cn(
        "flex flex-1 flex-col transition-all duration-300",
        isCollapsed ? "lg:pl-16" : "lg:pl-64"
      )}>
        <RoleHeader setIsMobileOpen={setIsMobileOpen} />
        
        <main className="flex-1 p-4 lg:p-8">
          <div className="mx-auto max-w-8xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
