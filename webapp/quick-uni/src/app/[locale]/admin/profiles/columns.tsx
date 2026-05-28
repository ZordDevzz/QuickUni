"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Mail, Phone, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProfileRowActions } from "@/components/features/academic/ProfileRowActions"
import { ProfileWithAccount } from "@/types/profile"
import { FormattedDate } from "@/components/shared/FormattedDate"
import { TranslationFunction } from "@/types/i18n"

export const getColumns = (t: TranslationFunction, isStudent?: boolean): ColumnDef<ProfileWithAccount>[] => {
  const cols: ColumnDef<ProfileWithAccount>[] = [
    {
      accessorKey: "fullname",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("FullName")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => row.getValue("fullname") || "N/A",
    },
    {
      accessorKey: "gender",
      header: t("Gender"),
      cell: ({ row }) => {
        const gender = row.getValue("gender") as string;
        const genderMap: Record<string, string> = {
          male: t("Male"),
          female: t("Female"),
          others: t("Others")
        };
        return <span className="capitalize">{genderMap[gender] || gender}</span>;
      },
    },
    {
      accessorKey: "dob",
      header: t("DateOfBirth"),
      cell: ({ row }) => <FormattedDate date={row.getValue("dob")} />,
    },
    {
      id: "contact",
      header: t("Contact"),
      cell: ({ row }) => {
        const profile = row.original
        return (
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {profile.account?.email || "No Email"}
            </div>
            {profile.account?.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {profile.account.phone}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "nationalId",
      header: t("NationalID"),
    },
    {
      id: "actions",
      header: () => <div className="text-right">{t("Actions")}</div>,
      cell: ({ row }) => <div className="flex justify-end"><ProfileRowActions profile={row.original} /></div>,
    },
  ];

  if (isStudent) {
    cols.splice(3, 0, {
      id: "class",
      header: "Lớp hành chính",
      cell: ({ row }) => {
        const studentObj = (row.original as any).students?.[0];
        return studentObj?.mainClassMembers?.[0]?.mainClass?.code || "N/A";
      }
    }, {
      id: "department",
      header: "Khoa/Phân khoa",
      cell: ({ row }) => {
        const studentObj = (row.original as any).students?.[0];
        return studentObj?.mainClassMembers?.[0]?.mainClass?.major?.department?.name || "N/A";
      }
    }, {
      id: "major",
      header: "Chuyên ngành",
      cell: ({ row }) => {
        const studentObj = (row.original as any).students?.[0];
        const major = studentObj?.mainClassMembers?.[0]?.mainClass?.major;
        return major ? `${major.des || major.code} (${major.code})` : "N/A";
      }
    });
  }

  return cols;
};