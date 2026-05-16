"use client";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Trash2, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ProfileField {
  id: number;
  fieldName: string;
  fieldCode: string;
  fieldType: string;
}

interface ProfileSchemaField {
  schemaId: number;
  fieldId: number;
  sectionId: number;
  order: number;
  isRequired: boolean;
  profileField: ProfileField;
}

interface ProfileSection {
  id: number;
  schemaId: number;
  name: string;
  order: number;
  profileSchemaFields: ProfileSchemaField[];
}

interface PropertyDrawerProps {
  selectedItem: {
    type: "field" | "section";
    data: ProfileSchemaField | ProfileSection;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateField: (sectionId: number, fieldId: number, updates: Partial<ProfileSchemaField>) => void;
  onUpdateSection: (sectionId: number, name: string) => void;
  onDeleteField: (sectionId: number, fieldId: number) => void;
  onDeleteSection: (sectionId: number) => void;
}

export function PropertyDrawer({
  selectedItem,
  isOpen,
  onClose,
  onUpdateField,
  onUpdateSection,
  onDeleteField,
  onDeleteSection
}: PropertyDrawerProps) {
  const t = useTranslations("ProfileStructure");

  if (!selectedItem) return null;

  const isField = selectedItem.type === "field";
  const field = isField ? (selectedItem.data as ProfileSchemaField) : null;
  const section = !isField ? (selectedItem.data as ProfileSection) : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isField ? t("FieldProperties") : t("SectionProperties")}
          </DialogTitle>
          <DialogDescription>
            {isField 
              ? t("EditFieldPropertiesDescription", { name: field?.profileField.fieldName })
              : t("EditSectionPropertiesDescription", { name: section?.name })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isField && field && (
            <>
              <div className="flex flex-col gap-2 p-3 bg-muted/30 rounded-lg border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{field.profileField.fieldName}</span>
                  <Badge variant="outline">{field.profileField.fieldType}</Badge>
                </div>
                <span className="text-xs text-muted-foreground">{field.profileField.fieldCode}</span>
              </div>

              <div className="flex items-center space-x-3 p-1">
                <Checkbox 
                  id="drawer-required" 
                  checked={field.isRequired}
                  onCheckedChange={(checked) => 
                    onUpdateField(field.sectionId, field.fieldId, { isRequired: !!checked })
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <Label 
                    htmlFor="drawer-required"
                    className="text-sm font-medium cursor-pointer"
                  >
                    {t("RequiredField")}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t("RequiredFieldHint")}
                  </p>
                </div>
              </div>
            </>
          )}

          {!isField && section && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="section-name">{t("SectionName")}</Label>
                <Input 
                  id="section-name"
                  value={section.name}
                  onChange={(e) => onUpdateSection(section.id, e.target.value)}
                />
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md border border-blue-100 dark:border-blue-900">
                <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <p>{t("SectionPropertiesHint")}</p>
              </div>
            </div>
          )}

          <Separator />
          
          <div className="pt-2">
            <Button 
              variant="destructive" 
              className="w-full justify-start"
              onClick={() => {
                if (isField && field) {
                  onDeleteField(field.sectionId, field.fieldId);
                } else if (section) {
                  onDeleteSection(section.id);
                }
                onClose();
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isField ? t("RemoveFieldFromSchema") : t("DeleteSection")}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>{t("Close")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
