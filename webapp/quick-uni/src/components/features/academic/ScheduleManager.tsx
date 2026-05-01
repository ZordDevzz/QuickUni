"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EntitySidebar } from "./EntitySidebar";
import { TimeGrid } from "./TimeGrid";
import { useState } from "react";
import { useTranslations } from "next-intl";

export type EntityType = "rooms" | "teachers" | "classes";

export function ScheduleManager() {
  const t = useTranslations("Admin");
  const [activeTab, setActiveTab] = useState<EntityType>("rooms");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleTabChange = (value: string) => {
    setActiveTab(value as EntityType);
    setSelectedId(null); // Reset selection when switching tabs
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{t("Schedule")}</h1>
        <div className="flex gap-2">
            {/* Placeholder for action buttons */}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="rooms">{t("Rooms")}</TabsTrigger>
          <TabsTrigger value="teachers">{t("Teachers")}</TabsTrigger>
          <TabsTrigger value="classes">{t("CourseClasses")}</TabsTrigger>
        </TabsList>
        
        <div className="flex flex-col lg:flex-row gap-6 mt-6 min-h-[600px]">
          <div className="w-full lg:w-64 shrink-0">
            <EntitySidebar 
                type={activeTab} 
                onSelect={setSelectedId} 
                selectedId={selectedId} 
            />
          </div>
          <div className="flex-1">
            <TimeGrid 
                type={activeTab} 
                entityId={selectedId} 
            />
          </div>
        </div>
      </Tabs>
    </div>
  );
}
