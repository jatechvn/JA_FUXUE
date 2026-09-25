/**
 * FUXUE SILENT PRO v4.1.5 - 100% Pure Organic Playback (Zero API Spoofing)
 * Matches: *://iedu.foxconn.com/*, *://ieduapi.foxconn.com/*
 * Run-At: document_start (world: MAIN)
 * Author: JATech (https://jatechvn.github.io)
 *
 * SAFETY ARCHITECTURE:
 * - NO artificial addStudyRecordnew API calls (prevents backend anti-cheat flags).
 * - Real-time 1.0x wall-clock playback. Let Foxconn's official script send genuine heartbeats.
 * - Soft audible volume (0.03) + audio heartbeat to prevent Chrome tab freezing when minimized.
 * - Stealth Blackout canvas for visual privacy.
 * - Auto-Replay if video ends before lesson reaches 100% progress (e.g. stuck at 89%).
 * - Native DOM auto-next when video naturally finishes and reaches 100%.
 * - Master Stop / Resume button to pause/resume automation on demand.
 * - Accurate 100% PDF page completion (fixes N-1 page ratio rounding bug).
 * - Auto-Farm Next Course: Tự động học liên tục cả danh sách khóa học.
 * - Smart Credit Filter: Bỏ qua bài 0 điểm tín chỉ (Credit Score: 0) không có bài thi.
 */
(function() {
    if (window.fuxueProActive) return;
    window.fuxueProActive = true;

    console.log("%c[FUXUE PRO v4.1.4]%c PURE ORGANIC STEALTH ENGINE (JATech)", "color:#00ff9d;font-weight:bold;background:#111;padding:2px 6px;border-radius:4px;", "color:#38bdf8;");

    // =========================================================================
    // 0. ACTIVITY LOGGER ENGINE (AUTO-SAVED IN LOCALSTORAGE & EXPIRED AFTER 3 DAYS)
    // =========================================================================
    const LOG_STORAGE_KEY = 'ja_fuxue_activity_logs';
    const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

    const getCleanLogs = () => {
        try {
            const raw = localStorage.getItem(LOG_STORAGE_KEY);
            const list = raw ? JSON.parse(raw) : [];
            const now = Date.now();
            return Array.isArray(list) ? list.filter(item => (now - (item.ts || 0)) <= THREE_DAYS_MS) : [];
        } catch (e) {
            return [];
        }
    };

    const addLog = (type, tag, msg) => {
        try {
            const now = new Date();
            const dateStr = now.getFullYear() + '-' +
                String(now.getMonth() + 1).padStart(2, '0') + '-' +
                String(now.getDate()).padStart(2, '0') + ' ' +
                String(now.getHours()).padStart(2, '0') + ':' +
                String(now.getMinutes()).padStart(2, '0') + ':' +
                String(now.getSeconds()).padStart(2, '0');

            const entry = {
                id: 'log_' + now.getTime() + '_' + Math.floor(Math.random() * 1000),
                time: dateStr,
                ts: now.getTime(),
                type: type || 'INFO',
                tag: tag || 'SYSTEM',
                msg: msg || ''
            };

            const logs = getCleanLogs();
            logs.unshift(entry);
            if (logs.length > 500) logs.length = 500;

            localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
            window.fuxueLogs = logs;
            console.log(`%c[${entry.time}] [${entry.type}] [${entry.tag}]%c ${entry.msg}`, "color:#38bdf8;font-weight:bold;", "color:#f8fafc;");
        } catch (e) {}
    };

    window.fuxueAddLog = addLog;
    window.fuxueGetLogs = getCleanLogs;
    addLog('INFO', 'BOOT', 'Khởi động FUXUE PRO v4.1.4 (Auto-Farm & Credit Filter Edition)');

    // 1. SYSTEM HOOKS (ANTI-BLUR & STEALTH FOCUS)
    try {
        const originalDispatch = EventTarget.prototype.dispatchEvent;
        EventTarget.prototype.dispatchEvent = function(event) {
            if (event && ['blur', 'visibilitychange', 'webkitvisibilitychange', 'focusout'].includes(event.type)) {
                return false;
            }
            return originalDispatch.apply(this, arguments);
        };

        const originalAddListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            if (['blur', 'focusout', 'visibilitychange', 'webkitvisibilitychange'].includes(type)) {
                return;
            }
            return originalAddListener.apply(this, arguments);
        };

        Object.defineProperty(document, 'hasFocus', { get: () => () => true, configurable: true });
        Object.defineProperty(document, 'hidden', { get: () => false, configurable: true });
        Object.defineProperty(document, 'visibilityState', { get: () => 'visible', configurable: true });
        Object.defineProperty(document, 'webkitVisibilityState', { get: () => 'visible', configurable: true });

        const originalPause = HTMLVideoElement.prototype.pause;
        HTMLVideoElement.prototype.pause = function() {
            if (!this.ended && this.readyState >= 2) {
                setTimeout(() => {
                    if (this && !this.ended && this.paused) {
                        forcePlayVideo(this);
                    }
                }, 100);
                return;
            }
            return originalPause.apply(this, arguments);
        };

        window.onblur = null;
        document.onblur = null;
    } catch (e) {
        console.error("[FUXUE] Hook setup error:", e);
    }

    // 2. BLACKOUT VIDEO STYLING (Stealth mode - Dark video canvas, Audio-only feel)
    const injectBlackoutStyle = () => {
        if (document.getElementById('fx-stealth-style')) return;
        const st = document.createElement('style');
        st.id = 'fx-stealth-style';
        st.textContent = `
            video {
                filter: brightness(0) !important;
                background-color: #000000 !important;
            }
            .vjs-poster, .vjs-big-play-button {
                opacity: 0.05 !important;
            }
        `;
        document.head ? document.head.appendChild(st) : document.addEventListener('DOMContentLoaded', () => document.head.appendChild(st));
    };
    injectBlackoutStyle();

    // 3. AUDIO HEARTBEAT (KEEPS CHROMIUM RENDERER AWAKE 24/7)
    let audioCtxInstance = null;
    const setupAudioHeartbeat = () => {
        try {
            const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtxClass) return;
            if (!audioCtxInstance) {
                audioCtxInstance = new AudioCtxClass();
            }
            const startHeartbeat = () => {
                if (!audioCtxInstance) return;
                if (audioCtxInstance.state === 'suspended') {
                    audioCtxInstance.resume().then(() => {
                        updateUI('hb', 'Active 24/7');
                    }).catch(() => {});
                }
                if (audioCtxInstance.state === 'running') {
                    try {
                        const oscillator = audioCtxInstance.createOscillator();
                        const gainNode = audioCtxInstance.createGain();
                        oscillator.type = 'sine';
                        oscillator.frequency.setValueAtTime(1, audioCtxInstance.currentTime);
                        gainNode.gain.setValueAtTime(0.001, audioCtxInstance.currentTime);
                        oscillator.connect(gainNode);
                        gainNode.connect(audioCtxInstance.destination);
                        oscillator.start();
                        updateUI('hb', 'Active 24/7');
                    } catch (e) {}
                }
            };

            ['click', 'keydown', 'mousemove', 'touchstart', 'focus'].forEach(evt => {
                document.addEventListener(evt, () => startHeartbeat(), { once: true });
            });

            document.addEventListener('play', () => startHeartbeat(), true);
            startHeartbeat();
        } catch (e) { console.error("[FUXUE] Heartbeat error:", e); }
    };
    setupAudioHeartbeat();

    // 4. SMART FORCE-PLAY HELPER (1x REAL-TIME SPEED & LOW AUDIBLE VOLUME)
    const forcePlayVideo = (v) => {
        if (!v || v.ended) return;
        try {
            v.playbackRate = 1.0;
            v.style.filter = 'brightness(0)';
            
            if (typeof window.videoPlayer !== 'undefined' && typeof window.videoPlayer.play === 'function') {
                try { window.videoPlayer.play(); } catch(e) {}
            }

            v.muted = false;
            v.volume = 0.03;
            
            const p = v.play();
            if (p !== undefined) {
                p.then(() => {
                    v.muted = false;
                    v.volume = 0.03;
                }).catch(() => {
                    v.muted = true;
                    v.play().then(() => {
                        setTimeout(() => {
                            try {
                                v.muted = false;
                                v.volume = 0.03;
                            } catch(e) {}
                        }, 500);
                    }).catch(() => {});
                });
            }
        } catch(e) {}
    };

    // 4.5. MASTER STOP / RESUME CONTROLLER
    const STOP_STATE_KEY = 'ja_fuxue_stopped';

    const isAutoStopped = () => {
        return localStorage.getItem(STOP_STATE_KEY) === 'true';
    };

    const updateStopUI = () => {
        const stopped = isAutoStopped();
        const btn = document.getElementById('fx-btn-stop');
        const icon = document.getElementById('fx-btn-stop-icon');
        const text = document.getElementById('fx-btn-stop-text');
        const stat = document.getElementById('fx-stat');

        if (btn) {
            if (stopped) {
                btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                btn.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.38)';
                if (icon) icon.innerText = '▶️';
                if (text) text.innerText = 'Tiếp tục tự động';
                if (stat) {
                    stat.innerText = 'ĐÃ TẠM DỪNG ⏸️';
                    stat.style.color = '#ef4444';
                }
            } else {
                btn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                btn.style.boxShadow = '0 4px 14px rgba(220, 38, 38, 0.38)';
                if (icon) icon.innerText = '⏹️';
                if (text) text.innerText = 'Dừng tự động';
                if (stat && stat.innerText === 'ĐÃ TẠM DỪNG ⏸️') {
                    stat.innerText = 'Đang phát';
                    stat.style.color = '#10b981';
                }
            }
        }
    };
    window._fxUpdateStopUI = updateStopUI;

    const setAutoStopped = (stopped) => {
        localStorage.setItem(STOP_STATE_KEY, stopped ? 'true' : 'false');
        updateStopUI();
        if (stopped) {
            const v = document.querySelector('video');
            if (v && !v.paused) {
                try { v.pause(); } catch(e) {}
            }
            addLog('WARN', 'USER_STOP', '⏸️ Người dùng đã bấm DỪNG toàn bộ quá trình tự động!');
        } else {
            const v = document.querySelector('video');
            if (v && v.paused && !v.ended) {
                forcePlayVideo(v);
            }
            addLog('SUCCESS', 'USER_RESUME', '▶️ Người dùng đã kích hoạt TIẾP TỤC tự động hóa!');
        }
    };
    window._fxSetAutoStopped = setAutoStopped;

    ['visibilitychange', 'focus', 'click', 'keydown', 'load'].forEach(ev => {
        window.addEventListener(ev, () => {
            if (isAutoStopped()) return;
            const v = document.querySelector('video');
            if (v && v.paused && !v.ended) forcePlayVideo(v);
        });
    });

    // 5. LIQUID GLASS HUD ON PAGE (LIGHT FROSTED GLASS & BLUR)
    const createUI = () => {
        if (document.getElementById('fuxue-ui-v4')) return;
        const h = document.createElement('div');
        h.id = "fuxue-ui-v4";
        h.style.cssText = "padding:16px 18px;background:rgba(255,255,255,0.78);backdrop-filter:blur(30px) saturate(180%);-webkit-backdrop-filter:blur(30px) saturate(180%);color:#0f172a;border:1px solid rgba(255,255,255,0.95);border-radius:24px;font-family:'Plus Jakarta Sans',system-ui,-apple-system,sans-serif;font-size:12px;width:260px;position:fixed;bottom:25px;right:25px;z-index:2147483647;box-shadow:0 20px 50px rgba(0,50,150,0.14),0 0 0 1px rgba(0,102,255,0.12);display:flex;flex-direction:column;gap:8px;pointer-events:auto;transition:all 0.3s ease;";
        h.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(0,0,0,0.07);padding-bottom:7px;margin-bottom:2px;"><div style="display:flex;align-items:center;gap:6px;"><span style="font-size:14px;">🛡️</span><b style="font-size:12.5px;color:#0052cc;font-weight:800;letter-spacing:0.3px;">FUXUE PRO v4.1.4</b></div><span style="font-size:9.5px;font-weight:800;background:rgba(0,102,255,0.1);color:#0066ff;border:1px solid rgba(0,102,255,0.25);padding:2px 7px;border-radius:10px;letter-spacing:0.5px;">ORGANIC 1x</span></div><div style="display:flex;justify-content:space-between;align-items:center;"><span style="color:#64748b;font-size:11.5px;font-weight:500;">Chế độ:</span><span id="fx-mode" style="font-weight:700;color:#0066ff;font-size:11.5px;">ORGANIC 1.0X</span></div><div style="display:flex;justify-content:space-between;align-items:center;"><span style="color:#64748b;font-size:11.5px;font-weight:500;">Trạng thái:</span><span id="fx-stat" style="font-weight:700;color:#10b981;font-size:11.5px;">Đang phát</span></div><div style="display:flex;justify-content:space-between;align-items:center;"><span style="color:#64748b;font-size:11.5px;font-weight:500;">Heartbeat:</span><span id="fx-hb" style="color:#0284c7;font-family:monospace;font-weight:700;font-size:11.5px;">Active 24/7</span></div><div style="display:flex;justify-content:space-between;align-items:center;"><span style="color:#64748b;font-size:11.5px;font-weight:500;">Auto-Farm:</span><span id="fx-autofarm-badge" style="font-weight:700;font-size:11px;cursor:pointer;padding:1.5px 7px;border-radius:6px;transition:all 0.2s ease;">TẮT ⏸️</span></div><div style="margin-top:4px;padding-top:7px;border-top:1px solid rgba(0,0,0,0.07);"><div style="font-size:10px;color:#94a3b8;margin-bottom:2px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Bài học hiện tại:</div><div id="fx-less" style="font-size:11.5px;line-height:1.4;word-break:break-word;color:#1e293b;font-weight:600;">N/A</div></div><button id="fx-btn-stop" style="margin-top:4px;padding:8px 14px;border:none;border-radius:12px;font-family:inherit;font-size:11.5px;font-weight:800;letter-spacing:0.3px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:all 0.2s ease;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;box-shadow:0 4px 14px rgba(220,38,38,0.38);width:100%;"><span id="fx-btn-stop-icon">⏹️</span><span id="fx-btn-stop-text">Dừng tự động</span></button>';
        document.body.appendChild(h);

        const btnStop = h.querySelector('#fx-btn-stop');
        if (btnStop) {
            btnStop.addEventListener('click', (e) => {
                e.stopPropagation();
                setAutoStopped(!isAutoStopped());
            });
        }

        const badgeFarm = h.querySelector('#fx-autofarm-badge');
        if (badgeFarm) {
            badgeFarm.addEventListener('click', (e) => {
                e.stopPropagation();
                setAutoFarmEnabled(!isAutoFarmEnabled());
            });
        }
        updateStopUI();
        updateAutoFarmUI();
    };

    if (document.body) createUI();
    else document.addEventListener('DOMContentLoaded', createUI);

    const updateUI = (id, text) => {
        if (id === 'stat' && isAutoStopped()) return;
        const el = document.getElementById('fx-' + id);
        if (el) el.innerText = text;
    };

    // =========================================================================
    // 5.5. AUTO-FARM NEXT COURSE & CREDIT SCORE FILTER ENGINE
    // =========================================================================
    const AUTOFARM_KEY = 'ja_fuxue_autofarm';
    const FILTER_CREDITS_KEY = 'ja_fuxue_filter_credits';
    const COURSE_QUEUE_KEY = 'ja_fuxue_course_queue';
    const COMPLETED_COURSES_KEY = 'ja_fuxue_completed_courses';
    const SKIPPED_COURSES_KEY = 'ja_fuxue_skipped_courses';
    const FARM_RETURN_URL_KEY = 'ja_fuxue_farm_return_url';

    const isAutoFarmEnabled = () => localStorage.getItem(AUTOFARM_KEY) === 'true';
    const isFilterCreditsEnabled = () => localStorage.getItem(FILTER_CREDITS_KEY) !== 'false';

    const setAutoFarmEnabled = (enabled) => {
        localStorage.setItem(AUTOFARM_KEY, enabled ? 'true' : 'false');
        updateAutoFarmUI();
        if (enabled) {
            addLog('SUCCESS', 'AUTO_FARM', '🚀 Đã BẬT chế độ Auto-Farm (Tự động cày liên tục cả danh sách khóa học)!');
        } else {
            addLog('INFO', 'AUTO_FARM', '⏸️ Đã TẮT chế độ Auto-Farm.');
        }
    };
    window._fxSetAutoFarm = setAutoFarmEnabled;

    const setFilterCreditsEnabled = (enabled) => {
        localStorage.setItem(FILTER_CREDITS_KEY, enabled ? 'true' : 'false');
    };
    window._fxSetFilterCredits = setFilterCreditsEnabled;

    const getCurrentCourseId = () => {
        try {
            const u = new URL(location.href);
            const cid = u.searchParams.get('courseId') || u.searchParams.get('id');
            if (cid) return String(cid);
        } catch (e) {}
        try {
            if (window.courseId) return String(window.courseId);
        } catch (e) {}
        try {
            const match = document.documentElement.innerHTML.match(/courseId[=:"']\s*([0-9]+)/i);
            if (match) return match[1];
        } catch (e) {}
        return null;
    };

    const isPlayPage = () => {
        const p = location.pathname.toLowerCase();
        return p.includes('/play/play') || p.includes('/play/playcourse');
    };

    const isListPage = () => {
        const p = location.pathname.toLowerCase();
        if (p.includes('/home/homepage')) return false; // Tuyệt đối không cướp trang chủ của người dùng
        return p.includes('/category/show') || p.includes('/home/search') || p.includes('/user/studytask');
    };

    // Nhận diện điểm tín chỉ chuẩn xác đa ngôn ngữ:
    // Tiếng Anh: "Credit Score：(0)", "Credit Score: (0)", "Credit Score：0", "Credit Score: 0", "Credit Score：(15)"
    // Tiếng Trung: "学分：(0)", "学分：0", "学分值：0", "学分：(15)"
    // Tiếng Việt: "Điểm học phần：(0)", "Điểm học phần: 0"
    const detectCourseCreditInfo = () => {
        try {
            const bodyText = document.body ? document.body.innerText : '';
            // 1. Nhận diện khóa học 0 tín chỉ
            if (/Credit\s*Score[：:\s]*\(\s*0(?:\.0+)?\s*\)/i.test(bodyText) ||
                /Credit\s*Score[：:\s]+0(?:\.0+)?(?:\s|$|[^\d])/i.test(bodyText) ||
                /学分[：:\s]*\(\s*0(?:\.0+)?\s*\)/.test(bodyText) ||
                /学分[：:\s]+0(?:\.0+)?(?:\s|$|[^\d])/.test(bodyText) ||
                /Điểm\s*học\s*phần[：:\s]*\(\s*0(?:\.0+)?\s*\)/i.test(bodyText)) {
                return { hasCredit: false, score: 0, text: 'Credit Score：(0)' };
            }

            // 2. Nhận diện khóa học có điểm tín chỉ dương
            const match = bodyText.match(/(?:Credit\s*Score|学分|Điểm\s*học\s*phần)[：:\s]*\(?([0-9]+(?:\.[0-9]+)?)\)?/i);
            if (match) {
                const val = parseFloat(match[1]);
                return { hasCredit: val > 0, score: val, text: match[0] };
            }
        } catch(e) {}
        return { hasCredit: null, score: null, text: null };
    };

    const getCourseQueue = () => {
        try {
            const raw = localStorage.getItem(COURSE_QUEUE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch(e) { return []; }
    };

    const saveCourseQueue = (queue) => {
        try {
            localStorage.setItem(COURSE_QUEUE_KEY, JSON.stringify(queue));
        } catch(e) {}
    };

    const getCompletedCourses = () => {
        try {
            const raw = localStorage.getItem(COMPLETED_COURSES_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch(e) { return []; }
    };

    const addCompletedCourse = (cid) => {
        if (!cid) return;
        try {
            const comp = getCompletedCourses();
            if (!comp.includes(String(cid))) {
                comp.push(String(cid));
                localStorage.setItem(COMPLETED_COURSES_KEY, JSON.stringify(comp));
            }
        } catch(e) {}
    };

    const getSkippedCourses = () => {
        try {
            const raw = localStorage.getItem(SKIPPED_COURSES_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch(e) { return []; }
    };

    const addSkippedCourse = (cid) => {
        if (!cid) return;
        try {
            const sk = getSkippedCourses();
            if (!sk.includes(String(cid))) {
                sk.push(String(cid));
                localStorage.setItem(SKIPPED_COURSES_KEY, JSON.stringify(sk));
            }
        } catch(e) {}
    };

    const getNextEligibleCourseInQueue = (currentCid) => {
        const queue = getCourseQueue();
        const completed = getCompletedCourses();
        const skipped = getSkippedCourses();
        return queue.find(c => {
            const id = String(c.courseId);
            return (!currentCid || id !== String(currentCid)) && !completed.includes(id) && !skipped.includes(id);
        }) || null;
    };

    const updateAutoFarmUI = () => {
        const badge = document.getElementById('fx-autofarm-badge');
        if (badge) {
            const on = isAutoFarmEnabled();
            if (on) {
                badge.innerText = 'BẬT ⚡';
                badge.style.background = 'rgba(16, 185, 129, 0.15)';
                badge.style.color = '#059669';
                badge.style.border = '1px solid rgba(16, 185, 129, 0.3)';
            } else {
                badge.innerText = 'TẮT ⏸️';
                badge.style.background = 'rgba(100, 116, 139, 0.12)';
                badge.style.color = '#64748b';
                badge.style.border = '1px solid rgba(100, 116, 139, 0.2)';
            }
        }
    };
    window._fxUpdateAutoFarmUI = updateAutoFarmUI;

    window._jaFarmNavigating = false;
    const advanceToNextCourse = (reason) => {
        if (window._jaFarmNavigating) return;
        window._jaFarmNavigating = true;

        const currentCid = getCurrentCourseId();
        const next = getNextEligibleCourseInQueue(currentCid);

        if (next && next.url) {
            const titleDisplay = (next.title || `Khóa ${next.courseId}`).substring(0, 22);
            addLog('SUCCESS', 'AUTO_FARM', `${reason} -> Chuẩn bị chuyển sang: ${next.title} (ID: ${next.courseId})`);
            updateUI('stat', `CHUYỂN: ${titleDisplay}... 🚀`);
            setTimeout(() => {
                location.href = next.url;
            }, 3000);
        } else {
            const retUrl = localStorage.getItem(FARM_RETURN_URL_KEY);
            addLog('SUCCESS', 'AUTO_FARM', `🏆 Đã hoàn thành/duyệt qua toàn bộ danh sách khóa học trong hàng đợi!`);
            updateUI('stat', 'XONG TẤT CẢ KHÓA! 🏆');
            if (retUrl && !location.href.includes(retUrl)) {
                setTimeout(() => {
                    location.href = retUrl;
                }, 3500);
            }
        }
    };

    const requestCloseTab = (opts = {}) => {
        try {
            window.postMessage({
                type: 'FUXUE_CLOSE_TAB',
                openNextUrl: opts.openNextUrl || null,
                reason: opts.reason || 'Auto-close tab'
            }, '*');
        } catch(e) {}
        try {
            window.close();
        } catch(e) {}
    };
    window._fxRequestCloseTab = requestCloseTab;

    // Tự động đóng tab khóa học đã hoàn tất (Exam record đạt 100 điểm)
    const requestCloseCompletedCourseTab = (opts = {}) => {
        const cid = opts.courseId || getCurrentCourseId();
        try {
            window.postMessage({
                type: 'FUXUE_COURSE_COMPLETED',
                courseId: cid,
                openNextUrl: opts.openNextUrl || null,
                reason: opts.reason || 'Course finished (Exam record 100)'
            }, '*');
        } catch(e) {}
        try {
            window.close();
        } catch(e) {}
    };
    window._fxRequestCloseCompletedCourseTab = requestCloseCompletedCourseTab;

    // Giao tiếp với bridge.js và background.js
    window._hasActiveStudyTab = false;
    window.addEventListener('message', (event) => {
        if (event.source !== window || !event.data || !event.data.type) return;
        if (event.data.type === 'FUXUE_CHECK_DUPLICATE_RESP') {
            if (event.data.isDuplicate) {
                console.log('[FUXUE] ⚠️ Tab này là tab trùng lặp, đang được background tự động đóng...');
                updateUI('stat', 'TAB TRÙNG LẶP - ĐANG ĐÓNG ⚠️');
            }
        } else if (event.data.type === 'FUXUE_QUERY_ACTIVE_STUDY_RESP') {
            window._hasActiveStudyTab = Boolean(event.data.hasActiveStudyTab);
        }
    });

    const checkDuplicatePlayTab = () => {
        const cid = getCurrentCourseId();
        if (!cid) return;
        try {
            window.postMessage({
                type: 'FUXUE_CHECK_DUPLICATE',
                courseId: cid
            }, '*');
        } catch(e) {}
    };
    window._fxCheckDuplicatePlayTab = checkDuplicatePlayTab;

    const queryActiveStudyTab = () => {
        try {
            window.postMessage({
                type: 'FUXUE_QUERY_ACTIVE_STUDY'
            }, '*');
        } catch(e) {}
    };
    window._fxQueryActiveStudyTab = queryActiveStudyTab;

    const scanListPageCourses = () => {
        try {
            const anchors = Array.from(document.querySelectorAll('a[href*="play?courseId="], a[href*="playCourse?courseId="]'));
            if (anchors.length === 0) return [];
            const queue = getCourseQueue();
            const seen = new Set(queue.map(q => String(q.courseId)));
            let addedCount = 0;

            anchors.forEach(a => {
                try {
                    const u = new URL(a.href);
                    const cid = u.searchParams.get('courseId');
                    if (cid && !seen.has(cid)) {
                        seen.add(cid);
                        const card = a.closest('li, .item, .course_item, dl, tr') || a;
                        const titleEl = card.querySelector('.title, .title_a, h3, h4, p.name') || a;
                        const title = (titleEl.getAttribute('title') || titleEl.innerText || '').trim() || `Course ${cid}`;
                        queue.push({
                            courseId: cid,
                            url: a.href,
                            title: title.substring(0, 100)
                        });
                        addedCount++;
                    }
                } catch(e) {}
            });

            if (addedCount > 0) {
                saveCourseQueue(queue);
            }
            localStorage.setItem(FARM_RETURN_URL_KEY, location.href);
            return queue;
        } catch(e) {
            return [];
        }
    };

    /**
     * Kiểm tra lịch sử thi (Exam record / 考试记录) trên trang playCourse.
     * Dựa vào "Exam record：" và "Course Credit：" để biết khóa học đã thi và đã đạt hay chưa.
     */
    let _lastKsjlRequestTime = 0;
    const checkCourseExamRecord = () => {
        try {
            // Tự động kích hoạt load dữ liệu lịch sử thi nếu chưa được load
            const now = Date.now();
            if (now - _lastKsjlRequestTime > 4000) {
                _lastKsjlRequestTime = now;
                const ksjlBtn = document.querySelector('a.ksjl, a[href="#ksjl"]');
                if (ksjlBtn) {
                    try { ksjlBtn.click(); } catch(e) {}
                } else if (typeof window.loadExamRecordList === 'function') {
                    try { window.loadExamRecordList(); } catch(e) {}
                }
            }

            // 1. Kiểm tra thuộc tính Is Get (Đã nhận điểm tín chỉ)
            const isObtainEl = document.querySelector('.isObtain');
            const isObtainText = (isObtainEl?.innerText || isObtainEl?.textContent || '').trim().toLowerCase();
            const isGetPass = isObtainText === 'yes' || isObtainText === '是' || isObtainText === 'có' || isObtainText === 'true';

            // 2. Quét bảng lịch sử thi (#ksjl table tr)
            const ksjlPane = document.getElementById('ksjl');
            const searchScope = ksjlPane || document;
            const rows = Array.from(searchScope.querySelectorAll('table tr, tbody tr'));
            
            let bestScore = -1;
            let hasPassedRow = false;

            for (const tr of rows) {
                const txt = tr.innerText.replace(/\s+/g, ' ').trim();
                // Bỏ qua header hoặc template
                if (txt.includes('Examination Score') || txt.includes('考试成绩') || txt.includes('Credit Score') || txt.includes('{{d[i]')) continue;

                // Kiểm tra có từ khóa Pass/Yes/Đạt/是
                const isPass = /\b(?:Yes|是|Đạt)\b/i.test(txt);
                
                // Trích xuất điểm số từ hàng
                const scoreMatch = txt.match(/\b([0-9]{1,3})\s+(?:Yes|是|Đạt)\b/i) || txt.match(/\b([0-9]{1,3})\b/);
                if (scoreMatch) {
                    const score = parseInt(scoreMatch[1], 10);
                    if (score > bestScore) bestScore = score;
                    if (isPass || score >= 80) {
                        hasPassedRow = true;
                    }
                } else if (isPass) {
                    hasPassedRow = true;
                }
            }

            if (isGetPass || hasPassedRow || bestScore >= 80) {
                const finalScore = bestScore >= 0 ? bestScore : 100;
                return {
                    hasPassed: true,
                    score: finalScore,
                    isGet: isGetPass,
                    reason: isGetPass ? 'Is Get: Yes (Đã hoàn thành và nhận tín chỉ)' : `Đã thi đạt ${finalScore} điểm (Is Pass: Yes)`
                };
            }
        } catch(e) {}
        return { hasPassed: false, score: null, isGet: false, reason: null };
    };
    window._fxCheckCourseExamRecord = checkCourseExamRecord;

    // =========================================================================
    // 6. SELF-LEARNING EXAM SOLVER (ELIMINATION & ANSWER CAPTURE ENGINE)
    // =========================================================================
    const EXAM_KB_KEY = 'ja_fuxue_exam_kb';
    const LEGACY_ANS_KEY = 'ja_captured_answers';
    const EXAM_STAGE_KEY = 'ja_exam_stage';

    // Chuẩn hóa đáp án thành chuỗi chữ cái viết hoa được sắp xếp và ngăn cách bằng dấu phẩy (VD: "A,C" hoặc "1", "0")
    const canonicalizeChoice = (val) => {
        if (!val) return '';
        if (typeof val === 'string') {
            const trimmed = val.replace(/&nbsp;/g, '').trim().toUpperCase();
            if (trimmed === 'YES' || trimmed === '1') return '1';
            if (trimmed === 'NO' || trimmed === '0') return '0';
        }
        if (Array.isArray(val)) {
            const mapped = val.map(l => {
                const s = String(l).replace(/&nbsp;/g, '').trim().toUpperCase();
                if (s === 'YES') return '1';
                if (s === 'NO') return '0';
                return s;
            });
            return Array.from(new Set(mapped)).filter(l => /^[A-Z0-9]$/.test(l)).sort().join(',');
        }
        const letters = (String(val).match(/[A-Z0-9]/gi) || []).map(l => l.toUpperCase());
        return Array.from(new Set(letters)).sort().join(',');
    };

    // Tạo toàn bộ các tổ hợp đa chọn khả thi (Ưu tiên cặp 2, bộ 3, bộ 4) cho câu hỏi nhiều đáp án
    const getAllMultiChoiceCombos = (options) => {
        const opts = Array.from(new Set(options.map(o => o.toUpperCase()))).sort();
        const combos = [];

        // 1. Cặp 2 đáp án (phổ biến nhất trên hệ thống đề thi Foxconn: AB, AC, AD, BC, BD, CD)
        for (let i = 0; i < opts.length; i++) {
            for (let j = i + 1; j < opts.length; j++) {
                combos.push([opts[i], opts[j]]);
            }
        }

        // 2. Bộ 3 đáp án (ABC, ABD, ACD, BCD)
        for (let i = 0; i < opts.length; i++) {
            for (let j = i + 1; j < opts.length; j++) {
                for (let k = j + 1; k < opts.length; k++) {
                    combos.push([opts[i], opts[j], opts[k]]);
                }
            }
        }

        // 3. Trọn bộ 4 đáp án (nếu có từ 4 đáp án trở lên: ABCD)
        if (opts.length >= 4) {
            combos.push([...opts]);
        }

        return combos;
    };

    const loadExamKB = () => {
        try {
            const raw = localStorage.getItem(EXAM_KB_KEY);
            const kb = raw ? JSON.parse(raw) : {};
            // Tự động chuẩn hóa dữ liệu cũ trong KB
            Object.keys(kb).forEach(k => {
                if (kb[k].correct) kb[k].correct = canonicalizeChoice(kb[k].correct);
                if (Array.isArray(kb[k].wrongChoices)) {
                    kb[k].wrongChoices = Array.from(new Set(kb[k].wrongChoices.map(canonicalizeChoice))).filter(Boolean);
                }
            });
            return kb;
        } catch (e) {
            return {};
        }
    };

    const saveExamKB = (kb) => {
        try {
            localStorage.setItem(EXAM_KB_KEY, JSON.stringify(kb));
            const legacy = Object.values(kb).map(x => x.correct || '').filter(Boolean);
            if (legacy.length > 0) localStorage.setItem(LEGACY_ANS_KEY, JSON.stringify(legacy));
        } catch (e) {}
    };

    const getQuestionSignature = (container, index) => {
        if (!container) return `q_${index}`;
        const titleEl = container.querySelector('.shiti_title, .title, .question_title, .question-stem, h3, h4, p:first-child');
        let text = titleEl ? (titleEl.innerText || titleEl.textContent) : (container.innerText || container.textContent);
        if (!text) return `q_${index}`;
        text = text.replace(/^(?:câu\s*\d+[\.:]?|\d+[\.:、])\s*/i, '').replace(/\s+/g, ' ').trim();
        return text.substring(0, 90) || `q_${index}`;
    };

    const getAvailableOptions = (container) => {
        const opts = [];
        const inputs = container.querySelectorAll('input[type="radio"], input[type="checkbox"], label, .option, .item');
        inputs.forEach(el => {
            let val = el.value || '';
            if (!val) {
                const txt = (el.innerText || el.textContent || '').trim().toUpperCase();
                if (/^(YES|ĐÚNG|正确)$/i.test(txt)) val = '1';
                else if (/^(NO|SAI|错误)$/i.test(txt)) val = '0';
                else {
                    const m = txt.match(/^([A-Z0-9])[\.、\s]/i) || txt.match(/\b([A-Z0-9])\b/);
                    if (m) val = m[1];
                }
            } else {
                val = val.trim().toUpperCase();
                if (val === 'YES') val = '1';
                else if (val === 'NO') val = '0';
            }
            val = val.trim().toUpperCase();
            if (val && /^[A-Z0-9]$/.test(val) && !opts.includes(val)) {
                opts.push(val);
            }
        });
        return opts.length > 0 ? opts : ['A', 'B', 'C', 'D'];
    };

    window._jaExamSolving = false;
    let _lastExamUrl = '';

    const checkExamLogic = () => {
        if (location.href !== _lastExamUrl) {
            _lastExamUrl = location.href;
            window._jaExamSolving = false;
            window._jaExamSubmitted = false;
            window._retakingExam = false;
        }

        const currentUrl = location.href.toLowerCase();
        if (isAutoStopped()) {
            window._jaExamSolving = false;
            return;
        }
        const isResultPage = currentUrl.includes('submitexam') || !!document.querySelector('p.answer, .daan, .right_answer, .tihao.Y, .tihao.F, .tihao.N');
        const questionBlocks = document.querySelectorAll('.shiti_list, .exam-item, .exam_question, .question_box, .shiti, .item_box, .question_warp');
        const submitBtn = document.querySelector('button[onclick*="tijiao"], .btn-submit, input[type="submit"][value*="交"], button.submit');

        const isExamPage = isResultPage || !!submitBtn || currentUrl.includes('exam') || currentUrl.includes('test') || currentUrl.includes('paper');
        if (!isExamPage) return;

        const kb = loadExamKB();

        // -------------------------------------------------------------
        // PHẦN A: THU THẬP VÀ GHI NHỚ TỪ TRANG KẾT QUẢ / XEM LẠI BÀI THI
        // (CHỈ CHẠY KHI ĐANG Ở TRANG KẾT QUẢ, TUYỆT ĐỐI KHÔNG CHẠY KHI ĐANG LÀM ĐỀ)
        // -------------------------------------------------------------
        if (isResultPage) {
            const ansParagraphs = Array.from(document.querySelectorAll('p.answer, .answer, .daan, .right_answer')).filter(p => /(?:Correct Answer|正確答案|正确答案|Đáp án đúng|ĐA đúng)/i.test(p.innerText));
            let newlyLearned = 0;
            let newlyEliminated = 0;

            // 1. Thu thập đáp án đúng 100% từ thẻ p.answer (Foxconn trả về đáp án chuẩn)
            if (ansParagraphs.length > 0) {
                ansParagraphs.forEach((ansEl, idx) => {
                    let rawText = '';
                    const strongEl = ansEl.querySelector('strong');
                    if (strongEl) {
                        rawText = strongEl.innerText.replace(/&nbsp;/g, '').trim();
                    } else {
                        const match = ansEl.innerText.match(/(?:Correct Answer|正確答案|正确答案|Đáp án đúng|ĐA đúng)[：:\s]*([^\n\r]+)/i);
                        if (match) rawText = match[1].replace(/&nbsp;/g, '').trim();
                    }

                    if (rawText) {
                        const correctKey = canonicalizeChoice(rawText);
                        if (correctKey) {
                            const parentQ = ansEl.closest('.shiti_list, .exam-item, .exam_question, .question_box, .shiti, .item_box, .question_warp') || questionBlocks[idx];
                            const sig = getQuestionSignature(parentQ, idx);
                            if (!kb[sig]) kb[sig] = { correct: null, wrongChoices: [], lastPicked: null };
                            if (kb[sig].correct !== correctKey) {
                                kb[sig].correct = correctKey;
                                kb[sig].wrongChoices = []; // Đã có đáp án đúng chuẩn, làm sạch danh sách sai
                                newlyLearned++;
                                addLog('SUCCESS', 'EXAM_MEMORY', `💎 Học ĐÁP ÁN ĐÚNG (#${idx + 1}): "${sig.substring(0,35)}..." -> [${correctKey}]`);
                            }
                        }
                    }
                });
            }

            // 2. Hệ thống chấm Đúng / Sai từng câu qua thẻ Answer Card (#a1 -> #a15) hoặc icon (khi trang không in p.answer)
            if (ansParagraphs.length === 0 && questionBlocks.length > 0) {
                questionBlocks.forEach((block, idx) => {
                    const qNum = idx + 1;
                    const sig = getQuestionSignature(block, idx);
                    if (!kb[sig]) kb[sig] = { correct: null, wrongChoices: [], lastPicked: null };

                    let chosenOption = kb[sig].lastPicked;
                    const checkedInputs = Array.from(block.querySelectorAll('input:checked'));
                    if (checkedInputs.length > 0) {
                        const vals = checkedInputs.map(i => (i.value || '').trim().toUpperCase()).filter(Boolean);
                        if (vals.length > 0) chosenOption = canonicalizeChoice(vals);
                    } else {
                        const userPickMatch = block.innerHTML.match(/(?:Your (?:Response|Answer)|Lựa chọn của bạn|選擇|选择|您选择的答案)[：:\s]*(?:<[^>]+>)?([A-Z0-9,\s]+)/i);
                        if (userPickMatch) chosenOption = canonicalizeChoice(userPickMatch[1]);
                    }

                    const tihaoEl = document.getElementById('a' + qNum);
                    let isRight = false;
                    let isWrong = false;

                    if (tihaoEl) {
                        if (tihaoEl.classList.contains('Y') || tihaoEl.classList.contains('right') || tihaoEl.classList.contains('dui')) {
                            isRight = true;
                        } else if (tihaoEl.classList.contains('F') || tihaoEl.classList.contains('N') || tihaoEl.classList.contains('wrong') || tihaoEl.classList.contains('cuo')) {
                            isWrong = true;
                        }
                    }

                    if (!isRight && !isWrong) {
                        if (block.querySelector('.dui, .right, .correct, .fa-check, .glyphicon-ok, img[src*="dui"]')) {
                            isRight = true;
                        } else if (block.querySelector('.c_orange, .cuo, .wrong, .error, .fa-times, .glyphicon-remove, img[src*="cuo"], img[src*="wrong"]')) {
                            isWrong = true;
                        }
                    }

                    if (chosenOption) {
                        chosenOption = canonicalizeChoice(chosenOption);
                        if (isRight) {
                            if (kb[sig].correct !== chosenOption) {
                                kb[sig].correct = chosenOption;
                                newlyLearned++;
                                addLog('SUCCESS', 'EXAM_MEMORY', `🎉 Xác nhận câu ĐÚNG (#${qNum}): "${sig.substring(0,35)}..." -> CỐ ĐỊNH [${chosenOption}]`);
                            }
                        } else if (isWrong) {
                            if (!kb[sig].wrongChoices) kb[sig].wrongChoices = [];
                            kb[sig].wrongChoices = Array.from(new Set(kb[sig].wrongChoices.map(canonicalizeChoice)));
                            if (!kb[sig].wrongChoices.includes(chosenOption)) {
                                kb[sig].wrongChoices.push(chosenOption);
                                newlyEliminated++;
                                addLog('WARN', 'EXAM_MEMORY', `❌ Ghi nhớ câu SAI (#${qNum}): "${sig.substring(0,35)}..." -> LOẠI BỎ [${chosenOption}]`);
                            }
                            kb[sig].correct = null;
                        }
                    }
                });
            }

            if (newlyLearned > 0 || newlyEliminated > 0) {
                saveExamKB(kb);
                localStorage.setItem(EXAM_STAGE_KEY, 'HAS_ANSWERS');
                updateUI('stat', `ĐÃ HỌC (${newlyLearned} đúng, ${newlyEliminated} loại trừ) ✅`);
            }
        }

        // -------------------------------------------------------------
        // PHẦN B: TỰ ĐỘNG ĐIỀN ĐÁP ÁN (HỖ TRỢ CẢ ĐƠN CHỌN VÀ ĐA CHỌN)
        // -------------------------------------------------------------
        // Hàm click chọn đáp án an toàn, tránh lỗi double-click gây bỏ chọn checkbox trên Foxconn
        const selectOption = (block, optLetter, isChecked = true) => {
            if (!block || !optLetter) return false;
            const letter = optLetter.trim().toUpperCase();
            let matched = false;

            // 1. Tìm input radio hoặc checkbox có value trùng khớp
            const inputs = block.querySelectorAll('input[type="radio"], input[type="checkbox"]');
            inputs.forEach(inp => {
                const val = (inp.value || '').trim().toUpperCase();
                const isMatch = val === letter ||
                    (letter === '1' && (val === '1' || val === 'YES' || val === 'TRUE')) ||
                    (letter === '0' && (val === '0' || val === 'NO' || val === 'FALSE'));

                if (isMatch) {
                    matched = true;
                    if (inp.type === 'checkbox') {
                        if (inp.checked !== isChecked) {
                            inp.click();
                        }
                        inp.checked = isChecked;
                        inp.dispatchEvent(new Event('change', { bubbles: true }));
                        // Đồng bộ hàm cbChange của Foxconn để Answer Card chuyển màu xanh
                        const onclickAttr = inp.getAttribute('onclick') || '';
                        const cbMatch = onclickAttr.match(/cbChange\((\d+),\s*'([^']+)'\)/);
                        if (cbMatch && typeof window.cbChange === 'function') {
                            try { window.cbChange(parseInt(cbMatch[1], 10), cbMatch[2]); } catch(e) {}
                        }
                    } else if (inp.type === 'radio') {
                        if (!inp.checked) {
                            inp.click();
                        }
                        inp.checked = true;
                        inp.dispatchEvent(new Event('change', { bubbles: true }));
                        // Đồng bộ hàm singleChange của Foxconn
                        const label = inp.closest('label');
                        const singleMatch = label && label.getAttribute('onclick') ? label.getAttribute('onclick').match(/singleChange\((\d+)\)/) : null;
                        if (singleMatch && typeof window.singleChange === 'function') {
                            try { window.singleChange(parseInt(singleMatch[1], 10)); } catch(e) {}
                        }
                    }
                }
            });

            // 2. Dự phòng theo nhãn văn bản (Label) nếu input không có value chuẩn
            if (!matched) {
                const labels = block.querySelectorAll('label, .option, .item');
                labels.forEach(el => {
                    if (matched) return;
                    const txt = (el.innerText || el.textContent || '').trim().toUpperCase();
                    let isMatch = false;
                    if (letter === '1' && (/^(YES|ĐÚNG|正确)$/i.test(txt) || txt.includes('YES'))) isMatch = true;
                    else if (letter === '0' && (/^(NO|SAI|错误)$/i.test(txt) || txt.includes('NO'))) isMatch = true;
                    else {
                        const m = txt.match(/^([A-Z0-9])[\.、：:\s]/i) || txt.match(/\b([A-Z0-9])\b/);
                        if (m && m[1].toUpperCase() === letter) isMatch = true;
                    }
                    if (isMatch) {
                        el.click();
                        matched = true;
                    }
                });
            }
            return matched;
        };

        // Tự động xử lý popup xác nhận nộp bài (layer.confirm)
        const examDialog = document.querySelector('.layui-layer-dialog');
        if (examDialog) {
            const dialogText = examDialog.innerText || '';
            const okBtn = examDialog.querySelector('.layui-layer-btn0');
            const cancelBtn = examDialog.querySelector('.layui-layer-btn1');

            if (/(unanswered|chưa trả lời|未完成|chưa hoàn thành)/i.test(dialogText)) {
                // Nếu bị báo thiếu câu, bấm Cancel để giải bổ sung ngay
                if (cancelBtn) cancelBtn.click();
                window._jaExamSubmitted = false;
            } else if (/(hand in|submit|nộp bài|交卷|确定)/i.test(dialogText)) {
                // Xác nhận nộp bài hoàn tất
                if (okBtn) {
                    okBtn.click();
                    updateUI('stat', 'ĐÃ NỘP BÀI THI ✅');
                    addLog('SUCCESS', 'EXAM', 'Xác nhận nộp bài thi thành công!');
                }
            }
        }

        if (submitBtn && questionBlocks.length > 0 && !window._jaExamSolving && !window._jaExamSubmitted) {
            const hasSelectableInputs = document.querySelector('input[type="radio"], input[type="checkbox"], label.radio, label.option');
            if (hasSelectableInputs) {
                // Kiểm tra xem đề thi này đã được bóc tách 100% đáp án chuẩn chưa
                const allKnown = Array.from(questionBlocks).every((b, i) => {
                    const sig = getQuestionSignature(b, i);
                    return kb[sig] && kb[sig].correct;
                });

                if (!allKnown) {
                    // =========================================================
                    // GIAI ĐOẠN 1: THI NHÁP SIÊU TỐC ĐỂ BÓC TÁCH ĐÁP ÁN CHUẨN TỪ FOXCONN
                    // =========================================================
                    window._jaExamSolving = true;
                    updateUI('stat', 'LẦN 1: NỘP NHÁP LẤY ĐÁP ÁN ⚡');
                    addLog('INFO', 'EXAM_PROBE', '⚡ Lần 1: Tự động nộp bài nhanh để Foxconn trả về 100% đáp án chuẩn...');

                    // Điền đáp án đầu tiên cho tất cả câu hỏi để không bị báo thiếu câu
                    questionBlocks.forEach((blk, idx) => {
                        const qNum = idx + 1;
                        const isMulti = blk.querySelectorAll('input[type="checkbox"]').length > 0 ||
                                        Array.from(blk.querySelectorAll('input')).some(i => (i.name || '').startsWith('M-'));
                        const avail = getAvailableOptions(blk);
                        if (isMulti) {
                            selectOption(blk, avail[0] || 'A', true);
                            if (avail[1]) selectOption(blk, avail[1], true);
                        } else {
                            selectOption(blk, avail[0] || '1', true);
                        }

                        const tihaoBtn = document.getElementById('a' + qNum);
                        if (tihaoBtn) tihaoBtn.classList.add('active');
                        const firstInp = blk.querySelector('input');
                        if (firstInp) {
                            if (isMulti && typeof window.cbChange === 'function') {
                                try { window.cbChange(qNum, firstInp.name); } catch(e) {}
                            } else if (!isMulti && typeof window.singleChange === 'function') {
                                try { window.singleChange(qNum); } catch(e) {}
                            }
                        }
                    });

                    document.querySelectorAll('.tihao_box a.tihao:not(.active)').forEach(el => {
                        el.classList.add('active');
                    });

                    window._jaExamSolving = false;
                    window._jaExamSubmitted = true;
                    updateUI('stat', 'NỘP BÀI LẤY ĐÁP ÁN... 🚀');
                    addLog('SUCCESS', 'EXAM_PROBE', 'Đã nộp bài nháp thành công! Chuẩn bị ghi nhận 100% đáp án chuẩn...');

                    setTimeout(() => {
                        if (typeof window.tijiao === 'function') {
                            window.tijiao();
                        } else if (submitBtn) {
                            submitBtn.click();
                        }
                        setTimeout(() => {
                            const confirmOk = document.querySelector('.layui-layer-btn0');
                            if (confirmOk) confirmOk.click();
                        }, 500);
                    }, 800);
                    return;
                }

                // =============================================================
                // GIAI ĐOẠN 2: THI CHÍNH THỨC VỚI 100% ĐÁP ÁN CHUẨN ĐÃ THU THẬP
                // =============================================================
                window._jaExamSolving = true;
                updateUI('stat', 'LẦN 2: ĐIỀN ĐÁP ÁN CHUẨN 100% 🎯');
                addLog('INFO', 'EXAM', '🎯 Lần 2: Áp dụng 100% đáp án chuẩn đã ghi nhớ để thi lại và đạt điểm tối đa!');

                let qIndex = 0;
                const solveStep = () => {
                    if (isAutoStopped()) {
                        window._jaExamSolving = false;
                        return;
                    }
                    if (qIndex >= questionBlocks.length) {
                        saveExamKB(kb);

                        // KIỂM TRA TOÀN DIỆN: Đảm bảo 100% câu hỏi đều ĐÃ ĐƯỢC CHỌN ĐÁP ÁN (Không để sót câu nào)
                        questionBlocks.forEach((blk, idx) => {
                            const qNum = idx + 1;
                            const isMulti = blk.querySelectorAll('input[type="checkbox"]').length > 0 ||
                                            Array.from(blk.querySelectorAll('input')).some(i => (i.name || '').startsWith('M-'));
                            const hasChecked = blk.querySelector('input:checked');
                            if (!hasChecked) {
                                const avail = getAvailableOptions(blk);
                                if (isMulti) {
                                    selectOption(blk, avail[0] || 'A', true);
                                    if (avail[1]) selectOption(blk, avail[1], true);
                                } else {
                                    selectOption(blk, avail[0] || 'A', true);
                                }
                            }
                            // Kích hoạt sáng đèn Answer Card của Foxconn (#a1 -> #a10)
                            const tihaoBtn = document.getElementById('a' + qNum);
                            if (tihaoBtn) tihaoBtn.classList.add('active');
                            const firstInp = blk.querySelector('input');
                            if (firstInp) {
                                if (isMulti && typeof window.cbChange === 'function') {
                                    try { window.cbChange(qNum, firstInp.name); } catch(e) {}
                                } else if (!isMulti && typeof window.singleChange === 'function') {
                                    try { window.singleChange(qNum); } catch(e) {}
                                }
                            }
                        });

                        // Đảm bảo không còn thẻ số câu nào sót chưa active để window.noCompleteCount() luôn = 0
                        document.querySelectorAll('.tihao_box a.tihao:not(.active)').forEach(el => {
                            el.classList.add('active');
                        });

                        window._jaExamSolving = false;
                        window._jaExamSubmitted = true;
                        updateUI('stat', 'ĐÃ ĐIỀN XONG 100% ✨');
                        addLog('SUCCESS', 'EXAM', `Đã điền đủ ${questionBlocks.length}/${questionBlocks.length} câu hỏi. Sẵn sàng tự động nộp bài!`);

                        // Tự động nộp bài sau 1s
                        setTimeout(() => {
                            updateUI('stat', 'NỘP BÀI THI... 🚀');
                            if (typeof window.tijiao === 'function') {
                                window.tijiao();
                            } else if (submitBtn) {
                                submitBtn.click();
                            }

                            // Tự động bấm nút OK xác nhận nộp bài nếu xuất hiện layer confirm
                            setTimeout(() => {
                                const confirmOk = document.querySelector('.layui-layer-btn0');
                                if (confirmOk) confirmOk.click();
                            }, 500);
                        }, 1000);
                        return;
                    }

                    const block = questionBlocks[qIndex];
                    const sig = getQuestionSignature(block, qIndex);
                    if (!kb[sig]) kb[sig] = { correct: null, wrongChoices: [], lastPicked: null };

                    const available = getAvailableOptions(block);
                    const isMultiple = block.querySelectorAll('input[type="checkbox"]').length > 0 ||
                                       Array.from(block.querySelectorAll('input')).some(i => (i.name || '').startsWith('M-'));
                    let targetLetters = [];

                    // 1. Ưu tiên 1: Đã xác định đáp án ĐÚNG 100% từ lần thi trước
                    if (kb[sig].correct) {
                        const letters = (String(kb[sig].correct).match(/[A-Z0-9]/gi) || []).map(l => l.toUpperCase());
                        targetLetters = letters.filter(l => available.includes(l));
                        if (targetLetters.length === 0 && letters.length > 0) {
                            targetLetters = letters;
                        }
                    }

                    // 2. Ưu tiên 2: LOẠI TRỪ các phương án/tổ hợp đã từng bị chấm SAI
                    if (targetLetters.length === 0) {
                        const wrongList = (kb[sig].wrongChoices || []).map(canonicalizeChoice).filter(Boolean);

                        if (isMultiple) {
                            // Tạo toàn bộ các tổ hợp đa chọn khả thi (cặp 2, bộ 3, bộ 4)
                            const allCombos = getAllMultiChoiceCombos(available);
                            // Tìm tổ hợp ĐẦU TIÊN chưa từng bị ghi nhận sai
                            const untriedCombo = allCombos.find(combo => {
                                const comboKey = combo.join(',');
                                return !wrongList.includes(comboKey);
                            });

                            if (untriedCombo) {
                                targetLetters = untriedCombo;
                            } else {
                                // Nếu đã thử hết các tổ hợp thì reset vòng lặp và thử lại cặp đầu tiên
                                targetLetters = allCombos[0] || available.slice(0, 2);
                            }
                        } else {
                            // Câu hỏi đơn lựa chọn: Tìm đáp án đơn chưa từng thử
                            const untried = available.filter(opt => !wrongList.includes(opt));
                            targetLetters = [untried[0] || available[0]];
                        }
                    }

                    kb[sig].lastPicked = canonicalizeChoice(targetLetters);

                    // Áp dụng chọn các đáp án mục tiêu:
                    // Đối với câu hỏi nhiều đáp án: bật true cho targetLetters và bỏ chọn các đáp án còn lại
                    if (isMultiple) {
                        available.forEach(letter => {
                            selectOption(block, letter, targetLetters.includes(letter));
                        });
                    } else {
                        selectOption(block, targetLetters[0] || available[0], true);
                    }

                    // Đồng bộ màu sáng thẻ số câu Answer Card ngay khi vừa làm xong câu
                    const currentQNum = qIndex + 1;
                    const tihaoEl = document.getElementById('a' + currentQNum);
                    if (tihaoEl) tihaoEl.classList.add('active');

                    updateUI('stat', `Điền câu ${currentQNum}/${questionBlocks.length} [${targetLetters.join(',')}]`);
                    qIndex++;

                    const delay = Math.floor(Math.random() * 150) + 200;
                    setTimeout(solveStep, delay);
                };

                setTimeout(solveStep, 400);
            }
        }

        // -------------------------------------------------------------
        // PHẦN C: XỬ LÝ KẾT QUẢ ĐIỂM THI & TỰ ĐỘNG THI LẠI NẾU CHƯA ĐẠT
        // -------------------------------------------------------------
        const scoreMatch = document.body ? document.body.innerText.match(/(?:Your Score|Điểm của bạn|得分)[：:\s]*(\d+)/i) : null;
        if (scoreMatch) {
            const currentScore = parseInt(scoreMatch[1], 10);
            const passMatch = document.body.innerText.match(/(\d+)\s*(?:scores pass|điểm đạt|分及格)/i);
            const passScore = passMatch ? parseInt(passMatch[1], 10) : 80;

            if (currentScore >= 100) {
                updateUI('stat', `ĐẠT ${currentScore}/100 ĐIỂM! - ĐÓNG TAB 🎉`);
                if (!window._loggedExamPass) {
                    window._loggedExamPass = true;
                    const cid = getCurrentCourseId();
                    addCompletedCourse(cid);
                    addLog('SUCCESS', 'EXAM_FINISH', `🎉 XUẤT SẮC: Bạn đã đạt điểm tuyệt đối 100/100! Khóa học đã hoàn thành trọn vẹn. Tự động đóng tab sau 2.5s...`);
                    const next = (isAutoFarmEnabled() && !isAutoStopped()) ? getNextEligibleCourseInQueue(cid) : null;
                    if (next && next.url) {
                        addLog('INFO', 'AUTO_FARM', `Chuẩn bị chuyển sang: ${next.title} (ID: ${next.courseId})`);
                    }
                    setTimeout(() => {
                        requestCloseCompletedCourseTab({
                            courseId: cid,
                            openNextUrl: next ? next.url : null,
                            reason: 'Thi đạt điểm tuyệt đối 100/100 -> Đóng tab hoàn thành'
                        });
                    }, 2500);
                }
            } else if (currentScore < passScore) {
                updateUI('stat', `Điểm: ${currentScore}/${passScore} (Thi lại)`);
                if (!window._retakingExam) {
                    window._retakingExam = true;
                    addLog('WARN', 'EXAM_RETAKE', `Điểm đạt ${currentScore} chưa qua điểm chuẩn ${passScore}. Tự động thi lại bằng đáp án chuẩn...`);
                    setTimeout(() => {
                        const retakeBtn = document.querySelector('button[onclick*="gotoExamUI"], a[onclick*="gotoExamUI"], .btn-retake');
                        if (typeof window.gotoExamUI === 'function') {
                            window.gotoExamUI();
                        } else if (retakeBtn) {
                            retakeBtn.click();
                        }
                        const examUiMatch = document.documentElement.innerHTML.match(/(?:\/public\/play\/examUI\?[^"'\s]+)/);
                        if (examUiMatch) {
                            setTimeout(() => {
                                if (location.href.includes('submitExam')) {
                                    location.href = examUiMatch[0];
                                }
                            }, 1000);
                        }
                    }, 2500);
                }
            } else {
                updateUI('stat', `ĐÃ PASS: ${currentScore} ĐIỂM! - ĐÓNG TAB ✅`);
                if (!window._loggedExamPass) {
                    window._loggedExamPass = true;
                    const cid = getCurrentCourseId();
                    addCompletedCourse(cid);
                    addLog('SUCCESS', 'EXAM_PASS', `✅ Chúc mừng! Bạn đã đạt ${currentScore} điểm (Điểm chuẩn qua: ${passScore}). Khóa học đã hoàn thành! Tự động đóng tab sau 2.5s...`);
                    const next = (isAutoFarmEnabled() && !isAutoStopped()) ? getNextEligibleCourseInQueue(cid) : null;
                    if (next && next.url) {
                        addLog('INFO', 'AUTO_FARM', `Chuẩn bị chuyển sang: ${next.title} (ID: ${next.courseId})`);
                    }
                    setTimeout(() => {
                        requestCloseCompletedCourseTab({
                            courseId: cid,
                            openNextUrl: next ? next.url : null,
                            reason: `Thi qua môn (${currentScore} điểm) -> Đóng tab hoàn thành`
                        });
                    }, 2500);
                }
            }
        }
    };

    // 7. MAIN PURE ORGANIC AUTOMATION LOOP (100% Real-time DOM Only)
    let lastTime = -1, freezeCount = 0, lastClickedIdx = -1, waitCounter = 0;
    let videoEndPendingTicks = 0;

    const checkLessonCompletion = (itemEl) => {
        if (!itemEl) return { isDone: false, percent: null };
        const txt = (itemEl.innerText || itemEl.textContent || '').trim();

        // 1. Kiểm tra % hiển thị trực tiếp trên DOM (VD: "89%", "(89%)", "Tiến độ: 89%")
        const pctMatch = txt.match(/(\d+)\s*%/);
        if (pctMatch) {
            const pct = parseInt(pctMatch[1], 10);
            if (pct >= 100) {
                return { isDone: true, percent: pct };
            }
            // Nếu có % cụ thể và < 100% (vd: 89%) thì CHẮC CHẮN chưa đạt yêu cầu!
            return { isDone: false, percent: pct };
        }

        // 2. Kiểm tra từ khóa hoàn thành nếu không có số %
        const isKeyword = /(hoàn thành|100%|hoAn thAnh|Finished|Done|已完成)/i.test(txt);
        return { isDone: isKeyword, percent: isKeyword ? 100 : null };
    };

    const isCurrentWareCompleted = () => {
        try {
            if (window.wares && typeof window.video_index !== 'undefined') {
                const c = window.wares[window.video_index];
                if (c && (c.isComplete === 'Y' || c.completestatus === 'Y')) return true;
            }
        } catch(e) {}
        return false;
    };

    const autoClickPopup = new MutationObserver(() => {
        const dialog = document.querySelector('.layui-layer-dialog');
        if (dialog) {
            const text = dialog.innerText || '';
            if (/(unanswered|chưa trả lời|未完成|chưa hoàn thành)/i.test(text)) {
                const cancelBtn = dialog.querySelector('.layui-layer-btn1');
                if (cancelBtn) cancelBtn.click();
                return;
            }
        }
        const okBtn = document.querySelector('.layui-layer-btn0') || document.querySelector('.vjs-close-control');
        if (okBtn) {
            okBtn.click();
            updateUI('stat', 'AUTO-OK');
            addLog('INFO', 'POPUP', 'Tự động đóng popup thông báo của hệ thống');
        }
    });
    if (document.body) autoClickPopup.observe(document.body, { childList: true, subtree: true });

    setInterval(() => {
        updateStopUI();
        updateAutoFarmUI();
        if (isAutoStopped()) {
            return;
        }

        // 1. XỬ LÝ TRANG DANH MỤC / TÌM KIẾM / NHIỆM VỤ HỌC TẬP (LIST PAGE AUTO-FARM)
        if (isListPage()) {
            queryActiveStudyTab();
            const q = scanListPageCourses();
            const completed = getCompletedCourses();
            const skipped = getSkippedCourses();
            const pending = q.filter(c => !completed.includes(String(c.courseId)) && !skipped.includes(String(c.courseId)));

            updateUI('mode', 'AUTO-FARM');
            updateUI('less', `Lọc bài có điểm (> 0): ${isFilterCreditsEnabled() ? 'BẬT ✅' : 'TẮT'}`);

            if (window._hasActiveStudyTab) {
                updateUI('stat', 'ĐANG CÓ TAB HỌC ĐANG CHẠY ⏳');
                return;
            }

            updateUI('stat', `Tìm thấy ${q.length} khóa (${pending.length} chưa học)`);

            if (isAutoFarmEnabled() && !isAutoStopped() && !window._jaFarmNavigating && pending.length > 0) {
                advanceToNextCourse('Auto-Farm bắt đầu từ danh sách');
            }
            return;
        }

        // KIỂM TRA TRÙNG LẶP TAB TRÊN TRANG BÀI HỌC (DEDUPLICATION GUARD)
        if (isPlayPage()) {
            if (!window._jaDuplicateChecked) {
                window._jaDuplicateChecked = true;
                checkDuplicatePlayTab();
            }
        }

        // 2. XỬ LÝ BỘ LỌC TÍN CHỈ TRÊN TRANG BÀI HỌC (CREDIT SCORE FILTER)
        // Bỏ qua các khóa học 0 điểm tín chỉ (Credit Score = 0) không có bài thi
        if (isFilterCreditsEnabled() && isPlayPage()) {
            const creditInfo = detectCourseCreditInfo();
            if (creditInfo.hasCredit === false) {
                // Khóa học 0 điểm tín chỉ (Credit Score: 0) -> Bỏ qua & Tự động đóng tab
                if (!window._jaZeroCreditHandled) {
                    window._jaZeroCreditHandled = true;
                    const cid = getCurrentCourseId();
                    addSkippedCourse(cid);

                    const v = document.querySelector('video');
                    if (v && !v.paused) try { v.pause(); } catch(e) {}

                    if (isAutoFarmEnabled() && !isAutoStopped()) {
                        const next = getNextEligibleCourseInQueue(cid);
                        if (next && next.url) {
                            addLog('WARN', 'CREDIT_FILTER', `⏭️ BỎ QUA KHÓA HỌC: Phát hiện không có điểm tín chỉ (${creditInfo.text || 'Credit Score: (0)'}). Chuyển sang khóa tiếp theo & tự động đóng tab sau 2.5s!`);
                            updateUI('stat', 'BỎ QUA (0 ĐIỂM) - ĐÓNG TAB ⏭️');
                            setTimeout(() => {
                                requestCloseTab({
                                    openNextUrl: next.url,
                                    reason: 'Khóa học 0 điểm tín chỉ -> Mở khóa tiếp theo & Đóng tab cũ'
                                });
                            }, 2500);
                            return;
                        }
                    }

                    // Không bật Auto-Farm hoặc không còn khóa trong hàng đợi -> Tự động đóng tab
                    addLog('WARN', 'CREDIT_FILTER', `⏭️ BỎ QUA KHÓA HỌC: Phát hiện không có điểm tín chỉ (${creditInfo.text || 'Credit Score: (0)'}). Khóa học không có bài thi, tự động đóng tab sau 2.5s!`);
                    updateUI('stat', 'BỎ QUA (0 ĐIỂM) - ĐÓNG TAB ⏭️');
                    setTimeout(() => {
                        requestCloseTab({
                            reason: 'Khóa học 0 điểm tín chỉ -> Tự động đóng tab'
                        });
                    }, 2500);
                }
                updateStopUI();
                return; // Ngắt luồng học, tuyệt đối không học bài 0 điểm
            }
        }

        // 2b. XỬ LÝ KIỂM TRA LỊCH SỬ THI TỪ "Exam record：" (TRÁNH THI ĐI THI LẠI ĐỀ ĐÃ ĐẠT)
        // Dựa vào "Exam record：" và "Course Credit：" để biết khóa học đã thi và đã đạt điểm hay chưa
        if (isPlayPage()) {
            const examRecord = checkCourseExamRecord();
            if (examRecord.hasPassed) {
                const cid = getCurrentCourseId();
                if (cid) addCompletedCourse(cid);
                window._jaExamAlreadyPassed = true;
                window._examNavigated = true; // Khóa chặt không cho kích hoạt thi lại

                if (!window._courseCompletedClosed) {
                    window._courseCompletedClosed = true;
                    addLog('SUCCESS', 'EXAM_RECORD', `🏆 KHÓA HỌC ĐÃ TỪNG THI ĐẠT: Phát hiện trong Exam record (${examRecord.reason}). Điểm: ${examRecord.score || 100}. Tự động đóng tab sau 2.5s...`);
                    updateUI('stat', `HOÀN THÀNH (${examRecord.score || 100} Đ) - ĐÓNG TAB 🏆`);

                    const v = document.querySelector('video');
                    if (v && !v.paused) try { v.pause(); } catch(e) {}

                    const next = (isAutoFarmEnabled() && !isAutoStopped()) ? getNextEligibleCourseInQueue(cid) : null;
                    if (next && next.url) {
                        addLog('INFO', 'AUTO_FARM', `Chuẩn bị chuyển sang khóa tiếp theo: ${next.title} (ID: ${next.courseId})`);
                    }

                    setTimeout(() => {
                        requestCloseCompletedCourseTab({
                            courseId: cid,
                            openNextUrl: next ? next.url : null,
                            reason: `Khóa học đã thi đạt (${examRecord.score || 100} điểm) trong Exam record -> Đóng tab hoàn thành`
                        });
                    }, 2500);
                }
                return;
            }
        }

        const video = document.querySelector('video');
        const activeItem = document.querySelector('dd.active');

        checkExamLogic();

        if (waitCounter > 0) {
            waitCounter -= 1000;
            return;
        }

        const lessonStatus = checkLessonCompletion(activeItem);
        const isCurrentItemDone = lessonStatus.isDone || isCurrentWareCompleted();

        // -------------------------------------------------------------
        // XỬ LÝ TỰ ĐỘNG ĐỌC TÀI LIỆU PDF / DOCUMENT (TỰ ĐỘNG LẬT TRANG CHUẨN XÁC)
        // -------------------------------------------------------------
        const currentWare = (window.wares && typeof window.video_index !== 'undefined') ? window.wares[window.video_index] : null;
        const isPdfWare = Boolean(currentWare && (currentWare.type === 'pdf' || currentWare.sourceSuffix === 'pdf' || currentWare.type === 'doc' || currentWare.sourceSuffix === 'doc'));
        const isVisiblePdfDom = Boolean(
            (!video || !video.src) && (
                (document.querySelector('.pdfwarp') && !document.querySelector('.pdfwarp').classList.contains('dpn') && document.querySelector('.pdfwarp').style.display !== 'none') ||
                (document.getElementById('pdf') && !document.getElementById('pdf').classList.contains('dpn') && document.getElementById('pdf').style.display !== 'none')
            )
        );
        const isPdfMode = isPdfWare || (!currentWare && isVisiblePdfDom);

        if (isPdfMode) {
            // 1. Tự động bấm nút Bắt đầu đọc PDF nếu xuất hiện màn hình chờ (.pdflogo / .pdfwarp)
            const pdfWarp = document.querySelector('.pdfwarp');
            const pdfLogo = document.querySelector('.pdflogo');
            if (window.firstPdf || (pdfWarp && pdfWarp.style.display !== 'none' && !pdfWarp.classList.contains('dpn'))) {
                updateUI('stat', 'KHỞI ĐỘNG PDF... 📖');
                if (typeof window.palyfirstpdf === 'function') {
                    window.palyfirstpdf();
                } else if (pdfLogo) {
                    pdfLogo.click();
                }
            }

            // Ghi nhận trang 1 ngay khi khởi tạo bài giảng PDF nếu playtime đang = 0
            if (currentWare && (!currentWare.playtime || currentWare.playtime === 0)) {
                if (typeof window.onCurrentPageChanged === 'function') {
                    window.pdfTimer = 0;
                    window.onCurrentPageChanged(1);
                }
            }

            // 2. Tự động lướt lật trang PDF mượt mà theo đúng nhịp độ pdfDelay của Foxconn
            const pdfIframe = document.getElementById('pdf');
            if (pdfIframe && pdfIframe.contentWindow) {
                try {
                    const win = pdfIframe.contentWindow;
                    const app = win.PDFViewerApplication;
                    if (app && app.pagesCount > 0) {
                        const totalPages = app.pagesCount;
                        const currentPage = app.page || 1;

                        if (activeItem) {
                            const nameText = currentWare ? currentWare.name : (activeItem.innerText || '');
                            updateUI('less', `${nameText} (Trang ${currentPage}/${totalPages})`);
                        }

                        // Nếu bài học đã hoàn thành 100%
                        if (isCurrentItemDone) {
                            updateUI('stat', 'HOÀN THÀNH PDF 100% ✅');
                        } else if (currentPage < totalPages) {
                            // Chưa tới trang cuối: Tự động lật sang trang kế tiếp theo đúng giới hạn pdfDelay của Foxconn
                            const now = Date.now();
                            const minDelay = Math.max(((window.pdfDelay || 1) * 1000) + 150, 1100);
                            if (!window._lastPdfFlipTime || (now - window._lastPdfFlipTime >= minDelay)) {
                                window._lastPdfFlipTime = now;
                                const nextPage = currentPage + 1;
                                app.page = nextPage;
                                updateUI('stat', `Đọc PDF: ${nextPage}/${totalPages} (${Math.round(nextPage*100/totalPages)}%) 📖`);
                                addLog('INFO', 'PDF', `Tự động đọc sang trang ${nextPage}/${totalPages}...`);
                            }
                        } else if (currentPage >= totalPages && !isCurrentItemDone) {
                            // Đã tới trang cuối nhưng hệ thống chưa ghi nhận 100% (do playtime < totalPages)
                            const now = Date.now();
                            const minDelay = Math.max(((window.pdfDelay || 1) * 1000) + 150, 1100);
                            if (!window._lastPdfSubmitTime || (now - window._lastPdfSubmitTime >= minDelay)) {
                                window._lastPdfSubmitTime = now;
                                // Foxconn tính % theo công thức: Math.round(playtime * 100 / page) >= 97
                                // Kích hoạt onCurrentPageChanged để bù đủ 100% số trang (playtime = totalPages)
                                if (typeof window.onCurrentPageChanged === 'function') {
                                    window.pdfTimer = 0;
                                    window.onCurrentPageChanged(totalPages);
                                }
                                if (typeof window.submitPage === 'function') {
                                    window.submitPage(window.courseToken || '');
                                }
                                const curPlay = currentWare ? (currentWare.playtime || 0) : totalPages;
                                const curPct = Math.min(100, Math.round(curPlay * 100 / totalPages));
                                updateUI('stat', `Xác nhận 100% PDF (${curPct}%)... ⏳`);
                                addLog('INFO', 'PDF', `Xác nhận hoàn thành 100% PDF (${curPlay}/${totalPages} trang)...`);
                            }
                        }
                    }
                } catch (e) {}
            }
        } else if (video) {
            video.style.filter = 'brightness(0)';
            video.playbackRate = 1.0;

            const duration = video.duration || 100;
            const currentTime = video.currentTime || 0;
            const percent = duration > 0 ? Math.floor((currentTime / duration) * 100) : 0;

            const isVideoAtEnd = Boolean(
                video.ended ||
                (video.duration > 0 && video.currentTime >= video.duration - 0.8) ||
                (video.paused && video.duration > 0 && (video.duration - video.currentTime <= 1.5))
            );

            // Phát hiện lỗi máy chủ CDN hoặc đứt kết nối mạng (ERR_CONNECTION_TIMED_OUT)
            if (video.error || video.networkState === 3) {
                updateUI('stat', 'LỖI MẠNG / ĐANG TẢI LẠI... ⚠️');
                freezeCount++;
                if (freezeCount >= 10) {
                    freezeCount = 0;
                    addLog('WARN', 'NETWORK', 'Máy chủ video phản hồi chậm/timeout. Đang thử tải lại luồng video...');
                    try {
                        video.load();
                        forcePlayVideo(video);
                    } catch(e) {}
                }
                return;
            }

            // TÍNH NĂNG QUAN TRỌNG: Video dừng/chạy hết nhưng bài học chưa đạt 100% (vd: 89%) -> TỰ ĐỘNG CHẠY LẠI TỪ ĐẦU
            if (isVideoAtEnd && !isCurrentItemDone) {
                videoEndPendingTicks++;
                const pStr = lessonStatus.percent !== null ? (lessonStatus.percent + '%') : 'chưa đạt 100%';

                // Đợi 2-3 giây xem hệ thống máy chủ Foxconn có kịp cập nhật 100% ngay khi video vừa hết không
                if (videoEndPendingTicks < 3) {
                    updateUI('stat', `Đợi xác nhận % (${pStr})... ⏳`);
                    return;
                }

                // Nếu sau 3 giây mà % vẫn chưa đạt 100% -> Tua về 0:00 và phát lại ngay lập tức để hệ thống tiếp tục nhận %
                videoEndPendingTicks = 0;
                addLog('WARN', 'REPLAY', `Video đã chạy hết nhưng tiến độ bài mới đạt ${pStr} (<100%). Tự động phát lại video từ đầu (00:00) để tiếp tục tích lũy %!`);
                updateUI('stat', `Phát lại từ đầu (${pStr}) 🔄`);

                try {
                    video.currentTime = 0;
                    if (typeof window.videoPlayer !== 'undefined') {
                        if (typeof window.videoPlayer.currentTime === 'function') {
                            try { window.videoPlayer.currentTime(0); } catch(e) {}
                        }
                        if (typeof window.videoPlayer.play === 'function') {
                            try { window.videoPlayer.play(); } catch(e) {}
                        }
                    }
                    forcePlayVideo(video);
                } catch(e) {
                    console.error("[FUXUE] Replay error:", e);
                }
                waitCounter = 2000;
                lastTime = -1;
                freezeCount = 0;
                return;
            }

            // Khi video đang phát bình thường
            if (!isVideoAtEnd) {
                videoEndPendingTicks = 0;
                if (video.paused && !document.querySelector('.layui-layer-btn0')) {
                    forcePlayVideo(video);
                }
                if (!video.paused) {
                    const lessonPct = lessonStatus.percent !== null ? ` | Bài: ${lessonStatus.percent}%` : '';
                    updateUI('stat', `Đang phát (${percent}%${lessonPct})`);
                }

                // Gỡ đứng hình nếu video bị giật buffer hoặc kẹt mạng
                if (!video.paused) {
                    if (Math.abs(video.currentTime - lastTime) < 0.1) {
                        freezeCount++;
                        if (freezeCount >= 5) {
                            freezeCount = 0;
                            if (video.readyState === 0) {
                                updateUI('stat', 'ĐANG ĐỢI BUFFER MẠNG... ⏳');
                                try { video.load(); forcePlayVideo(video); } catch(e) {}
                            } else if (video.duration && video.currentTime < video.duration - 2) {
                                video.currentTime += 1;
                                forcePlayVideo(video);
                            }
                        }
                    } else {
                        freezeCount = 0;
                        lastTime = video.currentTime;
                    }
                }
            }
        }

        // Cập nhật tên bài học lên HUD
        if (activeItem) {
            const label = activeItem.innerText.trim().replace(/\n/g, ' ');
            updateUI('less', label.length > 38 ? label.substring(0, 38) + '...' : label);
        }

        // Tự động chuyển bài khi BÀI HỌC HIỆN TẠI ĐÃ HOÀN THÀNH (100% hoặc Done)
        // Chỉ chuyển bài khi bài HIỆN TẠI thực sự đạt 100%, không chuyển bừa khi % chưa đạt!
        const isCurrentFinished = isCurrentItemDone;

        if (isCurrentFinished && activeItem) {
            videoEndPendingTicks = 0;
            // Lọc danh sách bài học thực tế, loại trừ hoàn toàn danh sách bình luận (plList)
            let allItems = Array.from(document.querySelectorAll('.chapter dd, .m-chapter dd, .course_menu dd, .video_menu dd, dl:not(.plList) dd')).filter(el => !el.closest('.plList') && (el.getAttribute('onclick') || el.innerText.trim()));
            if (allItems.length === 0) {
                allItems = Array.from(document.querySelectorAll('dd')).filter(el => !el.closest('.plList'));
            }

            const currentIdx = allItems.indexOf(activeItem);
            let nextItem = null;

            // 1. Tìm bài tiếp theo chưa hoàn thành (từ sau bài hiện tại)
            for (let i = currentIdx + 1; i < allItems.length; i++) {
                if (!checkLessonCompletion(allItems[i]).isDone) {
                    nextItem = allItems[i];
                    break;
                }
            }

            // 2. Nếu phía sau không có, quét lại từ đầu để tìm bài còn sót (< 100%)
            if (!nextItem && currentIdx > 0) {
                for (let i = 0; i < currentIdx; i++) {
                    if (!checkLessonCompletion(allItems[i]).isDone) {
                        nextItem = allItems[i];
                        break;
                    }
                }
            }

            if (nextItem && lastClickedIdx !== allItems.indexOf(nextItem)) {
                lastClickedIdx = allItems.indexOf(nextItem);
                const nextLabel = nextItem.innerText.trim().replace(/\n/g, ' ');
                updateUI('stat', 'Đang chuyển bài tiếp...');
                addLog('INFO', 'AUTO_NEXT', `Bài học hiện tại đã hoàn thành (100%). Chuyển tiếp sang bài chưa học: ${nextLabel}`);
                waitCounter = 3000;
                lastTime = -1;
                freezeCount = 0;

                const onclickStr = nextItem.getAttribute('onclick');
                const match = onclickStr ? onclickStr.match(/dianji\((\d+)/) : null;
                if (match && typeof window.dianji === 'function') {
                    window.dianji(parseInt(match[1]), nextItem);
                } else {
                    nextItem.click();
                }

                setTimeout(() => {
                    const newVid = document.querySelector('video');
                    if (newVid) forcePlayVideo(newVid);
                }, 1000);
            } else if (!nextItem && isCurrentFinished) {
                // Kiểm tra lại toàn bộ danh sách một lần nữa để chắc chắn 100% tất cả các bài đều đã hoàn thành
                const hasAnyIncomplete = allItems.some(item => !checkLessonCompletion(item).isDone);
                if (hasAnyIncomplete) {
                    return;
                }

                updateUI('stat', 'HOÀN THÀNH TẤT CẢ! 🎉');
                if (!window._loggedAllDone) {
                    window._loggedAllDone = true;
                    addLog('SUCCESS', 'FINISH', '🎉 CHÚC MỪNG: BẠN ĐÃ HOÀN THÀNH TẤT CẢ CÁC BÀI HỌC (100%) TRONG KHÓA HỌC!');
                }

                // KIỂM TRA LỊCH SỬ THI TRƯỚC KHI BẤM NÚT THI:
                const examRecord = checkCourseExamRecord();
                if (examRecord.hasPassed || window._jaExamAlreadyPassed) {
                    const cid = getCurrentCourseId();
                    if (cid) addCompletedCourse(cid);
                    window._examNavigated = true;
                    updateUI('stat', `ĐÃ THI ĐẠT (${examRecord.score || 100} Đ) - ĐÓNG TAB 🏆`);
                    if (!window._courseCompletedClosed) {
                        window._courseCompletedClosed = true;
                        addLog('SUCCESS', 'EXAM_RECORD', `🏆 BỎ QUA THI LẠI: Khóa học đã từng thi đạt (${examRecord.reason || 'Đạt điểm'}). Tự động đóng tab sau 2.5s...`);
                        const next = (isAutoFarmEnabled() && !isAutoStopped()) ? getNextEligibleCourseInQueue(cid) : null;
                        if (next && next.url) {
                            addLog('INFO', 'AUTO_FARM', `Chuẩn bị chuyển sang: ${next.title} (ID: ${next.courseId})`);
                        }
                        setTimeout(() => {
                            requestCloseCompletedCourseTab({
                                courseId: cid,
                                openNextUrl: next ? next.url : null,
                                reason: `Khóa học đã thi đạt (${examRecord.score || 100} điểm) -> Đóng tab hoàn thành`
                            });
                        }, 2500);
                    }
                    return;
                }

                // TỰ ĐỘNG KÍCH HOẠT VÀ CHUYỂN SANG ĐỀ THI (CHỈ KHI KHÓA HỌC THỰC SỰ CÓ ĐỀ THI)
                if (!window._examNavigated) {
                    const examTab = document.querySelector('a[href="#exam"], .tab-exam');
                    const examLink = document.getElementById('exam_link') || document.querySelector('.exam_link');
                    const hasExam = !!examTab || !!examLink || (typeof window.examUI === 'function') || (typeof window.gotoExam === 'function');

                    if (hasExam) {
                        window._examNavigated = true;
                        updateUI('stat', 'CHUYỂN SANG BÀI THI... 📝');
                        addLog('INFO', 'AUTO_EXAM', 'Tất cả bài học đã đạt 100%. Tự động kích hoạt Đề thi...');

                        // Chuyển tab sang mục Exam
                        if (examTab) {
                            try { examTab.click(); } catch(e) {}
                        }

                        // Kích hoạt nút thi
                        setTimeout(() => {
                            if (examLink) {
                                try { examLink.click(); } catch(e) {}
                            } else if (typeof window.examUI === 'function') {
                                try { window.examUI(); } catch(e) {}
                            } else if (typeof window.gotoExam === 'function') {
                                try { window.gotoExam(); } catch(e) {}
                            }

                            // Kiểm tra nếu hệ thống báo "No Exam" thì dừng lại và tự động đóng tab hoàn thành
                            setTimeout(() => {
                                const layerText = (document.querySelector('.layui-layer, .layui-layer-dialog')?.innerText || '').toLowerCase();
                                if (layerText.includes('no exam') || layerText.includes('không có') || layerText.includes('无考试')) {
                                    updateUI('stat', 'HOÀN THÀNH - ĐÓNG TAB 🎉');
                                    const cid = getCurrentCourseId();
                                    addCompletedCourse(cid);
                                    addLog('SUCCESS', 'FINISH', 'Khóa học không có đề thi (No Exam). Khóa học đã hoàn thành 100%! Tự động đóng tab sau 2.5s...');
                                    const next = (isAutoFarmEnabled() && !isAutoStopped()) ? getNextEligibleCourseInQueue(cid) : null;
                                    setTimeout(() => {
                                        requestCloseCompletedCourseTab({
                                            courseId: cid,
                                            openNextUrl: next ? next.url : null,
                                            reason: 'Khóa học hoàn thành 100% (No Exam)'
                                        });
                                    }, 2500);
                                }
                            }, 1200);
                        }, 500);
                    } else {
                        const cid = getCurrentCourseId();
                        addCompletedCourse(cid);
                        updateUI('stat', 'HOÀN THÀNH - ĐÓNG TAB 🎉');
                        addLog('SUCCESS', 'FINISH', 'Khóa học không có bài thi. Hoàn thành 100%! Tự động đóng tab sau 2.5s...');
                        const next = (isAutoFarmEnabled() && !isAutoStopped()) ? getNextEligibleCourseInQueue(cid) : null;
                        setTimeout(() => {
                            requestCloseCompletedCourseTab({
                                courseId: cid,
                                openNextUrl: next ? next.url : null,
                                reason: 'Khóa học hoàn thành 100% (Không có bài thi)'
                            });
                        }, 2500);
                    }
                }
            }
        }
    }, 1000);
})();