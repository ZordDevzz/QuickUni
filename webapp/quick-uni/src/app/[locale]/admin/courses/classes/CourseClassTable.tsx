"use client";

import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { useMemo } from "react";

export function CourseClassTable({ data, dependencies }: { data: any[], dependencies: any }) {
  const columns = useMemo(() => getColumns(dependencies), [dependencies]);
  return <DataTable columns={columns} data={data} searchKey="code" />;
}
