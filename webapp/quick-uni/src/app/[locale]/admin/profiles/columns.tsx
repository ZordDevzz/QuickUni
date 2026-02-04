"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Mail, Phone, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProfileRowActions } from "@/components/features/academic/ProfileRowActions"
import { ProfileWithAccount } from "@/types/profile"
import { FormattedDate } from "@/components/shared/FormattedDate"

export const columns: ColumnDef<ProfileWithAccount>[] = [
  {
    accessorKey: "fullname",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Full Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => row.getValue("fullname") || "N/A",
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => <span className="capitalize">{row.getValue("gender")}</span>,
  },
  {
    accessorKey: "dob",
    header: "Date of Birth",
    cell: ({ row }) => <FormattedDate date={row.getValue("dob")} />,
  },
  {
    id: "contact",
    header: "Contact",
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
    header: "National ID",
  },
  {
    id: "actions",
    cell: ({ row }) => <div className="flex justify-end"><ProfileRowActions profile={row.original} /></div>,
  },
]