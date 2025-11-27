// =============================
// SETTINGS PAGE LOGIC
// =============================
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

        // 카드 UI 상태 업데이트
        themeCards.forEach(c => c.classList.remove("selected"));
        if (mode === "dark") {
            if (themeCards[1]) themeCards[1].classList.add("selected");
        } else {
            if (themeCards[0]) themeCards[0].classList.add("selected");
        }
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
            const mode = isDark ? "dark" : "light";
            localStorage.setItem("fokas-theme", mode);
            applyTheme(mode);
        });
    });


    // -----------------------
    // TRACKING MODE
    // -----------------------
    const trackingCards = document.querySelectorAll("#tracking-settings .card-option");

    function applyTracking(mode) {
        trackingCards.forEach(c => c.classList.remove("selected"));
        if (mode === "open") {
            if (trackingCards[0]) trackingCards[0].classList.add("selected");
        } else {
            if (trackingCards[1]) trackingCards[1].classList.add("selected");
        }
    }

    // load tracking mode
    let savedTrack = localStorage.getItem("fokas_setting_track") || "open";
    applyTracking(savedTrack);

    // click tracking mode
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
        localStorage.setItem("fokas_daily_goal_hours", goalHours.value || "0");
        localStorage.setItem("fokas_daily_goal_minutes", goalMinutes.value || "0");
    }

    if (goalHours && goalMinutes) {
        // load
        goalHours.value = localStorage.getItem("fokas_daily_goal_hours") || "0";
        goalMinutes.value = localStorage.getItem("fokas_daily_goal_minutes") || "0";

        // save on change
        goalHours.addEventListener("input", saveGoal);
        goalMinutes.addEventListener("input", saveGoal);
    }


    // -----------------------
    // RESET SETTINGS
    // -----------------------
    const resetBtn = document.querySelector(".reset-btn");

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {

            // 1) localStorage를 "기본값"으로 다시 세팅
            localStorage.setItem("fokas-theme", "light");        // 테마: 라이트
            localStorage.setItem("fokas_setting_track", "open"); // 트래킹: room open
            localStorage.setItem("fokas_daily_goal_hours", "0");
            localStorage.setItem("fokas_daily_goal_minutes", "0");

            // 2) 화면(UI)도 같이 초기화
            applyTheme("light");
            applyTracking("open");
            if (goalHours && goalMinutes) {
                goalHours.value = 0;
                goalMinutes.value = 0;
            }

            // 3) 토스트 메시지
            showToast("Settings reset to default!");
        });
    }
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
