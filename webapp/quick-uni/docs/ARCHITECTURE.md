# QuickUni - Kiến trúc & Quy ước Kỹ thuật

Tài liệu này tổng hợp các kiến trúc cốt lõi và quy ước phát triển được áp dụng trong dự án QuickUni.

## 1. Công nghệ (Tech Stack)

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database ORM:** Drizzle ORM
- **Database:** PostgreSQL
- **Authentication:** NextAuth.js v4
- **Styling:** Tailwind CSS, Shadcn UI
- **Validation:** Zod
- **I18n:** next-intl

## 2. Quy ước Thư mục (Project Structure)

- `src/app/[locale]`: Chứa các trang (pages) và layouts theo chuẩn App Router và hỗ trợ đa ngôn ngữ.
- `src/actions`: Chứa các Server Actions. Đây là phương thức chính để thực hiện các Mutations (ghi dữ liệu).
- `src/services`: Chứa logic nghiệp vụ (Business Logic). Các logic phức tạp hoặc Workflow nên được viết ở đây thay vì trực tiếp trong Action.
- `src/db/schemas`: Định nghĩa sơ đồ cơ sở dữ liệu (Drizzle schemas).
- `src/lib/validators`: Chứa các Zod schemas dùng để validate dữ liệu ở cả client và server.
- `src/components/ui`: Các reusable components (chủ yếu từ Shadcn UI).
- `src/components/features`: Các components phức tạp gắn liền với tính năng nghiệp vụ cụ thể.

## 3. Quy ước Lập trình (Coding Conventions)

### 3.1. Dữ liệu & Validation
- Luôn sử dụng Zod để validate dữ liệu từ `formData` hoặc API payload.
- Các validator nên được đặt trong `src/lib/validators`.
- Sử dụng hàm `nullifyEmptyStrings` (trong `src/lib/utils.ts`) để xử lý các chuỗi trống từ form trước khi đưa vào DB.

### 3.2. Server Actions
- Mỗi Action nên trả về một kiểu thống nhất: `{ success: boolean, error?: string }`.
- Luôn bọc trong khối `try...catch` để xử lý lỗi và không làm crash server.
- Sử dụng `revalidatePath` để cập nhật lại dữ liệu trên UI sau khi mutation thành công.

### 3.3. Authentication & Authorization
- Sử dụng `getAuthSession()` để lấy session hiện tại.
- Kiểm tra quyền (RBAC) thông qua các helper trong `src/services/user.ts` (ví dụ: `isAdmin`).

## 4. Đặc điểm nổi bật: Dynamic Profile

Hệ thống sử dụng mô hình hồ sơ linh hoạt (Dynamic Profile):
- `profile_schema`: Định nghĩa một bộ các trường dữ liệu.
- `profile_field`: Định nghĩa chi tiết từng trường (datatype, ui_section, label).
- `profile`: Chứa dữ liệu thực tế trong cột `dynamic_data` (kiểu JSONB), được liên kết với một schema cụ thể.
- Việc tạo/cập nhật Profile phải được validate dựa trên `profile_schema_field` tương ứng.
