"use client";

import { useTranslations } from "next-intl";
import { ProfileWithAccount } from "@/types/profile";
import { DataTable } from "@/components/ui/data-table";
import { useMemo } from "react";
import { getColumns } from "./columns";
import { TranslationFunction } from "@/types/i18n";

interface ProfileTableProps {
  data: ProfileWithAccount[];
}

export function ProfileTable({ data }: ProfileTableProps) {
  const t = useTranslations("Profile");

  const columns = useMemo(() => getColumns(t as unknown as TranslationFunction), [t]);

  return <DataTable columns={columns} data={data} searchKey="fullname" />;
}
