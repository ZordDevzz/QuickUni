# Sơ đồ Luồng hệ thống Scheduling (Swimlane Flowchart)

## 1. Mục tiêu
Thiết kế các sơ đồ dạng Mermaid lưu trong thư mục `docs/diagrams` (hoặc cấu trúc thư mục được chỉ định) để mô tả chi tiết luồng nghiệp vụ của hệ thống Sắp lịch (Scheduling). Sơ đồ cần làm nổi bật vai trò của các Actors và sự tương tác của họ qua từng giai đoạn.

## 2. Các Actors (Các làn - Swimlanes)
- **Academic Admin (Quản lý đào tạo):** Điều phối viên chính, người thiết lập học kỳ và ra quyết định công bố lịch.
- **Instructor (Giảng viên):** Cung cấp các ràng buộc về thời gian.
- **QuickUni System:** Hệ thống xử lý lõi (bao gồm Bitmask conflict detection và Backtracking solver).
- **Student (Sinh viên):** Người xem kết quả.

## 3. Quy trình chi tiết (Các bước trong sơ đồ)

### Giai đoạn 1: Khởi tạo (Initialization)
- **Admin:** Tạo mới một Học kỳ (Semester).
- **Admin:** Import hoặc tạo dữ liệu Môn học (Courses), Lớp học (Classes), và Phòng học (Rooms).
- **System:** Lưu trữ thông tin và chuẩn bị cấu trúc dữ liệu cho học kỳ.

### Giai đoạn 2: Thu thập ràng buộc (Constraint Gathering)
- **Instructor:** Cập nhật thời gian bận/nghỉ (Availability / Blacklists).
- **Admin (Tùy chọn):** Quản lý ngày nghỉ lễ (Holidays) cho toàn trường hoặc học kỳ.

### Giai đoạn 3: Xử lý Sắp xếp (Processing & Generation)
- **Admin:** Kích hoạt tính năng Sắp lịch tự động (Auto-Generate).
- **System:** 
  - Áp dụng kỹ thuật Bitmask 15-bit để kiểm tra xung đột thời gian (O(1)).
  - Chạy thuật toán Backtracking để tìm vị trí trống (slots) cho từng lớp học, đảm bảo không có xung đột Giảng viên và Phòng học.
  - Lưu kết quả dự thảo (Draft Schedule).

### Giai đoạn 4: Điều chỉnh & Công bố (Refinement & Publishing)
- **Admin:** Xem lại lịch dự thảo (Draft).
- **Admin:** Điều chỉnh thủ công bằng tính năng Kéo/Thả (Drag/Drop) hoặc Manual Edit nếu cần.
- **System:** Xác thực các điều chỉnh thủ công để đảm bảo không vi phạm ràng buộc (Validate).
- **Admin:** Duyệt và Công bố lịch (Publish).
- **Student & Instructor:** Xem lịch đã chốt trên giao diện cá nhân.

## 4. Cấu trúc thư mục dự kiến
- `docs/diagrams/scheduling-actors-workflow.md`: Chứa mã Mermaid định nghĩa biểu đồ Swimlane.

## 5. Cú pháp Mermaid áp dụng
Sử dụng `flowchart TD` với các `subgraph` để đại diện cho từng Actor. Mũi tên (edges) sẽ đi qua lại giữa các subgraphs để thể hiện luồng bàn giao dữ liệu.