"use client";

import { ReactNode, useState } from "react";
import { AdminSidebar } from "@/components/shared/AdminSidebar";
import { RoleHeader } from "@/components/shared/RoleHeader";
import { cn } from "@/lib/utils";

export default function AdminLayoutContent({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/20">
      <AdminSidebar 
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
