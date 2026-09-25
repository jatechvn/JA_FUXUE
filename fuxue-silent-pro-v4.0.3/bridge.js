/**
 * FUXUE SILENT PRO v4.1.4 - Isolated Content Bridge
 * Bridges MAIN world events to chrome.runtime background service worker.
 */
(function() {
    window.addEventListener('message', (event) => {
        if (event.source !== window) return;
        if (event.data && event.data.type === 'FUXUE_CLOSE_TAB') {
            try {
                chrome.runtime.sendMessage({
                    action: 'CLOSE_CURRENT_TAB',
                    openNextUrl: event.data.openNextUrl,
                    reason: event.data.reason
                });
            } catch(e) {
                console.warn('[FUXUE BRIDGE] Failed to forward close message:', e);
            }
        }
    });
})();
