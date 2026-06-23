# Hướng Dẫn Sử Dụng — Cán Bộ Đào Tạo (Academic Staff)

> **Hệ thống:** QuickUni — Nền tảng quản lý giáo dục đại học
> **Phiên bản tài liệu:** 1.0
> **Đối tượng:** Cán bộ Phòng Đào tạo (Academic Office — Role ID: 4)
> **Cập nhật lần cuối:** 2026-06-15

---

## Mục Lục

1. [Giới thiệu vai trò Cán bộ Đào tạo](#1-giới-thiệu-vai-trò-cán-bộ-đào-tạo)
2. [Đăng nhập và điều hướng](#2-đăng-nhập-và-điều-hướng)
3. [Dashboard — Trang tổng quan Đào tạo](#3-dashboard--trang-tổng-quan-đào-tạo)
4. [Quản lý Lớp chính (Main Classes)](#4-quản-lý-lớp-chính-main-classes)
5. [Quản lý Học phần (Subjects)](#5-quản-lý-học-phần-subjects)
6. [Quản lý Lớp học phần (Course Classes)](#6-quản-lý-lớp-học-phần-course-classes)
7. [Quản lý Học kỳ (Semesters)](#7-quản-lý-học-kỳ-semesters)
8. [Quản lý Khoa & Ngành](#8-quản-lý-khoa--ngành)
9. [Danh sách Sinh viên (People > Students)](#9-danh-sách-sinh-viên-people--students)
10. [Danh sách Giảng viên (People > Teachers)](#10-danh-sách-giảng-viên-people--teachers)
11. [Quản lý Phòng học & Tòa nhà](#11-quản-lý-phòng-học--tòa-nhà)
12. [Xếp Thời Khóa Biểu (Schedule Manager)](#12-xếp-thời-khóa-biểu-schedule-manager)
13. [Xử lý Yêu cầu (Requests)](#13-xử-lý-yêu-cầu-requests)
14. [Cài đặt Tài khoản Cá nhân](#14-cài-đặt-tài-khoản-cá-nhân)

---

## 1. Giới Thiệu Vai Trò Cán Bộ Đào Tạo

Cán bộ Đào tạo là người vận hành hệ thống học thuật của trường. Tài khoản thuộc **Role ID 4** (Academic Office) và có quyền truy cập toàn bộ phân hệ `/academic/*`.

Các trách nhiệm chính:
- Quản lý cấu trúc học thuật (khoa, ngành, lớp, học phần)
- Lập và phát hành thời khóa biểu học kỳ
- Quản lý danh sách sinh viên và giảng viên
- Xử lý các yêu cầu từ giảng viên và sinh viên (xin nghỉ, đổi lịch)
- Quản lý cơ sở vật chất (phòng học, tòa nhà)

---

## 2. Đăng Nhập và Điều Hướng

**Đường dẫn:** `/login`

<!-- PLACEHOLDER_IMAGE: login_academic -->
> 📷 *[Hình ảnh: Màn hình đăng nhập — nhập username/email và mật khẩu]*

Sau khi đăng nhập với tài khoản có **Role ID 4**, hệ thống sẽ điều hướng đến `/academic`.

### Sidebar Điều hướng

<!-- PLACEHOLDER_IMAGE: academic_sidebar -->
> 📷 *[Hình ảnh: Sidebar phân hệ Đào tạo — danh sách menu]*

| Menu | Đường dẫn | Chức năng |
|---|---|---|
| 🏠 Dashboard | `/academic` | Trang tổng quan |
| 📅 Thời khóa biểu | `/academic/schedule` | Xếp & quản lý TKB |
| 🎓 Lớp chính | `/academic/classes` | Quản lý lớp sinh viên |
| 📚 Lớp học phần | `/academic/courses/classes` | Lớp mở theo học kỳ |
| 📖 Học phần | `/academic/subjects` | Danh mục môn học |
| 🗓 Học kỳ | `/academic/semesters` | Quản lý học kỳ |
| 🏛 Khoa/Ngành | `/academic/departments` | Quản lý đơn vị học thuật |
| 🎓 Sinh viên | `/academic/people/students` | Danh sách sinh viên |
| 👔 Giảng viên | `/academic/people/teachers` | Danh sách giảng viên |
| 🏢 Tòa nhà | `/academic/buildings` | Quản lý tòa nhà |
| 🚪 Phòng học | `/academic/rooms` | Quản lý phòng học |
| 📋 Yêu cầu | `/academic/requests` | Xử lý đơn từ |

> 💡 **Mẹo:** Ở phần đầu trang layout, có **bộ chọn Học kỳ** (Semester Selector) — luôn chọn đúng học kỳ hiện hành trước khi thao tác với TKB hoặc lớp học phần.

---

## 3. Dashboard — Trang Tổng Quan Đào Tạo

**Đường dẫn:** `/academic`

<!-- PLACEHOLDER_IMAGE: academic_dashboard -->
> 📷 *[Hình ảnh: Dashboard Đào tạo — Banner xanh + 4 thẻ thống kê + Quick Actions + Yêu cầu mới nhất]*

### 3.1. Thẻ thống kê (4 cards)

| Thẻ | Màu | Nội dung |
|---|---|---|
| **Học kỳ hiện hành** | Xanh lá (Emerald) | Tên học kỳ đang hoạt động |
| **Sinh viên hệ chính quy** | Xanh ngọc (Teal) | Tổng số sinh viên đã nhập học |
| **Cán bộ giảng viên** | Xanh lam (Cyan) | Tổng số giảng viên |
| **Yêu cầu chờ duyệt** | Vàng (Amber) | Số đơn đang chờ xử lý (nhấp nháy nếu có) |

> ⚠️ Nếu thẻ **"Yêu cầu chờ duyệt"** hiển thị số > 0 và nhấp nháy, cần vào trang Yêu cầu để xử lý sớm.

### 3.2. Thao tác nhanh (Quick Actions)

Dashboard hiển thị **6 card thao tác nhanh**, nhấn để điều hướng:

| Card | Màu | Điều hướng đến |
|---|---|---|
| ▶ Xếp TKB tự động | Xanh lá | `/academic/schedule` |
| 🎓 Hồ sơ Sinh viên | Xanh ngọc | `/academic/people/students` |
| 👔 Hồ sơ Giảng viên | Xanh lam | `/academic/people/teachers` |
| 📋 Yêu cầu Xin nghỉ | Vàng | `/academic/requests` |
| 🏛 Khoa & Đơn vị | Tím | `/academic/departments` |
| 🚪 Phòng học | Xanh dương | `/academic/rooms` |

### 3.3. Yêu cầu mới nhất

Bên phải dashboard có panel **"Yêu cầu chờ duyệt"** hiển thị tối đa 4 đơn gần nhất:
- Tên người gửi
- Loại yêu cầu
- Thời gian tạo
- Nút **"Duyệt"** — điều hướng đến trang Yêu cầu

---

## 4. Quản Lý Lớp Chính (Main Classes)

**Đường dẫn:** `/academic/classes`

<!-- PLACEHOLDER_IMAGE: academic_classes_master_detail -->
> 📷 *[Hình ảnh: Giao diện Master-Detail — Danh sách lớp bên trái, chi tiết lớp bên phải]*

Trang Lớp chính sử dụng giao diện **Master-Detail** (danh sách — chi tiết song song).

### 4.1. Xem danh sách Lớp

**Phần trái (Master List):**
- Danh sách tất cả lớp học với mã lớp, tên lớp
- Thanh tìm kiếm theo mã/tên lớp
- Nút **"Thêm lớp"** ở đầu danh sách

**Chọn lớp:** Nhấn vào một lớp để xem chi tiết bên phải.

> 💡 Nếu chưa chọn lớp nào, phần bên phải hiển thị thông báo "Chưa chọn lớp" với biểu tượng kính lúp.

### 4.2. Chi tiết Lớp (Detail View)

<!-- PLACEHOLDER_IMAGE: academic_class_detail_tabs -->
> 📷 *[Hình ảnh: Chi tiết lớp — 2 Tab: Thông tin và Danh sách sinh viên]*

Khi chọn một lớp, phần bên phải hiển thị thông tin với **2 tab**:

**Tab "Thông tin lớp":**
- Mã lớp, tên lớp
- Khoa, Ngành, Loại hình đào tạo
- Cố vấn học tập (Advisor)
- Ngày tạo, số lượng sinh viên

**Tab "Danh sách sinh viên":**
- Bảng danh sách sinh viên trong lớp (tên, mã SV, vai trò lớp)
- Nút **"Thêm sinh viên"** — mở dialog chọn sinh viên chưa có lớp

### 4.3. Tạo Lớp mới

<!-- PLACEHOLDER_IMAGE: create_class_dialog -->
> 📷 *[Hình ảnh: Dialog tạo lớp chính mới]*

1. Nhấn nút **"Thêm lớp"** ở đầu danh sách.
2. Điền thông tin trong dialog:
   - **Mã lớp** — Mã định danh duy nhất
   - **Tên lớp** — Tên hiển thị
   - **Ngành** — Chọn từ danh sách
   - **Loại hình đào tạo** — Chính quy, liên thông, v.v.
   - **Cố vấn học tập** — Chọn giảng viên
3. Nhấn **Lưu**.

### 4.4. Thêm Sinh viên vào Lớp

<!-- PLACEHOLDER_IMAGE: add_student_to_class_dialog -->
> 📷 *[Hình ảnh: Dialog chọn sinh viên để thêm vào lớp]*

1. Trong tab "Danh sách sinh viên", nhấn **"Thêm sinh viên"**.
2. Chọn sinh viên từ dropdown (chỉ hiển thị sinh viên chưa có lớp chính).
3. Chọn **Vai trò trong lớp** (Lớp trưởng, Lớp phó, Thành viên, v.v.).
4. Nhấn **Xác nhận**.

### 4.5. Xóa Sinh viên khỏi Lớp

1. Trong bảng sinh viên, nhấn nút **Xóa** (biểu tượng thùng rác) trên hàng sinh viên.
2. Xác nhận trong hộp thoại cảnh báo.

### 4.6. Chỉnh sửa và Xóa Lớp

- **Chỉnh sửa:** Nhấn biểu tượng **Bút chì** (Edit) ở thanh tiêu đề chi tiết lớp.
- **Xóa lớp:** Nhấn biểu tượng **Thùng rác** (Delete). Cần xác nhận trước khi xóa vĩnh viễn.

> ⚠️ Không thể xóa lớp đang có sinh viên. Cần chuyển hết sinh viên sang lớp khác trước.

---

## 5. Quản Lý Học Phần (Subjects)

**Đường dẫn:** `/academic/subjects`

<!-- PLACEHOLDER_IMAGE: academic_subjects_page -->
> 📷 *[Hình ảnh: Trang Học phần — Bảng danh sách môn học với nút Thêm/Sửa]*

### 5.1. Xem danh sách Học phần

Bảng hiển thị:
- **Mã học phần** — Mã định danh (VD: IT101, MATH201)
- **Tên học phần**
- **Số tín chỉ**
- **Mô tả**
- **Học kỳ khuyến nghị** — Học kỳ nên học trong chương trình
- **Học phần tiên quyết** — Danh sách môn bắt buộc học trước
- **Hành động** — Sửa, Xóa

### 5.2. Tạo Học phần mới

<!-- PLACEHOLDER_IMAGE: subject_form_dialog -->
> 📷 *[Hình ảnh: Dialog tạo Học phần — form nhập liệu với phần Tiên quyết]*

1. Nhấn nút **"Thêm học phần"**.
2. Điền thông tin:
   - **Mã học phần** — VD: `IT101`
   - **Tên học phần** — VD: "Lập trình cơ bản"
   - **Số tín chỉ** — Mặc định 3
   - **Mô tả** — Mô tả ngắn về học phần
   - **Học kỳ khuyến nghị** — Vị trí trong chương trình đào tạo

3. **Thêm học phần tiên quyết** (nếu cần):
   - Nhấn nút **"+ Thêm tiên quyết"**
   - Chọn học phần từ danh sách
   - Chọn loại: `PREREQUISITE` (Tiên quyết) hoặc `COREQUISITE` (Song hành)
   - Có thể thêm nhiều tiên quyết

4. Nhấn **Lưu**.

### 5.3. Chỉnh sửa Học phần

1. Nhấn biểu tượng **Bút chì** trên hàng học phần.
2. Cập nhật thông tin cần thiết.
3. Nhấn **Lưu**.

### 5.4. Xóa Học phần

1. Nhấn biểu tượng **Thùng rác** trên hàng học phần.
2. Xác nhận xóa.

> ⚠️ Không thể xóa học phần đã có lớp học phần được mở hoặc đang là tiên quyết của học phần khác.

---

## 6. Quản Lý Lớp Học Phần (Course Classes)

**Đường dẫn:** `/academic/courses/classes`

<!-- PLACEHOLDER_IMAGE: course_classes_page -->
> 📷 *[Hình ảnh: Trang Lớp học phần — Thanh lọc Khoa/Ngành + Bảng danh sách]*

Lớp học phần là lớp học cụ thể được mở trong một học kỳ cho một học phần, có giảng viên phụ trách.

### 6.1. Bộ lọc

- **Lọc theo Khoa** — Dropdown chọn Khoa/Phòng ban
- **Lọc theo Chuyên ngành** — Dropdown lọc theo ngành (tự động cập nhật theo khoa đã chọn)
- Nút **"Xóa bộ lọc"** — Reset về hiển thị tất cả
- Bộ lọc **Học kỳ** — Tự động theo học kỳ đang chọn trong header

### 6.2. Thông tin Bảng Lớp học phần

| Cột | Nội dung |
|---|---|
| **Mã lớp HP** | Mã định danh lớp (VD: IT101.01) |
| **Học phần** | Tên và mã học phần |
| **Giảng viên** | Giảng viên phụ trách |
| **Học kỳ** | Học kỳ đang mở |
| **Sĩ số** | Số sinh viên đã đăng ký / Sĩ số tối đa |
| **Hành động** | Xem, Sửa, Xóa |

### 6.3. Tạo Lớp Học phần mới

<!-- PLACEHOLDER_IMAGE: create_course_class_dialog -->
> 📷 *[Hình ảnh: Dialog tạo Lớp học phần — chọn học phần, học kỳ, giảng viên]*

1. Nhấn **"Tạo lớp học phần"**.
2. Điền thông tin:
   - **Mã lớp HP** — Mã tự đặt
   - **Học phần** — Chọn từ danh sách học phần
   - **Học kỳ** — Chọn học kỳ
   - **Giảng viên phụ trách** — Chọn từ danh sách
   - **Sĩ số tối đa** — Số sinh viên tối đa cho phép
3. Nhấn **Lưu**.

### 6.4. Thao tác trên Lớp Học phần

Trên mỗi hàng có dropdown hành động (ba chấm):
- **Xem chi tiết** — Danh sách sinh viên đã đăng ký
- **Chỉnh sửa** — Thay đổi giảng viên, sĩ số, học kỳ
- **Xóa** — Xóa lớp học phần (cần không có sinh viên)

---

## 7. Quản Lý Học Kỳ (Semesters)

**Đường dẫn:** `/academic/semesters`

<!-- PLACEHOLDER_IMAGE: semesters_page -->
> 📷 *[Hình ảnh: Trang Học kỳ — Bảng danh sách và nút Thêm học kỳ]*

### 7.1. Xem danh sách Học kỳ

Bảng hiển thị:
- **Mã học kỳ** — Code định danh (VD: HK1-2026)
- **Tên học kỳ** — VD: "Học kỳ 1 năm học 2025-2026"
- **Năm học**
- **Ngày bắt đầu / Kết thúc**
- **Đang hiện hành** — Đánh dấu học kỳ hiện tại

### 7.2. Tạo Học kỳ mới

<!-- PLACEHOLDER_IMAGE: create_semester_dialog -->
> 📷 *[Hình ảnh: Dialog tạo Học kỳ — form nhập code, tên, ngày]*

1. Nhấn **"Thêm học kỳ"**.
2. Điền thông tin:
   - **Mã học kỳ** — VD: `HK1-2026`
   - **Tên học kỳ** — VD: "Học kỳ 1 năm học 2025-2026"
   - **Năm học** — Nhập năm (VD: 2026)
   - **Ngày bắt đầu** — Chọn từ date picker
   - **Ngày kết thúc** — Chọn từ date picker
   - **Đang hiện hành** — Tích chọn nếu đây là học kỳ hiện tại
3. Nhấn **Lưu**.

> ⚠️ **Chú ý:** Chỉ nên có **một** học kỳ được đánh dấu "Đang hiện hành" tại một thời điểm. Học kỳ này sẽ được dùng làm mặc định trong toàn bộ hệ thống.

### 7.3. Chỉnh sửa Học kỳ

1. Nhấn biểu tượng **Bút chì** trên hàng học kỳ.
2. Cập nhật thông tin.
3. Nhấn **Lưu**.

---

## 8. Quản Lý Khoa & Ngành

**Đường dẫn:** `/academic/departments`

<!-- PLACEHOLDER_IMAGE: departments_master_detail -->
> 📷 *[Hình ảnh: Giao diện Khoa — Master List bên trái, Detail View bên phải]*

Tương tự Lớp chính, trang Khoa sử dụng giao diện **Master-Detail**.

### 8.1. Xem danh sách Khoa

**Phần trái:** Danh sách tất cả Khoa/Đơn vị trong trường.

**Chọn một Khoa** để xem chi tiết bên phải.

### 8.2. Chi tiết Khoa (5 Tab)

<!-- PLACEHOLDER_IMAGE: department_detail_tabs -->
> 📷 *[Hình ảnh: Chi tiết Khoa — 5 Tab: Thông tin, Ngành, Nhân sự, Vị trí, Lịch sử]*

**Tab "Thông tin":**
- Mã khoa, tên khoa, mô tả
- Trưởng khoa (Department Head)
- Ngày thành lập
- Nút **Chỉnh sửa** thông tin khoa

**Tab "Ngành học" (Majors):**
- Danh sách các ngành thuộc khoa
- Nút **"Thêm ngành"** — tạo ngành mới

**Tab "Nhân sự" (Staff):**
- Danh sách cán bộ/giảng viên được phân công vào khoa
- Thông tin: Họ tên, Chức vụ, Ngày nhận nhiệm
- Nút **"Phân công nhân sự"** — gán cán bộ vào khoa
- Nút **"Bãi nhiệm"** — gỡ phân công

**Tab "Vị trí" (Positions):**
- Danh sách các chức vụ trong khoa (Trưởng khoa, Phó khoa, v.v.)
- Nút **"Thêm vị trí"** — tạo chức danh mới
- Nút **"Khởi tạo mặc định"** — tạo bộ chức danh chuẩn

**Tab "Lịch sử":**
- Lịch sử thay đổi nhân sự và phân công

### 8.3. Tạo Khoa mới

<!-- PLACEHOLDER_IMAGE: create_department_dialog -->
> 📷 *[Hình ảnh: Dialog tạo Khoa mới]*

1. Nhấn nút **"Thêm khoa"** ở đầu Master List.
2. Điền: Mã khoa, Tên khoa, Mô tả.
3. Nhấn **Lưu**.

### 8.4. Tạo Ngành học

1. Chọn một Khoa trong Master List.
2. Chuyển sang tab **"Ngành học"**.
3. Nhấn **"Thêm ngành"**.
4. Điền: Mã ngành, Tên ngành, Mô tả.
5. Nhấn **Lưu**.

### 8.5. Phân công Nhân sự vào Khoa

<!-- PLACEHOLDER_IMAGE: staff_assignment_dialog -->
> 📷 *[Hình ảnh: Dialog phân công nhân sự — chọn cán bộ và chức vụ]*

1. Chọn Khoa → Tab **"Nhân sự"**.
2. Nhấn **"Phân công nhân sự"**.
3. Tìm và chọn cán bộ từ danh sách.
4. Chọn **Chức vụ** (Position).
5. Nhập **Ngày nhận nhiệm**.
6. Nhấn **Lưu**.

---

## 9. Danh Sách Sinh Viên (People > Students)

**Đường dẫn:** `/academic/people/students`

<!-- PLACEHOLDER_IMAGE: academic_people_students -->
> 📷 *[Hình ảnh: Trang Sinh viên — Bộ lọc 3 cấp (Khoa > Ngành > Lớp) + Bảng]*

### 9.1. Bộ lọc phân cấp

Trang có **3 bộ lọc cascade**:
1. **Khoa** → chọn để lọc ngành bên dưới
2. **Ngành** → tự cập nhật khi đổi khoa
3. **Lớp** → tự cập nhật khi đổi ngành
4. Nút **"Xóa bộ lọc"** — reset tất cả

### 9.2. Thông tin bảng Sinh viên

| Cột | Nội dung |
|---|---|
| **Mã sinh viên** | Mã định danh (SV-code) |
| **Họ và tên** | Tên đầy đủ |
| **Lớp chính** | Lớp đang thuộc |
| **Ngành** | Ngành học |
| **Trạng thái tài khoản** | active / suspended / banned |
| **Hành động** | Xem hồ sơ, Thao tác khác |

### 9.3. Thêm Sinh viên mới

<!-- PLACEHOLDER_IMAGE: add_student_person_dialog -->
> 📷 *[Hình ảnh: Dialog thêm sinh viên — form hồ sơ cá nhân]*

1. Nhấn **"Thêm sinh viên"** (góc trên phải).
2. Điền thông tin cá nhân theo cấu trúc Schema mặc định.
3. Nhấn **Lưu**.

> 💡 Mã sinh viên sẽ được sinh tự động nếu **quy tắc Auto Code** đang được bật (cấu hình bởi Admin hệ thống).

---

## 10. Danh Sách Giảng Viên (People > Teachers)

**Đường dẫn:** `/academic/people/teachers`

<!-- PLACEHOLDER_IMAGE: academic_people_teachers -->
> 📷 *[Hình ảnh: Trang Giảng viên — Bảng danh sách với hành động]*

### 10.1. Thông tin bảng Giảng viên

| Cột | Nội dung |
|---|---|
| **Mã cán bộ** | Mã định danh giảng viên |
| **Họ và tên** | Tên đầy đủ |
| **Đơn vị công tác** | Khoa/Bộ môn |
| **Chức vụ** | Chức danh hiện tại |
| **Trạng thái tài khoản** | active / suspended |
| **Hành động** | Xem hồ sơ, thao tác |

### 10.2. Thêm Giảng viên

1. Nhấn **"Thêm giảng viên"**.
2. Điền thông tin theo Schema nhân sự (EMP schema).
3. Nhấn **Lưu**.

---

## 11. Quản Lý Phòng Học & Tòa Nhà

### 11.1. Tòa nhà

**Đường dẫn:** `/academic/buildings`

<!-- PLACEHOLDER_IMAGE: academic_buildings_page -->
> 📷 *[Hình ảnh: Trang Tòa nhà — Bảng danh sách]*

**Thao tác:**
- Xem danh sách tòa nhà (tên, mã, số phòng)
- **Thêm tòa nhà** — Nhấn "Thêm tòa nhà", điền tên và mô tả
- **Sửa** — Chỉnh sửa thông tin
- **Xóa** — Xóa tòa nhà (cần không còn phòng liên kết)

### 11.2. Phòng học

**Đường dẫn:** `/academic/rooms`

<!-- PLACEHOLDER_IMAGE: academic_rooms_page -->
> 📷 *[Hình ảnh: Trang Phòng học — Bảng danh sách với cột Tòa nhà, Sức chứa, Loại phòng]*

**Thao tác:**
- Xem danh sách phòng học (mã phòng, tên, tòa nhà, sức chứa, loại)
- **Thêm phòng** — Nhấn "Thêm phòng", điền mã phòng, chọn tòa nhà, nhập sức chứa và loại phòng
- **Sửa** — Cập nhật thông tin
- **Xóa** — Xóa phòng học

**Loại phòng thường gặp:**
- `Phòng lý thuyết` — Giảng đường thường
- `Phòng máy tính` — Lab CNTT
- `Phòng thực hành` — Lab chuyên ngành

> 💡 Phòng học là dữ liệu đầu vào quan trọng cho module **Xếp Thời Khóa Biểu**. Đảm bảo cập nhật đúng sức chứa để thuật toán xếp TKB hoạt động chính xác.

---

## 12. Xếp Thời Khóa Biểu (Schedule Manager)

**Đường dẫn:** `/academic/schedule`

<!-- PLACEHOLDER_IMAGE: schedule_manager_overview -->
> 📷 *[Hình ảnh: Schedule Manager — Sidebar thực thể + Lưới thời gian TKB]*

Đây là tính năng **phức tạp nhất** và quan trọng nhất của phân hệ Đào tạo. Schedule Manager cho phép xây dựng và quản lý thời khóa biểu học kỳ.

### 12.1. Giao diện tổng thể

Giao diện gồm **2 phần chính**:

| Phần | Mô tả |
|---|---|
| **Sidebar thực thể** (trái) | Danh sách Phòng / Giảng viên / Lớp để chọn xem TKB |
| **Lưới thời gian** (phải) | Hiển thị TKB của thực thể được chọn dạng bảng tuần |

**Bộ chọn Học kỳ** ở đầu trang (từ SemesterProvider) — cần chọn đúng học kỳ trước khi thao tác.

### 12.2. Tab chế độ xem (Entity Tabs)

<!-- PLACEHOLDER_IMAGE: schedule_entity_tabs -->
> 📷 *[Hình ảnh: 3 Tab — Phòng học | Giảng viên | Lớp học]*

Có **3 tab** chuyển đổi loại thực thể:
- 🚪 **Phòng học (Rooms)** — Xem TKB theo từng phòng
- 👔 **Giảng viên (Teachers)** — Xem TKB theo từng giảng viên
- 🎓 **Lớp học (Classes)** — Xem TKB theo từng lớp học phần

### 12.3. Chế độ xem TKB

<!-- PLACEHOLDER_IMAGE: schedule_view_modes -->
> 📷 *[Hình ảnh: Toggle "Mẫu tuần" và "Thực tế" — Lưới thời gian với các slot]*

Có **2 chế độ xem**:
| Chế độ | Mô tả |
|---|---|
| **Template (Mẫu tuần)** | TKB mẫu dùng để xếp lịch hàng tuần (cơ sở phát hành) |
| **Actual (Thực tế)** | TKB thực tế từng tuần, có thể có ngoại lệ so với mẫu |

### 12.4. Xếp TKB thủ công (Template Mode)

<!-- PLACEHOLDER_IMAGE: schedule_slot_dialog -->
> 📷 *[Hình ảnh: Dialog thêm slot TKB — chọn lớp HP, thời gian, phòng]*

1. Chọn **chế độ Template**.
2. Chọn thực thể (phòng/GV/lớp) từ Sidebar.
3. Nhấn vào **ô trống** trong lưới thời gian (ngày × tiết học).
4. Dialog **"Thêm lịch"** mở ra:
   - **Lớp học phần** — Chọn lớp HP cần xếp
   - **Phòng học** — Chọn phòng (nếu đang xem theo GV hoặc lớp)
   - **Giảng viên** — Chọn GV (nếu đang xem theo phòng hoặc lớp)
   - **Tiết bắt đầu / kết thúc**
5. Nhấn **Lưu slot**.

> ⚠️ Hệ thống tự động kiểm tra **xung đột** (conflict): nếu phòng/GV/lớp đã có lịch ở thời điểm đó, sẽ hiển thị cảnh báo.

### 12.5. Chỉnh sửa & Xóa Slot

- **Nhấn vào slot đã xếp** để mở dialog chỉnh sửa.
- Trong dialog, có nút **Xóa slot** để gỡ khỏi TKB.

### 12.6. Cập nhật Tính khả dụng (Availability)

<!-- PLACEHOLDER_IMAGE: edit_availability_mode -->
> 📷 *[Hình ảnh: Chế độ chỉnh sửa tính khả dụng — các ô có màu sắc khác nhau]*

1. Bật nút **"Chỉnh sửa khả dụng"** (Edit Availability).
2. Nhấn vào các ô trong lưới để bật/tắt tính khả dụng của thực thể tại thời điểm đó.
3. **Xanh lá** = Khả dụng, **Đỏ/Xám** = Không khả dụng.
4. Tắt chế độ chỉnh sửa để lưu.

> 💡 Tính khả dụng ảnh hưởng trực tiếp đến thuật toán **Xếp TKB tự động**.

### 12.7. Xếp TKB Tự động (Auto-Generate)

<!-- PLACEHOLDER_IMAGE: auto_generate_schedule -->
> 📷 *[Hình ảnh: Nút Auto-Generate và dialog xác nhận]*

1. Nhấn nút **▶ Xếp TKB tự động** (Play icon).
2. Chọn **Học kỳ** cần xếp TKB.
3. Xác nhận trong hộp thoại cảnh báo.
4. Hệ thống chạy thuật toán tự động phân bổ lớp HP vào phòng/tiết hợp lệ.
5. Kết quả được điền vào lưới Template.

> ⚠️ **Cảnh báo:** Xếp TKB tự động sẽ **ghi đè** các slot đã xếp thủ công trong Template. Xem xét kỹ trước khi xác nhận.

### 12.8. Phát hành TKB (Publish)

<!-- PLACEHOLDER_IMAGE: publish_schedule -->
> 📷 *[Hình ảnh: Nút Publish và dropdown lựa chọn]*

Sau khi hoàn thiện Template, phát hành TKB thực tế:

1. Nhấn nút **Phát hành** (Send/Publish icon).
2. Chọn tuần cần phát hành.
3. Xác nhận.
4. TKB thực tế (`Actual`) của tuần đó được tạo từ Template.

### 12.9. Quản lý TKB Thực tế (Actual Mode)

<!-- PLACEHOLDER_IMAGE: actual_schedule_view -->
> 📷 *[Hình ảnh: Chế độ Actual — lưới tuần thực tế, có bộ chọn tuần]*

1. Chuyển sang chế độ **Actual**.
2. Dùng **bộ chọn tuần** để xem TKB của từng tuần.
3. Có thể **điều chỉnh ngoại lệ** cho từng tuần (dời lịch, thay phòng).

### 12.10. Xử lý Xung đột Tự động (Auto Relocate)

Khi phát hiện xung đột trong TKB thực tế:
1. Hệ thống hiển thị dialog **"Xung đột lịch"**.
2. Nhấn **"Tìm phòng thay thế tự động"**.
3. Hệ thống đề xuất phòng/thời điểm thay thế.
4. Xem xét và nhấn **"Chấp thuận đề xuất"** hoặc **"Từ chối"**.

### 12.11. Quản lý Ngày lễ / Nghỉ bù

<!-- PLACEHOLDER_IMAGE: holiday_dialog -->
> 📷 *[Hình ảnh: Dialog thêm ngày lễ/nghỉ]*

1. Nhấn nút **"Thêm ngày lễ"** (Calendar icon).
2. Chọn ngày nghỉ.
3. Nhập tên/mô tả (VD: "Tết Nguyên Đán").
4. Lưu — Tất cả slot trong ngày đó được đánh dấu nghỉ.

---

## 13. Xử Lý Yêu Cầu (Requests)

**Đường dẫn:** `/academic/requests`

<!-- PLACEHOLDER_IMAGE: academic_requests_page -->
> 📷 *[Hình ảnh: Trang Yêu cầu — Bảng danh sách đơn từ với cột Trạng thái và Hành động]*

Cán bộ Đào tạo là **người duyệt** các yêu cầu từ sinh viên và giảng viên.

### 13.1. Các loại Yêu cầu

| Loại | Người gửi | Nội dung |
|---|---|---|
| `student_absence` | Sinh viên | Xin nghỉ học một buổi |
| `teacher_schedule_change` | Giảng viên | Đề xuất thay đổi lịch dạy |
| `class_withdrawal` | Sinh viên | Xin rút khỏi lớp học phần |

### 13.2. Bảng Danh sách Yêu cầu

| Cột | Nội dung |
|---|---|
| **Người gửi** | Họ tên người tạo yêu cầu |
| **Loại yêu cầu** | Loại đơn (xin nghỉ, đổi lịch, v.v.) |
| **Trạng thái** | pending / approved / rejected / cancelled |
| **Ngày tạo** | Thời gian gửi đơn |
| **Hành động** | Nút xem chi tiết (biểu tượng mắt) |

**Badge trạng thái:**
| Badge | Màu | Ý nghĩa |
|---|---|---|
| `pending` | Xám | Đang chờ duyệt |
| `approved` | Xanh | Đã duyệt |
| `rejected` | Đỏ | Đã từ chối |
| `cancelled` | Viền | Đã hủy |

### 13.3. Duyệt Yêu cầu

<!-- PLACEHOLDER_IMAGE: request_review_dialog -->
> 📷 *[Hình ảnh: Dialog duyệt yêu cầu — xem thông tin chi tiết, ô nhập ý kiến, nút Duyệt/Từ chối]*

1. Nhấn biểu tượng **Mắt** (Eye) trên hàng yêu cầu cần duyệt.
2. Dialog **"Xét duyệt yêu cầu"** mở ra, hiển thị:
   - Người gửi
   - Loại yêu cầu
   - Ngày tạo
   - Chi tiết (tùy loại — ngày nghỉ, lịch đề xuất mới, mã lớp, v.v.)
   - Lý do (Reason)
3. Nhập **Ý kiến phản hồi** (Comment) vào ô văn bản.
4. Chọn hành động:
   - ✅ **Duyệt** — Nhấn nút "Duyệt" (màu xanh)
   - ❌ **Từ chối** — Nhấn nút "Từ chối" (màu đỏ)

> 💡 Yêu cầu đã được duyệt hoặc từ chối sẽ không thể thay đổi lại. Chỉ có thể xem thông tin và ý kiến đã nhập.

### 13.4. Chi tiết theo từng loại Yêu cầu

**Yêu cầu xin nghỉ (`student_absence`):**
- Hiển thị thêm: **Tên môn học (Mã lớp HP)**, **Ngày xin nghỉ**

**Yêu cầu đổi lịch GV (`teacher_schedule_change`):**
- Hiển thị thêm: **Lịch đề xuất mới** (Ngày, Tiết bắt đầu, Tiết kết thúc, Phòng mới)

**Yêu cầu rút lớp (`class_withdrawal`):**
- Hiển thị thêm: **Tên học phần (Mã lớp HP)**

---

## 14. Cài Đặt Tài Khoản Cá Nhân

**Đường dẫn:** `/account`

<!-- PLACEHOLDER_IMAGE: account_settings_academic -->
> 📷 *[Hình ảnh: Trang Cài đặt tài khoản — 3 Tab]*

Trang cài đặt cá nhân giống với các vai trò khác, bao gồm 3 tab:

| Tab | Chức năng |
|---|---|
| **Hồ sơ** | Xem và cập nhật thông tin cá nhân (tên, email, SĐT) |
| **Bảo mật** | Đổi mật khẩu, xem nhật ký đăng nhập (5 lần gần nhất) |
| **Tùy chọn** | Chọn ngôn ngữ (vi/en), chế độ giao diện sáng/tối |

---

## Phụ Lục A — Bảng Tóm Tắt Đường Dẫn

| Chức năng | Đường dẫn |
|---|---|
| Dashboard Đào tạo | `/academic` |
| Thời khóa biểu | `/academic/schedule` |
| Wizard xếp TKB | `/academic/schedule/wizard` |
| Lớp chính | `/academic/classes` |
| Lớp học phần | `/academic/courses/classes` |
| Học phần | `/academic/subjects` |
| Học kỳ | `/academic/semesters` |
| Khoa & Ngành | `/academic/departments` |
| Sinh viên | `/academic/people/students` |
| Giảng viên | `/academic/people/teachers` |
| Tòa nhà | `/academic/buildings` |
| Phòng học | `/academic/rooms` |
| Yêu cầu | `/academic/requests` |
| Cài đặt tài khoản | `/account` |

---

## Phụ Lục B — Quy Trình Xếp TKB Một Học Kỳ

Dưới đây là quy trình đề xuất khi bắt đầu một học kỳ mới:

```
1. Tạo Học kỳ mới (/academic/semesters)
   └─ Đánh dấu "Đang hiện hành"

2. Mở các Lớp học phần (/academic/courses/classes)
   └─ Tạo lớp HP cho từng môn, phân công giảng viên

3. Cập nhật Tính khả dụng (/academic/schedule)
   └─ Chỉnh sửa khả dụng Phòng/GV/Lớp nếu có thay đổi

4. Xếp TKB (chọn một trong hai cách):
   a. Tự động: Nhấn "▶ Xếp TKB tự động"
   b. Thủ công: Nhấn vào từng ô trong lưới Template

5. Kiểm tra và chỉnh sửa các slot bị xung đột

6. Phát hành TKB từng tuần
   └─ Nhấn "Phát hành" → Chọn tuần → Xác nhận

7. Theo dõi và xử lý Yêu cầu trong học kỳ (/academic/requests)
```

---

## Phụ Lục C — Giải Thích Thuật Ngữ

| Thuật ngữ | Giải thích |
|---|---|
| **Lớp chính (Main Class)** | Lớp quản lý hành chính của sinh viên (VD: CNTT-K65) |
| **Lớp học phần (Course Class)** | Lớp mở cho một môn học cụ thể trong một học kỳ |
| **Học phần (Subject)** | Môn học trong chương trình đào tạo |
| **Template (Mẫu tuần)** | TKB mẫu áp dụng cho các tuần trong học kỳ |
| **Actual (Thực tế)** | TKB thực tế từng tuần, có thể khác mẫu |
| **Slot** | Một ô trong lưới TKB = 1 buổi học cụ thể |
| **Tiên quyết (Prerequisite)** | Môn bắt buộc phải học trước khi đăng ký môn khác |
| **Conflict (Xung đột)** | Hai sự kiện cùng dùng phòng/GV/lớp vào cùng thời điểm |
| **SemesterProvider** | Context cung cấp học kỳ đang chọn cho toàn bộ trang |
| **Auto Relocate** | Tự động tìm phòng/thời gian thay thế khi có xung đột |
| **Availability (Khả dụng)** | Trạng thái sẵn sàng của Phòng/GV/Lớp tại một thời điểm |

---

*Tài liệu này được tạo từ mã nguồn dự án QuickUni. Để cập nhật hình ảnh minh họa, thay thế các placeholder `<!-- PLACEHOLDER_IMAGE: ... -->` bằng hình chụp màn hình thực tế.*
