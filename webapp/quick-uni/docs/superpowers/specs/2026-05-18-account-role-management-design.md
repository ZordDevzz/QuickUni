# Sơ đồ Luồng Quản lý Phân quyền Tài khoản (Swimlane Flowchart)

## 1. Mục tiêu
Thiết kế sơ đồ Mermaid mô tả quy trình quản lý vai trò (Roles), gán quyền (Authorities) và gán vai trò cho người dùng (User Role Assignment) trong hệ thống QuickUni. Sơ đồ này giúp hình dung cách Admin kiểm soát ma trận phân quyền.

## 2. Các Actors (Các làn - Swimlanes)
- **System Admin:** Quản trị viên thực hiện các thao tác quản lý phân quyền.
- **Role Service:** Logic nghiệp vụ xử lý việc lưu trữ và liên kết vai trò/quyền.
- **Database:** Lưu trữ các bảng `system_role`, `system_authority`, `system_role_authority`, và `user_system_role`.
- **Target Account:** Tài khoản người dùng được áp dụng các thay đổi về quyền hạn.

## 3. Quy trình chi tiết

### Giai đoạn 1: Định nghĩa vai trò (Role Definition)
- **System Admin:** Tạo mới hoặc cập nhật thông tin Vai trò (Role).
- **System Admin:** Lựa chọn danh sách các Quyền (Authorities) để gán cho vai trò đó.
- **Role Service:** Xử lý logic gán quyền (thông qua `updateRoleAuthorities`).
- **Database:** Xóa mapping cũ và chèn mapping mới vào bảng `system_role_authority`.

### Giai đoạn 2: Gán vai trò cho tài khoản (User Role Assignment)
- **System Admin:** Chọn tài khoản cần phân quyền (Target Account).
- **System Admin:** Chọn các vai trò (Roles) phù hợp cho tài khoản đó.
- **Role Service:** Thực hiện logic gán vai trò người dùng (thông qua `updateUserRoles`).
- **Database:** Cập nhật bảng `user_system_role` để phản ánh các thay đổi.

### Giai đoạn 3: Thực thi quyền hạn (Effective Permissions)
- **Target Account:** Đăng nhập hoặc thực hiện hành động trên hệ thống.
- **Role Service:** Tổng hợp quyền từ tất cả các Roles đã gán để xác định khả năng truy cập.
- **Target Account:** Nhận kết quả (Cho phép hoặc Chặn dựa trên quyền thực tế).

## 4. Cấu trúc thư mục dự kiến
- `docs/diagrams/account-role-management-workflow.md`: Chứa mã Mermaid định nghĩa biểu đồ Swimlane.

## 5. Cú pháp Mermaid áp dụng
Sử dụng `flowchart TD` với các `subgraph` đại diện cho từng Actor. Sử dụng các node hành động và các cạnh (edges) để mô tả luồng bàn giao dữ liệu giữa các bên.
