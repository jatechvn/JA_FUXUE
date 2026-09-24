/**
 * Script Tự động học Foxconn iEdu v3.2 (Force Next Edition)
 * Tối ưu cho việc tự động nhảy bài dựa trên trạng thái "hoàn thành" trong mục lục.
 */

(function() {
    if (window.foxconnAutoV3) clearInterval(window.foxconnAutoV3);

    const hud = document.createElement('div');
    hud.innerHTML = `
        <div style="padding: 10px; background: rgba(0,0,0,0.85); color: #00ff00; border: 1px solid #00ff00; border-radius: 8px; font-family: monospace; font-size: 12px; min-width: 250px;">
            <div style="font-weight: bold; border-bottom: 1px solid #00ff00; padding-bottom: 5px; margin-bottom: 5px;">🤖 OpenClaw v3.2 (Force Next)</div>
            <div>Trạng thái: <span id="claw-status">Đang chạy...</span></div>
            <div>Video: <span id="claw-video">N/A</span></div>
            <div>Bài hiện tại: <span id="claw-lesson">N/A</span></div>
        </div>
    `;
    hud.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 999999; pointer-events: none;';
    document.body.appendChild(hud);

    const updateUI = (id, text) => { const el = document.getElementById(id); if (el) el.innerText = text; };

    window.foxconnAutoV3 = setInterval(() => {
        const v = document.querySelector('video');
        const confirmBtn = document.querySelector('.layui-layer-btn0');

        if (confirmBtn) {
            confirmBtn.click();
            updateUI('claw-status', 'Đã click điểm danh!');
            return;
        }

        if (v) {
            v.muted = true;
            const currentDD = document.querySelector('dd.active');
            updateUI('claw-lesson', currentDD ? currentDD.innerText.split(' ')[0] : 'N/A');
            updateUI('claw-video', v.paused ? 'PAUSED' : 'PLAYING (' + Math.floor(v.currentTime) + 's)');

            // ĐIỀU KIỆN CHUYỂN BÀI: Video kết thúc HOẶC mục lục báo 'hoàn thành'
            const isCompleted = currentDD && currentDD.innerText.includes('hoàn thành');
            
            if (v.ended || isCompleted) {
                updateUI('claw-status', 'Đang ép chuyển bài...');
                
                if (currentDD) {
                    let nextDD = currentDD.nextElementSibling;
                    if (nextDD && nextDD.tagName === 'DT') nextDD = nextDD.nextElementSibling;

                    if (nextDD && nextDD.tagName === 'DD') {
                        // Trích xuất index từ hàm dianji(index, this)
                        const match = nextDD.getAttribute('onclick').match(/dianji\((\d+)/);
                        if (match && typeof window.dianji === 'function') {
                            window.dianji(parseInt(match[1]), nextDD);
                            updateUI('claw-status', 'Đã chuyển bài kế tiếp.');
                        } else {
                            nextDD.click();
                        }
                    } else {
                        updateUI('claw-status', 'HẾT KHÓA HỌC! 🎉');
                        clearInterval(window.foxconnAutoV3);
                    }
                }
            } else if (v.paused) {
                v.play().catch(() => {});
            }
        }
    }, 4000);
})();