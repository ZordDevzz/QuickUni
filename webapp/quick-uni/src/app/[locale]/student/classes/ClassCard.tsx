"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { User } from "lucide-react";
import { ClassDetailDialog } from "./ClassDetailDialog";

export interface ClassEnrollment {
  id: number;
  courseClass: {
    id: string;
    code: string;
    status?: string | null;
    subject: {
      name: string;
    };
    employee: {
      profile: {
        fullname: string | null;
        firstName?: string;
        lastName?: string;
      } | null;
    }
  }
}

export function ClassCard({ enrollment }: { enrollment: ClassEnrollment }) {
  const t = useTranslations("Student.Classes");
  const [isOpen, setIsOpen] = useState(false);
  const { courseClass } = enrollment;
  
  const teacherName = courseClass.employee.profile?.fullname || 
    `${courseClass.employee.profile?.firstName || ''} ${courseClass.employee.profile?.lastName || ''}`.trim() || 
    "N/A";

  return (
    <>
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
          <Button className="w-full" onClick={() => setIsOpen(true)}>
            {t("ViewDetails")}
          </Button>
        </CardFooter>
      </Card>

      <ClassDetailDialog 
        isOpen={isOpen} 
        onOpenChange={setIsOpen} 
        enrollment={enrollment} 
      />
    </>
  );
}
