"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Trash, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { 
  getFieldsForSchema, 
  getAvailableFields, 
  addFieldToSchemaAction, 
  removeFieldFromSchemaAction, 
  updateSchemaFieldAction,
  SchemaField,
  AvailableField
} from "@/actions/schema-field";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface SchemaFieldManagerProps {
  schemaId: number;
}

export function SchemaFieldManager({ schemaId }: SchemaFieldManagerProps) {
  const t = useTranslations("Profile");
  const [assignedFields, setAssignedFields] = useState<SchemaField[]>([]);
  const [availableFields, setAvailableFields] = useState<AvailableField[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [assigned, available] = await Promise.all([
        getFieldsForSchema(schemaId),
        getAvailableFields(schemaId)
      ]);
      setAssignedFields(assigned);
      setAvailableFields(available);
    } catch {
      toast.error("Failed to load fields");
    } finally {
      setLoading(false);
    }
  }, [schemaId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = async (fieldId: number) => {
    const res = await addFieldToSchemaAction(schemaId, fieldId);
    if (res.success) {
      toast.success("Field added");
      fetchData();
    } else {
      toast.error(res.error);
    }
  };

  const handleRemove = async (fieldId: number) => {
    const res = await removeFieldFromSchemaAction(schemaId, fieldId);
    if (res.success) {
      toast.success("Field removed");
      fetchData();
    } else {
      toast.error(res.error);
    }
  };

  const handleToggleRequired = async (fieldId: number, current: boolean) => {
    const res = await updateSchemaFieldAction(schemaId, fieldId, !current);
    if (res.success) {
      // Optimistic update or refetch
      setAssignedFields(prev => prev.map(f => 
        f.fieldId === fieldId ? { ...f, isRequired: !current } : f
      ));
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-medium text-sm text-muted-foreground">{t("AssignedFields")}</h3>
        {loading ? (
          <div className="text-sm">Loading...</div>
        ) : assignedFields.length === 0 ? (
          <div className="text-sm text-muted-foreground italic">No fields assigned</div>
        ) : (
          <div className="border rounded-md divide-y">
            {assignedFields.map((field) => (
              <div key={field.fieldId} className="flex items-center justify-between p-3">
                <div className="flex flex-col">
                  <span className="font-medium">{field.profileField.label || field.profileField.name}</span>
                  <span className="text-xs text-muted-foreground">{field.profileField.datatype}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs" htmlFor={`req-${field.fieldId}`}>Required</Label>
                    <input 
                      type="checkbox" 
                      id={`req-${field.fieldId}`}
                      checked={field.isRequired} 
                      onChange={() => handleToggleRequired(field.fieldId, field.isRequired)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemove(field.fieldId)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-sm text-muted-foreground">{t("AvailableFields")}</h3>
        {loading ? (
          <div className="text-sm">Loading...</div>
        ) : availableFields.length === 0 ? (
          <div className="text-sm text-muted-foreground italic">No more fields available</div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {availableFields.map((field) => (
              <Button 
                key={field.id} 
                variant="outline" 
                className="justify-start gap-2 h-auto py-2"
                onClick={() => handleAdd(field.id)}
              >
                <Plus className="h-3 w-3" />
                <div className="flex flex-col items-start">
                  <span className="text-sm">{field.label || field.name}</span>
                  <span className="text-[10px] text-muted-foreground">{field.datatype}</span>
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}