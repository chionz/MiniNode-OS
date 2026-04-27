document.addEventListener("DOMContentLoaded", () => {
    const preloader = document.getElementById("preloader");
    const progressBar = document.getElementById("progressBar");
    const loadingText = document.getElementById("loadingText");

    const loadingSteps = [
        { text: "Initializing system...", progress: 10 },
        { text: "Loading core components...", progress: 30 },
        { text: "Preparing desktop environment...", progress: 60 },
        { text: "Starting applications...", progress: 90 },
        { text: "Welcome to MiniNode OS", progress: 100 }
    ];

    let currentStep = 0;

    function updateLoader() {
        if (currentStep < loadingSteps.length) {
            const step = loadingSteps[currentStep];
            loadingText.textContent = step.text;
            progressBar.style.width = step.progress + "%";
            currentStep++;
            setTimeout(updateLoader, 800); // Change step every 800ms
        } else {
            // All steps done, wait for window load
            waitForLoad().then(() => {
                setTimeout(() => {
                    preloader.classList.add("fade-out");
                    setTimeout(() => preloader.style.display = "none", 800);
                }, 500);
            });
        }
    }

    function waitForLoad() {
        return new Promise(resolve => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });
    }

    updateLoader();
});
