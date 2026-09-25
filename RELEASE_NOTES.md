TAG=v4.1.4
TITLE=FUXUE SILENT PRO v4.1.4 — Auto-Farm Danh Sách Khóa Học & Bộ Lọc Tín Chỉ Thông Minh (Smart Credit Filter)
BODY=
## FUXUE SILENT PRO v4.1.4 — Auto-Farm Danh Sách Khóa Học & Bộ Lọc Tín Chỉ Thông Minh (Smart Credit Filter)

- **Auto-Farm Danh Sách Khóa Học (Idea 1):**
  - Tự động quét và lập hàng đợi khóa học (`ja_fuxue_course_queue`) từ các trang danh mục `/public/home/search`, `/category/show`, `/user/studyTask`.
  - Hiển thị badge trạng thái hàng đợi `Auto-Farm [Q: N]` trực tiếp trên Liquid Glass HUD và công tắc bật/tắt trong Popup.
  - Tự động hoàn thành khóa học và điều hướng sang bài học tiếp theo trong hàng đợi khi vượt qua bài thi hoặc bài học kết thúc.
- **Bộ Lọc Tín Chỉ Thông Minh & Tự Động Đóng Tab (Smart Credit Filter & Auto-Close):**
  - Tự động nhận diện điểm học phần/tín chỉ: Hỗ trợ tiếng Anh (`Credit Score：(0)`, `Credit Score: 0`), tiếng Trung (`学分：(0)`), tiếng Việt (`Điểm học phần：(0)`).
  - Tự động dừng phát và bỏ qua các khóa học 0 tín chỉ (`Credit Score = 0`) không có kỳ thi.
  - Tích hợp Background Service Worker (`background.js`) với quyền `"tabs"`, tự động hiển thị đếm ngược và đóng tab 0 điểm sau 2.5 giây. Nếu Auto-Farm đang bật, tự động mở khóa học có điểm kế tiếp trong hàng đợi.
- **Nhận Diện Lịch Sử Thi Thông Minh (Exam Record Smart Check):**
  - Tự động quét và đọc dữ liệu từ tab `Exam record` (`#ksjl`) trên trang học.
  - Phân tích trạng thái `Is Get: Yes` (Đã nhận tín chỉ) và điểm thi trong bảng lịch sử thi.
  - Khi phát hiện khóa học đã từng thi đạt điểm chuẩn ($\ge 80$ hoặc 100/100): Đánh dấu hoàn tất khóa học ngay, khóa luồng gọi đề thi và chuyển sang khóa tiếp theo trong hàng đợi, triệt tiêu hoàn toàn lỗi thi lặp lại đề cũ.
- **Đồng bộ toàn diện tài liệu & mã nguồn:** Cập nhật `ABOUT.txt`, `README.md`, `CHANGELOG.md`, `USERGUIDE.md`, `RELEASE_NOTES.md`, `IDEAS.md`.

### Cài đặt
1. Giải nén file zip hoặc tải mã nguồn
2. Mở trình duyệt Chromium (Chrome / Edge / Cốc Cốc / Brave), truy cập `chrome://extensions/`
3. Bật **Chế độ dành cho nhà phát triển (Developer mode)**
4. Nhấn **Tải tiện ích đã giải nén (Load unpacked)** và chọn thư mục `fuxue-silent-pro-v4.0.3`

