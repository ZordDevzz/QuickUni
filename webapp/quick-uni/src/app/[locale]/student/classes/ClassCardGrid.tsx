"use client";

import { ClassCard, ClassEnrollment } from "./ClassCard";
import { useTranslations } from "next-intl";

interface ClassCardGridProps {
  enrollments: ClassEnrollment[];
}

export function ClassCardGrid({ enrollments }: ClassCardGridProps) {
  const t = useTranslations("Student.Classes");

  if (enrollments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">{t("NoClassesFound")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {enrollments.map((enrollment) => (
        <ClassCard key={enrollment.id} enrollment={enrollment} />
      ))}
    </div>
  );
}
