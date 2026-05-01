"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { EntityType } from "./ScheduleManager";
import { getRooms, getTeachers, getCourseClasses } from "@/actions/scheduling-data";
import { Search, MapPin, User, BookOpen } from "lucide-react";

interface EntitySidebarProps {
  type: EntityType;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function EntitySidebar({ type, selectedId, onSelect }: EntitySidebarProps) {
  const [entities, setEntities] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        let data: any[] = [];
        if (type === "rooms") data = await getRooms();
        else if (type === "teachers") data = await getTeachers();
        else if (type === "classes") data = await getCourseClasses(1); // Hardcoded semester for now
        setEntities(data);
      } catch (error) {
        console.error("Failed to load entities", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [type]);

  const filteredEntities = entities.filter(e => {
    const term = search.toLowerCase();
    if (type === "rooms") return e.code.toLowerCase().includes(term);
    if (type === "teachers") return e.profile?.name?.toLowerCase().includes(term);
    if (type === "classes") return e.code.toLowerCase().includes(term) || e.subject?.name?.toLowerCase().includes(term);
    return false;
  });

  return (
    <div className="flex flex-col h-full border rounded-lg bg-background">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search..." 
            className="pl-8" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
        ) : filteredEntities.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">No entities found</div>
        ) : (
          <div className="space-y-1">
            {filteredEntities.map((entity) => (
              <button
                key={entity.id}
                onClick={() => onSelect(entity.id.toString())}
                className={cn(
                  "w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground text-left",
                  selectedId === entity.id.toString() ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                {type === "rooms" && <MapPin className="h-4 w-4 shrink-0" />}
                {type === "teachers" && <User className="h-4 w-4 shrink-0" />}
                {type === "classes" && <BookOpen className="h-4 w-4 shrink-0" />}
                <div className="truncate">
                  <div className="font-semibold">
                    {type === "rooms" ? entity.code : type === "teachers" ? entity.profile?.name : entity.code}
                  </div>
                  {type === "classes" && <div className="text-xs opacity-70">{entity.subject?.name}</div>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
