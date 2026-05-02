"use client";

import { useEffect, useState } from "react";
import { useSemester } from "@/components/providers/semester-provider";
import { getSemesters } from "@/actions/scheduling-data";
import { semester } from "@/db/schemas/academic";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export function SemesterSelector() {
  const { selectedSemesterId, setSelectedSemesterId } = useSemester();
  const [semesters, setSemesters] = useState<typeof semester.$inferSelect[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("Admin");

  useEffect(() => {
    getSemesters()
      .then((data) => {
        setSemesters(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch semesters:", err);
        toast.error("Failed to load semesters");
        setLoading(false);
      });
  }, []);

  const selectedSemester = semesters.find(s => s.id === selectedSemesterId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1 pr-2">
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline-block text-xs">
            {loading ? t("Loading") + "..." : selectedSemester?.name || t("SelectSemester")}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
        {semesters.map((s) => (
          <DropdownMenuItem 
            key={s.id} 
            onClick={() => setSelectedSemesterId(s.id)}
            className={s.id === selectedSemesterId ? "bg-accent" : ""}
          >
            {s.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
