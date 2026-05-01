"use client";

import { EntityType } from "./ScheduleManager";

interface EntitySidebarProps {
  type: EntityType;
  onSelect: (id: string | null) => void;
  selectedId: string | null;
}

export function EntitySidebar({ type, onSelect, selectedId }: EntitySidebarProps) {
  return (
    <div className="border rounded-md p-4 bg-muted/20 h-full">
      <h3 className="font-semibold mb-4 capitalize">{type} Sidebar</h3>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Select a {type.slice(0, -1)} to view schedule.</p>
        {/* Placeholder for list */}
      </div>
    </div>
  );
}
