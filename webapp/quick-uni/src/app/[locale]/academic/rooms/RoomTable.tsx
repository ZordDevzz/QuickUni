"use client";

import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { useMemo } from "react";

interface Building {
  id: number;
  code: string;
  name: string | null;
  des: string | null;
}

interface Room {
  id: number;
  code: string;
  buildingId: number;
  capacity: number | null;
  type: string | null;
  building?: Building | null;
}

export function RoomTable({ data, buildings }: { data: Room[], buildings: Building[] }) {
  const columns = useMemo(() => getColumns(buildings), [buildings]);
  return <DataTable columns={columns} data={data} searchKey="code" />;
}
