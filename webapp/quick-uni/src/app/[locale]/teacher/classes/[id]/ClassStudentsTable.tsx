"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, FileSpreadsheet, AlertCircle } from "lucide-react";
import { FormattedDate } from "@/components/shared/FormattedDate";
import * as XLSX from "xlsx";

interface Student {
  stt: number;
  id: string;
  code: string;
  fullname: string;
  gender: string;
  birthday: string;
  email: string;
  status: string;
}

interface ClassStudentsTableProps {
  students: Student[];
  classCode: string;
  subjectName: string;
}

export function ClassStudentsTable({ students, classCode, subjectName }: ClassStudentsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.code.toLowerCase().includes(term) ||
      s.fullname.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term)
    );
  });

  const handleExportExcel = () => {
    // 1. Prepare JSON records for SheetJS
    const data = filtered.map((s, idx) => ({
      "STT": idx + 1,
      "Mã sinh viên (MSSV)": s.code,
      "Họ và tên": s.fullname,
      "Giới tính": s.gender === "male" ? "Nam" : s.gender === "female" ? "Nữ" : s.gender,
      "Ngày sinh": s.birthday || "—",
      "Email": s.email
    }));

    // 2. Convert JSON array to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách lớp");

    // 3. Set custom column widths for pristine professional look
    worksheet["!cols"] = [
      { wch: 8 },  // STT
      { wch: 22 }, // MSSV
      { wch: 28 }, // Họ và tên
      { wch: 12 }, // Giới tính
      { wch: 16 }, // Ngày sinh
      { wch: 30 }  // Email
    ];

    // 4. Generate binary XLSX content
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);

    // 5. Trigger client-side file download
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Danh_sach_lop_${classCode}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Search & Export Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-70" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, MSSV, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-primary/20 rounded-xl bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-xs"
          />
        </div>

        <Button 
          onClick={handleExportExcel} 
          disabled={filtered.length === 0}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs px-4"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Xuất File Excel</span>
        </Button>
      </div>

      {/* Responsive Table Grid */}
      <div className="overflow-x-auto rounded-xl border border-primary/10 bg-background/50">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-primary/5 bg-muted/30 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <th className="py-3.5 px-4 text-center w-14">STT</th>
              <th className="py-3.5 px-4 w-32">MSSV</th>
              <th className="py-3.5 px-4">Họ và tên</th>
              <th className="py-3.5 px-4 w-28 text-center">Giới tính</th>
              <th className="py-3.5 px-4 w-36">Ngày sinh</th>
              <th className="py-3.5 px-4">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5 text-sm text-foreground">
            {filtered.length > 0 ? (
              filtered.map((s, idx) => (
                <tr 
                  key={s.id} 
                  className="hover:bg-muted/30 transition-colors group"
                >
                  <td className="py-3.5 px-4 text-center font-mono font-medium text-muted-foreground">
                    {idx + 1}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                    {s.code}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-primary group-hover:underline cursor-default">
                    {s.fullname}
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-muted-foreground text-xs">
                    {s.gender === "male" ? "Nam" : s.gender === "female" ? "Nữ" : s.gender}
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground font-medium">
                    {s.birthday ? <FormattedDate date={s.birthday} /> : "—"}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground select-all">
                    {s.email}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
                    <span className="font-semibold text-sm">Không tìm thấy sinh viên nào hợp lệ</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
