/**
 * FUXUE SILENT PRO v4.1.5 - Background Service Worker
 * Handles tab management, deduplication guard, automated closing of 0-credit course tabs,
 * and automated closing of completed course tabs (with Exam record >= 100).
 */

chrome.runtime.onInstalled.addListener(() => {
    console.log('[FUXUE BG] Service worker installed.');
});

const isStudyPlayUrl = (u) => {
    if (!u) return false;
    const lower = u.toLowerCase();
    return (lower.includes('/play/playcourse') || lower.includes('/play/play?')) && !lower.includes('examui') && !lower.includes('submitexam');
};

// Chống mở tab trùng lặp tự động khi tab đổi URL (chỉ áp dụng cho tab học video/play, tuyệt đối không đóng tab thi examUI)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url && isStudyPlayUrl(changeInfo.url) && changeInfo.url.includes('courseId=')) {
        try {
            const urlObj = new URL(changeInfo.url);
            const cid = urlObj.searchParams.get('courseId');
            if (cid) {
                chrome.tabs.query({ url: "*://iedu.foxconn.com/*" }, (tabs) => {
                    const matchingTabs = tabs.filter(t => isStudyPlayUrl(t.url) && t.url.includes('courseId=' + cid));
                    if (matchingTabs.length > 1) {
                        matchingTabs.sort((a, b) => a.id - b.id);
                        const primaryTab = matchingTabs[0];
                        if (primaryTab.id !== tabId) {
                            console.log(`[FUXUE BG] ⚠️ Phát hiện tab trùng lặp ${tabId} cho khóa ${cid}. Đóng tab trùng, giữ tab gốc ${primaryTab.id}`);
                            chrome.tabs.update(primaryTab.id, { active: true });
                            chrome.tabs.remove(tabId);
                        }
                    }
                });
            }
        } catch(e) {}
    }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (!msg || !msg.action) return;

    const tabId = sender.tab ? sender.tab.id : null;

    // 1. DEDUPLICATION GUARD: Kiểm tra xem đã có tab nào đang mở khóa học này chưa (chỉ tính tab học play, không tính tab thi)
    if (msg.action === 'CHECK_DUPLICATE_PLAY_TAB') {
        const cid = String(msg.courseId || '');
        if (!cid || !tabId) {
            sendResponse({ isDuplicate: false });
            return;
        }

        chrome.tabs.query({ url: "*://iedu.foxconn.com/*" }, (tabs) => {
            const matchingTabs = tabs.filter(t => isStudyPlayUrl(t.url) && t.url.includes('courseId=' + cid));
            if (matchingTabs.length > 1) {
                matchingTabs.sort((a, b) => a.id - b.id);
                const primaryTab = matchingTabs[0];

                if (primaryTab.id !== tabId) {
                    console.log(`[FUXUE BG] ⚠️ Tab ${tabId} là bản trùng lặp của ${primaryTab.id} cho khóa ${cid}. Đang đóng tab trùng...`);
                    chrome.tabs.update(primaryTab.id, { active: true });
                    chrome.tabs.remove(tabId, () => {
                        if (chrome.runtime.lastError) {
                            console.warn('[FUXUE BG] Error removing duplicate tab:', chrome.runtime.lastError.message);
                        }
                    });
                    sendResponse({ isDuplicate: true, keepTabId: primaryTab.id });
                    return;
                } else {
                    // Tab này là tab gốc -> dọn dẹp các tab trùng lặp thừa phía sau
                    const duplicateTabs = matchingTabs.slice(1);
                    for (const dup of duplicateTabs) {
                        console.log(`[FUXUE BG] 🧹 Dọn dẹp tab trùng lặp thừa ${dup.id} cho khóa ${cid}`);
                        chrome.tabs.remove(dup.id);
                    }
                }
            }
            sendResponse({ isDuplicate: false });
        });
        return true; // async
    }

    // 2. QUERY ACTIVE STUDY TABS: Trang danh sách kiểm tra xem có tab nào đang học không
    if (msg.action === 'HAS_ACTIVE_STUDY_TAB') {
        chrome.tabs.query({ url: "*://iedu.foxconn.com/*" }, (tabs) => {
            const hasPlayTab = tabs.some(t => t.id !== tabId && t.url && (t.url.includes('/play/play') || t.url.includes('/play/playCourse')));
            sendResponse({ hasActiveStudyTab: hasPlayTab });
        });
        return true; // async
    }

    // 3. TỰ ĐỘNG ĐÓNG TAB KHÓA HỌC ĐÃ HOÀN TẤT (Exam record đạt 100 điểm)
    if (msg.action === 'COURSE_COMPLETED_CLOSE_TAB') {
        const nextUrl = msg.openNextUrl;
        console.log(`[FUXUE BG] 🏆 Khóa học ${msg.courseId || ''} hoàn tất (Exam record 100 điểm). Đang đóng tab ${tabId}...`);

        if (nextUrl) {
            chrome.tabs.query({ url: "*://iedu.foxconn.com/*" }, (tabs) => {
                const alreadyOpen = tabs.find(t => t.id !== tabId && t.url && t.url === nextUrl);
                if (alreadyOpen) {
                    chrome.tabs.update(alreadyOpen.id, { active: true });
                } else {
                    chrome.tabs.create({ url: nextUrl, active: true });
                }
                if (tabId) {
                    chrome.tabs.remove(tabId, () => {
                        if (chrome.runtime.lastError) {
                            console.warn('[FUXUE BG] Error removing completed tab:', chrome.runtime.lastError.message);
                        }
                    });
                }
            });
        } else if (tabId) {
            chrome.tabs.remove(tabId, () => {
                if (chrome.runtime.lastError) {
                    console.warn('[FUXUE BG] Error removing completed tab:', chrome.runtime.lastError.message);
                }
            });
        }
        sendResponse({ success: true });
        return true;
    }

    // 4. ĐÓNG TAB BÌNH THƯỜNG / KHÓA 0 ĐIỂM
    if (msg.action === 'CLOSE_CURRENT_TAB') {
        const reason = msg.reason || 'Auto-close requested';
        console.log(`[FUXUE BG] Closing tab ${tabId}. Reason: ${reason}`);

        if (msg.openNextUrl) {
            chrome.tabs.query({ url: "*://iedu.foxconn.com/*" }, (tabs) => {
                const alreadyOpen = tabs.find(t => t.id !== tabId && t.url && t.url === msg.openNextUrl);
                if (alreadyOpen) {
                    chrome.tabs.update(alreadyOpen.id, { active: true });
                } else {
                    chrome.tabs.create({ url: msg.openNextUrl, active: true });
                }
                if (tabId) {
                    chrome.tabs.remove(tabId);
                }
            });
        } else if (tabId) {
            chrome.tabs.remove(tabId, () => {
                if (chrome.runtime.lastError) {
                    console.warn('[FUXUE BG] Error removing tab:', chrome.runtime.lastError.message);
                }
            });
        }
        sendResponse({ success: true });
        return true;
    }
});
