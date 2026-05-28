'use client';

import { useEffect, useState, useCallback } from 'react';
import { getDepartmentDetails } from '@/actions/academic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Users, BookOpen, Info, Edit, Plus, UserPlus } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { DepartmentDialog, MajorDialog, StaffAssignmentDialog } from '@/components/features/academic/DepartmentDialogs';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface DetailViewProps {
  departmentId: string;
}

export function DetailView({ departmentId }: DetailViewProps) {
  const router = useRouter();
  const t = useTranslations("Departments");
  const tAdmin = useTranslations("Admin");
  const tProfile = useTranslations("Profile");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMajorDialogOpen, setIsMajorDialogOpen] = useState(false);
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);

  const load = useCallback(async () => {
    // Await to ensure any subsequent setState calls are not synchronous within the effect
    await Promise.resolve();
    setLoading(true);
    try {
      const result = await getDepartmentDetails(departmentId);
      setData(result);
    } catch (error) {
      console.error('Failed to fetch department details', error);
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    async function init() {
      if (departmentId) {
        await load();
      }
    }
    init();
  }, [departmentId, load]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      <div className="text-muted-foreground">{t("NotFoundError")}</div>
    </div>
  );

// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const majorColumns: ColumnDef<any>[] = [
    { 
      accessorKey: 'code', 
      header: () => t("Code"),
      cell: ({ row }) => <span className="font-mono">{row.original.code}</span>
    },
    { 
      accessorKey: 'des', 
      header: () => t("Description"),
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.des || 'No description'}</span>
    },
  ];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const personnelColumns: ColumnDef<any>[] = [
    { 
      id: 'fullname',
      header: () => tProfile("FullName"),
      cell: ({ row }) => row.original.employee?.profile?.fullname || 'N/A'
    },
    { 
      accessorKey: 'roleName', 
      header: () => tAdmin("RoleName") || "Role",
      cell: ({ row }) => row.original.roleName || row.original.roleCode || 'Staff'
    },
    { 
      accessorKey: 'assignDate', 
      header: () => tAdmin("AssignDate") || "Assign Date",
    },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{data.name}</h1>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-1 bg-muted rounded text-xs font-mono font-medium">
              {data.code || 'N/A'}
            </span>
            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
              Department
            </span>
          </div>
        </div>
        <Button onClick={() => setIsEditDialogOpen(true)} variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          {t("EditDepartment")}
        </Button>
      </div>

      <Tabs defaultValue="majors" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
          <TabsTrigger value="majors" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {t("Majors")}
          </TabsTrigger>
          <TabsTrigger value="personnel" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t("Personnel")}
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            {t("About")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="majors" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xl font-semibold">{t("MajorsList")}</CardTitle>
              <Button size="sm" onClick={() => setIsMajorDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t("AddMajor")}
              </Button>
            </CardHeader>
            <CardContent>
               <DataTable 
                 columns={majorColumns} 
                 data={data.majors || []} 
                 searchKey="code"
                 searchPlaceholder={t("SearchMajorsPlaceholder") || "Search majors by code..."}
               />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personnel" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xl font-semibold">{t("PersonnelList")}</CardTitle>
              <Button size="sm" onClick={() => setIsStaffDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                {t("AssignStaff")}
              </Button>
            </CardHeader>
            <CardContent>
               <DataTable 
                 columns={personnelColumns} 
                 data={data.departmentEmployments || []} 
               />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">{t("GeneralInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t("Name")}</Label>
                <Input id="name" value={data.name} readOnly className="bg-muted/50" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="code">{t("Code")}</Label>
                <Input id="code" value={data.code || ''} readOnly className="bg-muted/50" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">{t("Description")}</Label>
                <textarea 
                  id="description" 
                  value={data.des || ''} 
                  readOnly 
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DepartmentDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        initialData={data} 
        onSuccess={() => {
          load();
          router.refresh();
        }}
      />

      <MajorDialog 
        open={isMajorDialogOpen} 
        onOpenChange={setIsMajorDialogOpen} 
        departmentId={departmentId} 
        onSuccess={load}
      />

      <StaffAssignmentDialog 
        open={isStaffDialogOpen} 
        onOpenChange={setIsStaffDialogOpen} 
        departmentId={departmentId} 
        onSuccess={load}
      />
    </div>
  );
}
