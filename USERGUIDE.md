# 📖 Hướng Dẫn Sử Dụng FUXUE SILENT PRO v4.1.2

Chào mừng bạn đến với **FUXUE SILENT PRO v4.1.2** — Tiện ích mở rộng chuyên dụng cho việc học tập, giải đề thi và hoàn thành khóa học Foxconn E-Learning (`iedu.foxconn.com`).

---

## 1. 📦 Cài Đặt Ban Đầu

### Yêu cầu hệ thống:
- Trình duyệt nền Chromium: Google Chrome, Microsoft Edge, Cốc Cốc, Brave, Opera.
- File gói phát hành: `JA_Fuxue_v4.1.2_Chrome_Extension.zip` trong thư mục `dist/`.

### Các bước cài đặt:
1. Giải nén file `JA_Fuxue_v4.1.2_Chrome_Extension.zip` ra thư mục trên máy tính. Bạn sẽ thấy thư mục con tên là `fuxue-silent-pro-v4.1.2`.
2. Mở trình duyệt Chrome (hoặc Edge).
3. Gõ trên thanh địa chỉ: `chrome://extensions/` và nhấn Enter.
4. Gạt nút **Chế độ dành cho nhà phát triển (Developer mode)** ở góc trên bên phải màn hình sang trạng thái **BẬT (ON)**.
5. Bấm vào nút **Tải tiện ích đã giải nén (Load unpacked)** ở góc trên bên trái.
6. Chọn đúng thư mục `fuxue-silent-pro-v4.1.2` vừa giải nén.
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

---

## 5. 📑 Quản Lý Nhật Ký & Bộ Nhớ Đáp Án

Bấm vào biểu tượng extension trên thanh công cụ để mở Popup:
1. **📑 Nhật Ký (View Logs):** Xem trực tiếp lịch sử hoạt động chi tiết (thời gian chuyển bài, tiến độ video, câu hỏi ghi nhớ). Bạn có thể bấm **📥 Tải File Log (.txt)** để xuất báo cáo. Nhật ký tự động xóa sau 3 ngày để không làm nặng trình duyệt.
2. **📋 Đáp Án (Copy Keys):** Sao chép toàn bộ cơ sở dữ liệu câu hỏi và đáp án đã học vào Clipboard dưới dạng JSON.
3. **🔄 Đặt Lại (Reset Cache):** Xóa sạch bộ nhớ đáp án và trạng thái thi nếu bạn muốn làm mới lại từ đầu.

---

## 6. ❓ Câu Hỏi Thường Gặp (Troubleshooting)

**Q1: Video bị tạm dừng khi tôi chuyển sang tab khác?**
> FUXUE v4.1.2 tự động khóa các sự kiện `blur` và `visibilitychange`. Video sẽ vẫn chạy mượt mà ngay cả khi bạn thu nhỏ cửa sổ trình duyệt nhờ công nghệ Audio Heartbeat 24/7.

**Q2: Khóa học không có bài thi thì extension có bị lỗi chuyển trang không?**
> Không. FUXUE v4.1.2 tự phát hiện thông báo `"No Exam"` / `"Khóa học không có kỳ thi"` và sẽ dừng lại an toàn mà không ép chuyển hướng sang màn hình thi.

**Q3: Tôi muốn tự làm bài thi mà không để extension tự động can thiệp?**
> Rất đơn giản, hãy bấm nút **⏹️ Dừng tự động** trên HUD trước khi vào đề thi. Extension sẽ tạm dừng hoàn toàn cho đến khi bạn bấm **▶️ Tiếp tục tự động**.
