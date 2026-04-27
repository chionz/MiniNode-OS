/* ---------- Desktop shell ---------- */
let zIndexCounter = 1200;
let editorInstance;
let currentLanguage = 'python';
let editorTheme = 'vs-dark';

const taskbarHeight = () => parseInt(getComputedStyle(document.documentElement).getPropertyValue('--taskbar-height'), 10) || 50;
const desktopTopbarHeight = () => parseInt(getComputedStyle(document.documentElement).getPropertyValue('--desktop-topbar-height'), 10) || 72;

const appLauncher = document.getElementById('appLauncher');
const appMenuBtn = document.getElementById('appMenuBtn');
const appSearchInput = document.getElementById('appSearchInput');
const allAppsTab = document.getElementById('allAppsTab');
const storeTab = document.getElementById('storeTab');
const launcherGrid = document.getElementById('launcherGrid');
const storePanel = document.getElementById('storePanel');
const settingsPanel = document.getElementById('settingsWindow');
const closeSettings = document.querySelector('.close-settings');
const desktopClock = document.getElementById('desktopClock');
const desktopChrome = document.querySelector('.desktop-chrome');

require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.48.0/min/vs' } });

function isCompactViewport() {
    return window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;
}

function syncDesktopChromeHeight() {
    const fallbackHeight = isCompactViewport() ? 116 : 72;
    const measuredHeight = desktopChrome ? Math.ceil(desktopChrome.getBoundingClientRect().height + 24) : fallbackHeight;
    document.documentElement.style.setProperty('--desktop-topbar-height', `${Math.max(fallbackHeight, measuredHeight)}px`);
}

function bringToFront(el) {
    if (!el) return;
    zIndexCounter += 1;
    el.style.zIndex = zIndexCounter;
}

function clampToViewport(el, nextLeft, nextTop) {
    const rect = el.getBoundingClientRect();
    const maxLeft = Math.max(8, window.innerWidth - rect.width - 8);
    const maxTop = Math.max(desktopTopbarHeight() + 12, window.innerHeight - rect.height - taskbarHeight() - 12);

    return {
        left: Math.min(Math.max(8, nextLeft), maxLeft),
        top: Math.min(Math.max(desktopTopbarHeight() + 12, nextTop), maxTop)
    };
}

function clampIconToViewport(el, nextLeft, nextTop) {
    const rect = el.getBoundingClientRect();
    const maxLeft = Math.max(8, window.innerWidth - rect.width - 8);
    const maxTop = Math.max(desktopTopbarHeight() + 6, window.innerHeight - rect.height - taskbarHeight() - 8);

    return {
        left: Math.min(Math.max(8, nextLeft), maxLeft),
        top: Math.min(Math.max(desktopTopbarHeight() + 6, nextTop), maxTop)
    };
}

function iconsOverlap(first, second) {
    const a = first.getBoundingClientRect();
    const b = second.getBoundingClientRect();

    return !(
        a.right <= b.left ||
        a.left >= b.right ||
        a.bottom <= b.top ||
        a.top >= b.bottom
    );
}

function resolveDesktopIconOverlap() {
    const icons = Array.from(document.querySelectorAll('.icon'));
    if (!icons.length) return;

    if (isCompactViewport()) {
        const gutter = 12;
        const startTop = desktopTopbarHeight() + 8;
        const columns = Math.max(2, Math.min(3, Math.floor((window.innerWidth - (gutter * 2)) / 86)));
        const cellWidth = (window.innerWidth - (gutter * 2)) / columns;
        const rowHeight = 102;

        icons.forEach((icon, index) => {
            const column = index % columns;
            const row = Math.floor(index / columns);
            const centeredLeft = gutter + (column * cellWidth) + Math.max(0, (cellWidth - icon.offsetWidth) / 2);
            const nextTop = startTop + (row * rowHeight);
            const position = clampIconToViewport(icon, centeredLeft, nextTop);
            icon.style.left = `${position.left}px`;
            icon.style.top = `${position.top}px`;
        });
        return;
    }

    const startLeft = 36;
    const startTop = desktopTopbarHeight() + 18;
    const columnWidth = 110;
    const rowHeight = 118;
    const availableHeight = Math.max(1, window.innerHeight - taskbarHeight() - startTop - 24);
    const rowsPerColumn = Math.max(1, Math.floor(availableHeight / rowHeight));

    icons.forEach((icon, index) => {
        const hasOverlap = icons.some((otherIcon, otherIndex) => {
            return index !== otherIndex && iconsOverlap(icon, otherIcon);
        });

        if (!hasOverlap) return;

        const column = Math.floor(index / rowsPerColumn);
        const row = index % rowsPerColumn;
        const nextLeft = startLeft + (column * columnWidth);
        const nextTop = startTop + (row * rowHeight);
        const position = clampIconToViewport(icon, nextLeft, nextTop);

        icon.style.left = `${position.left}px`;
        icon.style.top = `${position.top}px`;
    });
}

function setDockState(windowId, isActive) {
    document.querySelectorAll(`.dock-button[data-window-target="${windowId}"]`).forEach((button) => {
        button.classList.toggle('active', isActive);
    });
}

function closeLauncher() {
    if (!appLauncher) return;
    appLauncher.style.display = 'none';
    appLauncher.setAttribute('aria-hidden', 'true');
}

function openLauncher() {
    if (!appLauncher) return;
    appLauncher.style.display = 'flex';
    appLauncher.setAttribute('aria-hidden', 'false');
    showApps();
    if (appSearchInput) {
        appSearchInput.value = '';
        filterLauncherItems('');
        window.setTimeout(() => appSearchInput.focus(), 40);
    }
}

function toggleLauncher() {
    if (!appLauncher) return;
    if (appLauncher.style.display === 'flex') {
        closeLauncher();
        return;
    }
    openLauncher();
}

function closeWindow(windowOrId) {
    const win = typeof windowOrId === 'string' ? document.getElementById(windowOrId) : windowOrId;
    if (!win) return;

    if (win.id === 'settingsWindow') {
        win.classList.remove('active');
    } else {
        win.classList.remove('minimized');
        win.style.display = 'none';
    }

    setDockState(win.id, false);
}

function minimizeWindow(win) {
    if (!win || win.id === 'settingsWindow') return;
    win.classList.add('minimized');
    win.style.display = 'none';
    setDockState(win.id, false);
}

function toggleMaximize(win) {
    if (!win || win.id === 'settingsWindow') return;

    if (win.classList.contains('maximized')) {
        const previous = win.dataset.previousRect ? JSON.parse(win.dataset.previousRect) : null;
        win.classList.remove('maximized');
        if (previous) {
            win.style.left = previous.left;
            win.style.top = previous.top;
            win.style.width = previous.width;
            win.style.height = previous.height;
        }
        return;
    }

    win.dataset.previousRect = JSON.stringify({
        left: win.style.left || `${win.offsetLeft}px`,
        top: win.style.top || `${win.offsetTop}px`,
        width: win.style.width || `${win.offsetWidth}px`,
        height: win.style.height || `${win.offsetHeight}px`
    });

    win.classList.add('maximized');
    win.style.left = '0px';
    win.style.top = `${desktopTopbarHeight() - 10}px`;
    win.style.width = `${window.innerWidth}px`;
    win.style.height = `${window.innerHeight - taskbarHeight() - desktopTopbarHeight() + 10}px`;
}

function openWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;

    closeLauncher();

    if (id === 'settingsWindow') {
        win.classList.add('active');
        bringToFront(win);
        setDockState(id, true);
        return;
    }

    win.classList.remove('minimized');
    win.style.display = win.dataset.display || 'block';
    bringToFront(win);
    setDockState(id, true);

    if (id === 'editorWindow') {
        createMonacoEditor();
    }

    if (id === 'terminalWindow') {
        document.getElementById('terminalInput')?.focus();
    }
}

function makeDraggable(elem, clampFn) {
    if (!elem) return;

    elem.addEventListener('mousedown', (ev) => {
        if (isCompactViewport()) return;
        if (ev.button !== 0) return;
        ev.preventDefault();
        bringToFront(elem);

        const rect = elem.getBoundingClientRect();
        const shiftX = ev.clientX - rect.left;
        const shiftY = ev.clientY - rect.top;

        function onMove(moveEvent) {
            const position = clampFn(elem, moveEvent.pageX - shiftX, moveEvent.pageY - shiftY);
            elem.style.left = `${position.left}px`;
            elem.style.top = `${position.top}px`;
        }

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', function up() {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', up);
        }, { once: true });
    });

    elem.ondragstart = () => false;
}

function showApps() {
    allAppsTab?.classList.add('active');
    storeTab?.classList.remove('active');
    launcherGrid?.classList.remove('hidden');
    storePanel?.classList.add('hidden');
}

function showStore() {
    allAppsTab?.classList.remove('active');
    storeTab?.classList.add('active');
    launcherGrid?.classList.add('hidden');
    storePanel?.classList.remove('hidden');
}

function filterLauncherItems(query) {
    const normalized = query.toLowerCase().trim();

    document.querySelectorAll('.launcher-app-card').forEach((card) => {
        const label = card.dataset.label || '';
        card.style.display = label.includes(normalized) ? '' : 'none';
    });

    document.querySelectorAll('.store-card').forEach((card) => {
        const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const description = card.querySelector('p')?.textContent.toLowerCase() || '';
        card.style.display = title.includes(normalized) || description.includes(normalized) ? '' : 'none';
    });
}

document.querySelectorAll('.window').forEach((win) => {
    const header = win.querySelector('.window-header');
    const closeBtn = win.querySelector('.win-close');
    const minimizeBtn = win.querySelector('.win-minimize');
    const maximizeBtn = win.querySelector('.win-maximize');

    closeBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        closeWindow(win);
    });

    minimizeBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        minimizeWindow(win);
    });

    maximizeBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMaximize(win);
    });

    win.addEventListener('mousedown', () => bringToFront(win));

    if (!header) return;

    header.addEventListener('dblclick', () => {
        if (isCompactViewport()) return;
        toggleMaximize(win);
    });

    header.addEventListener('mousedown', (ev) => {
        if (isCompactViewport()) return;
        if (ev.target.closest('.win-controls') || win.classList.contains('maximized')) return;
        ev.preventDefault();
        bringToFront(win);

        const rect = win.getBoundingClientRect();
        const shiftX = ev.clientX - rect.left;
        const shiftY = ev.clientY - rect.top;

        function onMove(moveEvent) {
            const position = clampToViewport(win, moveEvent.pageX - shiftX, moveEvent.pageY - shiftY);
            win.style.left = `${position.left}px`;
            win.style.top = `${position.top}px`;
        }

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', function up() {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', up);
        }, { once: true });
    });

    header.ondragstart = () => false;
});

document.querySelectorAll('.icon').forEach((icon) => {
    makeDraggable(icon, clampIconToViewport);

    const targetWindow = icon.dataset.windowTarget;
    if (targetWindow) {
        icon.addEventListener('dblclick', () => openWindow(targetWindow));
        icon.addEventListener('click', () => {
            if (isCompactViewport()) {
                openWindow(targetWindow);
            }
        });
        icon.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openWindow(targetWindow);
            }
        });
    }
});

document.querySelectorAll('.dock-button[data-window-target]').forEach((button) => {
    button.addEventListener('click', () => openWindow(button.dataset.windowTarget));
});

appMenuBtn?.addEventListener('click', toggleLauncher);
appLauncher?.addEventListener('click', (e) => {
    if (e.target === appLauncher) closeLauncher();
});
allAppsTab?.addEventListener('click', showApps);
storeTab?.addEventListener('click', showStore);
appSearchInput?.addEventListener('input', () => filterLauncherItems(appSearchInput.value));
closeSettings?.addEventListener('click', () => closeWindow('settingsWindow'));

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('tab-close')) {
        e.target.closest('.editor-tab')?.remove();
    }
});

document.addEventListener('click', (e) => {
    const tab = e.target.closest('.editor-tab');
    if (tab && !e.target.classList.contains('tab-close')) {
        document.querySelectorAll('.editor-tab').forEach((item) => item.classList.remove('active'));
        tab.classList.add('active');
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;

    if (appLauncher?.style.display === 'flex') {
        closeLauncher();
        return;
    }

    if (settingsPanel?.classList.contains('active')) {
        closeWindow('settingsWindow');
        return;
    }

    const windows = Array.from(document.querySelectorAll('.window')).filter((win) => win.style.display !== 'none');
    const topWindow = windows.sort((a, b) => (parseInt(a.style.zIndex || 0, 10) - parseInt(b.style.zIndex || 0, 10))).pop();
    if (topWindow) closeWindow(topWindow);
});

function refreshDesktopClock() {
    if (!desktopClock) return;
    desktopClock.textContent = new Intl.DateTimeFormat([], {
        hour: 'numeric',
        minute: '2-digit',
        weekday: 'short'
    }).format(new Date());
}

function keepDesktopElementsInBounds() {
    syncDesktopChromeHeight();

    document.querySelectorAll('.icon').forEach((icon) => {
        const rect = icon.getBoundingClientRect();
        const position = clampIconToViewport(icon, rect.left, rect.top);
        icon.style.left = `${position.left}px`;
        icon.style.top = `${position.top}px`;
    });

    resolveDesktopIconOverlap();

    document.querySelectorAll('.window').forEach((win) => {
        if (getComputedStyle(win).display === 'none') return;
        if (win.classList.contains('maximized')) {
            win.style.width = `${window.innerWidth}px`;
            win.style.height = `${window.innerHeight - taskbarHeight() - desktopTopbarHeight() + 10}px`;
            return;
        }

        const rect = win.getBoundingClientRect();
        const position = clampToViewport(win, rect.left, rect.top);
        win.style.left = `${position.left}px`;
        win.style.top = `${position.top}px`;
    });
}

window.addEventListener('load', keepDesktopElementsInBounds);
window.addEventListener('resize', keepDesktopElementsInBounds);

function createMonacoEditor() {
    require(['vs/editor/editor.main'], () => {
        if (editorInstance) return;

        editorInstance = monaco.editor.create(document.getElementById('monacoContainer'), {
            value: [
                '# Welcome to CodeLab - Advanced Code Editor',
                '# Start typing below...',
                '',
                'def greet(name):',
                '    """A simple greeting function."""',
                '    return f"Hello, {name}!"',
                '',
                'if __name__ == "__main__":',
                '    print(greet("MiniNode OS"))',
            ].join('\n'),
            language: currentLanguage,
            theme: editorTheme,
            automaticLayout: true,
            fontSize: 14,
            fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
            lineNumbers: 'on',
            glyphMargin: true,
            folding: true,
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            minimap: {
                enabled: true,
                side: 'right'
            },
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
            bracketPairColorization: {
                enabled: true
            }
        });

        editorInstance.onDidChangeCursorPosition((event) => {
            const pos = event.position;
            const cursorPos = document.getElementById('cursorPos');
            if (cursorPos) {
                cursorPos.textContent = `Line ${pos.lineNumber}, Column ${pos.column}`;
            }
        });

        editorInstance.onDidChangeModelContent(updateFileStats);
        updateFileStats();
    });
}

function updateFileStats() {
    if (!editorInstance) return;
    const model = editorInstance.getModel();
    const fileStats = document.getElementById('fileStats');
    if (!model || !fileStats) return;

    const lineCount = model.getLineCount();
    const charCount = model.getValue().length;
    fileStats.textContent = `UTF-8 • ${currentLanguage.toUpperCase()} • CRLF • ${charCount} chars • ${lineCount} lines`;
}

document.getElementById('languageSelector')?.addEventListener('change', (event) => {
    currentLanguage = event.target.value;
    if (!editorInstance) return;

    const model = editorInstance.getModel();
    monaco.editor.setModelLanguage(model, currentLanguage);
    updateFileStats();
});

document.getElementById('themeToggle')?.addEventListener('click', () => {
    editorTheme = editorTheme === 'vs-dark' ? 'vs-light' : 'vs-dark';
    const button = document.getElementById('themeToggle');
    if (button) {
        button.textContent = editorTheme === 'vs-dark' ? '🌙' : '☀️';
    }

    if (editorInstance) {
        monaco.editor.setTheme(editorTheme);
    }
});

document.getElementById('formatCode')?.addEventListener('click', () => {
    editorInstance?.getAction('editor.action.formatDocument').run();
});

function getRandomUsage(base, variation) {
    return (base + Math.random() * variation).toFixed(1);
}

function updateRunStats() {
    const cpu = document.getElementById('cpuUsage');
    const ram = document.getElementById('ramUsage');
    const process = document.getElementById('processUsage');
    if (!cpu || !ram || !process) return;

    cpu.textContent = `${getRandomUsage(20, 30)}%`;
    ram.textContent = `${getRandomUsage(10, 25)}%`;
    process.textContent = `${getRandomUsage(5, 10)}%`;
}

refreshDesktopClock();
updateRunStats();
window.setInterval(refreshDesktopClock, 1000);
window.setInterval(updateRunStats, 2000);

 
