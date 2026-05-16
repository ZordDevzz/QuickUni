"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { LayoutGrid, FileText, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ProfileSchema {
  id: number;
  schemaCode: string;
  des: string | null;
}

interface StructureWorkspaceProps {
  schemas: ProfileSchema[];
}

export function StructureWorkspace({ schemas }: StructureWorkspaceProps) {
  const [activeSchemaId, setActiveSchemaId] = useState<number | null>(
    schemas.length > 0 ? schemas[0].id : null
  );
  const t = useTranslations("ProfileStructure");

  const activeSchema = schemas.find((s) => s.id === activeSchemaId);

  return (
    <div className="flex flex-col space-y-6 h-[calc(100vh-10rem)]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("WorkspaceTitle")}</h1>
          <p className="text-muted-foreground">{t("WorkspaceDescription")}</p>
        </div>
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
              {schemas.map((schema) => (
                <button
                  key={schema.id}
                  onClick={() => setActiveSchemaId(schema.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between group",
                    activeSchemaId === schema.id
                      ? "bg-primary text-primary-foreground"
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
              {schemas.length === 0 && (
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
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">{activeSchema.schemaCode}</h2>
                {activeSchema.des && (
                  <p className="text-sm text-muted-foreground mt-1">{activeSchema.des}</p>
                )}
              </div>
              
              <ScrollArea className="flex-1 p-6">
                <div className="max-w-4xl mx-auto space-y-8">
                  {/* Placeholder for future steps: Section management, Drag & Drop */}
                  <div className="border-2 border-dashed rounded-xl p-12 text-center">
                    <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <LayoutGrid className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">{t("EmptyWorkspace")}</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                      {t("EmptyWorkspaceHint")}
                    </p>
                  </div>
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
    </div>
  );
}
