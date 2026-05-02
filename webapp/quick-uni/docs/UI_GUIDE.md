# QuickUni - Hướng dẫn UI & Components

Dự án sử dụng Shadcn UI làm nền tảng cho các thành phần giao diện.

## 1. Thành phần chung (Shared Components)
- `AdminHeader`: Header cho trang quản trị.
- `AdminSidebar`: Sidebar điều hướng.
- `DataTable`: Component hiển thị danh sách dữ liệu với hỗ trợ phân trang và tìm kiếm (đặt tại `src/components/ui/data-table.tsx`).

## 2. Quy ước Form & Dialog
- Sử dụng `react-hook-form` kết hợp với `zod` để quản lý form.
- Các dialog/modal nên được đóng gói thành các components riêng trong `src/components/features`.
- Sử dụng `sonner` để hiển thị thông báo (toast).

## 3. Quản lý Trạng thái (State Management)
- Ưu tiên sử dụng trạng thái cục bộ (`useState`) và Server Actions để đồng bộ dữ liệu.
- Sử dụng `revalidatePath` hoặc `revalidateTag` để làm mới dữ liệu sau khi thực hiện Action.
