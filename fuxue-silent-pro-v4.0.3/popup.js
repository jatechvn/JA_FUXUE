document.addEventListener('DOMContentLoaded', () => {
    const mainView = document.getElementById('main-view');
    const logView = document.getElementById('log-view');
    const logContainer = document.getElementById('log-container');
    const btnViewLogs = document.getElementById('btn-view-logs');
    const btnCloseLogs = document.getElementById('btn-close-logs');
    const btnDownloadLogs = document.getElementById('btn-download-logs');
    const btnClearLogs = document.getElementById('btn-clear-logs');

    let currentLogs = [];

    // 0. Master Stop / Resume Controller
    const btnMaster = document.getElementById('btn-master-toggle');
    const masterIcon = document.getElementById('btn-master-icon');
    const masterText = document.getElementById('btn-master-text');
    const globalStatus = document.getElementById('global-status');

    const updateMasterUI = (isStopped) => {
        if (!btnMaster) return;
        if (isStopped) {
            btnMaster.className = 'btn-master btn-master-stopped';
            if (masterIcon) masterIcon.innerText = '▶️';
            if (masterText) masterText.innerText = 'TIẾP TỤC TỰ ĐỘNG';
            if (globalStatus) {
                globalStatus.innerText = 'STOPPED';
                globalStatus.className = 'status-indicator offline';
            }
        } else {
            btnMaster.className = 'btn-master btn-master-running';
            if (masterIcon) masterIcon.innerText = '⏹️';
            if (masterText) masterText.innerText = 'DỪNG TỰ ĐỘNG';
            if (globalStatus) {
                globalStatus.innerText = 'ACTIVE';
                globalStatus.className = 'status-indicator online';
            }
        }
    };

    const checkTabStopState = () => {
        if (chrome && chrome.tabs) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0] && tabs[0].id) {
                    chrome.scripting ? chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        func: () => {
                            return localStorage.getItem('ja_fuxue_stopped') === 'true';
                        }
                    }, (res) => {
                        if (res && res[0] && typeof res[0].result === 'boolean') {
                            updateMasterUI(res[0].result);
                        }
                    }) : null;
                }
            });
        }
    };
    checkTabStopState();

    if (btnMaster) {
        btnMaster.addEventListener('click', () => {
            if (chrome && chrome.tabs) {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs[0] && tabs[0].id) {
                        chrome.scripting ? chrome.scripting.executeScript({
                            target: { tabId: tabs[0].id },
                            func: () => {
                                const current = localStorage.getItem('ja_fuxue_stopped') === 'true';
                                const next = !current;
                                if (typeof window._fxSetAutoStopped === 'function') {
                                    window._fxSetAutoStopped(next);
                                } else {
                                    localStorage.setItem('ja_fuxue_stopped', String(next));
                                    const v = document.querySelector('video');
                                    if (next && v && !v.paused) try { v.pause(); } catch(e) {}
                                    else if (!next && v && v.paused && !v.ended) try { v.play(); } catch(e) {}
                                    if (typeof window._fxUpdateStopUI === 'function') {
                                        window._fxUpdateStopUI();
                                    }
                                }
                                return next;
                            }
                        }, (res) => {
                            if (res && res[0] && typeof res[0].result === 'boolean') {
                                updateMasterUI(res[0].result);
                            }
                        }) : null;
                    }
                });
            }
        });
    }

    // 1. Query exam knowledge base status from active tab
    const updateExamStatusFromTab = () => {
        if (chrome && chrome.tabs) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0] && tabs[0].id) {
                    chrome.scripting ? chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        func: () => {
                            try {
                                const kbRaw = localStorage.getItem('ja_fuxue_exam_kb');
                                const kb = kbRaw ? JSON.parse(kbRaw) : {};
                                const keys = Object.keys(kb);
                                const correctCount = keys.filter(k => kb[k].correct).length;
                                const wrongCount = keys.reduce((acc, k) => acc + (kb[k].wrongChoices ? kb[k].wrongChoices.length : 0), 0);
                                return { total: keys.length, correct: correctCount, wrong: wrongCount };
                            } catch(e) {
                                return { total: 0, correct: 0, wrong: 0 };
                            }
                        }
                    }, (results) => {
                        if (results && results[0] && results[0].result) {
                            const { total, correct, wrong } = results[0].result;
                            const el = document.getElementById('popup-exam-count');
                            if (el) {
                                if (total > 0) {
                                    el.innerText = `Đã nhớ ${correct} đúng, ${wrong} loại trừ`;
                                } else {
                                    el.innerText = 'Sẵn sàng tự học khi thi';
                                }
                            }
                        }
                    }) : null;
                }
            });
        }
    };
    updateExamStatusFromTab();

    // 2. Auto-Farm & Credit Filter Controllers
    const chkAutoFarm = document.getElementById('chk-autofarm');
    const chkFilterCredits = document.getElementById('chk-filter-credits');
    const badgeCreditFilter = document.getElementById('popup-credit-filter');

    const updateFarmTogglesFromTab = () => {
        if (chrome && chrome.tabs) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0] && tabs[0].id) {
                    chrome.scripting ? chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        func: () => {
                            return {
                                autoFarm: localStorage.getItem('ja_fuxue_autofarm') === 'true',
                                filterCredits: localStorage.getItem('ja_fuxue_filter_credits') !== 'false'
                            };
                        }
                    }, (res) => {
                        if (res && res[0] && res[0].result) {
                            const { autoFarm, filterCredits } = res[0].result;
                            if (chkAutoFarm) chkAutoFarm.checked = autoFarm;
                            if (chkFilterCredits) chkFilterCredits.checked = filterCredits;
                            if (badgeCreditFilter) {
                                badgeCreditFilter.innerText = filterCredits ? 'Chỉ học bài có điểm (> 0)' : 'Học tất cả (kể cả 0đ)';
                            }
                        }
                    }) : null;
                }
            });
        }
    };
    updateFarmTogglesFromTab();

    if (chkAutoFarm) {
        chkAutoFarm.addEventListener('change', () => {
            const isChecked = chkAutoFarm.checked;
            if (chrome && chrome.tabs) {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs[0] && tabs[0].id) {
                        chrome.scripting ? chrome.scripting.executeScript({
                            target: { tabId: tabs[0].id },
                            args: [isChecked],
                            func: (checked) => {
                                if (typeof window._fxSetAutoFarm === 'function') {
                                    window._fxSetAutoFarm(checked);
                                } else {
                                    localStorage.setItem('ja_fuxue_autofarm', String(checked));
                                    if (typeof window._fxUpdateAutoFarmUI === 'function') {
                                        window._fxUpdateAutoFarmUI();
                                    }
                                }
                            }
                        }) : null;
                    }
                });
            }
        });
    }

    if (chkFilterCredits) {
        chkFilterCredits.addEventListener('change', () => {
            const isChecked = chkFilterCredits.checked;
            if (badgeCreditFilter) {
                badgeCreditFilter.innerText = isChecked ? 'Chỉ học bài có điểm (> 0)' : 'Học tất cả (kể cả 0đ)';
            }
            if (chrome && chrome.tabs) {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs[0] && tabs[0].id) {
                        chrome.scripting ? chrome.scripting.executeScript({
                            target: { tabId: tabs[0].id },
                            args: [isChecked],
                            func: (checked) => {
                                if (typeof window._fxSetFilterCredits === 'function') {
                                    window._fxSetFilterCredits(checked);
                                } else {
                                    localStorage.setItem('ja_fuxue_filter_credits', String(checked));
                                }
                            }
                        }) : null;
                    }
                });
            }
        });
    }

    // 3. Log Viewer Drawer
    const renderLogs = (logs) => {
        currentLogs = logs || [];
        if (!currentLogs || currentLogs.length === 0) {
            logContainer.innerHTML = '<div class="log-empty">Chưa có nhật ký hoạt động nào được ghi nhận.</div>';
            return;
        }

        const fragment = document.createDocumentFragment();
        currentLogs.forEach(item => {
            const entry = document.createElement('div');
            entry.className = 'log-entry';

            const meta = document.createElement('div');
            meta.className = 'log-meta';

            const time = document.createElement('span');
            time.textContent = String(item.time || '');
            meta.appendChild(time);

            const badge = document.createElement('span');
            const type = String(item.type || 'INFO');
            badge.className = `log-badge ${['SUCCESS', 'INFO', 'WARN', 'ERROR'].includes(type) ? type : 'INFO'}`;
            badge.textContent = `${type} • ${String(item.tag || 'SYSTEM')}`;
            meta.appendChild(badge);

            const message = document.createElement('div');
            message.className = 'log-msg';
            message.textContent = String(item.msg || '');

            entry.append(meta, message);
            fragment.appendChild(entry);
        });
        logContainer.replaceChildren(fragment);
    };

    const loadLogsFromTab = () => {
        if (chrome && chrome.tabs) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0] && tabs[0].id) {
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        func: () => {
                            try {
                                const raw = localStorage.getItem('ja_fuxue_activity_logs');
                                const list = raw ? JSON.parse(raw) : [];
                                const now = Date.now();
                                return list.filter(item => (now - (item.ts || 0)) <= 3 * 24 * 60 * 60 * 1000);
                            } catch(e) { return []; }
                        }
                    }, (res) => {
                        if (res && res[0] && res[0].result) {
                            renderLogs(res[0].result);
                        } else {
                            renderLogs([]);
                        }
                    });
                }
            });
        }
    };

    btnViewLogs.addEventListener('click', () => {
        mainView.style.display = 'none';
        logView.style.display = 'flex';
        loadLogsFromTab();
    });

    btnCloseLogs.addEventListener('click', () => {
        logView.style.display = 'none';
        mainView.style.display = 'block';
    });

    // 4. Download Log file
    btnDownloadLogs.addEventListener('click', () => {
        if (!currentLogs || currentLogs.length === 0) {
            alert("Không có dữ liệu nhật ký để tải về!");
            return;
        }

        const lines = [
            "===========================================================",
            " FUXUE SILENT PRO - ACTIVITY LOG EXPORT",
            " Created: " + new Date().toLocaleString(),
            " Retention: Auto-expires after 3 days",
            "===========================================================\n"
        ];

        currentLogs.forEach(entry => {
            lines.push(`[${entry.time}] [${entry.type.padEnd(7)}] [${entry.tag.padEnd(9)}] ${entry.msg}`);
        });

        const blob = new Blob([lines.join("\n")], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fuxue_activity_log_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // 5. Clear logs
    btnClearLogs.addEventListener('click', () => {
        if (confirm("Bạn có chắc muốn xóa toàn bộ nhật ký hoạt động?")) {
            if (chrome && chrome.tabs) {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs[0] && tabs[0].id) {
                        chrome.scripting.executeScript({
                            target: { tabId: tabs[0].id },
                            func: () => {
                                localStorage.removeItem('ja_fuxue_activity_logs');
                            }
                        }, () => {
                            renderLogs([]);
                        });
                    }
                });
            }
        }
    });

    // 6. Copy keys
    document.getElementById('btn-copy-keys').addEventListener('click', () => {
        if (chrome && chrome.tabs) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0] && tabs[0].id) {
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        func: () => {
                            const kbRaw = localStorage.getItem('ja_fuxue_exam_kb');
                            const legacyRaw = localStorage.getItem('ja_captured_answers');
                            if (kbRaw) {
                                navigator.clipboard.writeText(kbRaw);
                                const count = Object.keys(JSON.parse(kbRaw)).length;
                                alert("Đã sao chép bộ nhớ đáp án thông minh (" + count + " câu hỏi) vào clipboard!");
                            } else if (legacyRaw) {
                                navigator.clipboard.writeText(legacyRaw);
                                alert("Đã sao chép " + JSON.parse(legacyRaw).length + " đáp án vào clipboard!");
                            } else {
                                alert("Chưa có đáp án nào được ghi nhận trong bộ nhớ!");
                            }
                        }
                    });
                }
            });
        }
    });

    // 7. Reset Cache
    document.getElementById('btn-reset-cache').addEventListener('click', () => {
        if (confirm("Bạn có chắc chắn muốn đặt lại toàn bộ trạng thái và bộ nhớ thi (đáp án đúng & sai)?")) {
            if (chrome && chrome.tabs) {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs[0] && tabs[0].id) {
                        chrome.scripting.executeScript({
                            target: { tabId: tabs[0].id },
                            func: () => {
                                localStorage.removeItem('ja_fuxue_exam_kb');
                                localStorage.removeItem('ja_captured_answers');
                                localStorage.removeItem('ja_exam_stage');
                                localStorage.removeItem('ja_last_open_click');
                                location.reload();
                            }
                        });
                    }
                });
            }
        }
    });
});
