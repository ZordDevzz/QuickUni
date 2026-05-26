"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { LayoutGrid, FileText, ChevronRight, Plus, Save, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SectionCard } from "./SectionCard";
import { PropertyDrawer } from "./PropertyDrawer";
import { updateProfileStructureAction, ActionResponse } from "@/actions/profile-structure";
import { toast } from "sonner";

export interface ProfileField {
  id: number;
  name: string | null;
  datatype: string | null;
  label: string | null;
  uiSection: string;
}

export interface ProfileSchemaField {
  schemaId: number;
  fieldId: number;
  sectionId: number | null;
  order: number;
  isRequired: boolean;
  profileField: ProfileField;
}

export interface ProfileSection {
  id: number;
  schemaId: number;
  name: string;
  order: number;
  profileSchemaFields: ProfileSchemaField[];
}

export interface ProfileSchema {
  id: number;
  schemaCode: string;
  des: string | null;
  profileSections: ProfileSection[];
}

interface StructureWorkspaceProps {
  initialSchemas: ProfileSchema[];
  allFields: ProfileField[];
}

export function StructureWorkspace({ initialSchemas, allFields }: StructureWorkspaceProps) {
  const [activeSchemaId, setActiveSchemaId] = useState<number | null>(
    initialSchemas.length > 0 ? initialSchemas[0].id : null
  );
  
  const [schemasData, setSchemasData] = useState<Record<number, ProfileSection[]>>(() => {
    const data: Record<number, ProfileSection[]> = {};
    initialSchemas.forEach(schema => {
      data[schema.id] = (schema.profileSections || []).map(section => ({
        ...section,
        profileSchemaFields: [...(section.profileSchemaFields || [])].sort((a, b) => a.order - b.order)
      })).sort((a, b) => a.order - b.order);
    });
    return data;
  });

  const [selectedItem, setSelectedItem] = useState<{
    type: "field" | "section";
    data: ProfileSchemaField | ProfileSection;
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const t = useTranslations("ProfileStructure");

  // Sync state if initialSchemas changes externally
  useEffect(() => {
    const data: Record<number, ProfileSection[]> = {};
    initialSchemas.forEach(schema => {
      data[schema.id] = (schema.profileSections || []).map(section => ({
        ...section,
        profileSchemaFields: [...(section.profileSchemaFields || [])].sort((a, b) => a.order - b.order)
      })).sort((a, b) => a.order - b.order);
    });
// eslint-disable-next-line react-hooks/set-state-in-effect
    setSchemasData(data);
  }, [initialSchemas]);

  const activeSchema = initialSchemas.find((s) => s.id === activeSchemaId);
  const activeSections = activeSchemaId ? schemasData[activeSchemaId] || [] : [];

  // Update selected item data if schemasData changes
  useEffect(() => {
    if (selectedItem && activeSchemaId) {
      const sections = schemasData[activeSchemaId];
      if (selectedItem.type === "section") {
        const sectionData = selectedItem.data as ProfileSection;
        const section = sections.find(s => s.id === sectionData.id);
        if (section) {
// eslint-disable-next-line react-hooks/set-state-in-effect
          setSelectedItem({ type: "section", data: section });
        } else {
          setSelectedItem(null);
        }
      } else {
        const fieldData = selectedItem.data as ProfileSchemaField;
        const section = sections.find(s => s.id === fieldData.sectionId);
        const field = section?.profileSchemaFields.find(f => f.fieldId === fieldData.fieldId);
        if (field) {
          setSelectedItem({ type: "field", data: field });
        } else {
          setSelectedItem(null);
        }
      }
    }
  }, [schemasData, activeSchemaId, selectedItem]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !activeSchemaId) return;

    if (active.id !== over.id) {
      // Check if we are dragging a section
      const activeId = active.id as string;
      const overId = over.id as string;

      if (activeId.startsWith("section-") && overId.startsWith("section-")) {
        setSchemasData(prev => {
          const sections = prev[activeSchemaId];
          const oldIndex = sections.findIndex(s => `section-${s.id}` === activeId);
          const newIndex = sections.findIndex(s => `section-${s.id}` === overId);
          
          if (oldIndex === -1 || newIndex === -1) return prev;

          const newSections = arrayMove(sections, oldIndex, newIndex).map((s, idx) => ({
            ...s,
            order: idx + 1
          }));
          
          return { ...prev, [activeSchemaId]: newSections };
        });
      }
    }
  }, [activeSchemaId]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !activeSchemaId) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Handle field dragging between sections
    if (activeId.startsWith("field-")) {
      const activeData = active.data.current;
      if (!activeData) return;

      const sourceSectionId = activeData.sectionId;
      let targetSectionId: number | null = null;

      if (overId.startsWith("section-")) {
        targetSectionId = parseInt(overId.replace("section-", ""));
      } else if (overId.startsWith("field-")) {
        const overData = over.data.current;
        if (overData) {
          targetSectionId = overData.sectionId;
        }
      }

      if (targetSectionId !== null && sourceSectionId !== targetSectionId) {
        setSchemasData(prev => {
          const sections = [...prev[activeSchemaId]];
          const sourceSecIdx = sections.findIndex(s => s.id === sourceSectionId);
          const targetSecIdx = sections.findIndex(s => s.id === targetSectionId);

          if (sourceSecIdx === -1 || targetSecIdx === -1) return prev;

          const sourceFields = [...sections[sourceSecIdx].profileSchemaFields];
          const targetFields = [...sections[targetSecIdx].profileSchemaFields];

          const fieldIdx = sourceFields.findIndex(f => `field-${f.fieldId}` === activeId);
          if (fieldIdx === -1) return prev;

          const [movedField] = sourceFields.splice(fieldIdx, 1);
          const updatedField = { ...movedField, sectionId: targetSectionId! };

          // Find where to insert in target
          const overFieldIdx = targetFields.findIndex(f => `field-${f.fieldId}` === overId);
          if (overFieldIdx !== -1) {
            targetFields.splice(overFieldIdx, 0, updatedField);
          } else {
            targetFields.push(updatedField);
          }

          sections[sourceSecIdx] = { 
            ...sections[sourceSecIdx], 
            profileSchemaFields: sourceFields.map((f, i) => ({ ...f, order: i + 1 })) 
          };
          sections[targetSecIdx] = { 
            ...sections[targetSecIdx], 
            profileSchemaFields: targetFields.map((f, i) => ({ ...f, order: i + 1 })) 
          };

          return { ...prev, [activeSchemaId]: sections };
        });
      } else if (targetSectionId !== null && sourceSectionId === targetSectionId) {
        // Reordering within same section during DragOver for smoother UX
        setSchemasData(prev => {
          const sections = [...prev[activeSchemaId]];
          const secIdx = sections.findIndex(s => s.id === sourceSectionId);
          if (secIdx === -1) return prev;

          const fields = [...sections[secIdx].profileSchemaFields];
          const oldIndex = fields.findIndex(f => `field-${f.fieldId}` === activeId);
          const newIndex = fields.findIndex(f => `field-${f.fieldId}` === overId);

          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            const newFields = arrayMove(fields, oldIndex, newIndex).map((f, i) => ({
              ...f,
              order: i + 1
            }));
            sections[secIdx] = { ...sections[secIdx], profileSchemaFields: newFields };
            return { ...prev, [activeSchemaId]: sections };
          }
          return prev;
        });
      }
    }
  }, [activeSchemaId]);

  const handleAddSection = () => {
    if (!activeSchemaId) return;
    setSchemasData(prev => {
      const sections = prev[activeSchemaId] || [];
      const newId = -Math.floor(Math.random() * 1000000); // Temporary ID for new section
      const newSection: ProfileSection = {
        id: newId,
        schemaId: activeSchemaId,
        name: "New Section",
        order: sections.length + 1,
        profileSchemaFields: []
      };
      return { ...prev, [activeSchemaId]: [...sections, newSection] };
    });
  };

  const handleUpdateSectionName = (sectionId: number, name: string) => {
    if (!activeSchemaId) return;
    setSchemasData(prev => {
      const sections = prev[activeSchemaId].map(s => 
        s.id === sectionId ? { ...s, name } : s
      );
      return { ...prev, [activeSchemaId]: sections };
    });
  };

  const handleRemoveSection = (sectionId: number) => {
    if (!activeSchemaId) return;
    setSchemasData(prev => {
      const sections = prev[activeSchemaId].filter(s => s.id !== sectionId)
        .map((s, idx) => ({ ...s, order: idx + 1 }));
      return { ...prev, [activeSchemaId]: sections };
    });
  };

  const handleAddField = (sectionId: number, field: ProfileField) => {
    if (!activeSchemaId) return;
    setSchemasData(prev => {
      const sections = prev[activeSchemaId].map(s => {
        if (s.id === sectionId) {
          // Check if field already exists in this schema
          const exists = prev[activeSchemaId].some(sec => 
            sec.profileSchemaFields.some(f => f.fieldId === field.id)
          );
          if (exists) {
            toast.error(t("FieldAlreadyExists"));
            return s;
          }

          const newSchemaField: ProfileSchemaField = {
            schemaId: activeSchemaId,
            fieldId: field.id,
            sectionId: sectionId,
            order: s.profileSchemaFields.length + 1,
            isRequired: false,
            profileField: field
          };
          return { ...s, profileSchemaFields: [...s.profileSchemaFields, newSchemaField] };
        }
        return s;
      });
      return { ...prev, [activeSchemaId]: sections };
    });
  };

  const handleRemoveField = (sectionId: number, fieldId: number) => {
    if (!activeSchemaId) return;
    setSchemasData(prev => {
      const sections = prev[activeSchemaId].map(s => {
        if (s.id === sectionId) {
          return {
            ...s,
            profileSchemaFields: s.profileSchemaFields.filter(f => f.fieldId !== fieldId)
              .map((f, i) => ({ ...f, order: i + 1 }))
          };
        }
        return s;
      });
      return { ...prev, [activeSchemaId]: sections };
    });
  };

  const handleToggleRequired = (sectionId: number, fieldId: number) => {
    if (!activeSchemaId) return;
    setSchemasData(prev => {
      const sections = prev[activeSchemaId].map(s => {
        if (s.id === sectionId) {
          return {
            ...s,
            profileSchemaFields: s.profileSchemaFields.map(f => 
              f.fieldId === fieldId ? { ...f, isRequired: !f.isRequired } : f
            )
          };
        }
        return s;
      });
      return { ...prev, [activeSchemaId]: sections };
    });
  };

  const handleSave = async () => {
    if (!activeSchemaId || !activeSections.length) return;
    setIsSaving(true);
    try {
      const payload = {
        schemaId: activeSchemaId,
        sections: activeSections.map(s => ({
          id: s.id < 0 ? undefined : s.id, // Don't send temp IDs
          name: s.name,
          order: s.order,
          fields: s.profileSchemaFields.map(f => ({
            fieldId: f.fieldId,
            order: f.order,
            isRequired: f.isRequired
          }))
        }))
      };

      const result = await updateProfileStructureAction(payload) as ActionResponse;
      if (result.success) {
        toast.success(t("SaveSuccess"));
      } else {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        toast.error((result as any).error || t("SaveError"));
      }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      toast.error(t("SaveError"));
    } finally {
      setIsSaving(false);
    }
  };

  const getSelectedId = () => {
    if (!selectedItem) return undefined;
    if (selectedItem.type === "section") return (selectedItem.data as ProfileSection).id;
    return undefined;
  };

  return (
    <div className="flex flex-col space-y-6 h-[calc(100vh-10rem)]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("WorkspaceTitle")}</h1>
          <p className="text-muted-foreground">{t("WorkspaceDescription")}</p>
        </div>
        {activeSchema && (
          <Button 
            onClick={handleSave} 
            disabled={isSaving || activeSections.length === 0}
            className="shadow-md"
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {t("SaveChanges")}
          </Button>
        )}
      </div>

      <Card className="flex-1 overflow-hidden flex flex-row">
        {/* Sidebar */}
        <div className="w-64 border-r bg-muted/10 flex flex-col">
          <div className="p-4 font-semibold text-sm flex items-center">
            <LayoutGrid className="mr-2 h-4 w-4 text-primary" />
            {t("Schemas")}
          </div>
          <Separator />
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {initialSchemas.map((schema) => (
                <button
                  key={schema.id}
                  onClick={() => setActiveSchemaId(schema.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between group",
                    activeSchemaId === schema.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-muted"
                  )}
                >
                  <div className="flex items-center overflow-hidden">
                    <FileText className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      activeSchemaId === schema.id ? "text-primary-foreground" : "text-muted-foreground"
                    )} />
                    <span className="truncate font-medium">{schema.schemaCode}</span>
                  </div>
                  <ChevronRight className={cn(
                    "h-4 w-4 shrink-0 transition-transform",
                    activeSchemaId === schema.id ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                  )} />
                </button>
              ))}
              {initialSchemas.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-xs italic">
                  {t("NoSchemas")}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-background overflow-hidden">
          {activeSchema ? (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b flex justify-between items-center bg-muted/5">
                <div>
                  <h2 className="text-xl font-bold">{activeSchema.schemaCode}</h2>
                  {activeSchema.des && (
                    <p className="text-sm text-muted-foreground mt-1">{activeSchema.des}</p>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={handleAddSection}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("AddSection")}
                </Button>
              </div>
              
              <ScrollArea className="flex-1 p-6">
                <div className="max-w-4xl mx-auto pb-12">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                  >
                    <SortableContext
                      items={activeSections.map(s => `section-${s.id}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-6">
                        {activeSections.map((section) => (
                          <SectionCard
                            key={section.id}
                            section={section}
                            allFields={allFields}
                            onUpdateName={handleUpdateSectionName}
                            onRemove={handleRemoveSection}
                            onAddField={handleAddField}
                            onRemoveField={handleRemoveField}
                            onToggleRequired={handleToggleRequired}
                            onSelectSection={() => setSelectedItem({ type: "section", data: section })}
                            onSelectField={(field) => setSelectedItem({ type: "field", data: field })}
                            selectedId={getSelectedId()}
                            selectedFieldId={selectedItem?.type === "field" ? (selectedItem.data as ProfileSchemaField).fieldId : undefined}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>

                  {activeSections.length === 0 && (
                    <div className="border-2 border-dashed rounded-xl p-12 text-center mt-8">
                      <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LayoutGrid className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">{t("EmptyWorkspace")}</h3>
                      <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                        {t("EmptyWorkspaceHint")}
                      </p>
                      <Button variant="outline" className="mt-6" onClick={handleAddSection}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t("AddSection")}
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium">{t("SelectSchema")}</h3>
                <p className="text-muted-foreground mt-2">{t("SelectSchemaHint")}</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <PropertyDrawer 
        isOpen={!!selectedItem}
        selectedItem={selectedItem}
        onClose={() => setSelectedItem(null)}
        onUpdateField={handleToggleRequired}
        onUpdateSection={handleUpdateSectionName}
        onDeleteField={handleRemoveField}
        onDeleteSection={handleRemoveSection}
      />
    </div>
  );
}
