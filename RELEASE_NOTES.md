TAG=v4.1.3
TITLE=FUXUE SILENT PRO v4.1.3 — Sửa lỗi xung đột nhận diện PDF/Video & Tăng cường Player Sync
BODY=
## FUXUE SILENT PRO v4.1.3 — Sửa lỗi xung đột nhận diện PDF/Video & Tăng cường Player Sync

- **Khắc phục xung đột bộ chọn PDF (.pdflogo DOM template):**
  - Xử lý triệt để lỗi thẻ ẩn `.pdflogo` nằm trong `<div class="pdfwarp dpn" style="display: none;">` khiến video bị nhận diện nhầm là PDF và dừng phát tự động.
  - Phân tách chính xác dựa trên `currentWare.type` (`mp4` vs `pdf`) từ server Foxconn, đảm bảo luồng tự động phát video luôn hoạt động liên tục.
- **Tăng cường đồng bộ hóa Player (`window.videoPlayer.play()`):**
  - Gọi trực tiếp Video.js instance trong `forcePlayVideo` để giữ video luôn chạy mượt mà ngay cả khi chuyển tab hoặc sau khi bị gián đoạn mạng.
- **Đồng bộ tài liệu dự án:** Cập nhật `ABOUT.txt`, `README.md`, `CHANGELOG.md`, `USERGUIDE.md`, `RELEASE_NOTES.md`.

### Cài đặt
1. Giải nén `JA_Fuxue_v4.1.3_Chrome_Extension.zip`
2. Mở trình duyệt Chromium (Chrome / Edge / Cốc Cốc / Brave), truy cập `chrome://extensions/`
3. Bật **Chế độ dành cho nhà phát triển (Developer mode)**
4. Nhấn **Tải tiện ích đã giải nén (Load unpacked)** và chọn thư mục `fuxue-silent-pro-v4.1.3`
