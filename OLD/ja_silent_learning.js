/**
 * JA Silent Learning v1.1 (Background Study Specialist)
 * Focus: Anti-pause, Keep-alive, Smart Next. (Exam logic moved to ja-exam.js)
 */

(function() {
    if (window.jaSilentLearningActive) {
        console.log("JA Silent Learning is already active.");
        return;
    }
    window.jaSilentLearningActive = true;

    // 0. ANTI-PAUSE & VISIBILITY FIX
    const blockEvents = ['blur', 'visibilitychange', 'webkitvisibilitychange', 'mozvisibilitychange', 'msvisibilitychange'];
    blockEvents.forEach(evt => {
        window.addEventListener(evt, (e) => e.stopImmediatePropagation(), true);
    });
    Object.defineProperty(document, 'hidden', { get: () => false });
    Object.defineProperty(document, 'visibilityState', { get: () => 'visible' });

    // 0.1 BACKGROUND KEEP-ALIVE
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0; 
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
    } catch(e) {}

    const wakeLoop = () => { if(window.jaSilentLearningActive) requestAnimationFrame(wakeLoop); };
    requestAnimationFrame(wakeLoop);

    // 1. HUD
    const hud = document.createElement('div');
    hud.className = 'ja-silent-hud';
    hud.innerHTML = `
        <div style="padding: 12px; background: rgba(13, 17, 23, 0.95); color: #00ff00; border: 1px solid #30363d; border-radius: 10px; font-family: 'Consolas', monospace; font-size: 11px; min-width: 240px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); pointer-events: auto; position: fixed; bottom: 20px; right: 20px; z-index: 2147483647;">
            <div style="font-weight: bold; border-bottom: 1px solid #00ff00; padding-bottom: 5px; margin-bottom: 8px; display: flex; justify-content: space-between;">
                <span>🎧 JA SILENT LEARNING</span>
                <span style="color: #8b949e; font-size: 9px;">V1.1</span>
            </div>
            <div style="margin: 4px 0;">📡 Status: <span id="ja-status" style="color: #58a6ff;">Initializing...</span></div>
            <div style="margin: 4px 0;">🎬 Video: <span id="ja-video" style="color: #f1e05a;">N/A</span></div>
            <div style="margin: 4px 0;">❄️ Freeze: <span id="ja-freeze" style="color: #8b949e;">0s</span></div>
        </div>
    `;
    document.body.appendChild(hud);

    const ui = (id, txt) => { const e = document.getElementById('ja-' + id); if(e) e.innerText = txt; };
    let lastT = -1, freezeS = 0;

    // 2. MAIN LOOP
    window.jaSilentInterval = setInterval(() => {
        const v = document.querySelector('video');
        const activeItem = document.querySelector('dd.active');

        if (v) {
            v.muted = true;
            v.playbackRate = 1.0;
            if (v.style.width !== '1px') {
                v.style.width = '1px'; v.style.height = '1px'; v.style.opacity = '0.05';
            }

            ui('video', v.paused ? 'PAUSED' : 'PLAYING (' + Math.floor(v.currentTime) + 's)');

            if (!v.paused && !v.ended) {
                if (Math.abs(v.currentTime - lastT) < 0.1) {
                    freezeS++; ui('freeze', freezeS + 's'); ui('status', 'Freeze Detected');
                } else {
                    freezeS = 0; ui('freeze', '0s'); lastT = v.currentTime; ui('status', 'Learning...');
                }
            }

            if (freezeS > 15) { location.reload(); }
            if (v.paused && !v.ended && !document.querySelector('.layui-layer-btn0')) { v.play().catch(()=>{}); }

            const isDone = activeItem && (activeItem.innerText.includes('hoàn thành') || activeItem.innerText.includes('Finished'));
            if (v.ended || isDone) {
                ui('status', 'Finding Next...');
                const allLessons = Array.from(document.querySelectorAll('dd'));
                const currentIndex = allLessons.indexOf(activeItem);
                let next = null;
                for (let i = currentIndex + 1; i < allLessons.length; i++) {
                    const txt = allLessons[i].innerText;
                    if (!txt.includes('hoàn thành') && !txt.includes('Finished')) { next = allLessons[i]; break; }
                }

                if (next) {
                    const m = next.getAttribute('onclick')?.match(/dianji\((\d+)/);
                    if (m && window.dianji) { window.dianji(parseInt(m[1]), next); } else { next.click(); }
                } else {
                    ui('status', 'Lessons finished. (JA Exam should take over)');
                }
            }
        }
    }, 3000);
})();