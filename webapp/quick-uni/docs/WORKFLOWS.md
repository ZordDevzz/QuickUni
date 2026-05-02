# QuickUni - Quy trình Nghiệp vụ (Workflows)

Tài liệu này mô tả các quy trình nghiệp vụ cốt lõi được triển khai trong `src/services`.

## 1. Quy trình Onboarding (Tiếp nhận)

Quy trình này thường được thực hiện bởi Admin để tạo mới hồ sơ và tài khoản cho Sinh viên hoặc Nhân viên.

### Bước 1: Lập hồ sơ (`createProfileWorkflow`)
- **Input:** Dữ liệu hồ sơ cơ bản (họ tên, ngày sinh,...) + `schemaId` + `dynamicData`.
- **Logic:**
  1. Kiểm tra sự tồn tại của `profileSchema`.
  2. Lấy danh sách các fields (`profileSchemaField`) của schema đó.
  3. Kiểm tra tính hợp lệ của `dynamicData` so với schema (các trường bắt buộc, kiểu dữ liệu).
  4. Tạo bản ghi mới trong bảng `profile` (lúc này `accountId` là NULL).

### Bước 2: Liên kết thực thể (`linkProfileToEntity`)
- **Input:** `profileId`, `type` ("student" | "employee"), `code`.
- **Logic:**
  1. Kiểm tra profile có tồn tại không.
  2. Tạo bản ghi trong bảng `student` hoặc `employee` tương ứng, liên kết với `profileId`.

### Bước 3: Cấp tài khoản (`issueAccountWorkflow`)
- **Input:** Thông tin tài khoản (username, password, type) + `profileId`.
- **Logic:**
  1. Kiểm tra hồ sơ đã có tài khoản chưa.
  2. Tạo tài khoản mới (`createAccountWorkflow`).
  3. Cập nhật `accountId` vào bản ghi `profile`.
  4. Gán quyền hệ thống (`userSystemRole`) nếu có.

## 2. Quy trình Cấp tài khoản hàng loạt (`bulkProvisioningWorkflow`)

Dùng để cấp tài khoản nhanh cho một nhóm hồ sơ đã có nhưng chưa có tài khoản.

- **Target:** Các `profile` có `accountId` là NULL.
- **Username Pattern:** Sử dụng mã sinh viên hoặc mã nhân viên (`code`) làm username.
- **Audit:** Mỗi tài khoản được tạo đều tạo một bản ghi `accountAudit`.

## 3. Quy trình Quản lý Tài khoản (`AccountWorkflow`)

Nằm trong `src/services/user.ts`, đảm bảo mọi thay đổi về tài khoản đều được lưu vết.
- `createAccountWorkflow`
- `updateAccountWorkflow`
- `deleteAccountWorkflow`
Tất cả các hàm này đều tự động tạo bản ghi trong bảng `account_audit` để theo dõi ai đã làm gì, lúc nào, và dữ liệu cũ/mới là gì.
