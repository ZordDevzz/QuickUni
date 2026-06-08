"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { User, Users, Calendar } from "lucide-react";
import { ClassDetailDialog } from "./ClassDetailDialog";
import { FormattedDate } from "@/components/shared/FormattedDate";

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
    };
    cap: number;
    currentSlot: number;
    startDate: string | null;
    endDate: string | null;
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
        <CardContent className="flex-grow space-y-3">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <User className="w-4 h-4 text-primary" />
            <span>
              <span className="font-medium">{t("TeacherLabel")}:</span> {teacherName}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-medium">{t("CapacityLabel")}:</span>
              </div>
              <span className="font-mono text-xs">{courseClass.currentSlot} / {courseClass.cap}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div 
                className="h-full bg-primary transition-all duration-300" 
                style={{ width: `${Math.min(100, (courseClass.currentSlot / courseClass.cap) * 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <div className="flex flex-wrap gap-x-1 items-center">
              <span className="font-medium">{t("DateStartEndLabel")}:</span>
              {courseClass.startDate && courseClass.endDate ? (
                <span className="text-xs">
                  <FormattedDate date={courseClass.startDate} /> – <FormattedDate date={courseClass.endDate} />
                </span>
              ) : (
                <span className="text-xs italic">N/A</span>
              )}
            </div>
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
