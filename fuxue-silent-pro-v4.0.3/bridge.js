/**
 * FUXUE SILENT PRO v4.1.5 - Isolated Content Bridge
 * Bridges MAIN world events to chrome.runtime background service worker.
 */
(function() {
    window.addEventListener('message', (event) => {
        if (event.source !== window || !event.data || !event.data.type) return;

        const data = event.data;

        // 1. Kiểm tra tab trùng lặp
        if (data.type === 'FUXUE_CHECK_DUPLICATE') {
            try {
                chrome.runtime.sendMessage({
                    action: 'CHECK_DUPLICATE_PLAY_TAB',
                    courseId: data.courseId
                }, (resp) => {
                    window.postMessage({
                        type: 'FUXUE_CHECK_DUPLICATE_RESP',
                        isDuplicate: resp?.isDuplicate
                    }, '*');
                });
            } catch(e) {}
        }
        // 2. Tự động đóng tab khóa học đã hoàn tất (Exam record đạt 100 điểm)
        else if (data.type === 'FUXUE_COURSE_COMPLETED') {
            try {
                chrome.runtime.sendMessage({
                    action: 'COURSE_COMPLETED_CLOSE_TAB',
                    courseId: data.courseId,
                    openNextUrl: data.openNextUrl,
                    reason: data.reason || 'Course finished (Exam record 100)'
                });
            } catch(e) {}
        }
        // 3. Đóng tab (khóa 0 điểm hoặc đóng tab thông thường)
        else if (data.type === 'FUXUE_CLOSE_TAB') {
            try {
                chrome.runtime.sendMessage({
                    action: 'CLOSE_CURRENT_TAB',
                    openNextUrl: data.openNextUrl,
                    reason: data.reason
                });
            } catch(e) {}
        }
        // 4. Kiểm tra xem có tab học nào đang chạy không
        else if (data.type === 'FUXUE_QUERY_ACTIVE_STUDY') {
            try {
                chrome.runtime.sendMessage({
                    action: 'HAS_ACTIVE_STUDY_TAB'
                }, (resp) => {
                    window.postMessage({
                        type: 'FUXUE_QUERY_ACTIVE_STUDY_RESP',
                        hasActiveStudyTab: resp?.hasActiveStudyTab
                    }, '*');
                });
            } catch(e) {}
        }
    });
})();
