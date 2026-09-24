/**
 * Script Tự động học Foxconn iEdu v2.0 (Premium Stealth Edition)
 * Tối ưu cho: Khóa học dài, Mạng yếu, Tự động chuyển bài & Chống kẹt.
 */

(function() {
    console.log("%c--- Foxconn iEdu Auto-Learning v2.0 Kích Hoạt ---", "color: #00ff00; font-weight: bold; background: #000; padding: 5px;");

    let lastTime = 0;
    let freezeCounter = 0;

    window.foxconnAutoV2 = setInterval(() => {
        const v = document.querySelector('video');
        const confirmBtn = document.querySelector('.layui-layer-btn0');

        // 1. Xử lý Pop-up điểm danh ngay lập tức
        if (confirmBtn) {
            confirmBtn.click();
            console.log("[%s] Đã tự động XÁC NHẬN điểm danh.", new Date().toLocaleTimeString());
            return; // Đợi confirm xong mới làm việc khác
        }

        if (v) {
            // 2. Cấu hình Stealth (Ẩn danh & Tiết kiệm)
            v.muted = true;
            v.playbackRate = 1.0; 
            if (v.style.width !== '1px') {
                v.style.width = '1px'; v.style.height = '1px'; v.style.opacity = '0.1';
            }

            // 3. Kiểm tra kẹt video (Freeze Detection)
            if (!v.paused && !v.ended) {
                if (v.currentTime === lastTime) {
                    freezeCounter++;
                } else {
                    freezeCounter = 0;
                    lastTime = v.currentTime;
                }
            }

            // Nếu bị kẹt quá 20 giây (do mạng lag), tự động Reload trang
            if (freezeCounter > 5) { 
                console.warn("Phát hiện video bị kẹt, đang tải lại trang...");
                location.reload();
            }

            // 4. Tự động Play nếu bị dừng vô lý
            if (v.paused && !v.ended && !confirmBtn) {
                v.play().catch(e => {});
            }

            // 5. Tự động Next bài (Cải tiến cho danh sách dài)
            if (v.ended) {
                console.log("Video kết thúc. Đang tìm bài tiếp theo...");
                
                // Tìm bài đang học (Dựa trên màu cam đặc trưng #FF4500 hoặc class active)
                const allItems = Array.from(document.querySelectorAll('li, span, a'));
                let currentIndex = allItems.findIndex(el => 
                    el.classList.contains('active') || 
                    window.getComputedStyle(el).color === 'rgb(255, 69, 0)'
                );

                if (currentIndex !== -1) {
                    // Tìm phần tử click được tiếp theo có ID chứa 'ware'
                    for (let i = currentIndex + 1; i < allItems.length; i++) {
                        if (allItems[i].id && allItems[i].id.includes('ware') || allItems[i].getAttribute('onclick')?.includes('play')) {
                            console.log("Chuyển sang bài: " + allItems[i].innerText);
                            allItems[i].click();
                            break;
                        }
                    }
                }
            }
        }

        // 6. Giả lập tương tác nhẹ để tránh bị Server quét Idle
        if (Math.random() > 0.95) window.scrollBy(0, Math.random() > 0.5 ? 10 : -10);

    }, 4000);

    // Lưu ID để có thể dừng bằng lệnh: clearInterval(window.foxconnAutoV2)
})();