TAG=v4.1.5
TITLE=FUXUE SILENT PRO v4.1.5 — Chống Mở Tab Trùng Lặp & Tự Động Đóng Tab Đã Học Hoàn Thành (100 Điểm)
BODY=
## FUXUE SILENT PRO v4.1.5 — Chống Mở Tab Trùng Lặp & Tự Động Đóng Tab Đã Học Hoàn Thành (100 Điểm)

- **Chống mở tab trùng lặp & Bảo vệ trang chủ (Deduplication Guard & Homepage Protection):**
  - Loại trừ hoàn toàn trang chủ (`/home/homepage`, root, `/login`, `/index`) khỏi bộ nhận diện danh sách bài học `isListPage()`, đảm bảo người dùng truy cập trang chủ không bao giờ bị cướp trang hoặc tự động nhảy bài.
  - Tích hợp cơ chế phát hiện tab trùng lặp đa tầng thời gian thực qua Background Service Worker (`chrome.tabs.onUpdated` và sự kiện `CHECK_DUPLICATE_PLAY_TAB`): Tự động phát hiện khi có nhiều tab cùng mở một khóa học (`courseId`), giữ lại tab gốc đang học và đóng ngay lập tức các tab trùng lặp thừa.
  - Guard kiểm tra tab đang học ngầm (`HAS_ACTIVE_STUDY_TAB`): Trang danh mục / tìm kiếm không bao giờ tự ý mở thêm tab nếu đã có một tab khóa học đang chạy.
- **Tự động đóng tab bài đã hoàn tất (Auto-Close Completed Tabs):**
  - Khi một khóa học đã hoàn tất và có dữ liệu trong "Exam record：" đạt 100 điểm (hoặc $\ge 80$), tiện ích tự động đóng tab đã học sau 2.5 giây (`COURSE_COMPLETED_CLOSE_TAB` qua `chrome.tabs.remove`) và chuyển sang khóa tiếp theo nếu bật Auto-Farm.
  - Đồng bộ xử lý tự động đóng tab sau 2.5s khi nộp bài thi đạt 100/100, khi thi qua môn, hoặc khi khóa học hoàn thành 100% không có đề thi (No Exam).
- **Đồng bộ toàn diện tài liệu & mã nguồn:** Cập nhật `ABOUT.txt`, `README.md`, `CHANGELOG.md`, `USERGUIDE.md`, `RELEASE_NOTES.md`.

### Cài đặt
1. Giải nén file zip hoặc tải mã nguồn
2. Mở trình duyệt Chromium (Chrome / Edge / Cốc Cốc / Brave), truy cập `chrome://extensions/`
3. Bật **Chế độ dành cho nhà phát triển (Developer mode)**
4. Nhấn **Tải tiện ích đã giải nén (Load unpacked)** và chọn thư mục `fuxue-silent-pro-v4.0.3`
