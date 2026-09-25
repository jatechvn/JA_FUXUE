# 📑 Nhật Ký Thay Đổi (Changelog) - FUXUE SILENT PRO

Tất cả các thay đổi quan trọng của dự án FUXUE SILENT PRO được ghi lại chi tiết tại đây theo chuẩn Semantic Versioning.

## [v4.1.4] - 2026-09-25

### 🚀 Nâng cấp & Tính năng mới (Idea 1 - Auto-Farm Next Course & Smart Credit Filter)
- **Tự động cày danh sách khóa học (Auto-Farm Next Course):**
  - Tự động quét và lưu danh sách khóa học từ các trang danh mục / tìm kiếm (`/public/home/search`, `/category/show`, `/user/studyTask`) vào hàng đợi `ja_fuxue_course_queue`.
  - Hiển thị badge trạng thái hàng đợi `Auto-Farm [Q: N]` trực tiếp trên thanh Liquid Glass HUD. Người dùng có thể click để Bật/Tắt nhanh tính năng này.
  - Tích hợp công tắc bật/tắt Auto-Farm trong Extension Popup (`popup.html` và `popup.js`).
  - Khi hoàn thành một khóa học (thi đỗ $\ge 80$ hoặc 100/100, hoặc học xong toàn bộ bài không có kỳ thi), FUXUE tự động ghi nhận vào `ja_fuxue_completed_courses` và tự động điều hướng sang khóa học hợp lệ tiếp theo trong hàng đợi.
- **Tự động đóng tab bài 0 điểm (Auto-Close 0-Credit Tabs):**
  - Tích hợp Background Service Worker (`background.js`) và Isolated Bridge (`bridge.js`) với quyền `"tabs"`.
  - Khi phát hiện khóa học 0 tín chỉ (`Credit Score: (0)`): Tự động hiển thị countdown `BỎ QUA (0 ĐIỂM) - ĐÓNG TAB ⏭️` trên HUD và tự động đóng tab sau 2.5 giây thông qua `chrome.tabs.remove()`.
  - Nếu Auto-Farm đang bật: Tự động mở khóa học có điểm tiếp theo trong hàng đợi đồng thời đóng tab 0 điểm cũ.
- **Nhận diện Lịch sử thi thông minh (Exam Record Smart Check - Chống thi lặp lại):**
  - Tự động kích hoạt kiểm tra tab `Exam record` (`#ksjl`) trên trang học thông qua `loadExamRecordList()` / `a.ksjl`.
  - Phân tích đa ngôn ngữ: `Is Get: Yes` / `Valid or not: Yes` (Đã nhận tín chỉ), và bảng `Exam record：` (`Examination Score >= 80`, `Is Pass: Yes` / `及格: 是`).
  - Khi phát hiện khóa học đã từng thi đạt: Lập tức ghi nhận hoàn thành vào `ja_fuxue_completed_courses`, hiển thị HUD `ĐÃ THI ĐẠT (100 Đ) 🏆`, khóa chặt không cho gọi lại `examUI()`, và tự động chuyển thẳng sang khóa học kế tiếp nếu Auto-Farm đang bật. Triệt tiêu hoàn toàn hiện tượng làm đi làm lại đề đã đạt điểm!
- **Bộ lọc tín chỉ thông minh (Smart Credit Score Filter):**
  - Tự động phát hiện số điểm học phần / tín chỉ của khóa học trên trang học tập (`/public/play/play`, `/public/play/playCourse`) và trang danh sách khóa học.
  - Nhận diện đa ngôn ngữ:
    - Tiếng Anh: `Credit Score：(0)`, `Credit Score: 0` (hỗ trợ cả dấu hai chấm toàn giác `：` và bán giác `:`).
    - Tiếng Trung: `学分：(0)`, `学分：0`.
    - Tiếng Việt: `Điểm học phần：(0)`.
  - Tự động bỏ qua các khóa học 0 tín chỉ (`Credit Score = 0`) vì đây là các khóa phổ biến không có bài thi và không đóng góp vào KPI tín chỉ.
  - Khi phát hiện khóa 0 điểm: Lập tức dừng phát video, chuyển trạng thái HUD sang `BỎ QUA (0 ĐIỂM) - ĐÓNG TAB ⏭️`, ghi nhận cảnh báo vào nhật ký `[CREDIT_FILTER]`, lưu vào danh sách đã bỏ qua `ja_fuxue_skipped_courses` và kích hoạt tự động đóng tab.
  - Tích hợp công tắc **"Bỏ qua bài 0 điểm"** trong Popup (`chk-filter-credits`) kèm badge trạng thái trực quan.

### 📦 Phát hành
- Đồng bộ version 4.1.4 trong `manifest.json`, `content.js`, `inject.js`, `bridge.js`, `background.js`, `popup.html`, `popup.css`, `popup.js`, `auto_study_foxconn_v4.0.3_full.js`, `ABOUT.txt`, `README.md`, `USERGUIDE.md`, `RELEASE_NOTES.md`.

---

## [v4.1.3] - 2026-09-24

### 🐛 Sửa lỗi & Tối ưu hóa (Hotfix)
- **Khắc phục xung đột bộ chọn PDF (.pdflogo DOM template):**
  - Xử lý triệt để lỗi thẻ ẩn `.pdflogo` nằm trong `<div class="pdfwarp dpn" style="display: none;">` của template Foxconn khiến extension nhận diện nhầm video là tài liệu PDF và bỏ qua luồng tự động phát video (`else if (video)`).
  - Chuẩn hóa bộ lọc: Ưu tiên thuộc tính `currentWare.type` (`mp4`/`flv` vs `pdf`/`doc`) từ máy chủ Foxconn; chỉ kích hoạt PDF mode khi đối tượng bài học thực sự là PDF hoặc container PDF hiển thị thực tế (`offsetParent !== null` và không có class `.dpn`).
- **Tăng cường đồng bộ hóa Player (`window.videoPlayer.play()`):**
  - Bổ sung lệnh đánh thức trực tiếp đối tượng Video.js instance trong `forcePlayVideo`, đảm bảo video luôn phát trơn tru và tự phục hồi ngay lập tức nếu bị ngắt quãng.
- **Bảo mật giao diện Popup (Anti-XSS):**
  - Chuyển đổi toàn bộ phương thức dựng nhật ký hoạt động (`renderLogs` trong `popup.js`) từ `innerHTML` sang `DocumentFragment` và gán thuộc tính văn bản an toàn qua `textContent` (theo đề xuất từ Codex / `gpt-ecc-agent-code-reviewer`), triệt tiêu hoàn toàn nguy cơ chèn mã HTML độc hại.

### 📦 Phát hành
- Đồng bộ version 4.1.3 trong `manifest.json`, `content.js`, `inject.js`, `popup.html`, `auto_study_foxconn_v4.0.3_full.js`, `ABOUT.txt`, `README.md`, `USERGUIDE.md`, `RELEASE_NOTES.md`.

---

## [v4.1.2] - 2026-09-24

### 🚀 Nâng cấp & Tính năng mới
- **Nút Master Stop / Resume:** Bổ sung nút bấm dừng / tiếp tục tự động học ngay trên giao diện nổi (Liquid Glass HUD) và trong Extension Popup (`popup.html`). Giúp người dùng chủ động tạm dừng toàn bộ vòng lặp tự động mà không cần tắt extension.
- **Thuật toán tự động giải đề 2 giai đoạn (2-Phase Smart Exam Solver):**
  - **Giai đoạn 1 (Fast Probe):** Khi gặp đề thi mới chưa có đáp án, tự động nộp bài nhanh để kích hoạt Foxconn trả về trang kết quả có chứa từ khóa `Correct Answer` / `正确答案` / `Đáp án đúng`.
  - **Giai đoạn 2 (Perfect Score Retake):** Tự động bóc tách 100% đáp án chuẩn từ hệ thống, ghi nhớ vào `ja_fuxue_exam_kb` (LocalStorage) và tự động làm lại đề thi để đạt điểm tuyệt đối 100/100.
  - Hỗ trợ đầy đủ cả câu hỏi **Đơn lựa chọn (Single-Choice)** và **Đa lựa chọn (Multi-Choice)** với thuật toán thử nghiệm tổ hợp loại trừ an toàn.
- **Khắc phục lỗi hoàn thành PDF (100% Guaranteed):**
  - Fix triệt để lỗi tỷ lệ hoàn thành $N-1$ trang (Foxconn `onCurrentPageChanged` chỉ tăng `playtime` khi chuyển trang, dẫn đến việc lật từ trang $1 \to N$ bị thiếu 1 tick, ví dụ 14/15 = 93% < 97%).
  - Tự động bù tick khởi đầu và kích hoạt sự kiện hoàn tất trang cuối cùng để đảm bảo luôn đạt đúng 100%.
- **Chuyển hướng an toàn cho khóa học không có đề thi (No Exam Protection):**
  - Nhận diện thông minh thông báo `"No Exam"` / `"Khóa học không có kỳ thi"` và dừng chuyển hướng sai sang `/public/play/examUI`.

### 🐛 Sửa lỗi & Tối ưu hóa
- **Khắc phục xung đột nhận diện PDF (.pdflogo DOM template):** Phân tách chính xác giữa Video (mp4/flv) và PDF (pdf/doc) dựa trên thuộc tính `currentWare.type`, khắc phục triệt để lỗi thẻ ẩn `.pdflogo` khiến extension nhận diện nhầm video là PDF và dừng phát tự động.
- **Chống desync và duplicate clicks:** Khóa cờ trạng thái `window._jaExamSolving` và loại bỏ click lặp gây uncheck các ô checkbox trên giao diện câu hỏi nhiều đáp án.
- **Tối ưu hóa Audio Heartbeat:** Đảm bảo tab không bị đóng băng khi trình duyệt Chromium chạy ngầm hoặc thu nhỏ.
- **Đồng bộ hóa giao diện cài đặt:** Cập nhật `FUXUE_V4_PRO_INSTALLER.html` và `index.html` lên phiên bản v4.1.2.

### 📦 Phát hành
- Đồng bộ version 4.1.2 trong `manifest.json`, `content.js`, `inject.js`, `popup.html`, `auto_study_foxconn_v4.0.3_full.js`, `ABOUT.txt`, `README.md`, `USERGUIDE.md`, `RELEASE_NOTES.md`.

---

## [v4.0.3] - 2026-08-25
- Phát hành phiên bản nền tảng Pure Organic Playback (1.0x Real-time).
- Tích hợp Liquid Glass HUD trực tiếp trên trình duyệt.
- Hỗ trợ học Video và tài liệu cơ bản.
