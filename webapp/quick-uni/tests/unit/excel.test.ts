import { describe, it, expect } from "vitest";
import { generateOnboardingTemplate, parseAndValidateOnboardingExcel } from "@/services/excel";
import * as XLSX from "xlsx";

describe("excel service", () => {
  it("should generate a valid excel buffer with correct headers", async () => {
    const dynamicFields = [
      { label: "Phone Number", name: "phone", isRequired: true },
      { label: "Major", name: "major", isRequired: false },
    ];

    const buffer = await generateOnboardingTemplate(dynamicFields);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);

    const workbook = XLSX.read(buffer, { type: "buffer" });
    expect(workbook.SheetNames).toContain("Template");
    expect(workbook.SheetNames).toContain("Instructions");

    const templateSheet = workbook.Sheets["Template"];
    const data = XLSX.utils.sheet_to_json(templateSheet, { header: 1 }) as string[][];
    const headers = data[0];

    const expectedFixedHeaders = ["Họ và tên", "Giới tính", "Ngày sinh", "Số CCCD/Hộ chiếu", "Địa chỉ", "Dân tộc", "Tôn giáo", "Mã định danh"];
    const expectedDynamicHeaders = ["Phone Number", "Major"];
    const expectedAllHeaders = [...expectedFixedHeaders, ...expectedDynamicHeaders];

    expect(headers).toEqual(expectedAllHeaders);
  });

  it("should correctly parse and validate onboarding excel data", async () => {
    const dynamicFields = [
      { label: "Phone Number", name: "phone", isRequired: true },
      { label: "Major", name: "major", isRequired: false },
    ];

    // Create a mock excel buffer with valid and invalid data
    const headers = ["Họ và tên", "Giới tính", "Ngày sinh", "Số CCCD/Hộ chiếu", "Địa chỉ", "Dân tộc", "Tôn giáo", "Mã định danh", "Phone Number", "Major"];
    const validRow = ["John Doe", "male", "2000-01-01", "123456789", "123 Street", "Kinh", "None", "STU001", "0987654321", "CS"];
    const invalidRow = ["Jane Doe", "female", "2001-01-01", undefined, "456 Ave", "Kinh", "None", "STU002", undefined, "IT"]; // Missing National ID and Phone Number

    const worksheet = XLSX.utils.aoa_to_sheet([headers, validRow, invalidRow]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;

    const result = await parseAndValidateOnboardingExcel(buffer, dynamicFields);

    expect(result).toHaveLength(2);
    
    // Valid row
    expect(result[0].isValid).toBe(true);
    expect(result[0].errors).toHaveLength(0);
    expect(result[0].data["Họ và tên"]).toBe("John Doe");

    // Invalid row
    expect(result[1].isValid).toBe(false);
    expect(result[1].errors).toContain("Thiếu trường thông tin bắt buộc: Số CCCD/Hộ chiếu");
    expect(result[1].errors).toContain("Thiếu trường thông tin bắt buộc: Phone Number");
  });
});
