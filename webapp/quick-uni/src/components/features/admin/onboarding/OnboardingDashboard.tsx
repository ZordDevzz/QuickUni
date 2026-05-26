"use client";

import { useState, useEffect } from "react";
import { getSessionsAction, deleteOnboardingSessionAction } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Plus, 
  Trash2, 
  Eye, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  RefreshCw,
  Loader2
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import Link from "next/link";
import { FormattedDate } from "@/components/shared/FormattedDate";

export function OnboardingDashboard() {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("Onboarding");

  const fetchSessions = async () => {
    setLoading(true);
    const res = await getSessionsAction();
    if (res.success) {
      setSessions(res.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
// eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSessions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm(t("DeleteWarning"))) return;
    
    const res = await deleteOnboardingSessionAction(id);
    if (res.success) {
      toast.success(t("DeleteSuccess"));
      fetchSessions();
    } else {
      toast.error(res.error || t("Failed"));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-green-500">{t("Success")}</Badge>;
      case "processing": return <Badge className="bg-blue-500 animate-pulse">{t("ProcessingOnboarding")}</Badge>;
      case "failed": return <Badge variant="destructive">{t("Failed")}</Badge>;
      case "ready": return <Badge className="bg-yellow-500">{t("StatusReady") || "Ready"}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("DashboardTitle")}</h1>
          <p className="text-muted-foreground">{t("DashboardDescription")}</p>
        </div>
        <Button asChild>
          <Link href="/admin/onboarding/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("NewOnboarding")}
          </Link>
        </Button>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("Name")}</TableHead>
              <TableHead>{t("Type")}</TableHead>
              <TableHead>{t("Status")}</TableHead>
              <TableHead>{t("CreatedAt")}</TableHead>
              <TableHead className="text-right">{t("Actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                   {t("NoSessionsFound") || "No sessions found"}
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{session.name}</TableCell>
                  <TableCell className="capitalize">{session.entityType}</TableCell>
                  <TableCell>{getStatusBadge(session.status)}</TableCell>
                  <TableCell>
                    <FormattedDate date={session.createAt} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/onboarding/new?sessionId=${session.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            {t("View")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(session.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("Delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
