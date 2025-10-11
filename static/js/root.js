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

appMenuBtn.addEventListener('click', () => {
    if (appLauncher.style.display === 'flex') {
        appLauncher.style.display = 'none';
        appLauncher.setAttribute('aria-hidden', 'true');
    } else {
        appLauncher.style.display = 'flex'; // show as flex so children wrap
        appLauncher.setAttribute('aria-hidden', 'false');
    }
});

// click on empty app-launcher background closes it
appLauncher.addEventListener('click', (e) => {
    if (e.target === appLauncher) {
        appLauncher.style.display = 'none';
        appLauncher.setAttribute('aria-hidden', 'true');
    }
});

/* ---------- taskbar buttons open corresponding windows ---------- */
document.getElementById('filesBtn').addEventListener('click', () => openWindow('filesWindow'));
/* document.getElementById('settingsBtn').addEventListener('click', () => openWindow('settingsWindow')); */
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


// Monaco Editor setup
let editorInstance;

require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.48.0/min/vs' } });

function createMonacoEditor() {
  require(['vs/editor/editor.main'], function () {
    if (editorInstance) return; // already created

    editorInstance = monaco.editor.create(document.getElementById('monacoContainer'), {
      value: [
        '// Welcome to your `{{app_name}}` code editor!',
        '// Start typing below...',
        '',
        'def hello() ',
        '  print("Hello World");',
        '',
      ].join('\n'),
      language: 'python',
      theme: 'vs-light',
      automaticLayout: true
    });
  });
}

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
