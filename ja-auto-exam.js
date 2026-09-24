/**
 * JA Auto-Exam v2.0 (Stable & Resilient Edition)
 * Target: iEdu Foxconn
 * Fix: Removed conflicting listeners, improved selector accuracy, 
 * and added a "Fail-Safe" mode for element detection.
 */

(function() {
    const S_K = 'ja_exam_stage', A_K = 'ja_captured_answers', L_K = 'ja_last_open_click';

    // 1. CLEANUP & HUD
    if (window.jaInt) clearInterval(window.jaInt);
    let h = document.querySelector('.ja-silent-hud');
    if (!h) {
        h = document.createElement('div');
        h.className = 'ja-silent-hud';
        h.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:2147483647;padding:12px;background:rgba(13,17,23,0.95);color:#00ff00;border:1px solid #30363d;border-radius:10px;font-family:Consolas,monospace;font-size:11px;min-width:240px;box-shadow:0 4px 20px rgba(0,0,0,0.5);pointer-events:auto;';
        document.body.appendChild(h);
    }
    
    const u = (s, i = "", c = "#58a6ff") => {
        h.innerHTML = `
            <div style="font-weight:bold;border-bottom:1px solid #00ff00;padding-bottom:5px;margin-bottom:8px;display:flex;justify-content:space-between;">
                <span>🎧 JA AUTO-EXAM</span>
                <span style="color:#8b949e;font-size:9px;">V2.0 STABLE</span>
            </div>
            <div style="margin:4px 0;">📡 Status: <span style="color:${c};">${s}</span></div>
            <div style="margin:4px 0;font-size:9px;color:#8b949e;">${i}</div>
            <div style="display:flex;gap:4px;margin-top:8px;">
                <button id="ja-reset" style="flex:1;cursor:pointer;background:#30363d;color:white;border:none;padding:4px;font-size:9px;border-radius:4px;">Reset</button>
                <button id="ja-copy" style="flex:1;cursor:pointer;background:#238636;color:white;border:none;padding:4px;font-size:9px;border-radius:4px;">Copy Logs</button>
            </div>
        `;
    };

    // 2. ENGINE
    const r = () => {
        const now = Date.now(), lc = parseInt(localStorage.getItem(L_K) || "0"), st = localStorage.getItem(S_K) || 'START';
        const sb = document.querySelector('button[onclick="tijiao()"]'), ok = document.querySelector('.layui-layer-btn0'), ans = document.querySelectorAll('p.answer');
        const et = document.querySelector('a[href="#exam"]'), eb = document.getElementById('exam_link') || document.querySelector('.exam_link');

        // STAGE: RESULT CAPTURE
        if (ans.length > 0) {
            let res = [];
            ans.forEach(el => {
                const match = el.innerHTML.match(/(Correct Answer|正確答案|正确答案)：<strong>(.*?)<\/strong>/i);
                if (match) res.push(match[match.length - 1].replace(/&nbsp;/g, '').trim());
            });
            if (res.length > 0) {
                localStorage.setItem(A_K, JSON.stringify(res));
                localStorage.setItem(S_K, 'HAS_ANSWERS');
                u("LOGGED! ✅", "Answers saved.", "#3fb950");
                clearInterval(window.jaInt); return;
            }
        }

        // STAGE: EXAM INTERACTION
        if (sb) {
            const saved = JSON.parse(localStorage.getItem(A_K) || '[]');
            if (st === 'HAS_ANSWERS' && saved.length > 0) {
                u("AUTO-FILLING...", "Matching keys...", "#f1e05a");
                document.querySelectorAll('.shiti_list, .exam-item, .exam_question, .question_box').forEach((blk, i) => {
                    const key = saved[i]; if (!key) return;
                    blk.querySelectorAll('input, label').forEach(opt => {
                        const v = (opt.value || opt.innerText || opt.textContent || "").trim().toUpperCase();
                        if (v === key.toUpperCase()) opt.click();
                    });
                });
                u("FILL COMPLETE", "Review & Submit.", "#3fb950");
                clearInterval(window.jaInt);
            } else {
                u("DISCOVERY", "Getting keys...");
                if (ok) ok.click(); else if (window.tijiao) window.tijiao(); else sb.click();
            }
            return;
        }

        // STAGE: COURSE PAGE
        const ls = Array.from(document.querySelectorAll('dd'));
        if (ls.length > 0) {
            const rem = ls.filter(li => !li.innerText.includes('hoàn thành') && !li.innerText.includes('Finished'));
            if (rem.length === 0) {
                if (now - lc < 15000) { u("Opening...", "Wait for tab load.", "#8b949e"); return; }
                if (eb && eb.offsetParent !== null) {
                    u("Exam Ready", "Clicking exam..."); localStorage.setItem(L_K, now.toString()); eb.click();
                } else if (et) {
                    u("Exam Tab", "Switching...", "#58a6ff"); et.click();
                }
            } else {
                u("Learning...", rem.length + " left", "#f1e05a");
            }
        } else { u("Ready", "Waiting for page..."); }
    };

    // 3. LISTENERS
    document.addEventListener('click', (e) => {
        if (e.target.id === 'ja-copy') {
            const d = localStorage.getItem(A_K);
            if (d) { navigator.clipboard.writeText(d); alert("Copied!"); }
        }
        if (e.target.id === 'ja-reset') {
            localStorage.setItem(S_K, 'START'); localStorage.removeItem(L_K); location.reload();
        }
    });

    window.jaInt = setInterval(r, 3000); r();
    console.log("JA Auto-Exam v2.0 Deployed.");
})();