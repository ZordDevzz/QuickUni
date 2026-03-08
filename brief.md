# QuickUni - Hệ Thống Quản Lý Đào Tạo Và Tương Tác Sinh Viên - Nhà Trường

## 1. Mục Tiêu Dự Án

### 1.1 Sản Phẩm Đích

Phát triển một **hệ thống tương tự quản lý đào tạo và trao đổi thông tin** giữa nhà trường và sinh viên, nhằm số hóa quy trình quản lý giáo dục và cải thiện trải nghiệm của sinh viên.

### 1.2 Chức Năng Chính

#### **Phía Nhà Trường**
- Quản lý thông tin sinh viên, giảng viên, ngành học, khóa học, lịch học
- Đăng tải thông báo và tài liệu học tập
- Theo dõi tiến độ học tập của sinh viên
- Trao đổi trực tiếp với sinh viên qua các kênh liên lạc built-in

#### **Phía Sinh Viên**
- Xem thông tin cá nhân, lịch học, điểm số
- Nhận thông báo và tài liệu học tập từ nhà trường
- Trao đổi trực tiếp với nhà trường qua các kênh liên lạc built-in
- Đăng ký môn học, tín chỉ, ngành học bổ xung
- Xem tiến độ học tập

### 1.3 Định Hướng Mở Rộng

#### **Hệ Thống Tài Chính**
- Quản lý học phí, lệ phí, các khoản thu chi liên quan đến sinh viên
- Cung cấp các phương thức thanh toán trực tuyến

#### **Quản Lý Cơ Sở Vật Chất**
- Quản lý phòng học, thiết bị dạy học, thư viện
- Đặt lịch sử dụng cơ sở vật chất cho các hoạt động học tập và sự kiện

#### **Quản Lý Thủ Tục Hành Chính**
- Quản lý hồ sơ sinh viên, các thủ tục nhập học, chuyển ngành, tốt nghiệp
- Cung cấp các biểu mẫu và hướng dẫn thực hiện các thủ tục hành chính

---

## 2. Cấu Trúc Ứng Dụng

### 2.1 WebApp

#### **Backend**
- Cơ sở dữ liệu và API phục vụ cho Frontend của cả mobile app và web app

#### **Frontend**
- Giao diện quản lý cho nhà trường với đầy đủ chức năng
- Giao diện thông tin và tương tác cho sinh viên với đầy đủ chức năng

### 2.2 MobileApp

#### **Phía Sinh Viên**
- Xem thông tin cá nhân, lịch học, điểm số
- Nhận thông báo và tài liệu học tập từ nhà trường
- Trao đổi, giao tiếp trực tiếp với:
  - Nhà trường
  - Các sinh viên khác trong nhà trường
  - Các sinh viên trong cùng lớp học
- Đăng ký môn học, tín chỉ, ngành học bổ xung
- Xem tiến độ học tập

#### **Phía Nhà Trường**
- Đăng tải thông báo và tài liệu học tập
- Theo dõi tiến độ học tập của sinh viên
- Trao đổi với sinh viên

---

## 3. Tech Stack Và Định Hướng Phát Triển

### 3.1 WebApp

| Thành Phần | Công Nghệ | Mục Đích |
|-----------|-----------|---------|
| **Framework Chính** | Next.js | Xây dựng cả frontend và backend, tận dụng server-side rendering và API routes |
| **Database** | PostgreSQL | Lưu trữ dữ liệu dài hạn, truy vấn dữ liệu toàn hệ thống |
| **ORM** | Prisma | Tương tác với PostgreSQL, quản lý dữ liệu hiệu quả |
| **API** | Next.js Route Handlers | Xây dựng API phục vụ frontend (web & mobile) |
| **Scheduled Tasks** | Cron Jobs | Gửi thông báo, cập nhật tiến độ học tập |
| **Form Handling** | TanStack React Form | Quản lý form phức tạp |
| **Validation** | Zod | Đảm bảo tính toàn vẹn dữ liệu |
| **UI/UX** | Tailwind CSS + Shadcn UI | Giao diện hiện đại, responsive |

**Các công nghệ hỗ trợ:**
- NextAuth.js cho xác thực người dùng
- Internationalization cho hỗ trợ đa ngôn ngữ
- TypeScript cho type safety

### 3.2 MobileApp

| Thành Phần | Công Nghệ | Mục Đích |
|-----------|-----------|---------|
| **Framework** | Flutter hoặc React Native | Phát triển ứng dụng di động đa nền tảng (iOS & Android) |

---


*Cập nhật: 08 Tháng 3, 2026*
