# 📖 Hướng Dẫn Sử Dụng FUXUE SILENT PRO v4.1.5

Chào mừng bạn đến với **FUXUE SILENT PRO v4.1.5** — Tiện ích mở rộng chuyên dụng cho việc học tập, giải đề thi và hoàn thành khóa học Foxconn E-Learning (`iedu.foxconn.com`).

---

## 1. 📦 Cài Đặt Ban Đầu

### Yêu cầu hệ thống:
- Trình duyệt nền Chromium: Google Chrome, Microsoft Edge, Cốc Cốc, Brave, Opera.
- Thư mục cài đặt: `fuxue-silent-pro-v4.0.3` hoặc file đóng gói trong thư mục `dist/`.

### Các bước cài đặt:
1. Tải về thư mục dự án `fuxue-silent-pro-v4.0.3`.
2. Mở trình duyệt Chrome (hoặc Edge).
3. Gõ trên thanh địa chỉ: `chrome://extensions/` và nhấn Enter.
4. Gạt nút **Chế độ dành cho nhà phát triển (Developer mode)** ở góc trên bên phải màn hình sang trạng thái **BẬT (ON)**.
5. Bấm vào nút **Tải tiện ích đã giải nén (Load unpacked)** ở góc trên bên trái.
6. Chọn thư mục `fuxue-silent-pro-v4.0.3`.
7. Biểu tượng khiên bảo vệ 🛡️ **FUXUE SILENT PRO** sẽ xuất hiện trên thanh công cụ của trình duyệt. Bạn có thể bấm vào biểu tượng ghim để ghim tiện ích ra thanh địa chỉ.

---

## 2. 🎛️ Nút Điều Khiển Master Stop / Resume

Trong phiên bản **v4.1.2**, bạn có toàn quyền kiểm soát việc tự động hóa thông qua nút **Dừng / Tiếp Tục**:

### Cách 1: Thao tác trên giao diện nổi (Liquid Glass HUD)
- Ở góc dưới bên phải trang học tập Foxconn, luôn có một bảng điều khiển mờ nổi (HUD).
- Phía dưới cùng của HUD có nút bấm:
  - Khi đang chạy: Nút màu đỏ **⏹️ Dừng tự động**. Bấm vào để tạm dừng học. Trạng thái sẽ đổi sang **ĐÃ TẠM DỪNG ⏸️**.
  - Khi đang tạm dừng: Nút đổi sang màu xanh ngọc **▶️ Tiếp tục tự động**. Bấm vào để khôi phục tiến trình tự động học.

### Cách 2: Thao tác qua Extension Popup
- Bấm vào biểu tượng extension 🛡️ trên thanh tiện ích Chrome.
- Trên đầu menu có nút bấm lớn **DỪNG TỰ ĐỘNG** / **TIẾP TỤC HỌC**.
- Thao tác tại popup sẽ đồng bộ tức thì với HUD trên trang đang mở.

---

## 3. 📄 Cơ Chế Tự Động Học Tài Liệu PDF (100% Guaranteed)

- Khi mở một bài học dạng PDF hoặc DOC, tiện ích sẽ tự động nhận diện khung đọc tài liệu.
- Thay vì để xảy ra lỗi chỉ đạt 93% do thiếu 1 lần tick chuyển trang ($N-1$), FUXUE v4.1.2 tự động:
  - Khởi tạo tick trang 1 ngay khi vào bài.
  - Lần lượt lật qua các trang với thời gian nghỉ tự nhiên.
  - Bắn sự kiện kết thúc ở trang cuối cùng để đảm bảo hệ thống Foxconn ghi nhận chính xác 100% thời lượng hoàn thành.
- Sau khi đạt 100%, hệ thống tự động chuyển sang bài học tiếp theo hoặc kích hoạt đề thi.

---

## 4. 📝 Cơ Chế Tự Động Giải Đề Thi Thông Minh (2-Phase Smart Exam Solver)

FUXUE v4.1.2 áp dụng giải thuật thi thông minh 2 giai đoạn:

### Giai đoạn 1: Thi nháp bóc tách đáp án (Fast Probe)
- Khi bạn vào một bài thi lần đầu tiên chưa có trong bộ nhớ đáp án:
- FUXUE tự động đánh dấu nhanh các câu hỏi và bấm **Nộp bài** (Submit).
- Khi có thông báo xác nhận nộp bài, tiện ích tự động bấm OK.
- Foxconn sẽ hiển thị trang kết quả kèm đáp án chuẩn qua từ khóa `Correct Answer` (hoặc `正确答案`, `Đáp án đúng`).
- FUXUE lập tức nhận diện, bóc tách và lưu toàn bộ đáp án chuẩn vào bộ nhớ an toàn (`ja_fuxue_exam_kb`).

### Giai đoạn 2: Thi lại chính thức (Perfect Score Retake)
- FUXUE tự động bấm nút **Làm lại bài thi (Retake/Again)**.
- Toàn bộ 100% câu hỏi sẽ được tự động điền theo đáp án chuẩn đã ghi nhớ (hỗ trợ cả trắc nghiệm đơn, trắc nghiệm chọn nhiều đáp án và câu Đúng/Sai).
- Các ô đáp án sẽ tự động chuyển màu xanh trên Answer Card.
- Tự động nộp bài và bạn sẽ đạt số điểm tuyệt đối **100/100**!

### Giai đoạn 3: Nhận diện Lịch sử thi & Chống thi lặp lại (Exam Record Smart Check)
- Khi mở một khóa học, FUXUE tự động kích hoạt truy vấn lịch sử thi (`loadExamRecordList()` trong tab **Exam record** `#ksjl`).
- Hệ thống tự động phân tích:
  - Chỉ số **Course Credit**: `Is Get: Yes` (Đã nhận tín chỉ) / `Valid or not: Yes`.
  - Bảng **Exam record：**: Các lần thi trước với `Examination Score >= 80` và `Is Pass: Yes` (hoặc `及格: 是`).
- **Nếu phát hiện khóa học đã từng thi đạt:**
  - FUXUE hiển thị huy chương **`ĐÃ THI ĐẠT (100 Đ) 🏆`** trên HUD.
  - Ghi nhận hoàn tất khóa học vào bộ nhớ `ja_fuxue_completed_courses`.
  - Khóa chặt không cho phép gọi hàm mở đề thi (`examUI()` / `examLink`).
  - Tự động chuyển thẳng sang bài học tiếp theo trong hàng đợi nếu Auto-Farm đang bật, triệt tiêu hoàn toàn lỗi thi đi thi lại một đề đã có điểm!

---

## 5. 🚜 Tự Động Cày Danh Sách Khóa Học (Auto-Farm Next Course) & Bộ Lọc Tín Chỉ (Smart Credit Filter)

Phiên bản **v4.1.4** tích hợp hệ thống Auto-Farm tự động hóa từ đầu đến cuối danh sách khóa học kèm bộ lọc tín chỉ thông minh:

### 🎯 Cơ chế Auto-Farm hoạt động như thế nào?
1. **Quét hàng đợi tự động:** Khi bạn truy cập vào các trang danh mục hoặc tìm kiếm khóa học (`/public/home/search`, `/category/show`, `/user/studyTask`), FUXUE tự động quét tất cả các thẻ khóa học hiển thị trên trang và nạp vào hàng đợi `ja_fuxue_course_queue`.
2. **Theo dõi trên Liquid Glass HUD:** Trên thanh HUD có badge `Auto-Farm [Q: N]` (trong đó `N` là số khóa học đang chờ trong hàng đợi). Bạn có thể click trực tiếp vào badge này để Bật/Tắt nhanh tính năng Auto-Farm.
3. **Tự động chuyển bài tiếp theo:** Khi hoàn thành bài học cuối cùng và thi đỗ bài thi ($\ge 80$ hoặc 100/100) — hoặc khóa học kết thúc mà không có bài thi — FUXUE tự động thêm mã khóa học vào danh sách đã hoàn thành (`ja_fuxue_completed_courses`) và tự động điều hướng sang khóa học hợp lệ kế tiếp trong hàng đợi.

### 🛡️ Bộ lọc tín chỉ thông minh (Smart Credit Filter - Chỉ học bài có điểm)
- **Mục đích:** Các khóa học không có điểm tín chỉ (`Credit Score: 0`) thường chỉ là bài đọc phổ biến, không có bài thi và không đóng góp vào KPI hoàn thành tín chỉ của học viên.
- **Nhận diện chính xác đa ngôn ngữ:**
  - Tiếng Anh: `Credit Score：(0)`, `Credit Score: 0` (hỗ trợ cả dấu hai chấm toàn giác `：` và bán giác `:`).
  - Tiếng Trung: `学分：(0)`, `学分：0`.
  - Tiếng Việt: `Điểm học phần：(0)`.
- **Hành vi khi phát hiện bài 0 điểm:**
  - Lập tức tạm dừng phát video để tiết kiệm tài nguyên mạng và CPU.
  - Cập nhật trạng thái Liquid Glass HUD: **BỎ QUA (0 ĐIỂM) - ĐÓNG TAB ⏭️** (màu cam cảnh báo).
  - Ghi nhật ký hoạt động: `[CREDIT_FILTER] ⏭️ BỎ QUA KHÓA HỌC: Phát hiện không có điểm tín chỉ... Tự động đóng tab sau 2.5s!`.
  - Lưu mã khóa học vào danh sách bỏ qua `ja_fuxue_skipped_courses` để không bao giờ học lại.
  - **Tự động đóng tab an toàn (Auto-Close Tab):** Sau 2.5 giây đếm ngược, Background Service Worker (`background.js`) tự động gọi API `chrome.tabs.remove()` để đóng sạch tab 0 điểm khỏi trình duyệt.
  - Nếu **Auto-Farm** đang BẬT: Tiện ích tự động mở khóa học có điểm kế tiếp trong hàng đợi trước khi đóng tab cũ.

---

## 6. 🛡️ Chống Mở Tab Trùng Lặp & Tự Động Đóng Tab Đã Học Hoàn Thành (v4.1.5)

### Chống cướp trang chủ (Homepage Protection):
- Tiện ích loại trừ hoàn toàn các trang chủ (`/home/homepage`, `/`, `/login`, `/index`) khỏi bộ quét tự động học. Bạn hoàn toàn có thể mở trang chủ để tìm kiếm, làm việc hoặc đọc tin tức mà không bao giờ bị tiện ích tự ý cướp trang hoặc chuyển hướng bài học.

### Chống mở tab trùng lặp (Deduplication Guard):
- Background Service Worker (`background.js`) giám sát thời gian thực mọi tab Foxconn mở ra:
  - Nếu bạn vô tình hoặc tiện ích mở nhiều tab cùng một khóa học (`courseId`), hệ thống sẽ phát hiện ngay lập tức.
  - Hệ thống tự động **giữ lại tab gốc** đang học và **đóng ngay lập tức các tab trùng lặp thừa**.
  - Khi đang ở trang danh mục / tìm kiếm, nếu phát hiện đang có một tab học chạy ngầm, tiện ích sẽ hiển thị **ĐANG CÓ TAB HỌC ĐANG CHẠY ⏳** và không mở thêm tab mới.

### Tự động đóng tab bài đã học hoàn tất (Auto-Close Completed Tabs):
- Khi một khóa học đã hoàn tất và có dữ liệu trong mục **Exam record：** đạt 100 điểm (hoặc $\ge 80$), tiện ích sẽ:
  1. Hiển thị thông báo trên HUD: **HOÀN THÀNH (100 Đ) - ĐÓNG TAB 🏆**.
  2. Tạm dừng phát video để tiết kiệm tài nguyên.
  3. Đếm ngược 2.5 giây và gửi lệnh tới Background Service Worker để tự động đóng tab đã học.
  4. Nếu bật Auto-Farm, tiện ích tự động mở khóa học có điểm kế tiếp trong hàng đợi.
- Áp dụng tương tự khi bạn vừa nộp bài thi đạt 100/100, khi thi qua môn, hoặc khi khóa học hoàn thành 100% không có bài thi.

---

## 7. 📑 Quản Lý Nhật Ký, Bộ Nhớ Đáp Án & Cấu Hình Popup

Bấm vào biểu tượng extension trên thanh công cụ để mở Popup:
1. **🎛️ Nút Điều Khiển Master:** Bấm **DỪNG TỰ ĐỘNG** / **TIẾP TỤC HỌC** để kiểm soát toàn bộ vòng lặp.
2. **🚜 Auto-Farm Danh Sách Khóa:** Bật/tắt tự động chuyển khóa học liên tục sau khi thi đỗ.
3. **🎯 Bỏ qua bài 0 điểm:** Bật/tắt bộ lọc tín chỉ thông minh (mặc định BẬT để tối ưu KPI).
4. **📑 Nhật Ký (View Logs):** Xem trực tiếp lịch sử hoạt động chi tiết (thời gian chuyển bài, tiến độ video, câu hỏi ghi nhớ, log bỏ qua bài 0 điểm). Bạn có thể bấm **📥 Tải File Log (.txt)** để xuất báo cáo. Nhật ký tự động xóa sau 3 ngày.
5. **📋 Đáp Án (Copy Keys):** Sao chép toàn bộ cơ sở dữ liệu câu hỏi và đáp án đã học vào Clipboard dưới dạng JSON.
6. **🔄 Đặt Lại (Reset Cache):** Xóa sạch bộ nhớ đáp án, hàng đợi Auto-Farm và trạng thái thi nếu bạn muốn làm mới lại từ đầu.

---

## 8. ❓ Câu Hỏi Thường Gặp (Troubleshooting)

**Q1: Video bị tạm dừng khi tôi chuyển sang tab khác?**
> FUXUE tự động khóa các sự kiện `blur` và `visibilitychange`. Video sẽ vẫn chạy mượt mà ngay cả khi bạn thu nhỏ cửa sổ trình duyệt nhờ công nghệ Audio Heartbeat 24/7.

**Q2: Khóa học không có bài thi thì extension có bị lỗi chuyển trang không?**
> Không. FUXUE tự phát hiện thông báo `"No Exam"` / `"Khóa học không có kỳ thi"` và sẽ hoàn tất khóa học an toàn, sau đó tự chuyển sang khóa tiếp theo nếu bật Auto-Farm.

**Q3: Tôi muốn học cả các khóa học 0 tín chỉ thì làm thế nào?**
> Rất đơn giản, mở Extension Popup và gạt tắt công tắc **"Bỏ qua bài 0 điểm"**. FUXUE sẽ học bình thường tất cả các bài.

**Q4: Tôi muốn tự làm bài thi mà không để extension tự động can thiệp?**
> Hãy bấm nút **⏹️ Dừng tự động** trên HUD trước khi vào đề thi. Extension sẽ tạm dừng hoàn toàn cho đến khi bạn bấm **▶️ Tiếp tục tự động**.
