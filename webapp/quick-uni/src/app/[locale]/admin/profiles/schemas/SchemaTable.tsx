"use client";

import { useTranslations } from "next-intl";
import { DataTable } from "@/components/ui/data-table";
import { useMemo } from "react";
import { getColumns } from "./columns";
import { profileSchema } from "@/db/schema";
import { TranslationFunction } from "@/types/i18n";

type ProfileSchemaType = typeof profileSchema.$inferSelect;

interface SchemaTableProps {
  data: ProfileSchemaType[];
}

export function SchemaTable({ data }: SchemaTableProps) {
  const t = useTranslations("Profile");

  const columns = useMemo(() => getColumns(t as unknown as TranslationFunction), [t]);

  return <DataTable columns={columns} data={data} searchKey="schemaCode" />;
}
