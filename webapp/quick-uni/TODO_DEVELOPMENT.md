# QuickUni Development TODO (Based on Technical Sheet Audit)

This list tracks the remaining features required to fulfill the university management system requirements.

## 🟢 Priority 1: Data Foundations (Academic Office)
- [ ] **Quản lý Giảng viên & Nhân sự** (`/academic/people/teachers`)
    - [ ] Trang danh sách giảng viên.
    - [ ] Form CRUD thông tin giảng viên (Email, Khoa, Chức danh).
    - [ ] Liên kết giảng viên với tài khoản hệ thống.
- [ ] **Quản lý Sinh viên** (`/academic/people/students`)
    - [ ] Trang danh sách sinh viên.
    - [ ] Form CRUD thông tin sinh viên (MSSV, Lớp, Khóa).
    - [ ] Liên kết sinh viên với tài khoản hệ thống.
- [ ] **Hoàn thiện Quản lý Khoa/Phòng** (`/academic/departments`)
    - [ ] Thay thế skeleton bằng CRUD hoàn chỉnh.

## 🟡 Priority 2: Role-Specific Detailed Views
- [ ] **Giảng viên: Danh sách lớp & Sinh viên** (`/teacher/classes`)
    - [ ] Xem danh sách lớp học phần được phân công trong học kỳ hiện tại.
    - [ ] Xem danh sách sinh viên cho từng lớp.
- [ ] **Sinh viên: Lớp học phần & Kết quả** (`/student/classes`)
    - [ ] Xem danh sách lớp đã đăng ký.
    - [ ] Xem chi tiết thông tin lớp (Giảng viên, Thời gian).
- [ ] **Sinh viên: Thời khóa biểu chi tiết** (`/student/schedule`)
    - [ ] Trang xem TKB chi tiết toàn học kỳ (View-only TimeGrid).

## 🟠 Priority 3: Workflows & Requests
- [ ] **Sinh viên: Module Yêu cầu** (`/student/requests`)
    - [ ] Form đăng ký xin vắng buổi học.
    - [ ] Form đăng ký hủy lớp học phần (trong thời gian cho phép).
- [ ] **Giảng viên: Yêu cầu đổi lịch** (`/teacher/schedule`)
    - [ ] Gửi yêu cầu thay đổi lịch học tới Phòng Đào tạo.
- [ ] **Phòng Đào tạo: Phê duyệt yêu cầu** (`/academic/requests`)
    - [ ] Dashboard quản lý và phê duyệt các yêu cầu từ GV/SV.

## 🔵 Priority 4: System & Maintenance
- [ ] **Quản trị: Nhật ký hệ thống** (`/admin/system/logs`)
    - [ ] Giao diện xem Audit Logs từ bảng `system_audit_log`.
    - [ ] Bộ lọc theo thời gian, tác nhân, và loại hành động.
- [ ] **Phân quyền: Giao diện phân quyền chi tiết**
    - [ ] Gán quyền (Authorities) cụ thể cho các vai trò (Roles).

---
*Cập nhật lần cuối: 2026-05-25*
