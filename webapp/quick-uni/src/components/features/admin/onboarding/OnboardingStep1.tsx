"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Download, Save, ArrowRight, Loader2 } from "lucide-react";
import { createOnboardingSession } from "@/actions/onboarding";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface OnboardingStep1Props {
  schemas: unknown[];
  onNext: (sessionId: string) => void;
  initialData?: unknown;
}

export function OnboardingStep1({ schemas, onNext, initialData }: OnboardingStep1Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [name, setName] = useState((initialData as any)?.name || "");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [entityType, setEntityType] = useState<"student" | "employee">((initialData as any)?.entityType || "student");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [schemaId, setSchemaId] = useState<string>((initialData as any)?.schemaId?.toString() || "");      
  const [isSaving, setIsSaving] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sessionId, setSessionId] = useState<string | null>((initialData as any)?.id || null);
  const t = useTranslations("Onboarding");
  const handleSaveAndDownload = async () => {
    if (!name || !schemaId) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const result = await createOnboardingSession({
        name,
        entityType,
        schemaId: parseInt(schemaId),
      });

      if (result.success && result.sessionId) {
        setSessionId(result.sessionId);
        toast.success("Session created successfully");
        
        // Trigger download
        window.location.href = `/api/admin/onboarding/template/${result.sessionId}`;
      } else {
        toast.error(result.error || "Failed to create session");
      }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Step1Title")}</CardTitle>
        <CardDescription>{t("Step1Description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="session-name">{t("SessionName")}</Label>
          <Input 
            id="session-name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder={t("SessionNamePlaceholder")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t("EntityType")}</Label>
            <Select 
              value={entityType} 
              onValueChange={(value: "student" | "employee") => setEntityType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("SelectEntityType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">{t("Student")}</SelectItem>
                <SelectItem value="employee">{t("Employee")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("ProfileSchema")}</Label>
            <Select 
              value={schemaId} 
              onValueChange={setSchemaId}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("SelectSchema")} />
              </SelectTrigger>
              <SelectContent>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {schemas.map((schema: any) => (
                  <SelectItem key={schema.id} value={schema.id.toString()}>
                    {schema.schemaCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button 
            variant="outline" 
            onClick={handleSaveAndDownload} 
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {t("SaveAndDownloadTemplate")}
          </Button>

          <Button 
            onClick={() => sessionId && onNext(sessionId)} 
            disabled={!sessionId}
          >
            {t("Next")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
