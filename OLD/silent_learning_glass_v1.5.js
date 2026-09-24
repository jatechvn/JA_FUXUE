// Foxconn Silent Learning - Version 1.5 (Stable Recovery)
// Author: OpenClaw (Linh) & Johnny
// Date: 2026-04-20

(function() {
    // Kiểm tra trùng lặp
    if(window.fuxueSilentActive) { 
        console.log("Fuxue Script already running."); 
        return; 
    }
    window.fuxueSilentActive = true;

    console.log("Initializing Silent Learning V1.5...");

    // 1. ANTI-PAUSE & JQUERY BYPASS
    const initAntiPause = () => {
        try {
            // Bypass jQuery events
            if (window.jQuery) {
                const $w = window.jQuery(window);
                const $d = window.jQuery(document);
                $w.off('blur focus focusout visibilitychange');
                $d.off('blur focus focusout visibilitychange');
            }

            // Native event blocker
            const blocker = (e) => {
                e.stopImmediatePropagation();
                e.stopPropagation();
            };
            window.addEventListener('blur', blocker, true);
            window.addEventListener('focusout', blocker, true);
            document.addEventListener('visibilitychange', blocker, true);
            
            // Force visibility state
            Object.defineProperty(document, 'hidden', { get: () => false, configurable: true });
            Object.defineProperty(document, 'visibilityState', { get: () => 'visible', configurable: true });
            
            // Override HTMLVideoElement.pause
            const originalPause = HTMLVideoElement.prototype.pause;
            HTMLVideoElement.prototype.pause = function() {
                if (!this.ended && this.readyState > 2) {
                    return;
                }
                return originalPause.apply(this, arguments);
            };
        } catch (e) { 
            console.error("Anti-Pause Error:", e); 
        }
    };
    initAntiPause();

    // 2. GIAO DIỆN LIQUID GLASS
    const h = document.createElement('div');
    h.id = 'fuxue-ui';
    h.style.cssText = `padding:15px;background:rgba(0,0,0,0.5);backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px);color:#fff;border:1px solid rgba(255,255,255,0.2);border-radius:20px;font-family:sans-serif;font-size:12px;min-width:250px;position:fixed;bottom:25px;right:25px;z-index:9999999;box-shadow:0 8px 32px rgba(0,0,0,0.5);`;
    h.innerHTML = `
        <b style="font-size:14px;display:block;margin-bottom:8px;color:#00d4ff;">🦞 SILENT LEARNING V1.5</b>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <div>Mode: <span id="h-m" style="font-weight:bold;">Auto</span></div>
            <div>Stat: <span id="h-s" style="font-weight:bold;">Run</span></div>
            <div>Time: <span id="h-v" style="color:#00ff9d;font-family:monospace;">00:00</span></div>
            <div>Less: <span id="h-l">N/A</span></div>
        </div>
    `;
    document.body.appendChild(h);

    const updateUI = (id, text) => { 
        const e = document.getElementById('h-' + id); 
        if (e) e.innerText = text; 
    };

    let lastTime = -1;
    let freezeStep = 0;
    let lastClickIdx = -1;
    let waitTimer = 0;

    // Detect content type
    const hasDoc = window.wares && window.wares.some(w => ['pdf', 'doc', 'html'].includes(w.type));
    updateUI('m', hasDoc ? 'HYBRID' : 'FAST');

    // Auto-click popups
    const observer = new MutationObserver(() => {
        const btn = document.querySelector('.layui-layer-btn0');
        if (btn) { 
            btn.click(); 
            updateUI('s', 'Popup Closed'); 
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // 3. MAIN CONTROL LOOP
    const mainLoop = setInterval(() => {
        const video = document.querySelector('video');
        const activeItem = document.querySelector('dd.active');
        let pdfDone = false;

        if (hasDoc && waitTimer > 0) { 
            waitTimer -= 2000; 
            updateUI('s', 'Waiting ' + (waitTimer/1000) + 's');
            return; 
        }

        // 3.1 Visual Sync
        if (video) {
            const vjsTime = document.querySelector('.vjs-remaining-time-display');
            if (vjsTime && vjsTime.innerText.trim() !== "") {
                updateUI('v', vjsTime.innerText.replace('-', '').trim());
            } else {
                const cur = Math.floor(video.currentTime);
                if (!isNaN(cur)) {
                    const mins = Math.floor(cur/60);
                    const secs = (cur%60).toString().padStart(2, '0');
                    updateUI('v', mins + ":" + secs);
                }
            }
        }

        // 3.2 PDF/Doc Sync
        try {
            if (window.wares && typeof window.video_index !== 'undefined') {
                const currentWare = window.wares[window.video_index];
                if (currentWare && ['pdf', 'doc', 'html'].includes(currentWare.type)) {
                    updateUI('v', 'DOCUMENT');
                    if (currentWare.isComplete !== 'Y' && !currentWare._v1Processed) {
                        updateUI('s', 'Syncing...');
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
                            const encryptedData = window.encrypt(JSON.stringify(payload));
                            window.realSendRecord((window.path || '') + '/public/play/addStudyRecordnew?data=' + encryptedData, currentWare.wareId, 'v1');
                        }
                        currentWare._v1Processed = true;
                        currentWare.isComplete = 'Y';
                        if (activeItem) activeItem.innerHTML = activeItem.innerHTML.replace(/\d+%/, '') + ' Finished';
                        pdfDone = true; 
                        waitTimer = 4000;
                    } else if (currentWare.isComplete === 'Y') {
                        pdfDone = true;
                    }
                }
            }
        } catch (e) { console.error("Doc Sync Err:", e); }

        // 3.3 Video Control
        if (video && video.offsetHeight > 5) {
            video.muted = true;
            // Thu nhỏ video để không làm phiền
            video.style.width = '1px';
            video.style.height = '1px';
            
            if (video.paused && !video.ended && !document.querySelector('.layui-layer-btn0')) {
                updateUI('s', 'Auto Playing');
                if (window.videoPlayer) window.videoPlayer.play();
                video.play().catch(() => {});
            }

            // Anti-freeze
            if (!video.paused && !video.ended) {
                if (Math.abs(video.currentTime - lastTime) < 0.01) {
                    freezeStep++;
                    if (freezeStep > 10) { 
                        freezeStep = 0; 
                        video.currentTime += 1; 
                        updateUI('s', 'Unfreezing...');
                    }
                } else {
                    freezeStep = 0;
                    lastTime = video.currentTime;
                    updateUI('s', 'Running');
                }
            }
        }

        // 3.4 Next Lesson Logic
        updateUI('l', activeItem ? activeItem.innerText.split(' ')[0] : 'N/A');
        const isFinished = /(Finished|hoàn thành|100%|hoAn thAnh)/i.test(activeItem ? activeItem.innerText : "") || pdfDone;

        if (video && video.ended && !isFinished) {
            video.currentTime = 0;
            if (window.videoPlayer) window.videoPlayer.play(); else video.play();
            updateUI('s', 'Rewinding');
        }

        if (((video && video.ended) || isFinished) && activeItem) {
            const allItems = Array.from(document.querySelectorAll('dd'));
            const currentIndex = allItems.indexOf(activeItem);
            let nextItem = null;
            let nextIndex = -1;

            for (let i = 0; i < allItems.length; i++) {
                if (i > currentIndex && !/(Finished|hoàn thành|100%|hoAn thAnh)/i.test(allItems[i].innerText)) {
                    nextItem = allItems[i];
                    nextIndex = i;
                    break;
                }
            }

            if (nextItem && lastClickIdx !== nextIndex) {
                lastClickIdx = nextIndex;
                updateUI('s', 'Next Lesson');
                waitTimer = hasDoc ? 6000 : 2000;
                const clickFunc = nextItem.getAttribute('onclick');
                const match = clickFunc ? clickFunc.match(/dianji\((\d+)/) : null;
                
                if (match && typeof window.dianji === 'function') {
                    window.dianji(parseInt(match[1]), nextItem);
                } else {
                    nextItem.click();
                }
            } else if (!nextItem && isFinished) {
                updateUI('s', 'All Done!');
                clearInterval(mainLoop);
            }
        }
    }, 2000);
})();
