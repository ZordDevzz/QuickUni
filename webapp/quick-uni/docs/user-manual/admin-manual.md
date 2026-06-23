# Hướng Dẫn Sử Dụng — Quản Trị Viên (Admin)

> **Hệ thống:** QuickUni — Nền tảng quản lý giáo dục đại học
> **Phiên bản tài liệu:** 1.0
> **Đối tượng:** Quản trị viên hệ thống (Admin / Tech / Dev)
> **Cập nhật lần cuối:** 2026-06-15

---

## Mục Lục

1. [Giới thiệu vai trò Quản trị viên](#1-giới-thiệu-vai-trò-quản-trị-viên)
2. [Đăng nhập vào hệ thống](#2-đăng-nhập-vào-hệ-thống)
3. [Tổng quan giao diện Admin](#3-tổng-quan-giao-diện-admin)
4. [Dashboard — Trang tổng quan](#4-dashboard--trang-tổng-quan)
5. [Quản lý Sinh viên](#5-quản-lý-sinh-viên)
6. [Quản lý Nhân sự (Cán bộ / Giảng viên)](#6-quản-lý-nhân-sự-cán-bộ--giảng-viên)
7. [Quản lý Tài khoản](#7-quản-lý-tài-khoản)
8. [Hàn lâm — Cơ sở học thuật](#8-hàn-lâm--cơ-sở-học-thuật)
9. [Hệ thống — Phân quyền và Cài đặt](#9-hệ-thống--phân-quyền-và-cài-đặt)
10. [Onboarding — Nhập liệu hàng loạt](#10-onboarding--nhập-liệu-hàng-loạt)
11. [Tài chính — Quản lý Hóa đơn](#11-tài-chính--quản-lý-hóa-đơn)
12. [Cài đặt Tài khoản Cá nhân](#12-cài-đặt-tài-khoản-cá-nhân)

---

## 1. Giới Thiệu Vai Trò Quản Trị Viên

Quản trị viên là người dùng có quyền cao nhất trong hệ thống QuickUni. Tài khoản admin thuộc một trong các loại:
- **`tech`** — Kỹ thuật viên hệ thống
- **`dev`** — Nhà phát triển / lập trình viên

Quản trị viên có toàn quyền truy cập vào tất cả phân hệ, bao gồm:
- Quản lý người dùng (sinh viên, cán bộ, tài khoản)
- Quản lý cơ sở học thuật (khoa, phòng, tòa nhà, học kỳ)
- Cấu hình hệ thống (vai trò, quyền hạn, quy tắc sinh mã)
- Nhập liệu hàng loạt (onboarding)
- Quản lý tài chính (hóa đơn)

---

## 2. Đăng Nhập Vào Hệ Thống

**Đường dẫn:** `/login`

<!-- PLACEHOLDER_IMAGE: login_page -->
> 📷 *[Hình ảnh: Màn hình đăng nhập QuickUni]*

**Các bước:**

1. Truy cập địa chỉ hệ thống và điều hướng tới trang `/login`.
2. Nhập **Tên đăng nhập** hoặc **Email** vào ô tương ứng.
3. Nhập **Mật khẩu**.
4. Nhấn nút **Đăng nhập**.

> ⚠️ **Lưu ý:** Nếu tài khoản bị tạm khóa (`suspended`) hoặc bị cấm (`banned`), hệ thống sẽ từ chối đăng nhập và hiển thị thông báo lỗi.

Sau khi đăng nhập thành công với tài khoản loại `tech` hoặc `dev`, hệ thống sẽ tự động điều hướng đến trang quản trị (`/admin`).

---

## 3. Tổng Quan Giao Diện Admin

<!-- PLACEHOLDER_IMAGE: admin_layout_overview -->
> 📷 *[Hình ảnh: Giao diện tổng quan Admin — Sidebar và Header]*

Giao diện Admin bao gồm:

| Thành phần | Mô tả |
|---|---|
| **Sidebar (Thanh bên)** | Menu điều hướng chính, có thể thu gọn/mở rộng |
| **Header (Thanh tiêu đề)** | Hiển thị thông tin người dùng, nút mở menu mobile |
| **Vùng nội dung chính** | Hiển thị nội dung trang hiện tại |

### Sidebar Navigation

Sidebar chứa các mục chính:

- 🏠 **Dashboard** — Trang tổng quan
- 🎓 **Sinh viên** — Quản lý hồ sơ và tài khoản sinh viên
- 👔 **Nhân sự** — Quản lý hồ sơ cán bộ / giảng viên
- 👤 **Tài khoản** — Danh sách tài khoản hệ thống
- 🏛 **Học thuật** — Quản lý khoa, tòa nhà, phòng, học kỳ
- 🛡 **Hệ thống** — Vai trò, quyền hạn, cài đặt
- 📥 **Onboarding** — Nhập liệu hàng loạt
- 💰 **Tài chính** — Quản lý hóa đơn

> 💡 **Mẹo:** Nhấn vào biểu tượng ≡ ở góc sidebar để thu gọn/mở rộng menu. Trên thiết bị di động, dùng nút hamburger ở header để mở sidebar.

---

## 4. Dashboard — Trang Tổng Quan

**Đường dẫn:** `/admin`

<!-- PLACEHOLDER_IMAGE: admin_dashboard -->
> 📷 *[Hình ảnh: Dashboard Admin với 4 thẻ thống kê]*

Trang Dashboard hiển thị thống kê tổng quan hệ thống gồm **4 thẻ thông tin**:

| Thẻ | Nội dung |
|---|---|
| **Tổng số tài khoản** | Tổng số tài khoản đã đăng ký trong hệ thống |
| **Tổng số hồ sơ** | Tổng số hồ sơ cá nhân (profile) đã được tạo |
| **Người dùng Admin** | Số lượng tài khoản có quyền hệ thống (tech/dev) |
| **Trạng thái Cơ sở dữ liệu** | Trạng thái kết nối PostgreSQL (Healthy / Error) |

---

## 5. Quản Lý Sinh Viên

**Đường dẫn:** `/admin/students`

<!-- PLACEHOLDER_IMAGE: admin_students_page -->
> 📷 *[Hình ảnh: Trang Quản lý Sinh viên — Metrics và Tab]*

### 5.1. Tổng quan số liệu

Đầu trang hiển thị **4 thẻ chỉ số** màu sắc:

| Thẻ | Màu | Ý nghĩa |
|---|---|---|
| **Tổng số sinh viên** | Xanh lá (Emerald) | Tổng hồ sơ sinh viên trong hệ thống |
| **Tài khoản đã liên kết** | Xanh ngọc (Teal) | Hồ sơ đã được gắn với tài khoản đăng nhập |
| **Hồ sơ chưa liên kết** | Xanh lam (Cyan) | Hồ sơ chưa có tài khoản |
| **Tài khoản bị khóa** | Đỏ (Rose) | Tài khoản bị suspended hoặc banned |

### 5.2. Tab "Hồ sơ Sinh viên"

<!-- PLACEHOLDER_IMAGE: student_profiles_tab -->
> 📷 *[Hình ảnh: Tab Hồ sơ Sinh viên — Bảng danh sách]*

Bảng danh sách hồ sơ sinh viên với các chức năng:

- **Tìm kiếm** — Tìm theo tên hoặc mã sinh viên
- **Lọc theo Lớp** — Bộ lọc theo mã lớp học
- **Lọc theo Ngành** — Bộ lọc theo ngành học
- **Lọc theo Khoa** — Bộ lọc theo đơn vị khoa
- **Lọc theo Trạng thái tài khoản** — active / suspended / banned
- **Xóa bộ lọc** — Nút reset tất cả bộ lọc

### 5.3. Tạo Hồ sơ Sinh viên mới

<!-- PLACEHOLDER_IMAGE: create_student_profile_modal -->
> 📷 *[Hình ảnh: Modal Tạo hồ sơ sinh viên mới]*

1. Nhấn nút **"Tạo hồ sơ"** (góc trên bên phải trang).
2. Chọn **Cấu trúc hồ sơ** (Schema — chỉ hiển thị các schema mã bắt đầu bằng `STD`).
3. Điền thông tin theo các trường được yêu cầu.
4. Nhấn **Lưu** để hoàn tất.

> 💡 Mã sinh viên có thể được tự động sinh nếu cấu hình quy tắc Auto Code đang hoạt động (xem mục 9.2).

### 5.4. Tab "Tài khoản Sinh viên"

<!-- PLACEHOLDER_IMAGE: student_accounts_tab -->
> 📷 *[Hình ảnh: Tab Tài khoản Sinh viên — Bảng và nút tạo]*

Quản lý tài khoản đăng nhập của sinh viên:

- **Xem danh sách tài khoản** — Hiển thị username, email, trạng thái
- **Tạo tài khoản** — Nhấn **"Tạo tài khoản"**, chọn hồ sơ sinh viên để liên kết
- **Phân loại** — Chỉ hiển thị tài khoản loại `student`

### 5.5. Liên kết Hồ sơ với Tài khoản

Hồ sơ và tài khoản là **hai thực thể riêng biệt** trong QuickUni:
- **Hồ sơ (Profile)** — Lưu thông tin cá nhân (họ tên, ngày sinh, v.v.)
- **Tài khoản (Account)** — Thông tin đăng nhập (username, password)

Để một sinh viên có thể đăng nhập, cần:
1. Tạo hồ sơ trước.
2. Tạo tài khoản và liên kết với hồ sơ đã tạo.

---

## 6. Quản Lý Nhân Sự (Cán Bộ / Giảng Viên)

**Đường dẫn:** `/admin/personnel`

<!-- PLACEHOLDER_IMAGE: admin_personnel_page -->
> 📷 *[Hình ảnh: Trang Quản lý Nhân sự — Gradient tím/hồng]*

Giao diện tương tự trang Sinh viên nhưng áp dụng cho cán bộ và giảng viên.

### 6.1. Tổng quan số liệu

| Thẻ | Màu | Ý nghĩa |
|---|---|---|
| **Tổng số nhân sự** | Chàm (Indigo) | Tổng hồ sơ cán bộ / giảng viên |
| **Tài khoản đã cấp** | Xanh lá (Emerald) | Hồ sơ đã được gắn tài khoản |
| **Hồ sơ chờ xử lý** | Vàng (Amber) | Hồ sơ chưa có tài khoản |
| **Tài khoản bị khóa** | Đỏ (Rose) | Tài khoản bị suspended / banned |

### 6.2. Tạo Hồ sơ Nhân sự

1. Nhấn **"Tạo hồ sơ"**.
2. Chọn **Schema** nhân sự (mã bắt đầu bằng `EMP` — loại trừ `STD`).
3. Điền thông tin.
4. Lưu hồ sơ.

### 6.3. Tab "Hồ sơ Nhân sự" và "Tài khoản Nhân sự"

Hoạt động tương tự như phần Sinh viên (xem Mục 5.2 và 5.4).

> ⚠️ Bộ lọc hồ sơ nhân sự theo **Schema** thay vì theo Lớp/Ngành/Khoa.

---

## 7. Quản Lý Tài Khoản

**Đường dẫn:** `/admin/accounts`

<!-- PLACEHOLDER_IMAGE: admin_accounts_page -->
> 📷 *[Hình ảnh: Trang danh sách tất cả tài khoản hệ thống]*

Trang này hiển thị **toàn bộ tài khoản** trong hệ thống (không phân loại sinh viên/nhân sự).

### Thông tin bảng tài khoản

Các cột thông tin gồm:
- **Username** — Tên đăng nhập
- **Email** — Địa chỉ email
- **Loại tài khoản** — `student`, `personnel`, `tech`, `dev`
- **Trạng thái** — `active`, `suspended`, `banned`
- **Hành động** — Chỉnh sửa, xóa, khóa/mở khóa tài khoản

---

## 8. Hàn Lâm — Cơ Sở Học Thuật

Nhóm tính năng này quản lý các đơn vị tổ chức học thuật.

### 8.1. Quản lý Khoa

**Đường dẫn:** `/admin/academic/departments`

<!-- PLACEHOLDER_IMAGE: admin_departments_page -->
> 📷 *[Hình ảnh: Trang Quản lý Khoa]*

Quản lý danh sách các Khoa / Đơn vị học thuật trong trường.

**Thao tác:**
- Xem danh sách các khoa
- Thêm khoa mới
- Chỉnh sửa thông tin khoa
- Xóa khoa (cần không còn liên kết với ngành, nhân sự)

### 8.2. Quản lý Tòa nhà

**Đường dẫn:** `/admin/academic/buildings`

<!-- PLACEHOLDER_IMAGE: admin_buildings_page -->
> 📷 *[Hình ảnh: Trang Quản lý Tòa nhà]*

Quản lý các tòa nhà trong khuôn viên trường:
- Tên tòa nhà
- Mô tả / số tầng
- Thêm, sửa, xóa tòa nhà

### 8.3. Quản lý Phòng học

**Đường dẫn:** `/admin/academic/rooms`

<!-- PLACEHOLDER_IMAGE: admin_rooms_page -->
> 📷 *[Hình ảnh: Trang Quản lý Phòng học]*

Quản lý các phòng học/thực hành:
- Mã phòng, tên phòng
- Sức chứa, loại phòng
- Liên kết với tòa nhà
- Thêm, sửa, xóa phòng

### 8.4. Quản lý Học kỳ

**Đường dẫn:** `/admin/academic/semesters`

<!-- PLACEHOLDER_IMAGE: admin_semesters_page -->
> 📷 *[Hình ảnh: Trang Quản lý Học kỳ]*

Quản lý các học kỳ trong năm học:
- Tên học kỳ, năm học
- Ngày bắt đầu / kết thúc
- Thêm, sửa, xóa học kỳ

---

## 9. Hệ Thống — Phân Quyền và Cài Đặt

### 9.1. Quản lý Vai trò (Roles)

**Đường dẫn:** `/admin/system/roles`

<!-- PLACEHOLDER_IMAGE: admin_roles_page -->
> 📷 *[Hình ảnh: Trang Quản lý Vai trò — Bảng danh sách Roles]*

Trang quản lý vai trò hệ thống với các chức năng:

#### Xem danh sách Vai trò

Bảng hiển thị:
- **ID Vai trò** — Mã định danh
- **Tên vai trò** — Tên hiển thị
- **Mặc định** — Đánh dấu vai trò được áp dụng mặc định cho tài khoản mới

#### Tạo Vai trò mới

<!-- PLACEHOLDER_IMAGE: create_role_dialog -->
> 📷 *[Hình ảnh: Dialog tạo vai trò mới]*

1. Nhấn nút **"Thêm vai trò"** (góc trên phải).
2. Điền **ID vai trò** (số nguyên, chỉ nhập khi tạo mới).
3. Nhập **Tên vai trò**.
4. Tích chọn **"Mặc định"** nếu muốn áp dụng cho tài khoản mới.
5. Nhấn **Tiếp tục** để lưu.

#### Chỉnh sửa Vai trò

1. Nhấn biểu tượng bút chì (Edit) trên hàng tương ứng.
2. Cập nhật thông tin.
3. Nhấn **Tiếp tục**.

#### Phân quyền cho Vai trò

<!-- PLACEHOLDER_IMAGE: role_authorities_dialog -->
> 📷 *[Hình ảnh: Dialog cập nhật Quyền hạn (Authorities) cho Vai trò]*

1. Nhấn biểu tượng Shield trên hàng vai trò cần cấu hình.
2. Dialog **"Cập nhật Quyền hạn"** mở ra với danh sách tất cả quyền có trong hệ thống.
3. Tích chọn/bỏ chọn các quyền muốn gán cho vai trò.
4. Nhấn **Tiếp tục** để lưu.

> ⚠️ **Cảnh báo:** Thay đổi quyền hạn có hiệu lực ngay lập tức. Xem xét kỹ trước khi lưu.

#### Xóa Vai trò

1. Nhấn biểu tượng Thùng rác (Trash) trên hàng tương ứng.
2. Xác nhận trong hộp thoại cảnh báo.
3. Nhấn **Tiếp tục** để xác nhận xóa.

> ⚠️ Không thể xóa vai trò đang được gán cho tài khoản đang hoạt động.

---

### 9.2. Cài Đặt Hệ Thống

**Đường dẫn:** `/admin/system/settings`

<!-- PLACEHOLDER_IMAGE: admin_settings_page -->
> 📷 *[Hình ảnh: Trang Cài đặt hệ thống — Schema mặc định và quy tắc sinh mã]*

Trang này gồm **3 phần chính**:

#### A. Cấu trúc Hồ sơ Mặc định

<!-- PLACEHOLDER_IMAGE: default_schema_config -->
> 📷 *[Hình ảnh: Card cấu hình Schema mặc định cho Sinh viên và Cán bộ]*

Cho phép chọn **Schema (cấu trúc hồ sơ) mặc định** cho từng nhóm:

| Nhóm | Schema áp dụng |
|---|---|
| **Sinh viên** | Schema có mã bắt đầu `STD` |
| **Cán bộ / Giảng viên** | Schema có mã bắt đầu `EMP` |

**Cách cài đặt:**
1. Chọn schema từ dropdown tương ứng.
2. Nhấn **"Lưu cấu hình cấu trúc"**.

#### B. Hướng dẫn Quy tắc Sinh mã

Card bên phải giải thích cách thức hoạt động của **quy tắc sinh mã tự động**:

| Thành phần | Mô tả |
|---|---|
| **Tiền tố (Prefix)** | Ký tự đầu đại diện cho nhóm (ví dụ: `SV`, `NV`) |
| **Năm hiện tại** | Dạng 2 số (`26`) hoặc 4 số (`2026`) |
| **Số thứ tự** | Tăng tự động, có đệm số 0 |

*Ví dụ mã sinh ra:* `SV26001`, `SV26002`, ...

#### C. Quy tắc Sinh mã Tự động

<!-- PLACEHOLDER_IMAGE: auto_code_rules -->
> 📷 *[Hình ảnh: Hai Card quy tắc sinh mã — Sinh viên (xanh lá) và Cán bộ (xanh dương)]*

Có hai card song song: **Mã sinh viên** và **Mã cán bộ/giảng viên**.

Mỗi card gồm:

| Thao tác | Mô tả |
|---|---|
| **Bật/Tắt quy tắc** | Toggle Switch — bật để kích hoạt tự động sinh mã |
| **Xem trước mã tiếp theo** | Hiển thị mẫu mã sẽ được sinh ra |
| **Tiền tố (Prefix)** | Nhập chuỗi ký tự đầu (ví dụ: `SV`, `GV`) |
| **Độ dài số thứ tự** | Chọn 3–6 chữ số (3 → `001`, 6 → `000001`) |
| **Số thứ tự hiện tại** | Giá trị hiện tại của bộ đếm |
| **Định dạng Năm** | `YY` (2 số) hoặc `YYYY` (4 số) |
| **Nhúng năm vào mã** | Toggle — bật để thêm năm vào mã |

**Lưu quy tắc:**
- Nhấn **"Lưu quy tắc Sinh viên"** (xanh lá) để lưu quy tắc sinh viên.
- Nhấn **"Lưu quy tắc Cán bộ"** (xanh dương) để lưu quy tắc cán bộ.

---

## 10. Onboarding — Nhập Liệu Hàng Loạt

**Đường dẫn:** `/admin/onboarding`

<!-- PLACEHOLDER_IMAGE: admin_onboarding_dashboard -->
> 📷 *[Hình ảnh: Dashboard Onboarding — Danh sách phiên nhập liệu]*

Tính năng Onboarding cho phép quản trị viên **nhập hàng loạt** hồ sơ sinh viên hoặc nhân sự vào hệ thống thông qua wizard từng bước.

### 10.1. Xem danh sách phiên Onboarding

Bảng hiển thị các phiên đã tạo với thông tin:
- **Tên phiên** — Tên do admin đặt
- **Loại** — `student` hoặc `employee`
- **Trạng thái** — Xem bảng bên dưới
- **Ngày tạo** — Thời điểm khởi tạo
- **Hành động** — Xem chi tiết, Xóa

| Trạng thái | Màu Badge | Ý nghĩa |
|---|---|---|
| `completed` | Xanh lá | Đã hoàn thành |
| `processing` | Xanh dương (nhấp nháy) | Đang xử lý |
| `ready` | Vàng | Sẵn sàng xử lý |
| `failed` | Đỏ | Thất bại |

### 10.2. Tạo phiên Onboarding mới

<!-- PLACEHOLDER_IMAGE: onboarding_wizard_step1 -->
> 📷 *[Hình ảnh: Wizard Onboarding — Bước 1: Chọn loại và đặt tên]*

1. Nhấn **"Onboarding mới"** (góc trên phải).
2. Wizard sẽ hướng dẫn qua **3 bước**:

**Bước 1:** Cấu hình cơ bản
- Đặt tên cho phiên
- Chọn loại đối tượng: `Sinh viên` hoặc `Cán bộ`

<!-- PLACEHOLDER_IMAGE: onboarding_wizard_step2 -->
> 📷 *[Hình ảnh: Wizard Onboarding — Bước 2: Tải lên và ánh xạ dữ liệu]*

**Bước 2:** Tải dữ liệu
- Tải lên file dữ liệu (CSV/Excel)
- Ánh xạ các cột dữ liệu với trường hồ sơ tương ứng

<!-- PLACEHOLDER_IMAGE: onboarding_wizard_step3 -->
> 📷 *[Hình ảnh: Wizard Onboarding — Bước 3: Xác nhận và xử lý]*

**Bước 3:** Xác nhận và xử lý
- Xem lại dữ liệu trước khi nhập
- Nhấn **Xử lý** để bắt đầu nhập hàng loạt

### 10.3. Xóa phiên Onboarding

1. Nhấn menu ba chấm (...) trên hàng phiên cần xóa.
2. Chọn **"Xóa"**.
3. Xác nhận trong hộp thoại cảnh báo.

> ⚠️ Xóa phiên onboarding **không** xóa dữ liệu đã được nhập vào hệ thống.

---

## 11. Tài Chính — Quản Lý Hóa Đơn

**Đường dẫn:** `/admin/finance/invoices`

<!-- PLACEHOLDER_IMAGE: admin_finance_invoices -->
> 📷 *[Hình ảnh: Trang Quản lý Hóa đơn]*

Phân hệ tài chính cho phép quản trị viên:

- Xem danh sách hóa đơn học phí / dịch vụ
- Tìm kiếm và lọc hóa đơn theo trạng thái
- Xem chi tiết hóa đơn từng sinh viên
- Cập nhật trạng thái thanh toán

> 📌 *Tính năng này đang trong giai đoạn phát triển. Các chức năng chi tiết sẽ được bổ sung trong phiên bản tiếp theo.*

---

## 12. Cài Đặt Tài Khoản Cá Nhân

**Đường dẫn:** `/account`

<!-- PLACEHOLDER_IMAGE: account_settings_page -->
> 📷 *[Hình ảnh: Trang Cài đặt tài khoản cá nhân — 3 Tab]*

Mỗi quản trị viên có trang cài đặt tài khoản riêng với **3 tab**:

### Tab 1: Hồ sơ (Profile)

<!-- PLACEHOLDER_IMAGE: account_profile_tab -->
> 📷 *[Hình ảnh: Tab Hồ sơ — Thông tin cá nhân]*

- Xem và cập nhật **thông tin cá nhân** (họ tên, ngày sinh, v.v.)
- Cập nhật **email**, **số điện thoại**
- Xem **mã định danh** (mã sinh viên / mã cán bộ nếu có)
- Xem **loại tài khoản** và **trạng thái** hiện tại

### Tab 2: Bảo mật (Security)

<!-- PLACEHOLDER_IMAGE: account_security_tab -->
> 📷 *[Hình ảnh: Tab Bảo mật — Đổi mật khẩu và nhật ký]*

- **Đổi mật khẩu** — Nhập mật khẩu cũ, mới và xác nhận
- **Nhật ký bảo mật** — Xem 5 lần đăng nhập/thay đổi gần nhất (thời gian, địa chỉ IP, loại sự kiện)

### Tab 3: Tùy chọn (Preferences)

<!-- PLACEHOLDER_IMAGE: account_preferences_tab -->
> 📷 *[Hình ảnh: Tab Tùy chọn — Cài đặt giao diện và ngôn ngữ]*

- **Ngôn ngữ** — Chuyển đổi giữa Tiếng Việt (`vi`) và Tiếng Anh (`en`)
- **Giao diện** — Chế độ sáng / tối / theo hệ thống

---

## Phụ Lục A — Bảng Tóm Tắt Đường Dẫn

| Chức năng | Đường dẫn |
|---|---|
| Đăng nhập | `/login` |
| Dashboard Admin | `/admin` |
| Quản lý Sinh viên | `/admin/students` |
| Quản lý Nhân sự | `/admin/personnel` |
| Quản lý Tài khoản | `/admin/accounts` |
| Khoa | `/admin/academic/departments` |
| Tòa nhà | `/admin/academic/buildings` |
| Phòng học | `/admin/academic/rooms` |
| Học kỳ | `/admin/academic/semesters` |
| Vai trò & Quyền | `/admin/system/roles` |
| Cài đặt hệ thống | `/admin/system/settings` |
| Onboarding | `/admin/onboarding` |
| Onboarding mới | `/admin/onboarding/new` |
| Hóa đơn | `/admin/finance/invoices` |
| Cài đặt tài khoản | `/account` |

---

## Phụ Lục B — Giải Thích Thuật Ngữ

| Thuật ngữ | Giải thích |
|---|---|
| **Profile (Hồ sơ)** | Bản ghi thông tin cá nhân, không phải tài khoản đăng nhập |
| **Account (Tài khoản)** | Thông tin xác thực dùng để đăng nhập vào hệ thống |
| **Schema** | Cấu trúc hồ sơ định nghĩa các trường dữ liệu cần thu thập |
| **STD Schema** | Schema dành cho sinh viên (mã bắt đầu `STD`) |
| **EMP Schema** | Schema dành cho cán bộ/giảng viên (mã bắt đầu `EMP`) |
| **Authority** | Quyền hạn cụ thể trong hệ thống (ví dụ: đọc, ghi, xóa dữ liệu) |
| **Role** | Vai trò tập hợp nhiều quyền hạn, gán cho tài khoản |
| **Auto Code** | Quy tắc tự động sinh mã định danh (mã SV, mã cán bộ) |
| **Onboarding** | Quy trình nhập liệu hàng loạt hồ sơ vào hệ thống |
| **Suspended** | Tài khoản bị tạm đình chỉ — không thể đăng nhập |
| **Banned** | Tài khoản bị cấm vĩnh viễn |

---

*Tài liệu này được tạo từ mã nguồn dự án QuickUni. Để cập nhật hình ảnh minh họa, thay thế các placeholder `<!-- PLACEHOLDER_IMAGE: ... -->` bằng hình chụp màn hình thực tế.*
