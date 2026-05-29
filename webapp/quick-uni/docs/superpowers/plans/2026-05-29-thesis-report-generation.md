# Graduation Thesis Report Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tự động tạo bộ hồ sơ báo cáo Khóa luận tốt nghiệp dày khoảng 75-100 trang (dạng .txt) bằng tiếng Việt, phân tích sâu các module Dynamic Profile và Scheduling của QuickUni dưới góc nhìn kỹ thuật kết hợp với tài liệu sản phẩm cho khách hàng.

**Architecture:** Sử dụng Sub-agents (@generalist) để "cày" nội dung chi tiết cho từng chương dựa trên mã nguồn thực tế. Mỗi chương được chia nhỏ thành các tệp con để tránh quá tải context.

**Tech Stack:** Sub-agent (@generalist), Git, Filesystem.

---

### Task 1: Khởi tạo cấu trúc thư mục báo cáo

**Files:**
- Create: `docs/thesis_report/.gitkeep`

- [ ] **Step 1: Tạo thư mục chứa báo cáo**
Run: `mkdir docs/thesis_report`
- [ ] **Step 2: Commit khởi tạo**
Run: `git add docs/thesis_report && git commit -m "docs: initialize thesis report directory"`

---

### Task 2: Chương 1 - Tầm nhìn Sản phẩm và Tổng quan (3 tệp con)

**Files:**
- Create: `docs/thesis_report/Chương_1.1_Vấn_đề_và_Giải_pháp.txt`
- Create: `docs/thesis_report/Chương_1.2_Giá_trị_Cốt_lõi_cho_Khách_hàng.txt`
- Create: `docs/thesis_report/Chương_1.3_Tổng_quan_Hệ_sinh_thái_QuickUni.txt`

- [ ] **Step 1: Giao Sub-agent viết Chương 1.1**
Prompt: "Phân tích nỗi đau của các trường đại học khi dùng phần mềm cũ (cứng nhắc, khó dùng). Giới thiệu QuickUni như một giải pháp 'may đo' linh hoạt. Mục tiêu > 800 từ."
- [ ] **Step 2: Giao Sub-agent viết Chương 1.2**
Prompt: "Viết về các lợi ích trực tiếp: Tiết kiệm 80% thời gian lập lịch, quản lý hồ sơ không giới hạn, giảm sai sót nhân sự. Mục tiêu > 700 từ."
- [ ] **Step 3: Giao Sub-agent viết Chương 1.3**
Prompt: "Mô tả hệ sinh thái sản phẩm dưới góc nhìn người dùng: Admin làm gì, Giảng viên nhận được gì, Sinh viên trải nghiệm gì. Mục tiêu > 700 từ."
- [ ] **Step 4: Commit Chương 1**
Run: `git add docs/thesis_report/Chương_1.* && git commit -m "docs: add chapter 1 content"`

---

### Task 3: Chương 2 - Trải nghiệm Người dùng và Nghiệp vụ (2 tệp con)

**Files:**
- Create: `docs/thesis_report/Chương_2.1_Hành_trình_Người_dùng.txt`
- Create: `docs/thesis_report/Chương_2.2_Các_Quy_tắc_Vận_hành.txt`

- [ ] **Step 1: Phân tích User Journey**
Prompt: "Mô tả chi tiết luồng công việc của một Cán bộ đào tạo từ lúc tiếp nhận hồ sơ đến lúc xuất thời khóa biểu. Nhấn mạnh tính tiện dụng. Mục tiêu > 1200 từ."
- [ ] **Step 2: Đặc tả ràng buộc dưới ngôn ngữ nghiệp vụ**
Prompt: "Giải thích các ràng buộc lập lịch bằng ngôn ngữ mà khách hàng hiểu được (Ví dụ: 'Đảm bảo giáo viên không phải chạy giữa 2 cơ sở trong 1 buổi'). Mục tiêu > 1300 từ."
- [ ] **Step 3: Commit Chương 2**
Run: `git add docs/thesis_report/Chương_2.* && git commit -m "docs: add chapter 2 content"`

---

### Task 4: Chương 3 - Nền tảng Công nghệ Tin cậy (3 tệp con)

**Files:**
- Create: `docs/thesis_report/Chương_3.1_Tại_sao_chọn_Tech_Stack_này.txt`
- Create: `docs/thesis_report/Chương_3.2_Sức_mạnh_của_Dynamic_Profile.txt`
- Create: `docs/thesis_report/Chương_3.3_An_toàn_và_Bảo_mật_Dữ_liệu.txt`

- [ ] **Step 1: Giải thích lợi ích của Tech Stack hiện đại**
Prompt: "Tại sao Next.js 15 và Cloud-native lại quan trọng với tốc độ và sự ổn định của khách hàng. Mục tiêu > 1000 từ."
- [ ] **Step 2: Giá trị của Dynamic Profile đối với quản trị**
Prompt: "Khách hàng có thể tự thêm trường dữ liệu (số điện thoại phụ, địa chỉ mạng xã hội...) mà không cần gọi thợ code. Nhấn mạnh tính tự chủ. Mục tiêu > 1200 từ."
- [ ] **Step 3: Bảo mật và Audit Trail**
Prompt: "Giải thích cách hệ thống bảo vệ dữ liệu và lưu vết (Ai đã sửa gì) để khách hàng yên tâm về tính minh bạch. Mục tiêu > 1000 từ."
- [ ] **Step 4: Commit Chương 3**
Run: `git add docs/thesis_report/Chương_3.* && git commit -m "docs: add chapter 3 content"`

---

### Task 5: Chương 4 - Công nghệ Lập lịch Tự động (4 tệp con)

**Files:**
- Create: `docs/thesis_report/Chương_4.1_Độ_chính_xác_tuyệt_đối_với_Bitmask.txt`
- Create: `docs/thesis_report/Chương_4.2_Trí_tuệ_nhân_tạo_trong_Lập_lịch.txt`
- Create: `docs/thesis_report/Chương_4.3_Tính_linh_hoạt_trong_hiệu_chỉnh.txt`
- Create: `docs/thesis_report/Chương_4.4_Tối_ưu_hóa_nguồn_lực_phòng_học.txt`

- [ ] **Step 1: Bitmask dưới góc nhìn độ tin cậy**
Prompt: "Giải thích tại sao cơ chế Bitmask giúp loại bỏ hoàn toàn lỗi trùng lịch - lỗi ám ảnh nhất của các phòng đào tạo. Mục tiêu > 1200 từ."
- [ ] **Step 2: Backtracking - 'Bộ não' của hệ thống**
Prompt: "Mô tả cách hệ thống 'suy nghĩ' để tìm ra phương án tốt nhất cho hàng trăm lớp học chỉ trong vài giây. Mục tiêu > 1500 từ."
- [ ] **Step 3: Khả năng can thiệp thủ công (Manual Override)**
Prompt: "Khách hàng vẫn là người quyết định cuối cùng: Cách hệ thống hỗ trợ con người điều chỉnh lịch mà vẫn đảm bảo các ràng buộc. Mục tiêu > 800 từ."
- [ ] **Step 4: Hiệu quả sử dụng tài sản**
Prompt: "Làm thế nào hệ thống giúp tối ưu hóa công suất sử dụng phòng học, tránh lãng phí. Mục tiêu > 700 từ."
- [ ] **Step 5: Commit Chương 4**
Run: `git add docs/thesis_report/Chương_4.* && git commit -m "docs: add chapter 4 content"`

---

### Task 6: Chương 5 - Onboarding và Thực thi (2 tệp con)

**Files:**
- Create: `docs/thesis_report/Chương_5.1_Quy_trình_Onboarding.txt`
- Create: `docs/thesis_report/Chương_5.2_Xử_lý_Excel_và_Audit.txt`

- [ ] **Step 1: Mô tả Workflow Onboarding**
Prompt: "Phân tích workflow 3 bước trong src/services/onboarding.ts dưới góc nhìn sự tiện lợi cho Admin. Mục tiêu > 1200 từ."
- [ ] **Step 2: Mô tả cơ chế Excel và Log**
Prompt: "Giải thích cách parse Excel hàng loạt giúp giảm 90% thời gian nhập liệu thủ công. Mục tiêu > 1300 từ."
- [ ] **Step 3: Commit Chương 5**
Run: `git add docs/thesis_report/Chương_5.* && git commit -m "docs: add chapter 5 content"`

---

### Task 7: Chương 6 - Lộ trình và Kết luận (2 tệp con)

**Files:**
- Create: `docs/thesis_report/Chương_6.1_Lộ_trình_Phase_2_3.txt`
- Create: `docs/thesis_report/Chương_6.2_Kết_luận_Chung.txt`

- [ ] **Step 1: Viết về hướng phát triển tương lai**
Prompt: "Mô tả việc tích hợp AI, Module Tài chính, Quản lý điểm dưới dạng các gói nâng cấp giá trị cho khách hàng. Mục tiêu > 1000 từ."
- [ ] **Step 2: Viết kết luận và tổng kết**
Prompt: "Tổng kết các kết quả đạt được và cam kết về chất lượng sản phẩm. Mục tiêu > 1000 từ."
- [ ] **Step 3: Commit hoàn tất**
Run: `git add docs/thesis_report/Chương_6.* && git commit -m "docs: complete thesis report generation"`
