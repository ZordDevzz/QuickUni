import { getAuthSession } from '@/services/auth';
import { getCurrentSemester, getScheduleByRole } from '@/actions/scheduling-data';
import { TimeGrid } from '@/components/features/academic/TimeGrid';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

export default async function TeacherSchedulePage() {
  const session = await getAuthSession();
  
  if (!session || (session.user.type as string) !== 'teacher') {
    redirect('/login');
  }

  const currentSemester = await getCurrentSemester();
  
  if (!currentSemester) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">No active semester found</h1>
      </div>
    );
  }

  const { assignments } = await getScheduleByRole('teacher', session.user.id, currentSemester.id);
  const t = await getTranslations('Teacher.Schedule');

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('Title')}</h1>
          <p className="text-muted-foreground">
            {t('Description')} - {currentSemester.name}
          </p>
        </div>
      </div>
      
      <div className="bg-card rounded-lg border shadow-sm p-4">
        <TimeGrid 
          assignments={assignments as any} 
          type="teachers" 
          mode="view"
        />
      </div>
    </div>
  );
}
