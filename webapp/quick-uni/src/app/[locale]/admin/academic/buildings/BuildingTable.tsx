"use client";

import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

export function BuildingTable({ data }: { data: any[] }) {
  return <DataTable columns={columns} data={data} searchKey="code" />;
}
