# Thiết kế Hệ thống Seeder Dữ liệu Mẫu (Modular Seeder System)

## Tổng quan
Thiết kế hệ thống seeder dữ liệu mới theo kiến trúc Factory-based, đảm bảo tính nhất quán (contextual integrity) và khả năng vận hành thử nghiệm toàn bộ các tính năng theo Technical Sheet.

## 1. SchemaFields Dynamic (JSONB)
Cấu trúc `dynamicData` cho các vai trò sẽ được khởi tạo qua các bộ template `SchemaField` sau:

### Teacher Dynamic Data
- `bank_info`: { `bank_name`: string, `account_number`: string }
- `tax_info`: { `tax_id`: string }
- `research_interests`: string[]
- `office_location`: string

### Student Dynamic Data
- `family_info`: { `father_name`: string, `mother_name`: string, `permanent_address`: string }
- `extracurriculars`: string[]

### Academic Office Dynamic Data
- `authorized_departments`: string[] (Danh sách bộ phận được quản lý)
- `emergency_contact`: { `name`: string, `phone`: string }

## 2. Kiến trúc Factory
Hệ thống sử dụng Pattern: `Factory<T>(context: Context) => T`
- **Dependency Graph:** `SystemRole` -> `Department` -> `Employee/Student` -> `Academic Entities` -> `Scheduling`.
- **Registry:** Sau khi tạo, mỗi Factory trả về `RegistryID` để các Factory sau sử dụng (đảm bảo tính toàn vẹn dữ liệu).

## 3. Quy trình Vận hành thử (Verification Engine)
Sau khi seed, hệ thống chạy suite kiểm tra:
1. **API/Route Availability:** Thử query qua Server Actions tương ứng (e.g., `getScheduleByRole`) cho từng role.
2. **RBAC Validation:** Kiểm tra quyền truy cập route `/admin`, `/teacher`, `/student` dựa trên Role đã seed.
3. **Log Output:** Báo cáo chi tiết kết quả nạp dữ liệu.

## 4. Các bước triển khai
1. Định nghĩa `SchemaFields` cho dynamic data trong `src/db/seeders/profiles/templates.ts`.
2. Viết các Factory: `TeacherFactory`, `StudentFactory`, `AcademicOfficeFactory`.
3. Refactor `seed.ts` để sử dụng Graph-based execution.
4. Triển khai suite kiểm thử `validateSeed()` để chạy sau khi seed xong.
