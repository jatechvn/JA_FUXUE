javascript:(function(){
    if(window.foxconnActiveV4) return;
    window.foxconnActiveV4 = 1;

    // 1. SIÊU BYPASS: Hooking hệ thống để chặn mọi sự kiện phát hiện mất focus
    const bypassDetection = () => {
        try {
            const noop = (e) => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                // console.log('OpenClaw: Đã chặn sự kiện ' + e.type);
            };

            // Chặn jQuery đăng ký listener mới
            if (window.jQuery && window.jQuery.fn) {
                const oldOn = window.jQuery.fn.on;
                window.jQuery.fn.on = function(types) {
                    if (typeof types === 'string' && (types.includes('blur') || types.includes('focusout') || types.includes('visibilitychange'))) {
                        return this;
                    }
                    return oldOn.apply(this, arguments);
                };
                // Gỡ các cái đã có
                window.jQuery(window).off('blur focusout visibilitychange');
                window.jQuery(document).off('blur focusout visibilitychange');
            }

            // Ghi đè addEventListener của Window và Document
            const oldAddEvt = EventTarget.prototype.addEventListener;
            EventTarget.prototype.addEventListener = function(type, listener, options) {
                if (['blur', 'focusout', 'visibilitychange'].includes(type)) {
                    return; // Không cho phép đăng ký
                }
                return oldAddEvt.apply(this, [type, listener, options]);
            };

            // Luôn trả về trạng thái đang focus
            Object.defineProperty(document, 'hasFocus', { get: () => () => true });
            Object.defineProperty(document, 'hidden', { get: () => false });
            Object.defineProperty(document, 'visibilityState', { get: () => 'visible' });
            Object.defineProperty(document, 'webkitVisibilityState', { get: () => 'visible' });

            // Chặn Video tự động bị pause bởi script trang web
            const oldPause = HTMLVideoElement.prototype.pause;
            HTMLVideoElement.prototype.pause = function() {
                if (!this.ended && this.readyState > 2) return;
                return oldPause.apply(this, arguments);
            };

            // Vô hiệu hóa trực tiếp các thuộc tính onblur
            window.onblur = null;
            document.onblur = null;
            
        } catch (e) { console.error('Bypass Error:', e); }
    };
    bypassDetection();

    // 2. UI ĐIỀU KHIỂN
    const h = document.createElement('div');
    h.style.cssText = "padding:15px;background:rgba(0,0,0,0.8);backdrop-filter:blur(10px);color:#00ff00;border:1px solid #00ff00;border-radius:15px;font-family:monospace;font-size:12px;min-width:220px;position:fixed;bottom:25px;right:25px;z-index:9999999;box-shadow:0 0 15px rgba(0,255,0,0.3);";
    h.innerHTML = '<b style="font-size:14px;display:block;margin-bottom:8px;text-align:center;color:#fff;">🛡️ FOXCONN BYPASS V4.0</b>' +
                  '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                  '<div>Mode: <span id="h-m">...</span></div><div>Stat: <span id="h-s">Run</span></div>' +
                  '<div style="grid-column:span 2;text-align:center;border-top:1px solid #333;padding-top:5px;">Current: <span id="h-l" style="color:#fff;">...</span></div></div>';
    document.body.appendChild(h);

    const ui = (i, t) => { const e = document.getElementById('h-' + i); if (e) e.innerText = t; };
    let lT = -1, fS = 0, lC = -1, w = 0;
    const hasC = window.wares && window.wares.some(x => ['pdf', 'doc', 'html'].includes(x.type));
    ui('m', hasC ? 'HYBRID' : 'VIDEO');

    // Tự động nhấn OK khi có thông báo
    new MutationObserver(() => {
        const b = document.querySelector('.layui-layer-btn0') || document.querySelector('.vjs-close-control');
        if (b) { b.click(); ui('s', 'AUTO-OK'); }
    }).observe(document.body, { childList: 1, subtree: 1 });

    // LOOP CHÍNH
    setInterval(() => {
        const v = document.querySelector('video'), a = document.querySelector('dd.active');
        let pD = 0;

        if (hasC && w > 0) { w -= 3000; return; }

        // Xử lý tài liệu (PDF/DOC)
        try {
            if (window.wares && typeof window.video_index != 'undefined') {
                const c = window.wares[window.video_index];
                if (c && ['pdf', 'doc', 'html'].includes(c.type)) {
                    if (c.isComplete != 'Y' && !c._v1) {
                        const p = { 'starttime': c.starttime, 'endtime': new Date().getTime() + (window.diff_localTime || 0), 'playtime': c.page || 100, 'courseid': window.courseId, 'wareid': c.wareId, 'chapterid': c.chapterId, 'completestatus': 'Y', 'page': c.page || 1, 'username': window.userName, 'versionname': 'v1', 'deviceid': window.courseToken };
                        if (window.encrypt && window.realSendRecord) window.realSendRecord((window.path || '') + '/public/play/addStudyRecordnew?data=' + window.encrypt(JSON.stringify(p)), c.wareId, 'v1');
                        c._v1 = 1; c.isComplete = 'Y';
                        if (a) a.innerHTML = a.innerHTML.replace(/\d+%/, '') + ' Done';
                        pD = 1; w = 3000;
                    } else if (c.isComplete == 'Y') pD = 1;
                }
            }
        } catch (e) {}

        // Xử lý Video
        if (v && v.offsetHeight > 5) {
            v.muted = true;
            if (v.paused && !v.ended && !document.querySelector('.layui-layer-btn0')) {
                v.play().catch(() => {});
            }
            // Anti-stuck
            if (!v.paused && !v.ended) {
                if (Math.abs(v.currentTime - lT) < 0.1) {
                    fS++; if (fS > 10) { fS = 0; v.currentTime += 2; }
                } else { fS = 0; lT = v.currentTime; }
            }
        }

        ui('l', a ? a.innerText.split('\n')[0].substring(0,20) : 'N/A');
        const d = /(Finished|hoàn thành|100%|hoAn thAnh)/i.test(a ? a.innerText : '') || pD;

        // Chuyển bài
        if (( (v && v.ended) || d) && a) {
            const al = Array.from(document.querySelectorAll('dd'));
            const idx = al.indexOf(a);
            let nx = null;
            for (let i = idx + 1; i < al.length; i++) {
                if (!/(Finished|hoàn thành|100%|hoAn thAnh)/i.test(al[i].innerText)) {
                    nx = al[i]; break;
                }
            }
            if (nx && lC != al.indexOf(nx)) {
                lC = al.indexOf(nx);
                ui('s', 'NEXT');
                w = hasC ? 5000 : 2000;
                const m = nx.getAttribute('onclick')?.match(/dianji\((\d+)/);
                if (m && window.dianji) window.dianji(parseInt(m[1]), nx);
                else nx.click();
            } else if (!nx && d) {
                ui('s', 'COMPLETED');
            }
        }
    }, 3000);
})();
