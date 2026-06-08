import * as XLSX from "xlsx";
import * as path from "path";
import * as fs from "fs";

export const generateTestOnboardingExcel = () => {
  console.log("📊 Generating test onboarding Excel file...");

  const headers = [
    "Họ và tên",
    "Giới tính",
    "Ngày sinh",
    "Số CCCD/Hộ chiếu",
    "Địa chỉ",
    "Dân tộc",
    "Tôn giáo",
    "Mã định danh",
    "Mã lớp hành chính"
  ];

  // Generate realistic Vietnamese student details that do NOT collide with seeded ones (SV210000 - SV210023)
  // We use SV250001 to SV250010 for pristine, non-colliding test accounts.
  const testStudents = [
    ["Nguyễn Văn An", "nam", "2005-01-15", "001205001234", "Hà Nội", "Kinh", "Không", "SV250001", "21CNTT1"],
    ["Trần Thị Bình", "nữ", "2005-05-20", "002205005678", "Đà Nẵng", "Kinh", "Không", "SV250002", "21CNTT1"],
    ["Lê Hoàng Cường", "nam", "2005-09-10", "003205009012", "TP. Hồ Chí Minh", "Kinh", "Không", "SV250003", "21CNTT1"],
    ["Phạm Minh Đức", "nam", "2005-11-25", "004205003456", "Hải Phòng", "Kinh", "Không", "SV250004", "21CNTT1"],
    ["Hoàng Thu Giang", "nữ", "2005-03-05", "005205007890", "Cần Thơ", "Kinh", "Không", "SV250005", "21CNTT1"],
    ["Đỗ Gia Huy", "nam", "2005-07-30", "006205002345", "Huế", "Tày", "Phật giáo", "SV250006", "21CNTT1"],
    ["Nguyễn Thị Hương", "nữ", "2005-12-12", "007205006789", "Nha Trang", "Kinh", "Không", "SV250007", "21CNTT1"],
    ["Lê Minh Nhật", "nam", "2005-02-28", "008205001112", "Vũng Tàu", "Kinh", "Không", "SV250008", "21CNTT1"],
    ["Phan Thanh Sơn", "nam", "2005-06-18", "009205002223", "Quảng Ninh", "Kinh", "Không", "SV250009", "21CNTT1"],
    ["Vũ Thùy Trang", "nữ", "2005-08-22", "010205003334", "Thái Nguyên", "Mường", "Không", "SV250010", "21CNTT1"]
  ];

  const sheetData = [headers, ...testStudents];
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  const workbook = XLSX.utils.book_new();
  
  XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

  // Set pristine custom column widths for maximum readability in Excel
  worksheet["!cols"] = [
    { wch: 22 }, // Họ và tên
    { wch: 12 }, // Giới tính
    { wch: 15 }, // Ngày sinh
    { wch: 22 }, // Số CCCD/Hộ chiếu
    { wch: 25 }, // Địa chỉ
    { wch: 12 }, // Dân tộc
    { wch: 12 }, // Tôn giáo
    { wch: 18 }, // Mã định danh
    { wch: 20 }  // Mã lớp hành chính
  ];

  // Output location: inside src/db/seeders
  const outputDir = path.join(process.cwd(), "src", "db", "seeders");
  const outputPath = path.join(outputDir, "onboarding_test_data.xlsx");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  fs.writeFileSync(outputPath, buffer);

  console.log(`\n✅ Test onboarding Excel generated successfully!`);
  console.log(`📍 File Location: ${outputPath}\n`);
};

// Check if run directly
const isMain = import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/'));
if (isMain) {
  generateTestOnboardingExcel();
  process.exit(0);
}
