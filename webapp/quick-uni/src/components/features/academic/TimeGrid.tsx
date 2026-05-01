"use client";

import { EntityType } from "./ScheduleManager";

interface TimeGridProps {
  type: EntityType;
  entityId: string | null;
}

export function TimeGrid({ type, entityId }: TimeGridProps) {
  return (
    <div className="border rounded-md p-8 bg-muted/10 min-h-[500px] flex items-center justify-center">
      <div className="text-center">
        <h3 className="text-lg font-medium">Time Grid</h3>
        <p className="text-muted-foreground">
          {entityId 
            ? `Displaying schedule for ${type.slice(0, -1)}: ${entityId}`
            : `Please select a ${type.slice(0, -1)} from the sidebar.`}
        </p>
      </div>
    </div>
  );
}
