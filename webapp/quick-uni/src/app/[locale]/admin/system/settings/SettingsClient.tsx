"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { notify } from "@/lib/custom-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AutoCodeRule, saveAutoCodeRule, setDefaultSchemaId } from "@/actions/admin";
import { 
  Settings2, 
  GraduationCap, 
  Briefcase, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  Binary, 
  Save 
} from "lucide-react";

interface SettingsClientProps {
  schemas: { id: number; schemaCode: string; des: string | null }[];
  defaultStudentSchemaId: number | null;
  defaultEmployeeSchemaId: number | null;
  autoCodeRules: {
    student: AutoCodeRule;
    employee: AutoCodeRule;
  };
}

export function SettingsClient({
  schemas,
  defaultStudentSchemaId,
  defaultEmployeeSchemaId,
  autoCodeRules,
}: SettingsClientProps) {
  const t = useTranslations("Profile");

  // Schema States
  const [selectedStudentSchema, setSelectedStudentSchema] = useState<string>(
    defaultStudentSchemaId ? String(defaultStudentSchemaId) : ""
  );
  const [selectedEmployeeSchema, setSelectedEmployeeSchema] = useState<string>(
    defaultEmployeeSchemaId ? String(defaultEmployeeSchemaId) : ""
  );
  const [isSavingSchemas, setIsSavingSchemas] = useState(false);

  // Auto Code Rules States
  const [studentRule, setStudentRule] = useState<AutoCodeRule>(autoCodeRules.student);
  const [employeeRule, setEmployeeRule] = useState<AutoCodeRule>(autoCodeRules.employee);
  const [isSavingStudentRule, setIsSavingStudentRule] = useState(false);
  const [isSavingEmployeeRule, setIsSavingEmployeeRule] = useState(false);

  // Live Preview Helpers
  const getPreviewCode = (rule: AutoCodeRule) => {
    if (!rule.isActive) return "Disabled";
    let yearPart = "";
    if (rule.hasYear) {
      const fullYear = new Date().getFullYear().toString();
      yearPart = rule.yearFormat === "YY" ? fullYear.slice(-2) : fullYear;
    }
    const sampleSeq = (rule.currentSeq + 1).toString().padStart(rule.seqPadding, "0");
    return `${rule.prefix}${yearPart}${sampleSeq}`;
  };

  const handleSaveSchemas = async () => {
    setIsSavingSchemas(true);
    try {
      if (selectedStudentSchema) {
        await setDefaultSchemaId("student", Number(selectedStudentSchema));
      }
      if (selectedEmployeeSchema) {
        await setDefaultSchemaId("employee", Number(selectedEmployeeSchema));
      }
      notify("Cập nhật cấu trúc hồ sơ mặc định thành công!", { type: "success" });
    } catch (error) {
      notify("Cập nhật cấu trúc thất bại", { type: "error" });
    } finally {
      setIsSavingSchemas(false);
    }
  };

  const handleSaveRule = async (type: "student" | "employee") => {
    const setIsSaving = type === "student" ? setIsSavingStudentRule : setIsSavingEmployeeRule;
    const rule = type === "student" ? studentRule : employeeRule;

    setIsSaving(true);
    try {
      const res = await saveAutoCodeRule(type, rule);
      if (res.success) {
        notify(`Cập nhật quy tắc sinh mã ${type === "student" ? "sinh viên" : "cán bộ"} thành công!`, { type: "success" });
      } else {
        notify("Cập nhật quy tắc thất bại", { type: "error" });
      }
    } catch (error) {
      notify("Có lỗi xảy ra khi lưu quy tắc", { type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-6 md:p-8 border border-indigo-500/15 dark:border-indigo-500/10 shadow-sm">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl"></div>
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
              <Settings2 className="h-7 w-7 text-indigo-500" />
              Cài đặt hệ thống
            </h1>
            <p className="text-muted-foreground text-sm max-w-2xl">
              Quản lý cấu trúc hồ sơ mặc định và quy tắc tự động cấp mã định danh sinh viên, cán bộ giảng viên.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Left: General Schema Mapping Settings */}
        <Card className="border border-border/40 bg-background/50 backdrop-blur-md shadow-sm">
          <CardHeader className="border-b border-border/20">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-500" />
              Cấu trúc hồ sơ mặc định
            </CardTitle>
            <CardDescription>
              Lựa chọn cấu trúc dữ liệu mặc định để áp dụng khi khởi tạo thông tin nhân sự và sinh viên.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Cấu trúc Sinh viên mặc định</Label>
              <Select value={selectedStudentSchema} onValueChange={setSelectedStudentSchema}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn cấu trúc..." />
                </SelectTrigger>
                <SelectContent>
                  {schemas.filter(s => s.schemaCode.startsWith("STD")).map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.schemaCode} {s.des ? `(${s.des})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Cấu trúc Cán bộ / Giảng viên mặc định</Label>
              <Select value={selectedEmployeeSchema} onValueChange={setSelectedEmployeeSchema}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn cấu trúc..." />
                </SelectTrigger>
                <SelectContent>
                  {schemas.filter(s => s.schemaCode.startsWith("EMP")).map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.schemaCode} {s.des ? `(${s.des})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleSaveSchemas} 
              disabled={isSavingSchemas}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold gap-2 shadow-sm rounded-xl py-5"
            >
              <Save className="h-4 w-4" /> {isSavingSchemas ? "Đang lưu..." : "Lưu cấu hình cấu trúc"}
            </Button>
          </CardContent>
        </Card>

        {/* Right Info Card: Generator Guide */}
        <Card className="border border-border/40 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 backdrop-blur-md shadow-sm flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
              Cách thức hoạt động quy tắc sinh mã
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-2">
              Hệ thống tự động nối chuỗi dựa trên cấu hình:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm flex-1">
            <div className="flex gap-3 items-start p-3 rounded-lg bg-background/40 border border-indigo-500/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong>Tiền tố (Prefix):</strong> Từ viết tắt đại diện cho nhóm đối tượng (ví dụ: <code className="bg-indigo-500/10 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400">SV</code> cho sinh viên).
              </div>
            </div>
            <div className="flex gap-3 items-start p-3 rounded-lg bg-background/40 border border-indigo-500/10">
              <Calendar className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <strong>Năm hiện tại:</strong> Gắn năm hiện tại vào mã số dạng 2 số cuối (<code className="bg-indigo-500/10 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400">26</code>) hoặc đầy đủ 4 số (<code className="bg-indigo-500/10 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400">2026</code>).
              </div>
            </div>
            <div className="flex gap-3 items-start p-3 rounded-lg bg-background/40 border border-indigo-500/10">
              <Binary className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
              <div>
                <strong>Số thứ tự tự tăng (Sequence):</strong> Số thứ tự sẽ tự động cộng 1 và thêm đệm chữ số 0 tương ứng với cấu hình của bạn.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Code rules cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Student Rule Card */}
        <Card className="border border-border/40 bg-background/50 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-emerald-500" />
                Mã sinh viên tự động
              </CardTitle>
              <Switch 
                checked={studentRule.isActive} 
                onCheckedChange={(checked) => setStudentRule({ ...studentRule, isActive: checked })} 
              />
            </div>
            <CardDescription>Cấu hình quy tắc sinh mã tự động cho sinh viên khi lập hồ sơ.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-3">
            {/* Live Preview Panel */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border border-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mã sinh viên tiếp theo:</span>
              <span className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400 tracking-wider">
                {getPreviewCode(studentRule)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground">Tiền tố (Prefix)</Label>
                <Input 
                  value={studentRule.prefix}
                  onChange={(e) => setStudentRule({ ...studentRule, prefix: e.target.value })}
                  placeholder="e.g. SV"
                  disabled={!studentRule.isActive}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground">Độ dài số thứ tự</Label>
                <Select 
                  value={String(studentRule.seqPadding)} 
                  onValueChange={(val) => setStudentRule({ ...studentRule, seqPadding: Number(val) })}
                  disabled={!studentRule.isActive}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 chữ số (e.g. 001)</SelectItem>
                    <SelectItem value="4">4 chữ số (e.g. 0001)</SelectItem>
                    <SelectItem value="5">5 chữ số (e.g. 00001)</SelectItem>
                    <SelectItem value="6">6 chữ số (e.g. 000001)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground">Số thứ tự hiện tại</Label>
                <Input 
                  type="number"
                  value={studentRule.currentSeq}
                  onChange={(e) => setStudentRule({ ...studentRule, currentSeq: Number(e.target.value) })}
                  disabled={!studentRule.isActive}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground">Định dạng Năm</Label>
                <Select 
                  value={studentRule.yearFormat} 
                  onValueChange={(val) => setStudentRule({ ...studentRule, yearFormat: val as "YY" | "YYYY" })}
                  disabled={!studentRule.isActive || !studentRule.hasYear}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YY">YY (e.g. 26)</SelectItem>
                    <SelectItem value="YYYY">YYYY (e.g. 2026)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20">
              <div className="flex flex-col gap-0.5">
                <Label className="text-sm font-semibold">Nhúng năm vào mã số</Label>
                <span className="text-xs text-muted-foreground">Gắn năm hiện tại vào mã của sinh viên</span>
              </div>
              <Switch 
                checked={studentRule.hasYear}
                onCheckedChange={(checked) => setStudentRule({ ...studentRule, hasYear: checked })}
                disabled={!studentRule.isActive}
              />
            </div>

            <Button 
              onClick={() => handleSaveRule("student")} 
              disabled={isSavingStudentRule}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2 shadow-sm rounded-xl py-4"
            >
              <Save className="h-4 w-4" /> {isSavingStudentRule ? "Đang lưu..." : "Lưu quy tắc Sinh viên"}
            </Button>
          </CardContent>
        </Card>

        {/* Employee Rule Card */}
        <Card className="border border-border/40 bg-background/50 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-500" />
                Mã cán bộ / giảng viên tự động
              </CardTitle>
              <Switch 
                checked={employeeRule.isActive} 
                onCheckedChange={(checked) => setEmployeeRule({ ...employeeRule, isActive: checked })} 
              />
            </div>
            <CardDescription>Cấu hình quy tắc sinh mã tự động cho cán bộ và giảng viên.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-3">
            {/* Live Preview Panel */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mã cán bộ tiếp theo:</span>
              <span className="text-xl font-mono font-black text-blue-600 dark:text-blue-400 tracking-wider">
                {getPreviewCode(employeeRule)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground">Tiền tố (Prefix)</Label>
                <Input 
                  value={employeeRule.prefix}
                  onChange={(e) => setEmployeeRule({ ...employeeRule, prefix: e.target.value })}
                  placeholder="e.g. NV"
                  disabled={!employeeRule.isActive}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground">Độ dài số thứ tự</Label>
                <Select 
                  value={String(employeeRule.seqPadding)} 
                  onValueChange={(val) => setEmployeeRule({ ...employeeRule, seqPadding: Number(val) })}
                  disabled={!employeeRule.isActive}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 chữ số (e.g. 001)</SelectItem>
                    <SelectItem value="4">4 chữ số (e.g. 0001)</SelectItem>
                    <SelectItem value="5">5 chữ số (e.g. 00001)</SelectItem>
                    <SelectItem value="6">6 chữ số (e.g. 000001)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground">Số thứ tự hiện tại</Label>
                <Input 
                  type="number"
                  value={employeeRule.currentSeq}
                  onChange={(e) => setEmployeeRule({ ...employeeRule, currentSeq: Number(e.target.value) })}
                  disabled={!employeeRule.isActive}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground">Định dạng Năm</Label>
                <Select 
                  value={employeeRule.yearFormat} 
                  onValueChange={(val) => setEmployeeRule({ ...employeeRule, yearFormat: val as "YY" | "YYYY" })}
                  disabled={!employeeRule.isActive || !employeeRule.hasYear}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YY">YY (e.g. 26)</SelectItem>
                    <SelectItem value="YYYY">YYYY (e.g. 2026)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20">
              <div className="flex flex-col gap-0.5">
                <Label className="text-sm font-semibold">Nhúng năm vào mã số</Label>
                <span className="text-xs text-muted-foreground">Gắn năm hiện tại vào mã của cán bộ</span>
              </div>
              <Switch 
                checked={employeeRule.hasYear}
                onCheckedChange={(checked) => setEmployeeRule({ ...employeeRule, hasYear: checked })}
                disabled={!employeeRule.isActive}
              />
            </div>

            <Button 
              onClick={() => handleSaveRule("employee")} 
              disabled={isSavingEmployeeRule}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2 shadow-sm rounded-xl py-4"
            >
              <Save className="h-4 w-4" /> {isSavingEmployeeRule ? "Đang lưu..." : "Lưu quy tắc Cán bộ"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
