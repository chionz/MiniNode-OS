window.addEventListener("load", () => {
    const preloader = document.getElementById("preloader");
    preloader.classList.add("fade-out");
    setTimeout(() => preloader.style.display = "none", 800);
});


/* document.addEventListener("DOMContentLoaded", () => {
    const preloader = document.getElementById("preloader");
    const hasLoaded = localStorage.getItem("osLoaded");

    // If user has already seen the preloader, skip it
    if (hasLoaded) {
        preloader.style.display = "none";
    } else {
        // Show once and fade out
        window.addEventListener("load", () => {
            preloader.classList.add("fade-out");
            setTimeout(() => {
                preloader.style.display = "none";
                localStorage.setItem("osLoaded", "true");
            }, 800);
        });
    }
}); */
