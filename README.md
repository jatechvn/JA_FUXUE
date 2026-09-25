# 🛡️ FUXUE SILENT PRO — Foxconn E-Learning Automation Suite

![Version](https://img.shields.io/badge/version-4.1.5-blue.svg?style=flat-square)
![Manifest](https://img.shields.io/badge/manifest-v3-green.svg?style=flat-square)
![Architecture](https://img.shields.io/badge/engine-Pure_Organic_1.0x-orange.svg?style=flat-square)
![Platform](https://img.shields.io/badge/platform-Chrome_%7C_Edge_%7C_Cốc_Cốc-purple.svg?style=flat-square)
![License](https://img.shields.io/badge/license-Proprietary-red.svg?style=flat-square)

Hệ sinh thái tự động hóa học tập, thi cử và hoàn thành khóa học trực tuyến thông minh dành riêng cho hệ thống **Foxconn E-Learning** (`iedu.foxconn.com`).

---

## 🌟 Tính Năng Cốt Lõi (Core Features)

- **Deduplication Guard & Chống Cướp Trang Chủ:**
  - Tuyệt đối không can thiệp, không cướp trang chủ (`/home/homepage`), giữ nguyên quyền kiểm soát cho người dùng.
  - Tự động nhận diện và đóng ngay các tab học trùng lặp cùng một khóa học qua Background Service Worker, giữ lại duy nhất tab gốc đang học.
  - Kiểm tra tab đang học ngầm trước khi mở thêm khóa học từ trang danh mục.
- **Auto-Close Completed Tabs (Tự động đóng tab đã học):**
  - Tự động đóng tab khi phát hiện khóa học đã có dữ liệu trong "Exam record：" đạt 100 điểm (hoặc $\ge 80$).
  - Tự động đóng tab sau 2.5s khi nộp bài thi đạt 100/100, khi thi qua môn, hoặc khi khóa học hoàn thành không có bài thi.
- **Auto-Farm Next Course:** Tự động cày liên tục cả danh sách khóa học qua đêm hoặc trong giờ làm việc mà không cần click tay.
- **Smart Credit Filter (Bỏ qua bài 0 điểm):**
  - Tự động nhận diện điểm tín chỉ: `Credit Score：(0)`, `学分：(0)`, `Điểm học phần：(0)`.
  - Tự động bỏ qua các khóa học 0 điểm (không có đề thi, không cộng điểm KPI), chỉ tập trung học các khóa có điểm tín chỉ (> 0). Tự động đóng tab bài 0 điểm sau 2.5 giây.
- **Master Stop / Resume Controller:** Nút điều khiển tạm dừng / chạy tiếp tự động hóa trực tiếp ngay trên Liquid Glass HUD và trong Extension Popup (`popup.html`).
- **100% Pure Organic Playback (Zero API Spoofing):**
  - Chạy video đúng tốc độ 1.0x chuẩn thời gian thực, không gọi API giả mạo `addStudyRecordnew` gây cờ nghi vấn (anti-cheat flags).
  - Tự động phát hiện video kẹt buffer hoặc kết thúc sớm để Replay đến khi bài học đạt đúng 100%.
- **Hybrid PDF Instant Engine (100% Guaranteed):**
  - Giải thuật lật trang tự động bù trừ $N-1$ ticks của Foxconn `onCurrentPageChanged`, đảm bảo tài liệu PDF đạt chính xác 100% tiến độ.
- **2-Phase Self-Learning Exam Solver:**
  - **Lần 1 (Probe):** Nộp bài siêu tốc để hệ thống Foxconn trả về trang kết quả kèm đáp án chuẩn (`Correct Answer` / `正确答案`).
  - **Lần 2 (Perfect Score):** Tự động bóc tách và nạp 100% đáp án chuẩn vào `ja_fuxue_exam_kb` (LocalStorage), sau đó làm lại đề thi và đạt điểm số tuyệt đối 100/100.
  - Hỗ trợ câu hỏi Đơn lựa chọn (Single-Choice), Đa lựa chọn (Multi-Choice) và Phán đoán Đúng/Sai.
- **Stealth Mode & Anti-Pause:**
  - Hook các sự kiện `visibilitychange`, `blur`, `focusout` từ cấp độ `document_start` (Main World).
  - Khóa focus vĩnh viễn, ngăn trình duyệt dừng video khi người dùng chuyển tab hoặc làm việc khác.
  - Màn hình mờ đen (Blackout Canvas) bảo vệ sự riêng tư.
- **Audio Heartbeat 24/7:**
  - Kích hoạt dao động âm thanh cực nhỏ qua Web Audio API, ngăn Chromium đóng băng tab khi trình duyệt bị thu nhỏ (minimized).
- **Auto-Next Loop & Safe Navigation:**
  - Tự động chuyển bài học kế tiếp khi bài hiện tại đạt 100%.
  - Tự động chuyển sang đề thi khi hoàn thành toàn bộ bài học.
  - Xử lý mượt mà và an toàn khi khóa học không có bài thi (`"No Exam"`).

---

## 🚀 Hướng Dẫn Cài Đặt (Installation)

### Cách 1: Nạp Extension Unpacked (Khuyên dùng)
1. Tải hoặc giải nén file gói `JA_Fuxue_v4.1.3_Chrome_Extension.zip` trong thư mục `dist/`.
2. Mở trình duyệt Chromium (Google Chrome, Microsoft Edge, Brave, Cốc Cốc).
3. Truy cập địa chỉ: `chrome://extensions/` (hoặc `edge://extensions/`).
4. Bật công tắc **Developer mode (Chế độ cho nhà phát triển)** ở góc trên bên phải.
5. Bấm vào nút **Load unpacked (Tải tiện ích đã giải nén)**.
6. Chọn thư mục `fuxue-silent-pro-v4.1.3`.

### Cách 2: Trình cài đặt đồ họa Offline
1. Mở trực tiếp file `FUXUE_V4_PRO_INSTALLER.html` trong trình duyệt.
2. Bấm nút **Xuất Thư Mục Trực Tiếp** hoặc **Tải Trọn Gói (.ZIP)**.
3. Làm theo 3 bước hướng dẫn trực quan trên giao diện.

---

## 📂 Cấu Trúc Thư Mục Dự Án

```
├── fuxue-silent-pro-v4.0.3/           # Thư mục mã nguồn extension đang chạy
│   ├── icons/                         # Bộ icon các kích thước (16, 48, 128)
│   ├── manifest.json                  # Manifest V3 cấu hình quyền & content script
│   ├── content.js                     # Core engine chạy trực tiếp tại MAIN world
│   ├── inject.js                      # Core engine backup inject
│   ├── popup.html                     # Giao diện trung tâm điều khiển (Popup)
│   ├── popup.css                      # Giao diện Liquid Frosted Glass
│   └── popup.js                       # Controller xử lý Master Stop, Log, Exam KB
├── auto_study_foxconn_v4.0.3_full.js  # Bản độc lập dạng Script / UserScript
├── FUXUE_V4_PRO_INSTALLER.html        # Trang giao diện Web cài đặt & xuất gói offline
├── index.html                         # Trang quản trị / danh mục dự án JA System
├── dist/                              # Thư mục đóng gói phát hành (xem gitpush)
│   ├── fuxue-silent-pro-v4.1.3/       # Unpacked ready-to-run extension
│   ├── JA_Fuxue_v4.1.3_Chrome_Extension.zip
│   └── SHA256SUMS.txt
├── ABOUT.txt                          # Thẻ thông tin metadata dự án
├── CHANGELOG.md                       # Lịch sử phiên bản
├── USERGUIDE.md                       # Hướng dẫn sử dụng chi tiết
├── RELEASE_NOTES.md                   # Ghi chú phát hành GitHub CLI
└── UI_DESIGN_SYSTEM.md                # Hệ thống thiết kế Liquid Glass HUD
```

---

## 🔄 Thay Đổi Gần Đây (v4.1.3)

- **Sửa lỗi xung đột PDF (.pdflogo):** Xử lý triệt để lỗi thẻ ẩn `.pdflogo` của Foxconn khiến video bị nhận diện nhầm là PDF và dừng phát tự động.
- **Tăng cường đồng bộ Video.js:** Tự động gọi `window.videoPlayer.play()` khi phục hồi phát video.
- **Master Stop/Resume:** Bổ sung nút dừng/chạy tự động hóa trên HUD và Extension Popup.
- **Sửa lỗi PDF tiến độ N-1:** Hoàn thiện 100% tài liệu PDF/DOC thay vì dừng ở 93%.
- **Tối ưu hóa Smart Exam Solver:** Tự động giải đề 2 giai đoạn với cơ chế bóc tách `Correct Answer` chuẩn xác 100%.

---

## 🔒 Bản Quyền & Bảo Mật

- Tác giả: **JATech** ([https://jatechvn.github.io](https://jatechvn.github.io))
- Giấy phép: **Proprietary — JA-Tech System**.
- Nghiêm cấm phân phối công khai khi chưa có sự chấp thuận bằng văn bản.
