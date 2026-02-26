"use client";

import { useTranslations } from "next-intl";
import { Account } from "@/types/profile";
import { DataTable } from "@/components/ui/data-table";
import { useMemo } from "react";
import { getColumns } from "./columns";

import { TranslationFunction } from "@/types/i18n";

interface AccountTableProps {
  data: Account[];
}

export function AccountTable({ data }: AccountTableProps) {
  const t = useTranslations("Account");

  const columns = useMemo(() => getColumns(t as unknown as TranslationFunction), [t]);

  return <DataTable columns={columns} data={data} searchKey="username" />;
}
