import { getTeacherClasses } from "@/actions/course";
import { getCurrentSemester } from "@/actions/scheduling-data";
import { TeacherClassClient } from "./TeacherClassClient";
import { TeacherClass } from "./teacher-class-columns";
import { getTranslations } from "next-intl/server";

export default async function TeacherClassesPage() {
  const currentSemester = await getCurrentSemester();
  
  if (!currentSemester) {
    const tNav = await getTranslations("Navigation");
    const tCommon = await getTranslations("Common");

    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">{tNav("MyClasses")}</h2>
        </div>
        <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed">
          <p className="text-muted-foreground">{tCommon("NoCurrentSemester")}</p>
        </div>
      </div>
    );
  }

  const classes = await getTeacherClasses(currentSemester.id);
  
  // Transform to match TeacherClass type if needed
  const data: TeacherClass[] = classes.map(c => ({
    id: c.id,
    code: c.code,
    cap: c.cap,
    currentSlot: c.currentSlot,
    status: c.status,
    subject: {
      code: c.subject.code,
      name: c.subject.name
    }
  }));

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <TeacherClassClient data={data} />
    </div>
  );
}
