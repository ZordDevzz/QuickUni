"use client";

import { useTranslations } from "next-intl";
import { Account } from "@/types/profile";
import { DataTable } from "@/components/ui/data-table";
import { useMemo } from "react";
import { getColumns } from "./columns";

import { TranslationFunction } from "@/types/i18n";

interface AccountTableProps {
  data: Account[];
  restrictType?: "student" | "personnel";
}

export function AccountTable({ data, restrictType }: AccountTableProps) {
  const t = useTranslations("Account");

  const columns = useMemo(() => getColumns(t as unknown as TranslationFunction, restrictType), [t, restrictType]);

  return <DataTable columns={columns} data={data} searchKey="username" />;
}
