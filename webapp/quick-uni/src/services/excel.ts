import * as XLSX from "xlsx";
import { OnboardingRow } from "@/types/onboarding";

/**
 * Generates an Excel template for admin onboarding.
 * Includes fixed profile fields and dynamic fields from the chosen schema.
 */
export async function generateOnboardingTemplate(
  fields: { label: string, name: string, isRequired: boolean }[],
  entityType?: "student" | "employee"
) {
  const fixedHeaders = ["Họ và tên", "Giới tính", "Ngày sinh", "Số CCCD/Hộ chiếu", "Địa chỉ", "Dân tộc", "Tôn giáo", "Mã định danh"];
  if (entityType === "student") {
    fixedHeaders.push("Mã lớp hành chính");
  }
  const dynamicHeaders = fields.map(f => f.label);
  const allHeaders = [...fixedHeaders, ...dynamicHeaders];

  // 1. Create Template Sheet
  const worksheet = XLSX.utils.aoa_to_sheet([allHeaders]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

  // 2. Create Instructions Sheet
  const instructions = [
    ["Cột", "Mô tả", "Định dạng / Lựa chọn", "Bắt buộc"],
    ["Họ và tên", "Họ và tên đầy đủ của người dùng", "Văn bản", "Có"],
    ["Giới tính", "Giới tính của người dùng", "nam / nữ / khác (hoặc male / female / other)", "Có"],
    ["Ngày sinh", "Ngày sinh", "DD-MM-YYYY hoặc YYYY-MM-DD (Ví dụ: 01-01-2000)", "Có"],
    ["Số CCCD/Hộ chiếu", "Số căn cước công dân hoặc hộ chiếu", "Chuỗi số", "Có"],
    ["Địa chỉ", "Địa chỉ hiện tại", "Văn bản", "Không"],
    ["Dân tộc", "Dân tộc", "Văn bản", "Không"],
    ["Tôn giáo", "Tôn giáo", "Văn bản", "Không"],
    ["Mã định danh", "Mã sinh viên hoặc mã nhân viên", "Văn bản", "Có"],
  ];

  if (entityType === "student") {
    instructions.push(["Mã lớp hành chính", "Lớp sinh hoạt hành chính của sinh viên", "Văn bản (Ví dụ: 21CNTT1, 21ATTT1)", "Không"]);
  }

  // Add dynamic fields to instructions
  fields.forEach(f => {
    instructions.push([f.label, "Trường thông tin tùy chỉnh", "Văn bản", f.isRequired ? "Có" : "Không"]);
  });

  const instrSheet = XLSX.utils.aoa_to_sheet(instructions);
  XLSX.utils.book_append_sheet(workbook, instrSheet, "Instructions");

  // 3. Set Column Widths for readability
  const max_width = allHeaders.reduce((w, h) => Math.max(w, h.length), 15);
  worksheet["!cols"] = allHeaders.map(() => ({ wch: max_width }));
  
  // Also set widths for Instructions sheet
  instrSheet["!cols"] = [
    { wch: 25 }, // Column
    { wch: 35 }, // Description
    { wch: 35 }, // Format
    { wch: 12 }  // Required
  ];

  // 4. Write to Buffer
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return buffer as Buffer;
}

/**
 * Parses an uploaded onboarding Excel file and validates its content.
 */
export async function parseAndValidateOnboardingExcel(buffer: Buffer, fields: { label: string, name: string, isRequired: boolean }[]) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets["Template"] || workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];
  
  return rawData.map((row) => {
    const errors: string[] = [];
    
    // Fixed validations supporting both VN and EN headers
    const hasFullName = row["Họ và tên"] || row["Full Name"];
    const hasNationalId = row["Số CCCD/Hộ chiếu"] || row["National ID"];
    const hasEntityCode = row["Mã định danh"] || row["Entity Code"];

    if (!hasFullName) errors.push("Thiếu thông tin: Họ và tên");
    if (!hasNationalId) errors.push("Thiếu thông tin: Số CCCD/Hộ chiếu");
    if (!hasEntityCode) errors.push("Thiếu thông tin: Mã định danh");
    
    // Dynamic validations
    fields.forEach(f => {
      if (f.isRequired && !row[f.label]) {
        errors.push(`Thiếu thông tin: ${f.label}`);
      }
    });

    return {
      data: row,
      errors,
      isValid: errors.length === 0
    } as OnboardingRow;
  });
}

/**
 * Generates an Excel report of the onboarding execution.
 */
export async function generateOnboardingReport(results: OnboardingRow[]) {
  const data = results.map(r => {
    const fullName = r.data["Họ và tên"] || r.data["Full Name"];
    const entityCode = r.data["Mã định danh"] || r.data["Entity Code"];
    const nationalId = r.data["Số CCCD/Hộ chiếu"] || r.data["National ID"];

    return {
      "Họ và tên": fullName,
      "Mã định danh": entityCode,
      "Trạng thái": r.processed ? "THÀNH CÔNG" : "THẤT BẠI",
      "Chi tiết lỗi": r.error || "",
      "Tài khoản truy cập": entityCode,
      "Mật khẩu mặc định": nationalId || entityCode,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Kết quả Onboarding");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return buffer as Buffer;
}

interface RosterStudent {
  student?: {
    code?: string;
    profile?: {
      fullname?: string;
      gender?: string;
    };
  };
  createAt?: string;
}

/**
 * Generates an Excel file for student roster.
 */
export async function generateRosterExcel(students: unknown[]) {
  const data = (students as RosterStudent[]).map(s => {
    return {
      "MSSV": s.student?.code || "",
      "Full Name": s.student?.profile?.fullname || "",
      "Gender": s.student?.profile?.gender || "",
      "Enrollment Date": s.createAt ? new Date(s.createAt).toLocaleDateString() : "",
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Roster");

  // Set column widths
  const headers = ["MSSV", "Full Name", "Gender", "Enrollment Date"];
  worksheet["!cols"] = headers.map(() => ({ wch: 20 }));

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return buffer as Buffer;
}
