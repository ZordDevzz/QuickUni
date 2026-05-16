"use client";

import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GripVertical, Trash2, Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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

interface SectionCardProps {
  section: ProfileSection;
  allFields: ProfileField[];
  onUpdateName: (id: number, name: string) => void;
  onRemove: (id: number) => void;
  onAddField: (sectionId: number, field: ProfileField) => void;
  onRemoveField: (sectionId: number, fieldId: number) => void;
  onToggleRequired: (sectionId: number, fieldId: number) => void;
}

export function SectionCard({
  section,
  allFields,
  onUpdateName,
  onRemove,
  onAddField,
  onRemoveField,
  onToggleRequired
}: SectionCardProps) {
  const t = useTranslations("ProfileStructure");
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: `section-${section.id}`,
    data: {
      type: "Section",
      section
    }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={cn(
        "border-2 transition-all duration-200 group/section",
        isDragging ? "border-primary shadow-xl ring-2 ring-primary/20" : "hover:border-muted-foreground/20"
      )}>
        <CardHeader className="p-4 flex flex-row items-center space-y-0 gap-4 bg-muted/30">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors">
            <GripVertical className="h-5 w-5" />
          </div>
          <Input
            value={section.name}
            onChange={(e) => onUpdateName(section.id, e.target.value)}
            className="font-bold text-lg border-transparent hover:border-input bg-transparent focus-visible:bg-background h-9"
          />
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("AddField")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t("AvailableFields")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-60 overflow-y-auto">
                  {allFields.map((field) => (
                    <DropdownMenuItem
                      key={field.id}
                      onClick={() => onAddField(section.id, field)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{field.fieldName}</span>
                        <span className="text-xs text-muted-foreground">{field.fieldCode}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive opacity-0 group-hover/section:opacity-100 transition-opacity"
              onClick={() => onRemove(section.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <SortableContext
            items={section.profileSchemaFields.map(f => `field-${f.fieldId}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="divide-y min-h-[50px]">
              {section.profileSchemaFields.map((field) => (
                <FieldItem
                  key={field.fieldId}
                  field={field}
                  sectionId={section.id}
                  onRemove={() => onRemoveField(section.id, field.fieldId)}
                  onToggleRequired={() => onToggleRequired(section.id, field.fieldId)}
                />
              ))}
              {section.profileSchemaFields.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm italic">
                  {t("NoFieldsInSection")}
                </div>
              )}
            </div>
          </SortableContext>
        </CardContent>
      </Card>
    </div>
  );
}

interface FieldItemProps {
  field: ProfileSchemaField;
  sectionId: number;
  onRemove: () => void;
  onToggleRequired: () => void;
}

function FieldItem({ field, sectionId, onRemove, onToggleRequired }: FieldItemProps) {
  const t = useTranslations("ProfileStructure");
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: `field-${field.fieldId}`,
    data: {
      type: "Field",
      field,
      sectionId
    }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group/field">
      <div className={cn(
        "flex items-center p-3 gap-3 bg-background transition-colors",
        isDragging ? "shadow-md ring-1 ring-primary/10" : "hover:bg-muted/20"
      )}>
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground">
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{field.profileField.fieldName}</span>
            <Badge variant="secondary" className="text-[10px] h-4 px-1">
              {field.profileField.fieldType}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground truncate">{field.profileField.fieldCode}</div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id={`req-${field.fieldId}`} 
              checked={field.isRequired}
              onCheckedChange={onToggleRequired}
            />
            <Label 
              htmlFor={`req-${field.fieldId}`}
              className="text-xs cursor-pointer select-none"
            >
              {t("Required")}
            </Label>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover/field:opacity-100 transition-opacity"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
