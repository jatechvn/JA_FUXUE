// Auto Study Foxconn - Version 3.6 (Forced Native Auto-Next Fix)
// Author: OpenClaw (Linh) & Johnny
// Date: 2026-04-20

(function() {
    if(window.foxconnAutoV6Active) { console.log("Already Active"); return; }
    window.foxconnAutoV6Active = true;

    // UI Injection
    const h = document.createElement('div');
    h.innerHTML = `<div style="padding:12px;background:rgba(13,17,23,.95);color:#0f0;border:1px solid #30363d;border-radius:10px;font-family:monospace;font-size:11px;min-width:240px;position:fixed;bottom:20px;right:20px;z-index:9999999">
        <b>🦞 SILENT LEARNING V3.6</b><br>
        Stat: <span id="h-s">Run</span><br>
        Vid: <span id="h-v">N/A</span><br>
        Less: <span id="h-l">N/A</span><br>
        Rewind: <span id="h-r">0</span>
    </div>`;
    document.body.appendChild(h);

    const ui = (id, text) => { const e = document.getElementById('h-' + id); if (e) e.innerText = text; };
    let lastTime = -1, freezeSec = 0, lastClickIdx = -1;
    let waitForDomMs = 0; // Throttle logic for UI updates

    // Auto Close Popups
    window.foxconnObserver = new MutationObserver(() => {
        const btn = document.querySelector('.layui-layer-btn0');
        if (btn) { btn.click(); ui('s', 'Popup OK'); }
    });
    window.foxconnObserver.observe(document.body, { childList: true, subtree: true });

    // Main Loop
    setInterval(() => {
        const v = document.querySelector('video');
        const activeNav = document.querySelector('dd.active');
        let pdfDone = false;

        // If recently clicked, give it a few seconds before trying to do anything else to let AJAX load
        if (waitForDomMs > 0) {
            waitForDomMs -= 3000;
            return;
        }

        // ------------------------------------------
        // 1. PDF / DOC HACK (Instantly complete without reload)
        // ------------------------------------------
        try {
            if (window.wares && typeof window.video_index !== 'undefined') {
                const currentWare = window.wares[window.video_index];
                if (currentWare && (currentWare.type === 'pdf' || currentWare.type === 'doc' || currentWare.type === 'html')) {
                    ui('v', 'PDF MODE');
                    if (currentWare.isComplete !== 'Y' && !currentWare._v6HackApplied) {
                        ui('s', 'Hacking PDF...');
                        const payload = {
                            'starttime': currentWare.starttime,
                            'endtime': new Date().getTime() + (window.diff_localTime || 0),
                            'playtime': currentWare.page || currentWare.duration || 100,
                            'courseid': window.courseId,
                            'wareid': currentWare.wareId,
                            'chapterid': currentWare.chapterId,
                            'completestatus': 'Y',
                            'page': currentWare.page || 1,
                            'username': window.userName,
                            'versionname': 'v1',
                            'deviceid': window.courseToken,
                            'afterHours': typeof isPopReminder !== 'undefined' ? isPopReminder : ''
                        };
                        
                        if (window.encrypt && window.realSendRecord) {
                            const data = window.encrypt(JSON.stringify(payload));
                            const url = (window.path || '') + '/public/play/addStudyRecordnew?data=' + data;
                            window.realSendRecord(url, currentWare.wareId, 'v1');
                        }
                        currentWare._v6HackApplied = true;
                        currentWare.isComplete = 'Y';
                        
                        // Explicitly fake "Finished" status in UI immediately
                        if (activeNav && !/(Finished|hoàn thành|100%|hoAn thAnh)/i.test(activeNav.innerText)) {
                            activeNav.innerHTML = activeNav.innerHTML.replace(/\d+%/, '') + ' Finished';
                        }
                        pdfDone = true;
                        waitForDomMs = 3000; // Pause for 3 seconds before searching for Next
                    } else if (currentWare.isComplete === 'Y') {
                        pdfDone = true;
                    }
                }
            }
        } catch (e) {
            console.log("PDF hack err", e);
        }

        // ------------------------------------------
        // 2. VIDEO HANDLING (Safe Play)
        // ------------------------------------------
        if (v && v.offsetHeight > 5) {
            v.muted = true;
            v.style.width = '1px';
            v.style.height = '1px';
            ui('v', v.paused ? 'PAUSED' : 'PLAYING');
            
            // Anti-stuck (freeze detection)
            if (!v.paused && !v.ended) {
                if (Math.abs(v.currentTime - lastTime) < 0.1) {
                    freezeSec++;
                    if (freezeSec > 15) {
                        freezeSec = 0;
                        v.currentTime += 1; // Try to skip 1 second instead of reload
                    }
                } else {
                    freezeSec = 0;
                    lastTime = v.currentTime;
                }
            }
            
            // Safe auto play (wait for readyState to avoid breaking Video.js)
            if (v.paused && !v.ended && !document.querySelector('.layui-layer-btn0') && v.readyState >= 2) {
                if (typeof window.videoPlayer !== 'undefined' && typeof window.videoPlayer.play === 'function') {
                    window.videoPlayer.play();
                } else {
                    v.play().catch(() => {});
                }
            }
        }

        // ------------------------------------------
        // 3. PROGRESS & NAVIGATION (Forced Next)
        // ------------------------------------------
        ui('l', activeNav ? activeNav.innerText.split(' ')[0] : 'N/A');
        const txt = activeNav ? activeNav.innerText : "";
        const done = /(Finished|hoàn thành|100%|hoAn thAnh)/i.test(txt) || pdfDone;

        if (v && v.ended && !done) {
            v.currentTime = 0;
            if (typeof window.videoPlayer !== 'undefined') window.videoPlayer.play();
            else v.play();
            ui('s', 'Rewinding...');
        }

        if ((v && v.ended) || done) {
            const all = Array.from(document.querySelectorAll('dd'));
            const idx = all.indexOf(activeNav);
            let nxt = null;
            let nxtIdx = -1;
            
            for (let i = 0; i < all.length; i++) {
                if (i > idx && !/(Finished|hoàn thành|100%|hoAn thAnh)/i.test(all[i].innerText)) {
                    nxt = all[i];
                    nxtIdx = i;
                    break;
                }
            }
            
            // The crucial V3.6 Fix: Execute the native click event perfectly by emulating human interaction
            if (nxt && lastClickIdx !== nxtIdx) {
                lastClickIdx = nxtIdx;
                ui('s', 'Forcing Next: ' + nxtIdx);
                
                // Pause checking logic for 5 seconds while AJAX loads the new video/PDF
                waitForDomMs = 5000; 

                const m = nxt.getAttribute('onclick')?.match(/dianji\((\d+)/);
                if (m && typeof window.dianji === 'function') {
                    // Call the exact native function
                    window.dianji(parseInt(m[1]), nxt);
                } else {
                    // Fallback trigger if dianji missing
                    nxt.click();
                }
            } else if (!nxt && done) {
                ui('s', 'All Done!');
            }
        }
    }, 3000);
})();
