// Foxconn Silent Learning - Version 1.3 (Ultra Visual Sync)
// Author: OpenClaw (Linh) & Johnny
// Date: 2026-04-20

(function() {
    if(window.fuxueSilentV1Active) { console.log("Already Active"); return; }
    window.fuxueSilentV1Active = true;

    // 1. HỆ THỐNG CHẶN PAUSE KHI RỜI TAB
    const killPause = () => {
        try {
            const blocker = (e) => {
                e.stopImmediatePropagation();
                e.stopPropagation();
            };
            window.addEventListener('blur', blocker, true);
            window.addEventListener('focusout', blocker, true);
            document.addEventListener('visibilitychange', blocker, true);
            Object.defineProperty(document, 'hidden', { get: () => false });
            Object.defineProperty(document, 'visibilityState', { get: () => 'visible' });
            
            const originalPause = HTMLVideoElement.prototype.pause;
            HTMLVideoElement.prototype.pause = function() {
                if (window.fuxueSilentV1Active && !this.ended && this.readyState > 2) {
                    return;
                }
                return originalPause.apply(this, arguments);
            };
        } catch (e) { console.error("Anti-Pause Setup Err", e); }
    };
    killPause();

    // 2. GIAO DIỆN LIQUID GLASS (Smart-Invert)
    const h = document.createElement('div');
    h.style.cssText = `padding:15px;background:rgba(255,255,255,0.15);backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px);color:#fff;mix-blend-mode:difference;border:1px solid rgba(255,255,255,0.3);border-radius:20px;font-family:'Segoe UI',sans-serif;font-size:12px;min-width:260px;position:fixed;bottom:25px;right:25px;z-index:9999999;box-shadow:0 8px 32px rgba(0,0,0,0.3);transition:all 0.3s ease;`;
    h.innerHTML = `<b style="font-size:14px;display:block;margin-bottom:8px;">🦞 SILENT LEARNING V1.3</b><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><div>Mode: <span id="h-m" style="font-weight:bold;">Auto</span></div><div>Stat: <span id="h-s" style="font-weight:bold;">Run</span></div><div>Time: <span id="h-v" style="color:#00ff9d;font-family:monospace;">00:00</span></div><div>Less: <span id="h-l">N/A</span></div></div>`;
    document.body.appendChild(h);

    const ui = (id, text) => { const e = document.getElementById('h-' + id); if (e) e.innerText = text; };
    let lT = -1, fS = 0, lastClickIdx = -1, wait = 0;

    const hasComplexContent = window.wares && window.wares.some(w => ['pdf', 'doc', 'html'].includes(w.type));
    ui('m', hasComplexContent ? 'HYBRID' : 'FAST');

    window.fuxueObserver = new MutationObserver(() => {
        const b = document.querySelector('.layui-layer-btn0');
        if (b) { b.click(); ui('s', 'Sync OK'); }
    });
    window.fuxueObserver.observe(document.body, { childList: true, subtree: true });

    // 3. VÒNG LẶP ĐIỀU KHIỂN
    setInterval(() => {
        const v = document.querySelector('video');
        const a = document.querySelector('dd.active');
        let pdfDone = false;

        if (hasComplexContent && wait > 0) { wait -= 3000; return; }

        // Hiển thị thời gian thực từ Video.js hoặc thẻ Video
        if (v) {
            const timeDisplay = document.querySelector('.vjs-remaining-time-display');
            if (timeDisplay && timeDisplay.innerText.trim() !== "") {
                ui('v', timeDisplay.innerText.replace('-', '').trim());
            } else {
                const cur = Math.floor(v.currentTime);
                const dur = Math.floor(v.duration);
                if (!isNaN(cur) && !isNaN(dur)) {
                    ui('v', Math.floor(cur/60) + ":" + (cur%60).toString().padStart(2,'0'));
                }
            }
        }

        // PDF/Doc Logic
        try {
            if (window.wares && typeof window.video_index !== 'undefined') {
                const c = window.wares[window.video_index];
                if (c && (c.type === 'pdf' || c.type === 'doc' || c.type === 'html')) {
                    ui('v', 'DOCUMENT');
                    if (c.isComplete !== 'Y' && !c._v1Processed) {
                        ui('s', 'Syncing...');
                        const p = {'starttime':c.starttime,'endtime':new Date().getTime()+(window.diff_localTime||0),'playtime':c.page||c.duration||100,'courseid':window.courseId,'wareid':c.wareId,'chapterid':c.chapterId,'completestatus':'Y','page':c.page||1,'username':window.userName,'versionname':'v1','deviceid':window.courseToken,'afterHours':typeof isPopReminder!=='undefined'?isPopReminder:''};
                        if (window.encrypt && window.realSendRecord) {
                            const d = window.encrypt(JSON.stringify(p));
                            window.realSendRecord((window.path||'')+'/public/play/addStudyRecordnew?data='+d, c.wareId, 'v1');
                        }
                        c._v1Processed = true; c.isComplete = 'Y';
                        if (a) a.innerHTML = a.innerHTML.replace(/\d+%/,'') + ' Finished';
                        pdfDone = true; wait = 3000;
                    } else if (c.isComplete === 'Y') pdfDone = true;
                }
            }
        } catch (e) {}

        // Video Handling
        if (v && v.offsetHeight > 5) {
            v.muted = true; v.style.width = '1px'; v.style.height = '1px';
            
            if (v.paused && !v.ended && !document.querySelector('.layui-layer-btn0')) {
                ui('s', 'Auto Play');
                if (window.videoPlayer) window.videoPlayer.play();
                v.play().catch(() => {});
            }

            if (!v.paused && !v.ended) {
                if (Math.abs(v.currentTime - lT) < 0.01) {
                    fS++; if (fS > 15) { fS = 0; v.currentTime += 1; }
                } else { fS = 0; lT = v.currentTime; }
            }
        }

        ui('l', a ? a.innerText.split(' ')[0] : 'N/A');
        const txt = a ? a.innerText : "";
        const done = /(Finished|hoàn thành|100%|hoAn thAnh)/i.test(txt) || pdfDone;

        if (v && v.ended && !done) {
            v.currentTime = 0;
            if (window.videoPlayer) window.videoPlayer.play(); else v.play();
            ui('s', 'Rewinding...');
        }

        if (((v && v.ended) || done) && a) {
            const all = Array.from(document.querySelectorAll('dd'));
            const idx = all.indexOf(a);
            let nxt = null; let nxtIdx = -1;
            for (let i = 0; i < all.length; i++) {
                if (i > idx && !/(Finished|hoàn thành|100%|hoAn thAnh)/i.test(all[i].innerText)) {
                    nxt = all[i]; nxtIdx = i; break;
                }
            }
            if (nxt && lastClickIdx !== nxtIdx) {
                lastClickIdx = nxtIdx; ui('s', 'Next Task...');
                wait = hasComplexContent ? 6000 : 0;
                const m = nxt.getAttribute('onclick')?.match(/dianji\((\d+)/);
                if (m && typeof window.dianji === 'function') window.dianji(parseInt(m[1]), nxt);
                else nxt.click();
            } else if (!nxt && done) ui('s', 'Done!');
        }
    }, 3000);
})();
