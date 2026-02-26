"use client";

import { ColumnDef } from "@tanstack/react-table";
import { profileField } from "@/db/schema";
import { ProfileFieldRowActions } from "@/components/features/academic/ProfileFieldRowActions";
import { Badge } from "@/components/ui/badge";
import { FormattedDate } from "@/components/shared/FormattedDate";

type ProfileFieldType = typeof profileField.$inferSelect;

export const columns: ColumnDef<ProfileFieldType>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "label",
    header: "Label",
  },
  {
    accessorKey: "datatype",
    header: "Data Type",
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("datatype")}</Badge>
    ),
  },
  {
    accessorKey: "uiSection",
    header: "UI Section",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.getValue("uiSection")}</Badge>
    ),
  },
  {
    accessorKey: "createAt",
    header: "Created At",
    cell: ({ row }) => <FormattedDate date={row.getValue("createAt")} />,
  },
  {
    id: "actions",
    cell: ({ row }) => <ProfileFieldRowActions data={row.original} />,
  },
];
