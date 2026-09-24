# 📑 Nhật Ký Thay Đổi (Changelog) - FUXUE SILENT PRO

Tất cả các thay đổi quan trọng của dự án FUXUE SILENT PRO được ghi lại chi tiết tại đây theo chuẩn Semantic Versioning.

## [v4.1.3] - 2026-09-24

### 🐛 Sửa lỗi & Tối ưu hóa (Hotfix)
- **Khắc phục xung đột bộ chọn PDF (.pdflogo DOM template):**
  - Xử lý triệt để lỗi thẻ ẩn `.pdflogo` nằm trong `<div class="pdfwarp dpn" style="display: none;">` của template Foxconn khiến extension nhận diện nhầm video là tài liệu PDF và bỏ qua luồng tự động phát video (`else if (video)`).
  - Chuẩn hóa bộ lọc: Ưu tiên thuộc tính `currentWare.type` (`mp4`/`flv` vs `pdf`/`doc`) từ máy chủ Foxconn; chỉ kích hoạt PDF mode khi đối tượng bài học thực sự là PDF hoặc container PDF hiển thị thực tế (`offsetParent !== null` và không có class `.dpn`).
- **Tăng cường đồng bộ hóa Player (`window.videoPlayer.play()`):**
  - Bổ sung lệnh đánh thức trực tiếp đối tượng Video.js instance trong `forcePlayVideo`, đảm bảo video luôn phát trơn tru và tự phục hồi ngay lập tức nếu bị ngắt quãng.

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
