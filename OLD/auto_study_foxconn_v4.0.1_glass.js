javascript:(function(){
    if(window.foxconnActive) return;
    window.foxconnActive = 1;

    // --- PHẦN 1: SIÊU BYPASS (CẢI TIẾN V4) ---
    const k = () => {
        try {
            // Chặn jQuery đăng ký listener mới
            if (window.jQuery && window.jQuery.fn) {
                const oldOn = window.jQuery.fn.on;
                window.jQuery.fn.on = function(types) {
                    if (typeof types === 'string' && (types.includes('blur') || types.includes('focusout') || types.includes('visibilitychange'))) {
                        return this;
                    }
                    return oldOn.apply(this, arguments);
                };
                window.jQuery(window).off('blur focus focusout visibilitychange');
                window.jQuery(document).off('blur focus focusout visibilitychange');
            }

            // Hook addEventListener hệ thống để chặn blur/visibility
            const oldAddEvt = EventTarget.prototype.addEventListener;
            EventTarget.prototype.addEventListener = function(type, listener, options) {
                if (['blur', 'focusout', 'visibilitychange'].includes(type)) return;
                return oldAddEvt.apply(this, [type, listener, options]);
            };

            // Khóa trạng thái Visibility & Focus
            Object.defineProperty(document, 'hasFocus', { get: () => () => true, configurable: true });
            Object.defineProperty(document, 'hidden', { get: () => false, configurable: true });
            Object.defineProperty(document, 'visibilityState', { get: () => 'visible', configurable: true });
            Object.defineProperty(document, 'webkitVisibilityState', { get: () => 'visible', configurable: true });

            // Chặn lệnh pause cưỡng ép từ trang web
            const p = HTMLVideoElement.prototype.pause;
            HTMLVideoElement.prototype.pause = function() {
                if (!this.ended && this.readyState > 2) return;
                return p.apply(this, arguments);
            };

            window.onblur = null;
            document.onblur = null;
        } catch (e) { console.error("Bypass Error", e); }
    };
    k();

    // --- PHẦN 2: GIAO DIỆN LIQUID GLASS (V3.9.4 STYLE) ---
    const h = document.createElement('div');
    h.style.cssText = "padding:15px;background:rgba(255,255,255,0.15);backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px);color:#fff;mix-blend-mode:difference;border:1px solid rgba(255,255,255,0.3);border-radius:20px;font-family:sans-serif;font-size:12px;min-width:220px;position:fixed;bottom:25px;right:25px;z-index:9999999;";
    h.innerHTML = '<b style="font-size:14px;display:block;margin-bottom:8px;text-align:center;">🦞 SILENT V4.0.1</b><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><div>Mode: <span id="h-m">...</span></div><div>Stat: <span id="h-s">Run</span></div><div style="grid-column:span 2;text-align:center;border-top:1px solid rgba(255,255,255,0.2);padding-top:5px;">Less: <span id="h-l">...</span></div></div>';
    document.body.appendChild(h);

    const ui = (i, t) => { const e = document.getElementById('h-' + i); if (e) e.innerText = t; };
    let lT = -1, fS = 0, lC = -1, w = 0;
    const hasC = window.wares && window.wares.some(x => ['pdf', 'doc', 'html'].includes(x.type));
    ui('m', hasC ? 'HYB' : 'FAST');

    // Auto Click OK (giống v3.9.4)
    new MutationObserver(() => {
        const b = document.querySelector('.layui-layer-btn0');
        if (b) { b.click(); ui('s', 'OK'); }
    }).observe(document.body, { childList: 1, subtree: 1 });

    // --- PHẦN 3: LOGIC AUTO STUDY & PDF BYPASS ---
    setInterval(() => {
        const v = document.querySelector('video'), a = document.querySelector('dd.active');
        let pD = 0;

        if (hasC && w > 0) { w -= 3000; return; }

        // PDF / Tài liệu Bypass
        try {
            if (window.wares && typeof window.video_index != 'undefined') {
                const c = window.wares[window.video_index];
                if (c && ['pdf', 'doc', 'html'].includes(c.type)) {
                    if (c.isComplete != 'Y' && !c._v1) {
                        const p = {
                            'starttime': c.starttime,
                            'endtime': new Date().getTime() + (window.diff_localTime || 0),
                            'playtime': c.page || 100,
                            'courseid': window.courseId,
                            'wareid': c.wareId,
                            'chapterid': c.chapterId,
                            'completestatus': 'Y',
                            'page': c.page || 1,
                            'username': window.userName,
                            'versionname': 'v1',
                            'deviceid': window.courseToken
                        };
                        if (window.encrypt && window.realSendRecord) {
                            window.realSendRecord((window.path || '') + '/public/play/addStudyRecordnew?data=' + window.encrypt(JSON.stringify(p)), c.wareId, 'v1');
                        }
                        c._v1 = 1; c.isComplete = 'Y';
                        if (a) a.innerHTML = a.innerHTML.replace(/\d+%/, '') + ' Done';
                        pD = 1; w = 3000;
                    } else if (c.isComplete == 'Y') pD = 1;
                }
            }
        } catch (e) {}

        // Video Controller
        if (v && v.offsetHeight > 5) {
            v.muted = 1;
            v.style.width = '1px'; v.style.height = '1px'; // Ẩn video để tiết kiệm CPU
            if (!v.paused && !v.ended) {
                if (Math.abs(v.currentTime - lT) < 0.1) {
                    fS++; if (fS > 15) { fS = 0; v.currentTime += 1; }
                } else { fS = 0; lT = v.currentTime; }
            }
            if (v.paused && !v.ended && !document.querySelector('.layui-layer-btn0')) {
                if (window.videoPlayer) window.videoPlayer.play();
                v.play().catch(() => {});
            }
        }

        ui('l', a ? a.innerText.split(' ')[0] : 'N/A');
        const d = /(Finished|hoàn thành|100%|hoAn thAnh)/i.test(a ? a.innerText : '') || pD;

        if (v && v.ended && !d) {
            v.currentTime = 0;
            if (window.videoPlayer) window.videoPlayer.play(); else v.play();
        }

        // Tự chuyển bài tiếp theo
        if (( (v && v.ended) || d) && a) {
            const al = Array.from(document.querySelectorAll('dd'));
            const idx = al.indexOf(a);
            let nx = null;
            for (let i = 0; i < al.length; i++) {
                if (i > idx && !/(Finished|hoàn thành|100%|hoAn thAnh)/i.test(al[i].innerText)) {
                    nx = al[i]; break;
                }
            }
            if (nx && lC != al.indexOf(nx)) {
                lC = al.indexOf(nx);
                ui('s', 'Next');
                w = hasC ? 6000 : 0;
                const m = nx.getAttribute('onclick')?.match(/dianji\((\d+)/);
                if (m && window.dianji) window.dianji(parseInt(m[1]), nx);
                else nx.click();
            } else if (!nx && d) ui('s', 'Done!');
        }
    }, 3000);
})();
