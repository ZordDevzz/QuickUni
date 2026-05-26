"use client";

import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { useMemo } from "react";
import { Dependencies } from "@/components/features/academic/CourseClassForm";

export function CourseClassTable({ data, dependencies }: { data: unknown[], dependencies: Dependencies }) {
  const columns = useMemo(() => getColumns(dependencies), [dependencies]);
  return <DataTable columns={columns} data={data} searchKey="code" />;
}
