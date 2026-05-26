# QuickUni Development TODO (Based on Technical Sheet Audit)

This list tracks the remaining features required to fulfill the university management system requirements.

## 🟢 Priority 1: Data Foundations (Academic Office)
- [x] **Quản lý Giảng viên & Nhân sự** (`/academic/people/teachers`)
    - [x] Trang danh sách giảng viên.
    - [x] Form CRUD thông tin giảng viên (Email, Khoa, Chức danh).
    - [x] Liên kết giảng viên với tài khoản hệ thống.
- [x] **Quản lý Sinh viên** (`/academic/people/students`)
    - [x] Trang danh sách sinh viên.
    - [x] Form CRUD thông tin sinh viên (MSSV, Lớp, Khóa).
    - [x] Liên kết sinh viên với tài khoản hệ thống.
- [x] **Hoàn thiện Quản lý Khoa/Phòng** (`/academic/departments`)
    - [x] Thay thế skeleton bằng CRUD hoàn chỉnh (Master-Detail).

## 🟡 Priority 2: Role-Specific Detailed Views
- [x] **Giảng viên: Danh sách lớp & Sinh viên** (`/teacher/classes`)
    - [x] Xem danh sách lớp học phần được phân công trong học kỳ hiện tại.
    - [x] Xem danh sách sinh viên cho từng lớp (Student Roster).
- [x] **Sinh viên: Lớp học phần & Kết quả** (`/student/classes`)
    - [x] Xem danh sách lớp đã đăng ký (Card Grid).
    - [x] Xem chi tiết thông tin lớp (Giảng viên, Thời gian, Tài liệu, Điểm số).
- [x] **Sinh viên: Thời khóa biểu chi tiết** (`/student/schedule`)
    - [x] Trang xem TKB chi tiết toàn học kỳ (View-only TimeGrid).

## 🟠 Priority 3: Workflows & Requests
- [x] **Sinh viên: Module Yêu cầu** (`/student/requests`)
    - [x] Form đăng ký xin vắng buổi học.
    - [x] Form đăng ký hủy lớp học phần (trong thời gian cho phép).
- [ ] **Giảng viên: Yêu cầu đổi lịch** (`/teacher/schedule`)
    - [ ] Gửi yêu cầu thay đổi lịch học tới Phòng Đào tạo (Giao diện đang chờ).
- [x] **Phòng Đào tạo & Giảng viên: Phê duyệt yêu cầu** (`/academic/requests`, `/teacher/requests`)
    - [x] Dashboard quản lý và phê duyệt các yêu cầu từ GV/SV.
    - [x] Tự động hóa Side Effects (Hủy lớp -> Gỡ enrollment & Giảm sĩ số).

## 🔵 Priority 4: System & Maintenance
- [ ] **Quản trị: Nhật ký hệ thống** (`/admin/system/logs`)
    - [ ] Giao diện xem Audit Logs từ bảng `system_audit_log`.
    - [ ] Bộ lọc theo thời gian, tác nhân, và loại hành động.
- [ ] **Phân quyền: Giao diện phân quyền chi tiết**
    - [ ] Gán quyền (Authorities) cụ thể cho các vai trò (Roles).

---
*Cập nhật lần cuối: 2026-05-25*
