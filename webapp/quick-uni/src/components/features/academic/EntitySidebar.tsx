"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { EntityType } from "./ScheduleManager";
import { getRooms, getTeachers, getCourseClasses } from "@/actions/scheduling-data";
import { Search, MapPin, User, BookOpen } from "lucide-react";

interface Entity {
  id: string | number;
  code: string;
  name?: string;
  profile?: {
    fullname?: string | null;
  } | null;
  subject?: {
    name: string;
  } | null;
}

interface EntitySidebarProps {
  type: EntityType;
  selectedId: string | null;
  onSelect: (id: string) => void;
  semesterId: number | null;
}

export function EntitySidebar({ type, selectedId, onSelect, semesterId }: EntitySidebarProps) {
  const t = useTranslations("Admin");
  const [entities, setEntities] = useState<Entity[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (type === "classes" && !semesterId) {
        setEntities([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        let data: Entity[] = [];
        if (type === "rooms") data = await getRooms() as Entity[];
        else if (type === "teachers") data = await getTeachers() as Entity[];
        else if (type === "classes" && semesterId) data = await getCourseClasses(semesterId) as Entity[];
        setEntities(data);
      } catch (error) {
        console.error("Failed to load entities", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [type, semesterId]);

  const filteredEntities = entities.filter(e => {
    const term = search.toLowerCase();
    if (type === "rooms") return e.code.toLowerCase().includes(term);
    if (type === "teachers") return e.profile?.fullname?.toLowerCase().includes(term);
    if (type === "classes") return e.code.toLowerCase().includes(term) || e.subject?.name?.toLowerCase().includes(term);
    return false;
  });

  return (
    <div className="flex flex-col h-full border rounded-lg bg-background">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={t("SearchPlaceholder")} 
            className="pl-8" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1 p-2">
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">{t("Loading")}</div>
        ) : filteredEntities.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">{t("NoEntitiesFound")}</div>
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
                    {type === "rooms" ? entity.code : type === "teachers" ? entity.profile?.fullname : entity.code}
                  </div>
                  {type === "classes" && <div className="text-xs opacity-70">{entity.subject?.name}</div>}
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
