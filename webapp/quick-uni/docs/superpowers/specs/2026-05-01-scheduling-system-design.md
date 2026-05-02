# Thiết kế chức năng Quản lý Thời khóa biểu (Scheduling System Design)

**Ngày:** 2026-05-01
**Trạng thái:** Draft
**Tác giả:** Gemini CLI

## 1. Mục tiêu (Objectives)
Xây dựng hệ thống xếp thời khóa biểu tự động và thủ công cho QuickUni, tối ưu hóa việc sử dụng phòng học và thời gian của giảng viên dựa trên các ràng buộc cứng.

## 2. Kiến trúc hệ thống (Architecture)
Hệ thống sử dụng phương pháp **Hybrid Bitmask-Backtracking** chạy trực tiếp trên Node.js.

### 2.1. Biểu diễn thời gian (Bitmask)
- Mỗi ngày được chia thành 15 tiết (1-15).
- Sử dụng một số nguyên 16-bit (Integer) để đại diện cho 1 ngày.
- Bit thứ `i` (0-14) tương ứng với tiết `i+1`.
- **Ưu điểm:** Phép toán Bitwise (AND, OR, NOT) giúp kiểm tra xung đột và tìm khoảng trống với độ trễ cực thấp (O(1)).

### 2.2. Chiến lược "Tuần mẫu" (Sample Week)
- Thay vì xếp lịch cho cả học kỳ, thuật toán chỉ giải bài toán cho 1 tuần mẫu (Thứ 2 - Chủ nhật).
- Sau khi có tuần mẫu, hệ thống "trải" (populate) dữ liệu ra toàn bộ học kỳ trong bảng `schedule` thực tế, có tính đến các ngày nghỉ lễ (Blacklist).

## 3. Cấu trúc dữ liệu (Data Structures)

### 3.1. Database Schema (Drizzle ORM)
Cập nhật hoặc thêm mới các bảng sau trong `src/db/schemas/schedule.ts`:

1.  **`availability`**: Lưu ràng buộc bận/rảnh cố định của GV, Phòng, Môn học.
    - `entity_id`: UUID
    - `entity_type`: enum('teacher', 'room', 'subject', 'global')
    - `day_of_week`: 0-6
    - `occupied_mask`: integer (15-bit mask)

2.  **`weekly_template`**: Lưu kết quả xếp lịch mẫu.
    - `course_class_id`: UUID (FK)
    - `room_id`: smallint (FK)
    - `day_of_week`: 0-6
    - `start_period`: 1-15
    - `end_period`: 1-15
    - `occupy_mask`: integer

3.  **`holiday_blacklist`**: Lưu các ngày nghỉ cụ thể trong năm.
    - `date`: Date
    - `name`: varchar
    - `is_global`: boolean

### 3.2. Thuật toán Auto-Schedule (Backtracking)
- **Heuristic:** Sử dụng **MRV (Minimum Remaining Values)**. Lớp nào có ít lựa chọn về phòng hoặc GV nhất sẽ được xếp trước.
- **Constraints (Ràng buộc):**
    - `(RoomMask & NewMask) === 0` (Phòng không bị trùng)
    - `(TeacherMask & NewMask) === 0` (GV không bị trùng)
    - `(GlobalBlacklist & NewMask) === 0` (Tránh giờ giới nghiêm)

## 4. Quy trình nghiệp vụ (Workflows)

### 4.1. Xếp lịch tự động
1.  **Input:** Danh sách `course_class` của học kỳ, danh sách `room`, `availability`.
2.  **Process:** Chạy thuật toán Backtracking để điền vào `weekly_template`.
3.  **Output:** Một tuần mẫu hoàn chỉnh không có xung đột.

### 4.2. Xếp lịch thủ công & Override
- Khi User kéo thả/chỉnh sửa tiết học:
    - Kiểm tra xung đột tức thì bằng Bitmask.
    - Nếu chọn "Override": Xóa lịch cũ, chèn lịch mới, và (tùy chọn) chạy lại bộ giải cho các lớp bị ảnh hưởng.

### 4.3. Xuất bản (Publishing)
- Duyệt qua từng ngày trong học kỳ (`startDate` -> `endDate` của Semester).
- Nếu ngày đó không nằm trong `holiday_blacklist`, copy từ `weekly_template` sang bảng `schedule`.

## 5. Kế hoạch thực hiện (Implementation Plan)
1.  **Phase 1:** Cập nhật DB Schema và viết Utility xử lý Bitmask.
2.  **Phase 2:** Viết logic tìm kiếm khoảng trống (Sliding Window trên Bitmask).
3.  **Phase 4:** Hiện thực hóa thuật toán Backtracking cho tuần mẫu.
4.  **Phase 5:** Xây dựng API và UI quản lý (Table/Calendar view).

---
*Ghi chú: CP-SAT được thay thế bằng Backtracking thuần Node.js để phù hợp với hạ tầng dự án sinh viên.*
