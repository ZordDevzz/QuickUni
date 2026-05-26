# I18n Scanner Script Design

## 1. Overview
Thiết kế script CLI để tự động quét toàn bộ mã nguồn của dự án (TS/TSX) nhằm phát hiện hai vấn đề liên quan đến đa ngôn ngữ (i18n):
1. Các đoạn text tĩnh (hardcoded text) hiển thị trên giao diện người dùng nhưng chưa được tích hợp i18n.
2. Các key i18n được sử dụng trong code (thông qua hàm `t`) nhưng chưa được định nghĩa đầy đủ trong các file dịch thuật (`messages/vi.json`, `messages/en.json`).

## 2. Technical Stack
- **Ngôn ngữ:** TypeScript.
- **Thư viện chính:** `ts-morph` (phân tích AST của TypeScript).
- **Thực thi:** Chạy thông qua `tsx` (đã có sẵn trong dự án).

## 3. Architecture & Data Flow

### 3.1. Parsing i18n Messages
- Script sẽ duyệt thư mục `messages/` và tải tất cả các file JSON (`en.json`, `vi.json`).
- Hàm tiện ích `flattenObject` sẽ được sử dụng để chuyển đổi cấu trúc JSON lồng nhau thành các key phẳng (e.g., `{"Admin": {"Title": "..."}}` -> `Admin.Title`).
- Dữ liệu sẽ được lưu trữ trong một cấu trúc Map/Record để tra cứu O(1): `Map<Language, Set<string>>`.

### 3.2. AST Traversal với ts-morph
- Khởi tạo project `ts-morph` và nạp toàn bộ các file tại `src/**/*.{ts,tsx}`.
- Script sẽ bỏ qua các file không liên quan (như CSS, thư mục `tests/`).

#### 3.2.1. Phát hiện Hardcoded Text
- **JsxText:** Tìm các node `JsxText`. Nếu text chứa ký tự chữ cái (không phải chỉ toàn khoảng trắng hoặc ký tự đặc biệt) thì ghi nhận là hardcoded.
- **Attributes:** Tìm các prop như `placeholder`, `title`, `alt`, `aria-label` trên các thẻ JSX. Nếu giá trị là một `StringLiteral` (chuỗi tĩnh), ghi nhận là hardcoded.
- **Ngoại lệ:** Bỏ qua các chuỗi nếu chúng là tham số của hàm `t()` hoặc nằm trong cấu trúc đã biết không phải text UI (như `className`).

#### 3.2.2. Phát hiện Missing Keys
- **Xác định Namespace:** Tìm các thẻ gọi hook `useTranslations`. Trích xuất namespace từ đối số truyền vào (ví dụ: `const t = useTranslations("Admin")` -> namespace là `Admin`).
- **Xác định Key:** Tìm các lời gọi hàm từ biến được gán (thường là `t("Key")`).
- **Tổng hợp:** Kết hợp `Namespace` và `Key` (thành `Admin.Key`). So sánh key này với danh sách key của từng ngôn ngữ đã phân tích ở bước 3.1.
- Ghi nhận những ngôn ngữ bị thiếu key.

### 3.3. Output Generation
- Kết quả sẽ được định dạng và ghi ra một file text có tên `i18n-report.txt` ở thư mục gốc của dự án.
- Báo cáo được chia thành 2 phần rõ rệt:
  - **Phần 1: Lỗi Text Hardcode**
    - Format: `[HARDCODE] src/path/to/file.tsx:25 - "Nội dung text"`
  - **Phần 2: Lỗi Thiếu Key Dịch Thuật**
    - Format: `[MISSING] src/path/to/file.tsx:40 - Key "Admin.Title" thiếu trong: vi.json, en.json`

## 4. Integration
- Cài đặt `ts-morph` bằng lệnh: `npm install -D ts-morph`
- Script sẽ được đặt tại: `scripts/i18n-scan.ts`
- Thêm script vào `package.json`: `"i18n:scan": "tsx scripts/i18n-scan.ts"`
