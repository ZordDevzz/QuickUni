'use client';

import { useEffect, useState, useCallback } from 'react';
import { getMainClassDetails, deleteMainClass } from '@/actions/academic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Users, Info, Edit, Trash2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { ClassDialog } from '@/components/features/academic/ClassDialogs';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { notify } from '@/lib/custom-toast';
import { FormattedDate } from '@/components/shared/FormattedDate';

interface DetailViewProps {
  classId: string;
}

export function DetailView({ classId }: DetailViewProps) {
  const router = useRouter();
  const t = useTranslations("MainClasses");
  const tAdmin = useTranslations("Admin");
  const tProfile = useTranslations("Profile");
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const load = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    try {
      const result = await getMainClassDetails(classId);
      setData(result);
    } catch (error) {
      console.error('Failed to fetch class details', error);
      notify(t("ToastFailedToLoad"), { type: "error" });
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    if (classId) {
      load();
    }
  }, [classId, load]);

  const handleDelete = async () => {
    if (confirm(t("DeleteConfirm"))) {
      try {
        await deleteMainClass(classId);
        notify(t("ToastDeleteSuccess"), { type: "success" });
        router.push("/academic/classes");
        router.refresh();
      } catch (error: unknown) {
        notify((error as Error).message || t("ToastDeleteFailed"), { type: "error" });
      }
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="text-muted-foreground">{t("NotFoundError")}</div>
      </div>
    );
  }

  const studentColumns: ColumnDef<any>[] = [
    { 
      accessorKey: 'student.code', 
      header: () => tProfile("Code") || "MSSV",
      cell: ({ row }) => <span className="font-mono font-medium">{row.original.student?.code}</span>
    },
    { 
      id: 'fullname',
      header: () => tProfile("FullName") || "Full Name",
      cell: ({ row }) => row.original.student?.profile?.fullname || 'N/A'
    },
    { 
      accessorKey: 'student.profile.gender', 
      header: () => tProfile("Gender") || "Gender",
      cell: ({ row }) => {
        const gender = row.original.student?.profile?.gender;
        const genderMap: Record<string, string> = {
          male: tProfile("Male") || "Nam",
          female: tProfile("Female") || "Nữ",
          others: tProfile("Others") || "Khác"
        };
        return <span className="capitalize">{genderMap[gender] || gender || "N/A"}</span>;
      }
    },
    { 
      id: 'dob', 
      header: () => tProfile("DateOfBirth") || "DOB",
      cell: ({ row }) => <FormattedDate date={row.original.student?.profile?.dob} />,
    },
    {
      id: 'role',
      header: () => t("Role"),
      cell: ({ row }) => {
        const roleId = row.original.roleId;
        return roleId === 1 ? (
          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded text-xs font-semibold">
            {t("RoleLeader")}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">{t("RoleMember")}</span>
        );
      }
    }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{data.code}</h1>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
              {t("Class")}
            </span>
            <span className="px-2 py-1 bg-muted rounded text-xs font-mono font-medium">
              {data.major?.des || data.major?.code}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsEditDialogOpen(true)} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            {t("EditClass")}
          </Button>
          <Button onClick={handleDelete} variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            {t("DeleteClass")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="roster" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[300px]">
          <TabsTrigger value="roster" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t("ClassRoster")}
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            {t("GeneralInfo")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roster" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                {t("RosterCount", { count: data.mainClassMembers?.length || 0 })}
              </CardTitle>
            </CardHeader>
            <CardContent>
               <DataTable 
                 columns={studentColumns} 
                 data={data.mainClassMembers || []} 
                 searchKey="fullname"
                 searchPlaceholder={t("SearchStudentPlaceholder")}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">{t("Code")}</Label>
                  <Input id="code" value={data.code} readOnly className="bg-muted/50" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="teacher">{t("Teacher")}</Label>
                  <Input 
                    id="teacher" 
                    value={data.employee?.profile?.fullname ? `${data.employee.profile.fullname} (${data.employee.code})` : 'N/A'} 
                    readOnly 
                    className="bg-muted/50" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="major">{t("Major")}</Label>
                  <Input 
                    id="major" 
                    value={data.major?.des ? `${data.major.des} (${data.major.code})` : data.major?.code || 'N/A'} 
                    readOnly 
                    className="bg-muted/50" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="educationType">{t("EducationType")}</Label>
                  <Input 
                    id="educationType" 
                    value={data.educationType?.name ? `${data.educationType.name} (${data.educationType.code})` : 'N/A'} 
                    readOnly 
                    className="bg-muted/50" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="academicYear">{t("AcademicYear")}</Label>
                  <Input id="academicYear" value={data.academicYear || ''} readOnly className="bg-muted/50" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ClassDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        initialData={{
          id: data.id,
          code: data.code,
          teacher: data.teacher,
          typeId: data.typeId,
          majorId: data.majorId,
          academicYear: data.academicYear
        }} 
        onSuccess={() => {
          load();
          router.refresh();
        }}
      />
    </div>
  );
}
