# Thiết kế Giao diện Quản lý Thời khóa biểu (Scheduling UI Design)

**Ngày:** 2026-05-01
**Trạng thái:** Draft
**Tác giả:** Gemini CLI

## 1. Mục tiêu (Objectives)
Xây dựng giao diện trực quan cho phép Admin quản lý, tạo mới và tinh chỉnh thời khóa biểu mẫu (Weekly Template) trước khi xuất bản ra toàn học kỳ.

## 2. Bố cục Giao diện (Layout Structure)
Sử dụng mô hình **Tabbed Master Grid** (Phương án 1 đã chọn).

### 2.1. Thanh điều hướng Tab (Top Tabs)
- **Lịch theo Phòng học (Room View)**
- **Lịch theo Giảng viên (Teacher View)**
- **Lịch theo Lớp học phần (Course Class View)**

### 2.2. Sidebar lựa chọn thực thể (Entity Sidebar)
- Nằm bên trái khu vực chính.
- Hiển thị danh sách các thực thể tương ứng với Tab hiện tại (Ví dụ: danh sách các phòng học).
- Có ô tìm kiếm nhanh (Search bar).

### 2.3. Lưới thời gian chính (TimeGrid)
- Hiển thị theo cấu hình 7x15 (Thứ 2 - Chủ nhật, 15 tiết/ngày).
- Mỗi ô hiển thị trạng thái: Trống, Có lịch (Tên môn, GV, Phòng), hoặc Bận (Blacklist).
- **Tương tác:** Click vào ô trống để mở Form thêm lịch; Click vào lịch hiện có để Sửa/Xóa.

## 3. Các thành phần chính (Components)

### 3.1. Component `TimeGrid`
- Nhận vào `data` là mảng các `Assignment` của thực thể đang chọn.
- Xử lý việc render các "Block" thời gian dựa trên `startPeriod` và `endPeriod`.

### 3.2. Component `EntitySidebar`
- Tải danh sách thực thể từ API (Phòng, GV, Lớp).
- Quản lý trạng thái `selectedId` để báo cho `TimeGrid` cập nhật dữ liệu.

### 3.3. Dialog Chỉnh sửa (ScheduleDialog)
- Hiển thị khi người dùng click vào Grid.
- Cho phép chọn Lớp học phần, Phòng, GV và khoảng thời gian.
- **Validation:** Gọi API `validateManualEdit` để kiểm tra xung đột trước khi lưu.

## 4. Quy trình tương tác (Workflows)

1.  **Xếp lịch mẫu:**
    - Admin chọn Tab "Phòng học" -> Chọn một phòng trống.
    - Click vào các tiết muốn xếp lịch -> Form hiện ra -> Chọn Lớp và GV.
    - Hệ thống tự động kiểm tra xung đột bằng Bitmask Utility đã viết ở Task 6.
2.  **Tự động tạo (Auto-Generate):**
    - Một nút "Xếp lịch tự động" nằm ở Toolbar phía trên.
    - Khi click, hệ thống gọi service `solveWeekly` và cập nhật lại Grid.
3.  **Xuất bản (Publish):**
    - Nút "Xuất bản ra Học kỳ" sẽ thực hiện việc copy dữ liệu từ `weekly_template` sang `schedule`.

## 5. Kế hoạch thực hiện (Implementation Plan)
1.  **Task 1:** Xây dựng cấu trúc Page và Sidebar lựa chọn.
2.  **Task 2:** Phát triển Component `TimeGrid` cơ bản (chỉ hiển thị).
3.  **Task 3:** Tích hợp logic Click-to-Edit và Validation API.
4.  **Task 4:** Thêm các nút điều khiển (Auto-Generate, Publish).

---
*Ghi chú: UI sẽ sử dụng phong cách của QuickUni Admin (Shadcn/UI + Tailwind CSS).*
