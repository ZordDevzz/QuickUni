"use client";

import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { profileField } from "@/db/schema";

type ProfileFieldType = typeof profileField.$inferSelect;

interface FieldTableProps {
  data: ProfileFieldType[];
}

export function FieldTable({ data }: FieldTableProps) {
  return (
    <DataTable 
      columns={columns} 
      data={data} 
      searchKey="name" 
    />
  );
}
