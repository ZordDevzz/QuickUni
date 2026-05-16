"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePersonalProfileAction } from "@/actions/account";
import { notify } from "@/lib/custom-toast";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface ProfileField {
  id: number;
  name: string;
  label: string;
  uiSection: string;
  isRequired: boolean;
  datatype: string;
}

interface ProfileTabProps {
  profile: any;
  fields: ProfileField[];
}

export function ProfileTab({ profile, fields }: ProfileTabProps) {
  const t = useTranslations("AccountSettings");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>(
    (profile.dynamicData as Record<string, any>) || {}
  );

  const sections = Array.from(new Set(fields.map(f => f.uiSection)));

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await updatePersonalProfileAction(formData);
      if (result.success) {
        notify(t("ProfileSuccess"), { type: "success" });
      } else {
        notify(result.error || t("ProfileNotFound"), { type: "error" });
      }
    } catch (error) {
      notify("System error", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {sections.map(section => (
        <Card key={section}>
          <CardHeader>
            <CardTitle>{section}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {fields
              .filter(f => f.uiSection === section)
              .map(field => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.isRequired && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <Input
                    id={field.name}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    required={field.isRequired}
                  />
                </div>
              ))}
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("SaveChanges")}
        </Button>
      </div>
    </form>
  );
}
