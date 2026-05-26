# Thiết kế Chức năng Xem Thời khóa biểu Giảng viên

## Tổng quan
Tạo trang xem thời khóa biểu chuyên biệt cho Giảng viên tại `/teacher/schedule`, đảm bảo tính nhất quán với trải nghiệm của Sinh viên.

## Kiến trúc
- **Route:** `/teacher/schedule`
- **Data Fetching:** Sử dụng `getScheduleByRole("teacher", ...)` từ `scheduling-data.ts`.
- **UI Component:** Tái sử dụng `TimeGrid` từ `src/components/features/academic/TimeGrid.tsx`.
- **Localization:** Cập nhật file ngôn ngữ cho namespace `Teacher.Schedule`.

## Các bước triển khai
1. Tạo file `src/app/[locale]/teacher/schedule/page.tsx`.
2. Cập nhật `messages/en.json` và `messages/vi.json`.
3. Cập nhật Sidebar/Menu giảng viên (nếu xác định được file menu hiện tại).
4. Kiểm tra quyền truy cập (middleware/layout check).

## Kiểm thử
- Xác thực dữ liệu hiển thị khớp với giảng viên đăng nhập.
- Kiểm tra tính đúng đắn của dữ liệu lịch (ngày, tiết, môn, phòng).
- Đảm bảo Sidebar hiển thị đúng.
