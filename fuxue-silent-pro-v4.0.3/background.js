/**
 * FUXUE SILENT PRO v4.1.4 - Background Service Worker
 * Handles tab management, automated closing of 0-credit course tabs, and cross-tab orchestration.
 */

chrome.runtime.onInstalled.addListener(() => {
    console.log('[FUXUE BG] Service worker installed.');
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (!msg || !msg.action) return;

    if (msg.action === 'CLOSE_CURRENT_TAB') {
        const tabId = sender.tab ? sender.tab.id : null;
        const reason = msg.reason || 'Auto-close requested';
        console.log(`[FUXUE BG] Closing tab ${tabId}. Reason: ${reason}`);

        if (msg.openNextUrl) {
            chrome.tabs.create({ url: msg.openNextUrl, active: true }, (newTab) => {
                if (tabId) {
                    chrome.tabs.remove(tabId, () => {
                        if (chrome.runtime.lastError) {
                            console.warn('[FUXUE BG] Error removing tab:', chrome.runtime.lastError.message);
                        }
                    });
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
