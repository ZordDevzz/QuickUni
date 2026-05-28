'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { DetailView } from './DetailView';
import { MasterList } from './MasterList';
import { DepartmentDialog } from '@/components/features/academic/DepartmentDialogs';
import { department } from '@/db/schemas/academic';
import { InferSelectModel } from 'drizzle-orm';

type Department = InferSelectModel<typeof department>;

interface DepartmentClientProps {
  initialDepartments: Department[];
}

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function DepartmentClient({ initialDepartments }: DepartmentClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const pathname = usePathname();
  const selectedId = searchParams.get('id');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const t = useTranslations("Departments");

  return (
    <div className="flex h-[calc(100vh-120px)] overflow-hidden border rounded-lg bg-background">
      <MasterList 
        departments={initialDepartments} 
        selectedId={selectedId} 
        onAdd={() => setIsAddDialogOpen(true)} 
      />

      {/* Detail View */}
      <div className="flex-1 overflow-auto bg-background">
        {selectedId ? (
          <DetailView departmentId={selectedId} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500">
            <div className="h-20 w-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
              <Search className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t("NoDepartmentSelected")}</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              {t("NoDepartmentSelectedDesc")}
            </p>
          </div>
        )}
      </div>

      <DepartmentDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
