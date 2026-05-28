'use client';

import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface MainClass {
  id: string;
  code: string;
  majorId: string;
  academicYear: number;
  major?: {
    code: string;
    des: string | null;
  };
}

interface MasterListProps {
  classes: MainClass[];
  selectedId: string | null;
  onAdd: () => void;
}

export function MasterList({ classes, selectedId, onAdd }: MasterListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const t = useTranslations("MainClasses");

  const filteredClasses = classes.filter(c =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.major?.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.major?.des?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('id', id);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-80 border-r flex flex-col bg-muted/5 h-full">
      <div className="p-4 border-b space-y-4 bg-background">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">{t("Title")}</h2>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onAdd}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("SearchPlaceholder")}
            className="pl-8 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredClasses.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelect(c.id)}
              className={cn(
                "w-full text-left px-3 py-3 rounded-md transition-all duration-200 group",
                selectedId === c.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-muted"
              )}
            >
              <div className="font-medium truncate">{c.code}</div>
              <div className={cn(
                "text-xs truncate mt-0.5",
                selectedId === c.id ? "text-primary-foreground/80" : "text-muted-foreground"
              )}>
                {c.major?.des || c.major?.code || t("NoMajor")}
              </div>
            </button>
          ))}
          {filteredClasses.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              {t("NoClassesFound")}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
