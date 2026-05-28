import { getCourseClassesWithRelations, getCourseClassFormDependencies } from "@/actions/course";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateCourseClassButton } from "@/components/features/academic/CreateCourseClassButton";
import { CourseClassTable } from "./CourseClassTable";
import { getTranslations } from "next-intl/server";

export default async function CourseClassesPage() {
  const [classes, dependencies] = await Promise.all([
    getCourseClassesWithRelations(),
    getCourseClassFormDependencies()
  ]);
  const t = await getTranslations("Admin");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t("CourseClasses")}</h2>
        <CreateCourseClassButton dependencies={dependencies} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("CourseClassesList")}</CardTitle>
        </CardHeader>
        <CardContent>
          <CourseClassTable data={classes} dependencies={dependencies} />
        </CardContent>
      </Card>
    </div>
  );
}
