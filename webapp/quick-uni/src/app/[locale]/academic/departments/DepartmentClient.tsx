'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { department } from '@/db/schemas/academic';
import { InferSelectModel } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { DetailView } from './DetailView';

type Department = InferSelectModel<typeof department>;

interface DepartmentClientProps {
  initialDepartments: Department[];
}

export default function DepartmentClient({ initialDepartments }: DepartmentClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const selectedId = searchParams.get('id');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDepartments = initialDepartments.filter(dept => 
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('id', id);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex h-[calc(100vh-120px)] overflow-hidden border rounded-lg bg-background">
      {/* Master List */}
      <div className="w-80 border-r flex flex-col bg-muted/5">
        <div className="p-4 border-b space-y-4 bg-background">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Departments</h2>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredDepartments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => handleSelect(dept.id)}
                className={cn(
                  "w-full text-left px-3 py-3 rounded-md transition-all duration-200 group",
                  selectedId === dept.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-muted"
                )}
              >
                <div className="font-medium truncate">{dept.name}</div>
                <div className={cn(
                  "text-xs truncate mt-0.5",
                  selectedId === dept.id ? "text-primary-foreground/80" : "text-muted-foreground"
                )}>
                  {dept.code || 'NO CODE'}
                </div>
              </button>
            ))}
            {filteredDepartments.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No departments found
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Detail View */}
      <div className="flex-1 overflow-auto bg-background">
        {selectedId ? (
          <DetailView departmentId={selectedId} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500">
            <div className="h-20 w-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
              <Search className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Department Selected</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Select a department from the list on the left to view and manage its details, majors, and personnel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
