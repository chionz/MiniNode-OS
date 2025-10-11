const iframe = document.getElementById("browserFrame");
const urlBar = document.getElementById("urlBar");
const backBtn = document.getElementById("backBtn");
const forwardBtn = document.getElementById("forwardBtn");
const refreshBtn = document.getElementById("refreshBtn");
const goBtn = document.getElementById("goBtn");

let historyStack = [];
let currentIndex = -1;

function loadURL(url) {
    if (!url.startsWith("http")) url = "https://" + url;
    iframe.src = url;
    urlBar.value = url;

    // Push to history only if new
    if (currentIndex === -1 || historyStack[currentIndex] !== url) {
        historyStack = historyStack.slice(0, currentIndex + 1);
        historyStack.push(url);
        currentIndex = historyStack.length - 1;
    }
}

goBtn.onclick = () => loadURL(urlBar.value);
urlBar.addEventListener("keydown", e => {
    if (e.key === "Enter") loadURL(urlBar.value);
});

backBtn.onclick = () => {
    if (currentIndex > 0) {
        currentIndex--;
        iframe.src = historyStack[currentIndex];
        urlBar.value = historyStack[currentIndex];
    }
};

forwardBtn.onclick = () => {
    if (currentIndex < historyStack.length - 1) {
        currentIndex++;
        iframe.src = historyStack[currentIndex];
        urlBar.value = historyStack[currentIndex];
    }
};

refreshBtn.onclick = () => iframe.src = iframe.src;

// Initialize
loadURL(urlBar.value);

// Optional: Close window
document.querySelector(".win-close").onclick = () => {
    document.getElementById("browserWindow").style.display = "none";
};
