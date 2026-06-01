"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import { MoreHorizontal, Edit, Trash2, Users, School, Loader2, UserPlus, Trash, FilterX, BookOpen, Layers, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CourseClassForm, CourseClass, Dependencies } from "./CourseClassForm";
import { 
  deleteCourseClassAction, 
  getCourseClassManagementData, 
  enrollMainClassIntoCourseClass, 
  unenrollMainClassFromCourseClass,
  enrollStudentIntoCourseClass,
  unenrollStudentFromCourseClass
} from "@/actions/course";
import { notify } from "@/lib/custom-toast";
import { useTranslations } from "next-intl";

export function CourseClassRowActions({ courseClass, dependencies }: { courseClass: CourseClass, dependencies: Dependencies }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("Admin");

  // Roster & Class Management States
  const [loadingMgmt, setLoadingMgmt] = useState(false);
  const [mgmtData, setMgmtData] = useState<any>({
    mainClasses: [],
    participatingMainClasses: [],
    enrolledStudents: [],
    availableStudents: []
  });
  const [selectedMainClassId, setSelectedMainClassId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [availableStudentSearch, setAvailableStudentSearch] = useState("");

  const loadManagementData = async () => {
    setLoadingMgmt(true);
    try {
      const res = await getCourseClassManagementData(courseClass.id);
      setMgmtData(res);
    } catch (error) {
      console.error("Failed to load management data:", error);
      notify("Không thể tải thông tin quản lý lớp học phần.", { type: "error" });
    } finally {
      setLoadingMgmt(false);
    }
  };

  useEffect(() => {
    if (isManageOpen) {
      loadManagementData();
    }
  }, [isManageOpen]);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCourseClassAction(courseClass.id);
      if (result.success) {
        notify(t("DeletedSuccess"), { type: "success" });
      } else {
        notify(result.error || t("DeleteFailed"), { type: "error" });
      }
      setIsDeleteOpen(false);
    });
  };

  const handleEnrollMainClass = async () => {
    if (!selectedMainClassId) return;
    try {
      const res = await enrollMainClassIntoCourseClass(courseClass.id, selectedMainClassId);
      if (res.success) {
        notify("Đăng ký lớp hành chính thành công!", { type: "success" });
        setSelectedMainClassId("");
        loadManagementData();
      } else {
        notify(res.error || "Đăng ký lớp hành chính thất bại.", { type: "error" });
      }
    } catch (err: any) {
      notify(err.message || "Đã xảy ra lỗi.", { type: "error" });
    }
  };

  const handleUnenrollMainClass = async (mainClassId: string) => {
    if (!confirm("Hủy đăng ký lớp hành chính này sẽ xóa tất cả sinh viên thuộc lớp khỏi lớp học phần. Bạn có chắc chắn?")) return;
    try {
      const res = await unenrollMainClassFromCourseClass(courseClass.id, mainClassId);
      if (res.success) {
        notify("Hủy đăng ký lớp hành chính thành công!", { type: "success" });
        loadManagementData();
      } else {
        notify(res.error || "Hủy đăng ký thất bại.", { type: "error" });
      }
    } catch (err: any) {
      notify(err.message || "Đã xảy ra lỗi.", { type: "error" });
    }
  };

  const handleEnrollStudent = async () => {
    if (!selectedStudentId) return;
    try {
      const res = await enrollStudentIntoCourseClass(courseClass.id, selectedStudentId);
      if (res.success) {
        notify("Đăng ký sinh viên thành công!", { type: "success" });
        setSelectedStudentId("");
        loadManagementData();
      } else {
        notify(res.error || "Đăng ký sinh viên thất bại.", { type: "error" });
      }
    } catch (err: any) {
      notify(err.message || "Đã xảy ra lỗi.", { type: "error" });
    }
  };

  const handleUnenrollStudent = async (studentId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sinh viên này khỏi lớp học phần?")) return;
    try {
      const res = await unenrollStudentFromCourseClass(courseClass.id, studentId);
      if (res.success) {
        notify("Hủy đăng ký sinh viên thành công!", { type: "success" });
        loadManagementData();
      } else {
        notify(res.error || "Hủy đăng ký thất bại.", { type: "error" });
      }
    } catch (err: any) {
      notify(err.message || "Đã xảy ra lỗi.", { type: "error" });
    }
  };

  // Filter available classes to those that are NOT already participating
  const unparticipatingMainClasses = useMemo(() => {
    const participatingIds = new Set(mgmtData.participatingMainClasses.map((pm: any) => pm.id));
    return mgmtData.mainClasses.filter((mc: any) => !participatingIds.has(mc.id));
  }, [mgmtData]);

  // Filter enrolled students list based on search query
  const filteredEnrolledStudents = useMemo(() => {
    if (!studentSearchQuery) return mgmtData.enrolledStudents;
    const query = studentSearchQuery.toLowerCase();
    return mgmtData.enrolledStudents.filter((e: any) => {
      const name = (e.student?.profile?.fullname || "").toLowerCase();
      const code = (e.student?.code || "").toLowerCase();
      return name.includes(query) || code.includes(query);
    });
  }, [mgmtData.enrolledStudents, studentSearchQuery]);

  // Filter available students list based on query
  const filteredAvailableStudents = useMemo(() => {
    if (!availableStudentSearch) return mgmtData.availableStudents;
    const query = availableStudentSearch.toLowerCase();
    return mgmtData.availableStudents.filter((s: any) => {
      const name = (s.profile?.fullname || "").toLowerCase();
      const code = (s.code || "").toLowerCase();
      return name.includes(query) || code.includes(query);
    });
  }, [mgmtData.availableStudents, availableStudentSearch]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsManageOpen(true)}>
            <Users className="mr-2 h-4 w-4 text-primary" /> Quản lý lớp & sinh viên
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> {t("Edit")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDeleteOpen(true)} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" /> {t("Delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("EditCourseClass")}</DialogTitle>
          </DialogHeader>
          <CourseClassForm courseClass={courseClass} dependencies={dependencies} onSuccess={() => setIsEditOpen(false)} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("ConfirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>{t("DeleteSoftWarning")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
              {t("Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Student & Class Management Dialog */}
      <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quản lý Lớp & Sinh viên học phần ({courseClass.code})</DialogTitle>
          </DialogHeader>

          {loadingMgmt ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Đang tải dữ liệu học phần...</span>
            </div>
          ) : (
            <Tabs defaultValue="classes" className="w-full mt-4">
              <TabsList className="grid w-full grid-cols-2 max-w-[480px]">
                <TabsTrigger value="classes" className="flex items-center gap-2">
                  <School className="h-4 w-4" />
                  Lớp hành chính
                </TabsTrigger>
                <TabsTrigger value="students" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Danh sách sinh viên ({mgmtData.enrolledStudents.length})
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Manage classes */}
              <TabsContent value="classes" className="space-y-6 mt-6">
                <div className="p-4 bg-background/30 border rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Đăng ký theo Lớp hành chính</h4>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Select value={selectedMainClassId} onValueChange={setSelectedMainClassId}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn lớp hành chính" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {unparticipatingMainClasses.length === 0 ? (
                            <div className="p-2 text-xs text-muted-foreground text-center">Tất cả các lớp đã được đăng ký</div>
                          ) : (
                            unparticipatingMainClasses.map((mc: any) => (
                              <SelectItem key={mc.id} value={mc.id}>{mc.code}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={handleEnrollMainClass}
                      disabled={!selectedMainClassId}
                      className="bg-primary hover:bg-primary/95 text-xs font-bold shrink-0 rounded-lg"
                    >
                      <Plus className="h-4 w-4 mr-1.5" /> Đăng ký tham gia
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-foreground">Các lớp hành chính đang tham gia</h4>
                  {mgmtData.participatingMainClasses.length === 0 ? (
                    <div className="text-center py-8 border border-dashed rounded-xl text-muted-foreground text-xs">
                      Chưa có lớp hành chính nào đăng ký tham gia lớp học phần này.
                    </div>
                  ) : (
                    <div className="border rounded-xl overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead>Mã lớp hành chính</TableHead>
                            <TableHead>Chuyên ngành</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mgmtData.participatingMainClasses.map((pm: any) => (
                            <TableRow key={pm.id}>
                              <TableCell className="font-semibold">{pm.code}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{pm.major?.des || pm.major?.code || "N/A"}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUnenrollMainClass(pm.id)}
                                  className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg"
                                  title="Hủy đăng ký cả lớp"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Tab 2: Manage individual students */}
              <TabsContent value="students" className="space-y-6 mt-6">
                {/* Add student section */}
                <div className="p-4 bg-background/30 border rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Đăng ký thủ công từng sinh viên</h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <Input
                        placeholder="Tìm kiếm: Nhập MSSV hoặc Họ tên..."
                        value={availableStudentSearch}
                        onChange={(e) => {
                          setAvailableStudentSearch(e.target.value);
                          setSelectedStudentId(""); // Reset selection on typing
                        }}
                        className="text-xs h-9 bg-background/40"
                      />
                    </div>
                    <div className="flex-1">
                      <Select value={selectedStudentId} onValueChange={setSelectedStudentId} disabled={filteredAvailableStudents.length === 0}>
                        <SelectTrigger className="w-full h-9 bg-background/40">
                          <SelectValue placeholder={
                            mgmtData.availableStudents.length === 0 
                              ? "Tất cả sinh viên đã đăng ký" 
                              : filteredAvailableStudents.length === 0 
                                ? "Không tìm thấy sinh viên nào" 
                                : "Chọn sinh viên trong kết quả..."
                          } />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {filteredAvailableStudents.map((s: any) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.profile?.fullname} ({s.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={() => {
                        handleEnrollStudent();
                        setAvailableStudentSearch(""); // Clear search after adding
                      }}
                      disabled={!selectedStudentId}
                      className="bg-primary hover:bg-primary/95 text-xs font-bold shrink-0 rounded-lg h-9 gap-1.5"
                    >
                      <UserPlus className="h-4 w-4" /> Thêm sinh viên
                    </Button>
                  </div>
                  {availableStudentSearch && filteredAvailableStudents.length > 0 && (
                    <p className="text-[10px] text-muted-foreground/80 italic mt-1">
                      * Hiển thị tối đa 30 kết quả phù hợp nhất. Vui lòng chọn sinh viên từ danh mục sau khi lọc.
                    </p>
                  )}
                </div>

                {/* Enrolled Students Table with search query */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground">Danh sách sinh viên học phần</h4>
                    <Input
                      placeholder="Tìm kiếm theo tên, mã sinh viên..."
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      className="max-w-[250px] h-8 text-xs"
                    />
                  </div>

                  {filteredEnrolledStudents.length === 0 ? (
                    <div className="text-center py-8 border border-dashed rounded-xl text-muted-foreground text-xs">
                      Không tìm thấy sinh viên nào trong lớp học phần.
                    </div>
                  ) : (
                    <div className="border rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30 sticky top-0">
                            <TableHead className="bg-muted/90 backdrop-blur-xs">MSSV</TableHead>
                            <TableHead className="bg-muted/90 backdrop-blur-xs">Họ và Tên</TableHead>
                            <TableHead className="text-right bg-muted/90 backdrop-blur-xs">Hành động</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredEnrolledStudents.map((e: any) => (
                            <TableRow key={e.id}>
                              <TableCell className="font-mono font-medium text-xs">{e.student?.code}</TableCell>
                              <TableCell className="text-xs font-medium">{e.student?.profile?.fullname || "N/A"}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUnenrollStudent(e.studentId)}
                                  className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg"
                                  title="Xóa khỏi lớp học phần"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
