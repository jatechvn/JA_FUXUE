# 🚀 FUXUE SILENT PRO - FEATURE ROADMAP & IDEAS
**Hệ thống Định hướng Phát triển & Tính năng Nâng cao**
*Cập nhật: 25/09/2026 | Phiên bản hiện tại: v4.1.3*

---

## 📌 BẢNG TỔNG HỢP CÁC Ý TƯỞNG PHÁT TRIỂN

| # | Nhóm tính năng | Tên ý tưởng | Trạng thái | Ưu tiên |
|---|---|---|:---:|:---:|
| **1** | **Automation** | **Auto-Farm Next Course & Credit Filter** (Tự động cày liên tục & Lọc bỏ bài 0 điểm) | 🟡 Đang triển khai | **P0 - Cao nhất** |
| **2** | **Knowledge Base** | **Exam Bank Export / Import & Sharing** (Quản lý, sao lưu & chia sẻ ngân hàng đề thi) | ⚪ Kế hoạch | **P1** |
| **3** | **Stealth & Safety** | **Human-like Exam Score (85 - 95 Điểm)** (Tùy chọn điểm thi ngẫu nhiên tự nhiên) | ⚪ Kế hoạch | **P1** |
| **4** | **Notification** | **Remote Alert & Telegram Webhook** (Thông báo hoàn thành qua Windows/Telegram) | ⚪ Kế hoạch | **P2** |
| **5** | **UI/UX** | **Mini Draggable HUD & Learning Dashboard** (Thu nhỏ thanh trạng thái & thống kê) | ⚪ Kế hoạch | **P2** |

---

## 🎯 CHI TIẾT CÁC Ý TƯỞNG

### 1. Ý tưởng 1: Auto-Farm Next Course & Smart Credit Filter (ĐANG THỰC HIỆN)
* **Mục tiêu**: Tự động học liên tục qua đêm/rảnh tay toàn bộ danh sách khóa học mà không cần người dùng click tay.
* **Bộ lọc tín chỉ (Credit Filter - Bắt buộc)**:
  * **Chỉ học những bài có điểm tín chỉ (`Credit Score > 0`)**: Những bài này mới có bài thi và được tính điểm KPI.
  * **Tự động BỎ QUA các bài 0 điểm**:
    * Nhận diện chuẩn: `Credit Score：(0)`, `Credit Score: (0)`, `Credit Score：0`, `学分：(0)`, `学分：0`, `Điểm học phần：(0)`.
    * Khi phát hiện bài 0 điểm: Lập tức dừng phát, ghi log cảnh báo và tự động chuyển sang bài tiếp theo trong danh sách.
* **Cơ chế chuyển khóa học liên tục (Auto-Chain)**:
  * Sau khi thi đạt điểm $\ge 80$ hoặc 100/100 trên trang `submitExam`, hệ thống tự động quay lại danh sách hoặc kích hoạt bài học kế tiếp trong danh mục/tìm kiếm.
  * Lưu trữ danh sách hàng đợi (Course Queue) trong `localStorage` để duy trì tiến trình xuyên suốt các phiên duyệt web.

---

### 2. Ý tưởng 2: Quản lý & Chia sẻ Ngân hàng Đáp án (Exam Bank Manager)
* **Mục tiêu**: Tái sử dụng và chia sẻ kho tri thức đề thi đã tích lũy (> 250 câu hỏi) giữa các máy tính và đồng nghiệp.
* **Tính năng**:
  * **Export / Import JSON**: Xuất ngân hàng câu hỏi thành file `.json` và nhập vào máy khác. Máy mới có sẵn đáp án chuẩn mà không cần qua vòng thi nháp (Phase 1).
  * **Xuất Đề cương ôn tập (.HTML / .TXT / .MD)**: Xuất toàn bộ câu hỏi kèm đáp án đúng được tô màu để in hoặc ôn luyện nội bộ.
  * **Quick Quiz Search**: Ô tra cứu đáp án nhanh trong Extension Popup (gõ từ khóa câu hỏi -> hiện ngay đáp án chuẩn A, B, C...).

---

### 3. Ý tưởng 3: Chế độ Điểm thi Tự nhiên "Human-like" (85 - 95 Điểm)
* **Mục tiêu**: Tránh sự chú ý từ hệ thống giám sát khi tài khoản luôn đạt 100/100 điểm tuyệt đối ở tất cả các khóa.
* **Tính năng**:
  * Cho phép người dùng chọn chế độ:
    * 🥇 *Điểm tuyệt đối (100/100)*: Áp dụng 100% đáp án chuẩn.
    * 🎯 *Tự nhiên (85 - 95 điểm)*: Cố tình chọn sai ngẫu nhiên 1 - 2 câu không ảnh hưởng đến điều kiện qua (chuẩn 80 điểm) để điểm số có độ biến thiên ngẫu nhiên giống người thật.

---

### 4. Ý tưởng 4: Giám sát Từ xa & Thông báo Hoàn thành (Remote Alert)
* **Mục tiêu**: Giúp người dùng biết tiến độ học khi không ngồi trước máy tính.
* **Tính năng**:
  * **Windows Desktop Notification**: Hiển thị popup góc phải màn hình khi hoàn thành bài học hoặc đạt điểm thi.
  * **Telegram Bot Webhook**: Gửi tin nhắn trực tiếp về điện thoại người dùng khi hoàn tất khóa học:
    > *"🎉 [FUXUE] Hoàn thành khóa học: C++游戏开发基础 - Điểm số: 100/100! Đang chuyển khóa tiếp theo..."*

---

### 5. Ý tưởng 5: Tinh gọn Giao diện & Thống kê Hoạt động (Mini HUD & Stats)
* **Mục tiêu**: Tối ưu trải nghiệm quan sát và bảo vệ không gian hiển thị.
* **Tính năng**:
  * **Draggable / Collapsible HUD**: Thu gọn widget thành chấm tròn nhỏ ở góc màn hình, có thể kéo thả tự do.
  * **Dashboard Thống kê**: Báo cáo tổng số giờ đã học, số khóa học đã hoàn tất, số câu hỏi trắc nghiệm đã giải trong tuần/tháng.
