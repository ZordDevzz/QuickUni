'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  getDepartmentDetails, 
  unassignStaffFromDepartment,
  getDepartmentPositions,
  deleteDepartmentPosition,
  initializeDefaultPositions
} from '@/actions/academic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Users, BookOpen, Info, Edit, Plus, UserPlus, GitFork, Trash2, Shield, Calendar, UserCheck, Briefcase, FileText } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { DepartmentDialog, MajorDialog, StaffAssignmentDialog, PositionDialog } from '@/components/features/academic/DepartmentDialogs';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { notify } from '@/lib/custom-toast';

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
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMajorDialogOpen, setIsMajorDialogOpen] = useState(false);
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [isPositionDialogOpen, setIsPositionDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<any>(null);
  const [selectedPresetRole, setSelectedPresetRole] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    try {
      const result = await getDepartmentDetails(departmentId);
      setData(result);
      const positionsResult = await getDepartmentPositions(departmentId);
      setPositions(positionsResult);
    } catch (error) {
      console.error('Failed to fetch department details', error);
      notify("Không thể tải thông tin đơn vị", { type: "error" });
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

  const handleUnassign = async (employeeId: string, employeeName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn bãi nhiệm chức vụ của ${employeeName} tại đơn vị này?`)) {
      return;
    }
    try {
      setActionLoading(true);
      await unassignStaffFromDepartment(employeeId, departmentId);
      notify("Đã bãi nhiệm nhân sự thành công", { type: "success" });
      await load();
    } catch (error) {
      notify("Không thể bãi nhiệm nhân sự", { type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePosition = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa chức vụ "${name}"? Thao tác này có thể ảnh hưởng đến các nhân sự đã được bổ nhiệm chức vụ này.`)) {
      return;
    }
    try {
      setActionLoading(true);
      await deleteDepartmentPosition(id);
      notify("Đã xóa chức vụ thành công", { type: "success" });
      await load();
    } catch (error) {
      notify("Không thể xóa chức vụ", { type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleInitDefaultPositions = async () => {
    try {
      setActionLoading(true);
      await initializeDefaultPositions(departmentId, isAcademicDept);
      notify("Đã khởi tạo các chức danh mẫu thành công", { type: "success" });
      await load();
    } catch (error) {
      notify("Không thể khởi tạo chức danh mẫu", { type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAppointPreset = (roleCode: string, roleName: string) => {
    setSelectedPresetRole({
      employeeId: "",
      departmentId: departmentId,
      roleCode,
      roleName,
      assignDate: new Date().toISOString().split('T')[0],
    });
    setIsStaffDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="h-full min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      <div className="text-muted-foreground">{t("NotFoundError")}</div>
    </div>
  );

  const isAcademicDept = data
    ? (data.name?.toLowerCase().includes("khoa") || 
       data.code?.toLowerCase().startsWith("k") || 
       data.name?.toLowerCase().includes("faculty") || 
       data.name?.toLowerCase().includes("bộ môn") || 
       data.name?.toLowerCase().includes("subject"))
    : true;



  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const majorColumns: ColumnDef<any>[] = [
    { 
      accessorKey: 'code', 
      header: () => t("Code"),
      cell: ({ row }) => <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{row.original.code}</span>
    },
    { 
      accessorKey: 'des', 
      header: () => t("Description"),
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.des || 'Không có mô tả'}</span>
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const personnelColumns: ColumnDef<any>[] = [
    { 
      id: 'fullname',
      header: () => tProfile("FullName"),
      cell: ({ row }) => (
        <span className="font-semibold text-foreground">
          {row.original.employee?.profile?.fullname || 'N/A'}
        </span>
      )
    },
    { 
      accessorKey: 'roleName', 
      header: () => tAdmin("RoleName") || "Chức vụ",
      cell: ({ row }) => (
        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-100/50">
          {row.original.roleName || row.original.roleCode || 'Nhân viên'}
        </span>
      )
    },
    { 
      accessorKey: 'assignDate', 
      header: () => tAdmin("AssignDate") || "Ngày bổ nhiệm",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground font-mono">
          {row.original.assignDate}
        </span>
      )
    },
    {
      id: 'actions',
      header: () => "Hành động",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
            disabled={actionLoading}
            onClick={() => handleUnassign(row.original.employeeId, row.original.employee?.profile?.fullname)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Bãi nhiệm
          </Button>
        </div>
      )
    }
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const positionsColumns: ColumnDef<any>[] = [
    { 
      accessorKey: 'code', 
      header: () => "Mã chức vụ",
      cell: ({ row }) => <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{row.original.code}</span>
    },
    { 
      accessorKey: 'name', 
      header: () => "Tên chức danh",
      cell: ({ row }) => <span className="font-semibold">{row.original.name}</span>
    },
    { 
      accessorKey: 'des', 
      header: () => "Mô tả",
      cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.des || 'Không có mô tả'}</span>
    },
    {
      id: 'actions',
      header: () => "Hành động",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
            onClick={() => {
              setSelectedPosition(row.original);
              setIsPositionDialogOpen(true);
            }}
          >
            <Edit className="h-4 w-4 mr-1" />
            Sửa
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
            disabled={actionLoading}
            onClick={() => handleDeletePosition(row.original.id, row.original.name)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Xóa
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">{data.name}</h1>
          <div className="flex gap-2 mt-2">
            <span className="px-2.5 py-1 bg-muted/60 dark:bg-muted/30 border border-border/30 rounded-xl text-xs font-semibold text-muted-foreground">
              Mã đơn vị: <span className="font-mono">{data.code || 'N/A'}</span>
            </span>
            <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
              isAcademicDept 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30' 
                : 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30'
            }`}>
              {isAcademicDept ? 'Khoa Đào tạo' : 'Phòng ban Hành chính'}
            </span>
          </div>
        </div>
        <Button onClick={() => setIsEditDialogOpen(true)} variant="outline" className="rounded-xl border-border/50 hover:bg-accent/60">
          <Edit className="h-4 w-4 mr-2 text-indigo-500" />
          {t("EditDepartment")}
        </Button>
      </div>

      <Tabs defaultValue="majors" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-[560px] bg-background/50 border border-border/40 p-1 rounded-xl">
          <TabsTrigger value="majors" className="flex items-center gap-2 rounded-lg text-xs md:text-sm">
            <BookOpen className="h-4 w-4" />
            {t("Majors")}
          </TabsTrigger>
          <TabsTrigger value="personnel" className="flex items-center gap-2 rounded-lg text-xs md:text-sm">
            <Users className="h-4 w-4" />
            {t("Personnel")}
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2 rounded-lg text-xs md:text-sm">
            <Info className="h-4 w-4" />
            {t("About")}
          </TabsTrigger>
          <TabsTrigger value="positions" className="flex items-center gap-2 rounded-lg text-xs md:text-sm">
            <Briefcase className="h-4 w-4" />
            Quản lý chức danh
          </TabsTrigger>
        </TabsList>

        <TabsContent value="majors" className="mt-6">
          <Card className="border border-border/40 bg-background/60 backdrop-blur-md shadow-xl rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{t("MajorsList")}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">Danh sách các chuyên ngành trực thuộc quản lý của khoa này</CardDescription>
              </div>
              <Button size="sm" onClick={() => setIsMajorDialogOpen(true)} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                <Plus className="h-4 w-4 mr-2" />
                {t("AddMajor")}
              </Button>
            </CardHeader>
            <CardContent>
               <DataTable 
                 columns={majorColumns} 
                 data={data.majors || []} 
                 searchKey="code"
                 searchPlaceholder={t("SearchMajorsPlaceholder") || "Tìm chuyên ngành theo mã..."}
               />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personnel" className="mt-6">
          <Card className="border border-border/40 bg-background/60 backdrop-blur-md shadow-xl rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{t("PersonnelList")}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">Tất cả cán bộ, nhân sự được gán công tác tại khoa/phòng</CardDescription>
              </div>
              <Button size="sm" onClick={() => { setSelectedPresetRole(null); setIsStaffDialogOpen(true); }} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
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
          <Card className="border border-border/40 bg-background/60 backdrop-blur-md shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{t("GeneralInfo")}</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Thông tin đăng ký và mô tả chức năng hoạt động chính thức</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase text-muted-foreground">{t("Name")}</Label>
                <Input id="name" value={data.name} readOnly className="h-10 rounded-xl bg-muted/40 border-border/50 read-only:text-foreground" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="code" className="text-xs font-bold uppercase text-muted-foreground">{t("Code")}</Label>
                <Input id="code" value={data.code || ''} readOnly className="h-10 rounded-xl bg-muted/40 border-border/50 read-only:font-mono read-only:text-foreground" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-xs font-bold uppercase text-muted-foreground">{t("Description")}</Label>
                <textarea 
                  id="description" 
                  value={data.des || ''} 
                  readOnly 
                  className="flex min-h-[120px] w-full rounded-xl border border-border/50 bg-muted/40 px-3 py-2 text-sm read-only:text-foreground focus-visible:outline-none resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Positions CRUD Tab (Quản lý chức danh) */}
        <TabsContent value="positions" className="mt-6">
          <Card className="border border-border/40 bg-background/60 backdrop-blur-md shadow-xl rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Quản lý Chức danh đơn vị</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Cấu hình các chức vụ, chức danh chuyên môn được áp dụng riêng trong cơ cấu đơn vị này
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {positions.length === 0 && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    disabled={actionLoading}
                    onClick={handleInitDefaultPositions} 
                    className="rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900/50 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
                  >
                    ✨ Khởi tạo chức danh mẫu
                  </Button>
                )}
                <Button 
                  size="sm" 
                  onClick={() => { setSelectedPosition(null); setIsPositionDialogOpen(true); }} 
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm chức vụ
                </Button>
              </div>
            </CardHeader>
            <CardContent>
               <DataTable 
                 columns={positionsColumns} 
                 data={positions} 
                 searchKey="name"
                 searchPlaceholder="Tìm chức danh theo tên..."
               />
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
        onOpenChange={(open) => {
          setIsStaffDialogOpen(open);
          if (!open) setSelectedPresetRole(null);
        }} 
        departmentId={departmentId} 
        initialData={selectedPresetRole}
        onSuccess={load}
      />

      <PositionDialog 
        open={isPositionDialogOpen} 
        onOpenChange={(open) => {
          setIsPositionDialogOpen(open);
          if (!open) setSelectedPosition(null);
        }} 
        departmentId={departmentId} 
        initialData={selectedPosition}
        onSuccess={load}
      />
    </div>
  );
}
