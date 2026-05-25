"use client";

import { ColumnDef } from "@tanstack/react-table";
import { FormattedDate } from "@/components/shared/FormattedDate";

export type StudentRosterData = {
  id: number;
  student: {
    code: string;
    profile: {
      fullname: string | null;
      gender: string;
    };
  };
  createAt: string;
};

export const getRosterColumns = (t: any): ColumnDef<StudentRosterData>[] => [
  {
    accessorKey: "student.code",
    header: t("MSSV") || "MSSV",
  },
  {
    accessorKey: "student.profile.fullname",
    header: t("FullName") || "Full Name",
  },
  {
    accessorKey: "student.profile.gender",
    header: t("Gender") || "Gender",
    cell: ({ row }) => {
      const gender = row.original.student.profile.gender;
      // Map gender enum values to localized strings if possible
      return <span className="capitalize">{t(gender.charAt(0).toUpperCase() + gender.slice(1)) || gender}</span>;
    },
  },
  {
    accessorKey: "createAt",
    header: t("EnrollmentDate") || "Enrollment Date",
    cell: ({ row }) => <FormattedDate date={row.original.createAt} />,
  },
];
