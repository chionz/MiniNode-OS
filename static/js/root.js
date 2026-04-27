/* ---------- utility: bring window to front ---------- */
let zIndexCounter = 1200;
function bringToFront(el) {
    zIndexCounter += 1;
    el.style.zIndex = zIndexCounter;
}

/* ---------- open/close windows ---------- */
function openWindow(id) {
    const w = document.getElementById(id);
    if (!w) return;
   
    if (id === 'settingsWindow') {
      w.classList.add('active'); // slide in
      bringToFront(w);
      appLauncher.style.display = 'none';
      appLauncher.setAttribute('aria-hidden', 'true');
      return;
    }
    
    w.style.display = 'block';
    bringToFront(w);
    // close app launcher when opening an app
    appLauncher.style.display = 'none';
    appLauncher.setAttribute('aria-hidden', 'true');
}

// close buttons
document.querySelectorAll('.window').forEach(win => {
    const closeBtn = win.querySelector('.win-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            win.style.display = 'none';
        });
    }

    // clicking on a window brings it to front
    win.addEventListener('mousedown', () => bringToFront(win));
});


/* ---------- drag desktop folder icon ---------- */
const desktopFolder = document.getElementById('desktopFolder');
makeDraggable(desktopFolder);

// double-click folder to open Files
desktopFolder.addEventListener('dblclick', () => openWindow('filesWindow'));

/* ---------- make generic element draggable ---------- */
function makeDraggable(elem) {
    elem.addEventListener('mousedown', function (ev) {
        // only left mouse button
        if (ev.button !== 0) return;
        ev.preventDefault();
        bringToFront(elem);

        const rect = elem.getBoundingClientRect();
        const shiftX = ev.clientX - rect.left;
        const shiftY = ev.clientY - rect.top;

        function onMove(e) {
            elem.style.left = (e.pageX - shiftX) + 'px';
            elem.style.top = (e.pageY - shiftY) + 'px';
        }

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', function up() {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', up);
        }, { once: true });
    });
    elem.ondragstart = () => false;
}

/* ---------- windows: drag by header (but ignore clicks on close button) ---------- */
document.querySelectorAll('.window').forEach(win => {
    const header = win.querySelector('.window-header');
    header.addEventListener('mousedown', function (ev) {
        // ignore if user clicked the close button
        if (ev.target.closest('.win-controls')) return;
        ev.preventDefault();
        bringToFront(win);

        const rect = win.getBoundingClientRect();
        const shiftX = ev.clientX - rect.left;
        const shiftY = ev.clientY - rect.top;

        function onMove(e) {
            win.style.left = (e.pageX - shiftX) + 'px';
            win.style.top = (e.pageY - shiftY) + 'px';
        }

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', function up() {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', up);
        }, { once: true });
    });
    header.ondragstart = () => false;
});

/* ---------- app launcher toggle (keeps taskbar visible) ---------- */
const appMenuBtn = document.getElementById('appMenuBtn');
const appLauncher = document.getElementById('appLauncher');
const appSearchInput = document.getElementById('appSearchInput');
const allAppsTab = document.getElementById('allAppsTab');
const storeTab = document.getElementById('storeTab');
const launcherGrid = document.getElementById('launcherGrid');
const storePanel = document.getElementById('storePanel');

appMenuBtn.addEventListener('click', () => {
    if (appLauncher.style.display === 'flex') {
        appLauncher.style.display = 'none';
        appLauncher.setAttribute('aria-hidden', 'true');
    } else {
        appLauncher.style.display = 'flex';
        appLauncher.setAttribute('aria-hidden', 'false');
        showApps();
    }
});

// click on empty app-launcher background closes it
appLauncher.addEventListener('click', (e) => {
    if (e.target === appLauncher) {
        appLauncher.style.display = 'none';
        appLauncher.setAttribute('aria-hidden', 'true');
    }
});

if (allAppsTab && storeTab) {
    allAppsTab.addEventListener('click', showApps);
    storeTab.addEventListener('click', showStore);
}

if (appSearchInput) {
    appSearchInput.addEventListener('input', () => {
        const query = appSearchInput.value.toLowerCase().trim();
        document.querySelectorAll('.launcher-app-card').forEach(card => {
            const label = card.dataset.label || '';
            card.style.display = label.includes(query) ? 'grid' : 'none';
        });

        document.querySelectorAll('.store-card').forEach(card => {
            const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const description = card.querySelector('p')?.textContent.toLowerCase() || '';
            card.style.display = title.includes(query) || description.includes(query) ? 'block' : 'none';
        });
    });
}

function showApps() {
    allAppsTab.classList.add('active');
    storeTab.classList.remove('active');
    launcherGrid.classList.remove('hidden');
    storePanel.classList.add('hidden');
}

function showStore() {
    allAppsTab.classList.remove('active');
    storeTab.classList.add('active');
    launcherGrid.classList.add('hidden');
    storePanel.classList.remove('hidden');
}

/* ---------- taskbar buttons open corresponding windows ---------- */
document.getElementById('filesBtn').addEventListener('click', () => openWindow('filesWindow'));
document.getElementById('settingsBtn').addEventListener('click', () => openWindow('settingsWindow')); 
document.getElementById('editorBtn').addEventListener('click', () => openWindow('editorWindow'));

/* ---------- keep the folder icon inside viewport on load ---------- */
window.addEventListener('load', () => {
    const r = desktopFolder.getBoundingClientRect();
    const maxLeft = window.innerWidth - r.width - 8;
    const maxTop = window.innerHeight - r.height - parseInt(getComputedStyle(document.documentElement).getPropertyValue('--taskbar-height')) - 8;
    if (r.left > maxLeft) desktopFolder.style.left = maxLeft + 'px';
    if (r.top > maxTop) desktopFolder.style.top = maxTop + 'px';
});



/* ---------- SETTINGS PANEL ---------- */
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsWindow');
const closeSettings = document.querySelector('.close-settings');

if (settingsBtn && settingsPanel && closeSettings) {
  settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.add('active');
  });

  closeSettings.addEventListener('click', () => {
    settingsPanel.classList.remove('active');
  });
}


// ==================== CodeLab Editor Setup ====================
let editorInstance;
let currentLanguage = 'python';
let editorTheme = 'vs-dark'; // Start with dark theme

require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.48.0/min/vs' } });

function createMonacoEditor() {
  require(['vs/editor/editor.main'], function () {
    if (editorInstance) return; // already created

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

    // Track cursor position
    editorInstance.onDidChangeCursorPosition((e) => {
      const pos = e.position;
      document.getElementById('cursorPos').textContent = `Line ${pos.lineNumber}, Column ${pos.column}`;
    });

    // Update file stats when content changes
    editorInstance.onDidChangeModelContent(() => {
      updateFileStats();
    });
  });
}

function updateFileStats() {
  if (!editorInstance) return;
  const model = editorInstance.getModel();
  if (!model) return;
  
  const lineCount = model.getLineCount();
  const charCount = model.getValue().length;
  document.getElementById('fileStats').textContent = `UTF-8 • ${currentLanguage.toUpperCase()} • CRLF • ${charCount} chars • ${lineCount} lines`;
}

// Language selector
document.getElementById('languageSelector').addEventListener('change', (e) => {
  currentLanguage = e.target.value;
  if (editorInstance) {
    const model = editorInstance.getModel();
    monaco.editor.setModelLanguage(model, currentLanguage);
    updateFileStats();
  }
});

// Theme toggle
document.getElementById('themeToggle').addEventListener('click', () => {
  editorTheme = editorTheme === 'vs-dark' ? 'vs-light' : 'vs-dark';
  const btn = document.getElementById('themeToggle');
  btn.textContent = editorTheme === 'vs-dark' ? '🌙' : '☀️';
  
  if (editorInstance) {
    monaco.editor.setTheme(editorTheme);
  }
});

// Format code
document.getElementById('formatCode').addEventListener('click', () => {
  if (editorInstance) {
    editorInstance.getAction('editor.action.formatDocument').run();
  }
});

// Tab close functionality
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('tab-close')) {
    const tab = e.target.closest('.editor-tab');
    tab.remove();
  }
});

// Tab switching
document.addEventListener('click', (e) => {
  const tab = e.target.closest('.editor-tab');
  if (tab && !e.target.classList.contains('tab-close')) {
    document.querySelectorAll('.editor-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  }
});

// when opening the editor window
document.getElementById('editorBtn').addEventListener('click', () => {
  openWindow('editorWindow');
  createMonacoEditor();
});


// CPU/RAM usage in taskbar
function getRandomUsage(base, variation) {
  return (base + Math.random() * variation).toFixed(1);
}

function updateRunStats() {
  const cpu = document.getElementById("cpuUsage");
  const ram = document.getElementById("ramUsage");
  const process = document.getElementById("processUsage");

  // Generate fake fluctuating values
  const cpuVal = getRandomUsage(20, 30); 
  const ramVal = getRandomUsage(10, 25); 
  const processVal = getRandomUsage(5, 10);

  cpu.textContent = `${cpuVal}%`;
  ram.textContent = `${ramVal}%`;
  process.textContent = `${processVal}%`;
}

// Update every 2 seconds
setInterval(updateRunStats, 2000);

// Initial update
updateRunStats();

 