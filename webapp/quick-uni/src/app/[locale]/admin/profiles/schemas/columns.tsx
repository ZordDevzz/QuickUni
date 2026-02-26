"use client"

import { ColumnDef } from "@tanstack/react-table"
import { FormattedDate } from "@/components/shared/FormattedDate"
import { TranslationFunction } from "@/types/i18n"
import { profileSchema } from "@/db/schema"
import { ProfileSchemaRowActions } from "@/components/features/academic/ProfileSchemaRowActions"

type ProfileSchemaType = typeof profileSchema.$inferSelect;

export const getColumns = (t: TranslationFunction): ColumnDef<ProfileSchemaType>[] => [
  {
    accessorKey: "schemaCode",
    header: t("SchemaCode") || "Schema Code",
  },
  {
    accessorKey: "effectiveDate",
    header: t("EffectiveDate") || "Effective Date",
    cell: ({ row }) => <FormattedDate date={row.getValue("effectiveDate")} />,
  },
  {
    accessorKey: "expiredDate",
    header: t("ExpiredDate") || "Expired Date",
    cell: ({ row }) => row.getValue("expiredDate") ? <FormattedDate date={row.getValue("expiredDate")} /> : "N/A",
  },
  {
    accessorKey: "createAt",
    header: t("CreatedAt") || "Created At",
    cell: ({ row }) => <FormattedDate date={row.getValue("createAt")} />,
  },
  {
    id: "actions",
    header: () => <div className="text-right">{t("Actions")}</div>,
    cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <ProfileSchemaRowActions schema={row.original} />
      </div>
    ),
  },
];
