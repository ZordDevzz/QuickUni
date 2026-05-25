"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { User } from "lucide-react";

export interface ClassEnrollment {
  id: number;
  courseClass: {
    id: string;
    code: string;
    subject: {
      name: string;
    };
    employee: {
      profile: {
        firstName: string;
        lastName: string;
      }
    }
  }
}

export function ClassCard({ enrollment }: { enrollment: ClassEnrollment }) {
  const t = useTranslations("Student.Classes");
  const { courseClass } = enrollment;
  const teacherName = `${courseClass.employee.profile.firstName} ${courseClass.employee.profile.lastName}`;

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-xl font-bold line-clamp-2">
            {courseClass.subject.name}
          </CardTitle>
          <Badge variant="secondary" className="shrink-0">
            {t("StatusActive")}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground font-mono">{courseClass.code}</p>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <User className="w-4 h-4" />
          <span>
            <span className="font-medium">{t("TeacherLabel")}:</span> {teacherName}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/student/classes/${courseClass.id}`}>
            {t("ViewDetails")}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
