(function() {
    // Ngăn chặn chạy chồng chéo
    if (window.fuxueSilentV1Active) {
        console.log("Already Active");
        return;
    }
    window.fuxueSilentV1Active = true;

    // 1. HỆ THỐNG CHẶN PAUSE KHI RỜI TAB (ANTI-PAUSE)
    const killPause = () => {
        try {
            const blocker = (e) => {
                e.stopImmediatePropagation();
                e.stopPropagation();
            };

            // Chặn các sự kiện mất tiêu điểm
            window.addEventListener('blur', blocker, true);
            window.addEventListener('focusout', blocker, true);
            document.addEventListener('visibilitychange', blocker, true);

            // Giả mạo trạng thái hiển thị của tài liệu
            Object.defineProperty(document, 'hidden', { get: () => false, configurable: true });
            Object.defineProperty(document, 'visibilityState', { get: () => 'visible', configurable: true });

            // Ghi đè hàm pause gốc của trình phát video
            const originalPause = HTMLVideoElement.prototype.pause;
            HTMLVideoElement.prototype.pause = function() {
                if (window.fuxueSilentV1Active && !this.ended && this.readyState > 2) {
                    console.log("Anti-Pause: Blocked pause request");
                    return;
                }
                return originalPause.apply(this, arguments);
            };
        } catch (e) {
            console.error("Anti-Pause Setup Err", e);
        }
    };
    killPause();

    // 2. GIAO DIỆN ĐIỀU KHIỂN (LIQUID GLASS - SMART INVERT)
    const h = document.createElement('div');
    h.style.cssText = `
        padding: 15px;
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
        color: #fff;
        mix-blend-mode: difference;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 20px;
        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        font-size: 12px;
        min-width: 260px;
        position: fixed;
        bottom: 25px;
        right: 25px;
        z-index: 9999999;
        box-shadow: 0 8px 32px 0 rgba(0,0,0,0.3);
        transition: all 0.3s ease;
    `;
    h.innerHTML = `
        <b style="font-size:14px;color:#fff;display:block;margin-bottom:8px;letter-spacing:0.5px;">🦞 SILENT LEARNING V1.3</b>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;color:#fff;">
            <div>Mode: <span id="h-m" style="font-weight:bold;">Auto</span></div>
            <div>Stat: <span id="h-s" style="font-weight:bold;">Run</span></div>
            <div>Time: <span id="h-v" style="color:#00ff9d;font-family:monospace;font-weight:bold;">00:00</span></div>
            <div>Less: <span id="h-l">N/A</span></div>
        </div>
    `;
    document.body.appendChild(h);

    const ui = (id, text) => {
        const e = document.getElementById('h-' + id);
        if (e) e.innerText = text;
    };

    let lT = -1, fS = 0, lastClickIdx = -1, wait = 0;

    // Phân tích nội dung khóa học (Video vs PDF)
    const hasComplexContent = window.wares && window.wares.some(w => ['pdf', 'doc', 'html'].includes(w.type));
    ui('m', hasComplexContent ? 'HYBRID' : 'FAST');

    // Tự động click Popup
    window.fuxueObserver = new MutationObserver(() => {
        const b = document.querySelector('.layui-layer-btn0');
        if (b) { b.click(); ui('s', 'Sync OK'); }
    });
    window.fuxueObserver.observe(document.body, { childList: true, subtree: true });

    // 3. VÒNG LẶP ĐIỀU KHIỂN CHÍNH
    setInterval(() => {
        const v = document.querySelector('video');
        const a = document.querySelector('dd.active');
        let pdfDone = false;

        // Độ trễ an toàn cho AJAX
        if (hasComplexContent && wait > 0) {
            wait -= 3000;
            return;
        }

        // Cập nhật đồng hồ thời gian (Visual Sync)
        if (v) {
            const td = document.querySelector('.vjs-remaining-time-display');
            if (td && td.innerText.trim() !== "") {
                ui('v', td.innerText.replace('-', '').trim());
            } else {
                const c = Math.floor(v.currentTime);
                if (!isNaN(c)) {
                    ui('v', Math.floor(c / 60) + ":" + (c % 60).toString().padStart(2, '0'));
                }
            }
        }

        // Xử lý Tài liệu (PDF/DOC Sync)
        try {
            if (window.wares && typeof window.video_index !== 'undefined') {
                const c = window.wares[window.video_index];
                if (c && (c.type === 'pdf' || c.type === 'doc' || c.type === 'html')) {
                    ui('v', 'DOCUMENT');
                    if (c.isComplete !== 'Y' && !c._v1Processed) {
                        ui('s', 'Syncing...');
                        const p = {
                            'starttime': c.starttime,
                            'endtime': new Date().getTime() + (window.diff_localTime || 0),
                            'playtime': c.page || c.duration || 100,
                            'courseid': window.courseId,
                            'wareid': c.wareId,
                            'chapterid': c.chapterId,
                            'completestatus': 'Y',
                            'page': c.page || 1,
                            'username': window.userName,
                            'versionname': 'v1',
                            'deviceid': window.courseToken,
                            'afterHours': typeof isPopReminder !== 'undefined' ? isPopReminder : ''
                        };
                        if (window.encrypt && window.realSendRecord) {
                            const d = window.encrypt(JSON.stringify(p));
                            window.realSendRecord((window.path || '') + '/public/play/addStudyRecordnew?data=' + d, c.wareId, 'v1');
                        }
                        c._v1Processed = true;
                        c.isComplete = 'Y';
                        if (a) a.innerHTML = a.innerHTML.replace(/\d+%/g, '') + ' Finished';
                        pdfDone = true;
                        wait = 3000;
                    } else if (c.isComplete === 'Y') {
                        pdfDone = true;
                    }
                }
            }
        } catch (e) {
            console.log("Sync error", e);
        }

        // Xử lý Video (Silent Playback)
        if (v && v.offsetHeight > 5) {
            v.muted = true;
            v.style.width = '1px';
            v.style.height = '1px';
            
            // Cưỡng bức phát lại
            if (v.paused && !v.ended && !document.querySelector('.layui-layer-btn0')) {
                if (window.videoPlayer) window.videoPlayer.play();
                v.play().catch(() => {});
            }

            // Chống treo video
            if (!v.paused && !v.ended) {
                if (Math.abs(v.currentTime - lT) < 0.01) {
                    fS++;
                    if (fS > 15) { fS = 0; v.currentTime += 1; }
                } else {
                    fS = 0;
                    lT = v.currentTime;
                }
            }
        }

        // Điều hướng bài tiếp theo
        ui('l', a ? a.innerText.split(' ')[0] : 'N/A');
        const done = /(Finished|hoàn thành|100%|hoAn thAnh)/i.test(a ? a.innerText : "") || pdfDone;

        if (v && v.ended && !done) {
            v.currentTime = 0;
            if (window.videoPlayer) window.videoPlayer.play();
            else v.play();
            ui('s', 'Rewinding...');
        }

        if (((v && v.ended) || done) && a) {
            const all = Array.from(document.querySelectorAll('dd'));
      
...(truncated)...