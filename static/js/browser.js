const iframe = document.getElementById('browserFrame');
const urlBar = document.getElementById('urlBar');
const backBtn = document.getElementById('backBtn');
const forwardBtn = document.getElementById('forwardBtn');
const refreshBtn = document.getElementById('refreshBtn');
const goBtn = document.getElementById('goBtn');

let historyStack = [];
let currentIndex = -1;

function loadURL(url, addToHistory = true) {
    if (!iframe || !urlBar || !url) return;

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    iframe.src = normalizedUrl;
    urlBar.value = normalizedUrl;

    if (addToHistory && (currentIndex === -1 || historyStack[currentIndex] !== normalizedUrl)) {
        historyStack = historyStack.slice(0, currentIndex + 1);
        historyStack.push(normalizedUrl);
        currentIndex = historyStack.length - 1;
    }
}

goBtn?.addEventListener('click', () => loadURL(urlBar.value));
urlBar?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        loadURL(urlBar.value);
    }
});

backBtn?.addEventListener('click', () => {
    if (currentIndex <= 0) return;
    currentIndex -= 1;
    loadURL(historyStack[currentIndex], false);
});

forwardBtn?.addEventListener('click', () => {
    if (currentIndex >= historyStack.length - 1) return;
    currentIndex += 1;
    loadURL(historyStack[currentIndex], false);
});

refreshBtn?.addEventListener('click', () => {
    if (iframe) {
        iframe.src = iframe.src;
    }
});

if (urlBar?.value) {
    loadURL(urlBar.value);
}
