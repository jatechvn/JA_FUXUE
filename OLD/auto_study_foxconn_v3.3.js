(function() {
    if (window.foxconnAutoV3Active) {
        console.log("Silent Learning v3.3 đã đang chạy.");
        return;
    }
    window.foxconnAutoV3Active = true;

    const hud = document.createElement('div');
    hud.className = 'openclaw-hud';
    hud.innerHTML = `
        <div style="padding: 12px; background: rgba(13, 17, 23, 0.95); color: #00ff00; border: 1px solid #30363d; border-radius: 10px; font-family: 'Consolas', monospace; font-size: 11px; min-width: 240px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); pointer-events: auto; position: relative;">
            <div style="font-weight: bold; border-bottom: 1px solid #00ff00; padding-bottom: 5px; margin-bottom: 8px; display: flex; justify-content: space-between;">
                <span>🤖 SILENT LEARNING V3.3</span>
                <span style="color: #8b949e; font-size: 9px;">ULTIMATE</span>
            </div>
            <div style="margin: 4px 0;">📡 Status: <span id="hud-status" style="color: #58a6ff;">Initializing...</span></div>
            <div style="margin: 4px 0;">🎬 Video: <span id="hud-video" style="color: #f1e05a;">N/A</span></div>
            <div style="margin: 4px 0;">📚 Lesson: <span id="hud-lesson" style="color: #ff7b72;">N/A</span></div>
            <div style="margin: 4px 0;">❄️ Freeze: <span id="hud-freeze" style="color: #8b949e;">0s</span></div>
            <div style="margin: 4px 0;">✅ Check-in: <span id="hud-checkin" style="color: #3fb950;">0</span></div>
        </div>
    `;
    hud.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 2147483647;';
    document.body.appendChild(hud);

    const ui = (id, txt) => { const e = document.getElementById('hud-' + id); if(e) e.innerText = txt; };
    let checkins = 0;
    let lastT = -1;
    let freezeS = 0;

    window.foxconnObserver = new MutationObserver(() => {
        const btn = document.querySelector('.layui-layer-btn0');
        if (btn) {
            btn.click();
            checkins++;
            ui('checkin', checkins);
            ui('status', 'Popup Clicked!');
        }
    });
    window.foxconnObserver.observe(document.body, { childList: true, subtree: true });

    window.foxconnAutoV3 = setInterval(() => {
        const v = document.querySelector('video');
        const activeItem = document.querySelector('dd.active');

        if (v) {
            v.muted = true;
            if (v.style.width !== '1px') {
                v.style.width = '1px'; v.style.height = '1px'; v.style.opacity = '0.05';
            }

            ui('video', v.paused ? 'PAUSED' : 'PLAYING (' + Math.floor(v.currentTime) + 's)');
            ui('lesson', activeItem ? activeItem.innerText.split(' ')[0] : 'Unknown');

            if (!v.paused && !v.ended) {
                if (Math.abs(v.currentTime - lastT) < 0.1) {
                    freezeS++;
                    ui('freeze', freezeS + 's');
                    ui('status', 'Detecting Freeze...');
                } else {
                    freezeS = 0; ui('freeze', '0s');
                    lastT = v.currentTime;
                    ui('status', 'Learning...');
                }
            }

            if (freezeS > 15) { 
                ui('status', 'Frozen! Reloading...'); 
                location.reload(); 
            }

            if (v.paused && !v.ended && !document.querySelector('.layui-layer-btn0')) {
                v.play().catch(()=>{});
            }

            const currentProgress = activeItem ? activeItem.innerText : "";
            const isActuallyDone = currentProgress.includes('hoàn thành') || currentProgress.includes('Finished') || currentProgress.includes('100%');
            
            if (v.ended && !isActuallyDone) {
                ui('status', 'Not finished! Rewinding...');
                v.currentTime = 0;
                v.play().catch(()=>{});
            }

            if (v.ended || isActuallyDone) {
                ui('status', 'Seeking Next Lesson...');
                const allLessons = Array.from(document.querySelectorAll('dd'));
                const currentIndex = allLessons.indexOf(activeItem);
                let nextLesson = null;

                for (let i = 0; i < allLessons.length; i++) {
                    const text = allLessons[i].innerText;
                    const isCompleted = text.includes('hoàn thành') || text.includes('Finished') || text.includes('100%');
                    if (i > currentIndex && !isCompleted) {
                        nextLesson = allLessons[i];
                        break;
                    }
                }

                if (nextLesson) {
                    const m = nextLesson.getAttribute('onclick')?.match(/dianji\((\d+)/);
                    if (m && window.dianji) {
                        window.dianji(parseInt(m[1]), nextLesson);
                        ui('status', 'Next Loaded');
                    } else {
                        nextLesson.click();
                        ui('status', 'Next Clicked');
                    }
                } else {
                    ui('status', 'ALL COMPLETED! 🎉');
                    document.querySelector('.openclaw-hud > div').style.borderColor = '#238636';
                    clearInterval(window.foxconnAutoV3);
                    window.foxconnObserver.disconnect();
                    window.foxconnAutoV3Active = false;
                }
            }
        } else {
            ui('status', 'Waiting for Video...');
        }
    }, 3000);
})();