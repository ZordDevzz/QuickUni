"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Shield, User, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AccountRowActions } from "@/components/features/auth/AccountRowActions"
import { Account } from "@/types/profile"
import { FormattedDate } from "@/components/shared/FormattedDate"

export const columns: ColumnDef<Account>[] = [
  {
    accessorKey: "username",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Username
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.getValue("email") || "N/A",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return (
        <div className="flex items-center gap-1">
          {type === 'tech' || type === 'dev' ? <Shield className="h-3 w-3 text-primary" /> : <User className="h-3 w-3" />}
          <span className="capitalize">{type}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={
            status === 'active' ? 'success' : 
            status === 'suspended' ? 'warning' : 
            status === 'banned' ? 'destructive' : 'outline'
        }>
            {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createAt",
    header: "Created At",
    cell: ({ row }) => <FormattedDate date={row.getValue("createAt")} />,
  },
  {
    id: "actions",
    cell: ({ row }) => <div className="flex justify-end"><AccountRowActions account={row.original} /></div>,
  },
]