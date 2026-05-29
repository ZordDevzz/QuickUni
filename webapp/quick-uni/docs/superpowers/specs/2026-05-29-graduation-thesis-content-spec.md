# Design Spec: Graduation Thesis Report Generation - QuickUni

## 1. Mục tiêu
Tạo ra bộ tài liệu (6-8 tệp .txt) phục vụ viết báo cáo Khóa luận tốt nghiệp với nội dung tiếng Việt, chuyên sâu, độ dài lớn và giàu chi tiết kỹ thuật.

## 2. Cấu trúc Tài liệu (Outputs)

### Tệp 1: `01_Mo_Dau_va_Tong_Quan.txt` (~2000+ từ)
- **Nội dung:** Bối cảnh giáo dục 4.0, sự cần thiết của hệ thống quản lý linh hoạt. Phân tích các hạn chế của phần mềm quản lý giáo dục hiện hữu (SaaS truyền thống). Giới thiệu về triết lý "QuickUni" (Nhanh - Linh hoạt - Tự động).
- **Điểm nhấn:** Phân tích sự khác biệt giữa cấu trúc dữ liệu tĩnh và động.

### Tệp 2: `02_Phan_Tich_Yeu_Cau_Nghiep_Vu.txt` (~2500+ từ)
- **Nội dung:** Phân tích chi tiết các tác nhân (Actors). Đặc tả Use Case cho: Onboarding (Cấp tài khoản hàng loạt), Quản lý hồ sơ động, Lập thời khóa biểu. 
- **Ràng buộc:** Liệt kê hàng chục ràng buộc (hard & soft constraints) trong bài toán lập lịch thực tế (trùng phòng, trùng giáo viên, lịch nghỉ, khung giờ bận, lớp liên tục).

### Tệp 3: `03_Kien_Truc_He_Thong_va_CSDL.txt` (~3000+ từ)
- **Nội dung:** Chi tiết Tech Stack (Next.js 15, Drizzle, PostgreSQL). 
- **Thiết kế CSDL:** Giải trình sâu về mô hình `profile_schema` & `profile_field`. Tại sao dùng JSONB? Ưu nhược điểm và cách xử lý Indexing trong JSONB.
- **Sơ đồ:** Placeholders cho ERD, Component Diagram, Data Flow Diagram.

### Tệp 4: `04_Giai_Phap_Thuat_Toan_Scheduling.txt` (~4000+ từ - Chương trọng tâm)
- **Nội dung:** 
    - Giải thích về cơ chế Bitmask 15-bit (15 tiết học/ngày). Tại sao chọn 15-bit? Cách thực hiện phép toán AND/OR để kiểm tra xung đột trong O(1).
    - Thuật toán Backtracking: Cách chọn thứ tự ưu tiên lớp học, cách tối ưu hóa không gian tìm kiếm.
    - Sliding Window: Tìm slot trống cho các lớp có số tiết khác nhau.
    - Cơ chế Override và Re-schedule: Logic bảo toàn blacklist khi sắp xếp lại.
- **Minh họa:** Pseudo-code và trích dẫn logic từ `scheduler.ts`.

### Tệp 5: `05_Trien_Khai_Quy_Trinh_Onboarding.txt` (~2500+ từ)
- **Nội dung:** Logic xử lý Excel (Excel parsing & validation). Quy trình 3 bước (Create Profile -> Link Entity -> Issue Account). Cơ chế Audit Trail (theo dõi vết thay đổi tài khoản).
- **Mã nguồn:** Giải thích các Workflow service trong `src/services/onboarding.ts`.

### Tệp 6: `06_Kiem_Thu_va_Ket_Luan.txt` (~2000+ từ)
- **Nội dung:** Các kịch bản kiểm thử (Test Cases) cho thuật toán. Kết quả đo lường hiệu năng. 
- **Hướng phát triển:** Roadmap Phase 2 & 3 (AI, Finance, Grade). Kết luận về tính khả thi và đóng góp của đề tài.

## 3. Quy trình thực hiện (YOLO Session)
Tôi sẽ thực hiện một chuỗi các turn liên tiếp để:
1. Đọc kỹ mã nguồn từng phần tương ứng.
2. Viết nội dung bằng tiếng Việt với văn phong học thuật cao.
3. Chèn các Placeholder cho hình ảnh/sơ đồ/bảng biểu một cách logic.
4. Đảm bảo mỗi tệp đều "dày cộp" bằng cách phân tích kỹ các case edge (trường hợp biên) và lý thuyết nền tảng.

## 4. Tự đánh giá (Self-Review)
- [ ] Nội dung tiếng Việt chuẩn xác, trang trọng?
- [ ] Có đủ placeholder cho sơ đồ?
- [ ] Các đoạn mã nguồn có được giải thích cặn kẽ?
- [ ] Độ dài đạt yêu cầu "dày cộp"?
