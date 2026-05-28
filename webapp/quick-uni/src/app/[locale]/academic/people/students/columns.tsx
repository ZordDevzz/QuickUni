"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudentRowActions } from "./student-row-actions";
import { FormattedDate } from "@/components/shared/FormattedDate";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getColumns = (t: any): ColumnDef<any>[] => [
  {
    accessorKey: "profile.fullname",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {t("FullName") || "Full Name"}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "code",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {t("Code") || "Code"}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    id: "class",
    header: "Lớp hành chính",
    cell: ({ row }) => row.original.mainClassMembers?.[0]?.mainClass?.code || "N/A",
  },
  {
    id: "department",
    header: "Khoa/Phân khoa",
    cell: ({ row }) => row.original.mainClassMembers?.[0]?.mainClass?.major?.department?.name || "N/A",
  },
  {
    id: "major",
    header: "Chuyên ngành",
    cell: ({ row }) => {
      const major = row.original.mainClassMembers?.[0]?.mainClass?.major;
      return major ? `${major.des || major.code} (${major.code})` : "N/A";
    },
  },
  {
    accessorKey: "profile.gender",
    header: t("Gender") || "Gender",
    cell: ({ row }) => {
      const gender = row.original.profile?.gender;
      return <span className="capitalize">{gender ? t(gender.charAt(0).toUpperCase() + gender.slice(1)) : "N/A"}</span>;
    },
  },
  {
    accessorKey: "profile.dob",
    header: t("DateOfBirth") || "DOB",
    cell: ({ row }) => <FormattedDate date={row.original.profile?.dob} />,
  },
  {
    accessorKey: "profile.nationalId",
    header: t("NationalID") || "National ID",
  },
  {
    id: "actions",
    cell: ({ row }) => <div className="text-right"><StudentRowActions student={row.original} /></div>,
  },
];
