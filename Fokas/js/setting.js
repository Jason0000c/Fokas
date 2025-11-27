document.addEventListener("DOMContentLoaded", () => {

    // -----------------------
    // THEME
    // -----------------------
    const themeCards = document.querySelectorAll("#theme-settings .card-option");

    function applyTheme(mode) {
        if (mode === "dark") {
            document.documentElement.classList.add("dark-mode");
        } else {
            document.documentElement.classList.remove("dark-mode");
        }

        themeCards.forEach(c => c.classList.remove("selected"));
        if (mode === "dark") themeCards[1].classList.add("selected");
        else themeCards[0].classList.add("selected");
    }

    // load theme
    let savedTheme = localStorage.getItem("fokas-theme");
    if (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        savedTheme = "dark";
    }
    applyTheme(savedTheme || "light");

    // theme click
    themeCards.forEach(card => {
        card.addEventListener("click", () => {
            const isDark = card.textContent.toLowerCase().includes("dark");
            localStorage.setItem("fokas-theme", isDark ? "dark" : "light");
            applyTheme(isDark ? "dark" : "light");
        });
    });


    // -----------------------
    // TRACKING MODE
    // -----------------------
    const trackingCards = document.querySelectorAll("#tracking-settings .card-option");

    function applyTracking(mode) {
        trackingCards.forEach(c => c.classList.remove("selected"));
        if (mode === "open") trackingCards[0].classList.add("selected");
        else trackingCards[1].classList.add("selected");
    }

    // load
    let savedTrack = localStorage.getItem("fokas_setting_track") || "open";
    applyTracking(savedTrack);

    // click
    trackingCards.forEach((card, index) => {
        card.addEventListener("click", () => {
            const mode = index === 0 ? "open" : "visible";
            localStorage.setItem("fokas_setting_track", mode);
            applyTracking(mode);
        });
    });


    // -----------------------
    // DAILY GOAL
    // -----------------------
    const goalHours = document.getElementById("goal-hours");
    const goalMinutes = document.getElementById("goal-minutes");

    function saveGoal() {
        localStorage.setItem("fokas_daily_goal_hours", goalHours.value || 0);
        localStorage.setItem("fokas_daily_goal_minutes", goalMinutes.value || 0);
    }

    goalHours.addEventListener("input", saveGoal);
    goalMinutes.addEventListener("input", saveGoal);

    // load
    goalHours.value = localStorage.getItem("fokas_daily_goal_hours") || 0;
    goalMinutes.value = localStorage.getItem("fokas_daily_goal_minutes") || 0;


    // -----------------------
    // RESET SETTINGS
    // -----------------------
    document.querySelector(".reset-btn").addEventListener("click", () => {

        // clear localStorage
        localStorage.removeItem("fokas-theme");
        localStorage.removeItem("fokas_setting_track");
        localStorage.removeItem("fokas_daily_goal_hours");
        localStorage.removeItem("fokas_daily_goal_minutes");

        // reset UI
        applyTheme("light");
        applyTracking("open");
        goalHours.value = 0;
        goalMinutes.value = 0;

        showToast("Settings reset to default!");
    });
});

// =============================
// Toast Message Function
// =============================
function showToast(message) {
    // 기존 토스트 제거
    const old = document.querySelector(".fokas-toast");
    if (old) old.remove();

    // 새 토스트 생성
    const toast = document.createElement("div");
    toast.className = "fokas-toast";
    toast.innerText = message;
    document.body.appendChild(toast);

    // fade-in
    setTimeout(() => toast.classList.add("show"), 50);

    // fade-out + 제거
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 500);
    }, 1800);
}
