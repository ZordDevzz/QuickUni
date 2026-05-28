'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { DetailView } from './DetailView';
import { MasterList } from './MasterList';
import { ClassDialog } from '@/components/features/academic/ClassDialogs';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ClassClientProps {
  initialClasses: any[];
}

export default function ClassClient({ initialClasses }: ClassClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedId = searchParams.get('id');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const t = useTranslations("MainClasses");

  return (
    <div className="flex h-[calc(100vh-120px)] overflow-hidden border rounded-lg bg-background animate-in fade-in duration-300">
      <MasterList 
        classes={initialClasses} 
        selectedId={selectedId} 
        onAdd={() => setIsAddDialogOpen(true)} 
      />

      {/* Detail View */}
      <div className="flex-1 overflow-auto bg-background">
        {selectedId ? (
          <DetailView classId={selectedId} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500">
            <div className="h-20 w-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
              <Search className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t("NoClassSelected")}</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              {t("NoClassSelectedDesc")}
            </p>
          </div>
        )}
      </div>

      <ClassDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
