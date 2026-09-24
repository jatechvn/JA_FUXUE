// Auto Study Foxconn - Version 3.8 (Hybrid Adaptive Mode)
// Author: OpenClaw (Linh) & Johnny
// Date: 2026-04-20

(function() {
    if(window.foxconnAutoV8Active) { console.log("Already Active"); return; }
    window.foxconnAutoV8Active = true;

    // UI Injection
    const h = document.createElement('div');
    h.innerHTML = `<div style="padding:12px;background:rgba(13,17,23,.95);color:#0f0;border:1px solid #30363d;border-radius:10px;font-family:monospace;font-size:11px;min-width:240px;position:fixed;bottom:20px;right:20px;z-index:9999999">
        <b>🦞 SILENT LEARNING V3.8</b><br>
        Mode: <span id="h-m">Auto</span><br>
        Stat: <span id="h-s">Run</span><br>
        Vid: <span id="h-v">N/A</span><br>
        Less: <span id="h-l">N/A</span>
    </div>`;
    document.body.appendChild(h);

    const ui = (id, text) => { const e = document.getElementById('h-' + id); if (e) e.innerText = text; };
    let lT = -1, fS = 0, lastClickIdx = -1, wait = 0;

    // Check if course has any PDF/DOC to decide strategy
    const hasComplexContent = window.wares && window.wares.some(w => ['pdf', 'doc', 'html'].includes(w.type));
    ui('m', hasComplexContent ? 'HYBRID (Safe)' : 'VIDEO (Fast)');

    window.foxconnObserver = new MutationObserver(() => {
        const b = document.querySelector('.layui-layer-btn0');
        if (b) { b.click(); ui('s', 'Popup OK'); }
    });
    window.foxconnObserver.observe(document.body, { childList: true, subtree: true });

    setInterval(() => {
        const v = document.querySelector('video');
        const a = document.querySelector('dd.active');
        let pdfDone = false;

        // Hybrid delay only if course contains PDFs
        if (hasComplexContent && wait > 0) {
            wait -= 3000;
            return;
        }

        // 1. PDF HACK (Only if present)
        try {
            if (window.wares && typeof window.video_index !== 'undefined') {
                const c = window.wares[window.video_index];
                if (c && (c.type === 'pdf' || c.type === 'doc' || c.type === 'html')) {
                    ui('v', 'PDF MODE');
                    if (c.isComplete !== 'Y' && !c._v8HackApplied) {
                        ui('s', 'Hacking PDF...');
                        const p = {'starttime':c.starttime,'endtime':new Date().getTime()+(window.diff_localTime||0),'playtime':c.page||c.duration||100,'courseid':window.courseId,'wareid':c.wareId,'chapterid':c.chapterId,'completestatus':'Y','page':c.page||1,'username':window.userName,'versionname':'v1','deviceid':window.courseToken,'afterHours':typeof isPopReminder!=='undefined'?isPopReminder:''};
                        if (window.encrypt && window.realSendRecord) {
                            const d = window.encrypt(JSON.stringify(p));
                            const u = (window.path||'')+'/public/play/addStudyRecordnew?data='+d;
                            window.realSendRecord(u,c.wareId,'v1');
                        }
                        c._v8HackApplied = true;
                        c.isComplete = 'Y';
                        if (a && !/(Finished|hoàn thành|100%|hoAn thAnh)/i.test(a.innerText)) {
                            a.innerHTML = a.innerHTML.replace(/\d+%/,'') + ' Finished';
                        }
                        pdfDone = true;
                        wait = 3000;
                    } else if (c.isComplete === 'Y') { pdfDone = true; }
                }
            }
        } catch (e) {}

        // 2. VIDEO HANDLING
        if (v && v.offsetHeight > 5) {
            v.muted = true;
            v.style.width = '1px';
            v.style.height = '1px';
            ui('v', v.paused ? 'PAUSED' : 'PLAYING');
            if (!v.paused && !v.ended) {
                if (Math.abs(v.currentTime - lT) < 0.1) {
                    fS++;
                    if (fS > 15) { fS = 0; v.currentTime += 1; }
                } else { fS = 0; lT = v.currentTime; }
            }
            if (v.paused && !v.ended && !document.querySelector('.layui-layer-btn0')) {
                if (typeof window.videoPlayer !== 'undefined' && typeof window.videoPlayer.play === 'function') window.videoPlayer.play();
                v.play().catch(() => {});
            }
        }

        // 3. NAVIGATION
        ui('l', a ? a.innerText.split(' ')[0] : 'N/A');
        const txt = a ? a.innerText : "";
        const done = /(Finished|hoàn thành|100%|hoAn thAnh)/i.test(txt) || pdfDone;

        if (v && v.ended && !done) {
            v.currentTime = 0;
            if (typeof window.videoPlayer !== 'undefined' && typeof window.videoPlayer.play === 'function') window.videoPlayer.play();
            else v.play();
            ui('s', 'Rewinding...');
        }

        if ((v && v.ended) || done) {
            const all = Array.from(document.querySelectorAll('dd'));
            const idx = all.indexOf(a);
            let nxt = null;
            let nxtIdx = -1;
            for (let i = 0; i < all.length; i++) {
                if (i > idx && !/(Finished|hoàn thành|100%|hoAn thAnh)/i.test(all[i].innerText)) {
                    nxt = all[i];
                    nxtIdx = i;
                    break;
                }
            }
            if (nxt && lastClickIdx !== nxtIdx) {
                lastClickIdx = nxtIdx;
                ui('s', 'Next...');
                // Adaptive delay: 6s if PDF exists, 0s if pure Video course
                wait = hasComplexContent ? 6000 : 0;
                const m = nxt.getAttribute('onclick')?.match(/dianji\((\d+)/);
                if (m && typeof window.dianji === 'function') window.dianji(parseInt(m[1]), nxt);
                else nxt.click();
            } else if (!nxt && done) { ui('s', 'All Done!'); }
        }
    }, 3000);
})();
