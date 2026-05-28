"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStudentClassDetails } from "@/actions/course";
import { toast } from "sonner";
import { Loader2, FileText, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { ScrollArea } from "@/components/ui/scroll-area";

import { ClassEnrollment } from "./ClassCard";

export function ClassDetailDialog({ 
  isOpen, 
  onOpenChange, 
  enrollment 
}: { 
  isOpen: boolean, 
  onOpenChange: (open: boolean) => void, 
  enrollment: ClassEnrollment 
}) {
  const t = useTranslations("Student.Classes");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [details, setDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && enrollment?.courseClass?.id) {
      async function fetchDetails() {
        setIsLoading(true);
        try {
          const data = await getStudentClassDetails(enrollment.courseClass.id);
          setDetails(data);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          toast.error("Failed to load class details");
        } finally {
          setIsLoading(false);
        }
      }
      fetchDetails();
    }
  }, [isOpen, enrollment]);

  const { courseClass } = enrollment;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {courseClass.subject.name}
          </DialogTitle>
          <p className="text-muted-foreground">{courseClass.code}</p>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="overview" className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                {t("TabOverview")}
              </TabsTrigger>
              <TabsTrigger value="materials" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {t("TabMaterials")}
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 mt-4 pr-4">
              <TabsContent value="overview" className="space-y-4 m-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase">{t("TeacherLabel")}</h4>
                    <p>{courseClass.employee.profile?.fullname || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase">{t("StatusLabel")}</h4>
                    <p className="capitalize">{courseClass.status}</p>
                  </div>
                </div>
                {/* Add schedule info if available in details */}
              </TabsContent>

              <TabsContent value="materials" className="m-0">
                {details?.materials?.length > 0 ? (
                  <div className="space-y-2">
                    {details.materials.map((m: { id: string; fileUrl: string; title: string }) => (
                      <a 
                        key={m.id} 
                        href={m.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center p-3 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <FileText className="w-5 h-5 mr-3 text-blue-500" />
                        <span className="font-medium">{m.title}</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">{t("NoMaterials")}</p>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
