# Sơ đồ Luồng Authentication & RBAC (Swimlane Flowchart)

## 1. Mục tiêu
Thiết kế sơ đồ Mermaid mô tả quy trình Đăng nhập và Kiểm soát quyền dựa trên vai trò (RBAC) trong hệ thống QuickUni. Sơ đồ tập trung vào sự phối hợp giữa NextAuth, JWT và các service kiểm tra quyền trong DB.

## 2. Các Actors (Các làn - Swimlanes)
- **End User:** Người dùng cuối thực hiện đăng nhập và truy cập tài nguyên.
- **NextAuth Handler:** Bộ xử lý xác thực trung tâm (xử lý Credentials Provider, JWT và Session callbacks).
- **Database:** Nơi lưu trữ thông tin tài khoản (`account`), vai trò (`system_role`) và phân quyền (`user_system_role`).
- **Access Control Layer:** Lớp bảo vệ (Middleware/Server Actions) kiểm tra quyền hạn trước khi thực thi logic nghiệp vụ.

## 3. Quy trình chi tiết

### Giai đoạn 1: Xác thực (Authentication)
- **End User:** Nhập Username/Password vào form login.
- **NextAuth Handler:** Nhận credentials, gọi service `getUserByUsername`.
- **Database:** Trả về thông tin Account kèm password hash (`pwdHash`).
- **NextAuth Handler:** So sánh mật khẩu bằng `bcrypt.compare`.
- **NextAuth Handler:** Nếu thành công, tạo JWT chứa `id`, `name`, `type` và trả về Session cho client.

### Giai đoạn 2: Kiểm soát quyền (Authorization - RBAC)
- **End User:** Gửi yêu cầu truy cập tài nguyên bảo mật (ví dụ: trang Admin).
- **Access Control Layer:** Lấy `userId` từ Session.
- **Access Control Layer:** Gọi hàm `isAdmin(userId)` hoặc kiểm tra danh sách `userSystemRoles`.
- **Database:** Truy vấn bảng `user_system_role` để tìm mapping giữa User và Role Admin (ID=1).
- **Access Control Layer:** 
    - Nếu có quyền: Cho phép truy cập (Allow).
    - Nếu không: Trả về lỗi 403 (Forbidden).

## 4. Cấu trúc thư mục dự kiến
- `docs/diagrams/auth-rbac-workflow.md`: Chứa mã Mermaid định nghĩa biểu đồ Swimlane.

## 5. Cú pháp Mermaid áp dụng
Sử dụng `flowchart TD` với các `subgraph` đại diện cho từng Actor. Các node sẽ mô tả hành động cụ thể và các cạnh (edges) mô tả luồng dữ liệu/quy trình.
