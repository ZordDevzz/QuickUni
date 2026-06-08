"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Calendar, ChevronDown } from "lucide-react";

interface Week {
  index: number;
  label: string;
  start: string;
  end: string;
}

interface WeekSelectorProps {
  weeks: Week[];
  initialWeekIndex: number;
}

export function WeekSelector({ weeks, initialWeekIndex }: WeekSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedIdx, setSelectedIdx] = useState(initialWeekIndex);

  const handleSelect = (idx: number) => {
    setSelectedIdx(idx);
    
    // Create new search params based on chosen week index
    const params = new URLSearchParams(searchParams.toString());
    params.set("weekIndex", idx.toString());
    
    // Navigate with new search parameter
    router.push(`${pathname}?${params.toString()}`);
  };

  const currentWeek = weeks[selectedIdx];

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-10 px-4 gap-2 border-primary/20 hover:border-primary/40 bg-background/50 hover:bg-background/80 transition-all rounded-xl shadow-xs">
            <Calendar className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-semibold tracking-wide text-foreground">
              {currentWeek?.label || "Select Week"}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto rounded-xl border-primary/10 shadow-lg bg-popover/95 backdrop-blur-md">
          {weeks.map((w, idx) => (
            <DropdownMenuItem 
              key={w.index} 
              onClick={() => handleSelect(idx)}
              className={`text-xs py-2.5 px-4 font-medium transition-colors cursor-pointer rounded-lg mx-1 my-0.5 ${
                idx === selectedIdx 
                  ? "bg-primary text-primary-foreground font-bold shadow-sm" 
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {w.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
