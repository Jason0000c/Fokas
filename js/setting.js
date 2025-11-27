// ============================================================
// SETTINGS PAGE LOGIC
// ============================================================
document.addEventListener("DOMContentLoaded", () => {

    // --------------------------------------------------------
    // THEME SETTINGS
    // --------------------------------------------------------
    const themeCards = document.querySelectorAll("#theme-settings .card-option");

    // Apply light/dark theme to document + UI highlight
    function applyTheme(mode) {
        if (mode === "dark") {
            document.documentElement.classList.add("dark-mode");
        } else {
            document.documentElement.classList.remove("dark-mode");
        }

        // Update card UI state
        themeCards.forEach(c => c.classList.remove("selected"));
        if (mode === "dark") {
            if (themeCards[1]) themeCards[1].classList.add("selected");
        } else {
            if (themeCards[0]) themeCards[0].classList.add("selected");
        }
    }

    // Load saved theme (or detect system preference first time)
    let savedTheme = localStorage.getItem("fokas-theme");
    if (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        savedTheme = "dark";
    }
    applyTheme(savedTheme || "light");

    // Theme card click event
    themeCards.forEach(card => {
        card.addEventListener("click", () => {
            const isDark = card.textContent.toLowerCase().includes("dark");
            const mode = isDark ? "dark" : "light";
            localStorage.setItem("fokas-theme", mode);
            applyTheme(mode);
        });
    });


    // --------------------------------------------------------
    // TRACKING MODE (Open room / Visible room)
    // --------------------------------------------------------
    const trackingCards = document.querySelectorAll("#tracking-settings .card-option");

    // UI update for tracking mode
    function applyTracking(mode) {
        trackingCards.forEach(c => c.classList.remove("selected"));
        if (mode === "open") {
            if (trackingCards[0]) trackingCards[0].classList.add("selected");
        } else {
            if (trackingCards[1]) trackingCards[1].classList.add("selected");
        }
    }

    // Load saved tracking mode
    let savedTrack = localStorage.getItem("fokas_setting_track") || "open";
    applyTracking(savedTrack);

    // Tracking mode click event
    trackingCards.forEach((card, index) => {
        card.addEventListener("click", () => {
            const mode = index === 0 ? "open" : "visible";
            localStorage.setItem("fokas_setting_track", mode);
            applyTracking(mode);
        });
    });


    // -------------------------------------------------------------
    // DAILY GOAL SETTINGS
    // -------------------------------------------------------------
    const goalHours = document.getElementById("goal-hours");
    const goalMinutes = document.getElementById("goal-minutes");

    // Save values to localStorage (empty values are treated as 0)
    function saveGoal() {
        localStorage.setItem(
            "fokas_daily_goal_hours",
            goalHours.value === "" ? "0" : goalHours.value
        );
        localStorage.setItem(
            "fokas_daily_goal_minutes",
            goalMinutes.value === "" ? "0" : goalMinutes.value
        );
    }

    if (goalHours && goalMinutes) {

        // Load saved values (fallback to 0 when empty or missing)
        const storedH = localStorage.getItem("fokas_daily_goal_hours");
        const storedM = localStorage.getItem("fokas_daily_goal_minutes");

        goalHours.value = (storedH === null || storedH === "") ? 0 : storedH;
        goalMinutes.value = (storedM === null || storedM === "") ? 0 : storedM;

        // Save immediately when user types
        goalHours.addEventListener("input", saveGoal);
        goalMinutes.addEventListener("input", saveGoal);

        // Ensure the field never stays empty → always revert to 0
        function fixEmptyInput(input) {
            if (input.value === "" || input.value === null) {
                input.value = 0;
                saveGoal(); // overwrite in localStorage
            }
        }

        // Apply auto-zero when losing focus
        goalHours.addEventListener("blur", () => fixEmptyInput(goalHours));
        goalMinutes.addEventListener("blur", () => fixEmptyInput(goalMinutes));
    }



    // --------------------------------------------------------
    // RESET ALL SETTINGS
    // --------------------------------------------------------
    const resetBtn = document.querySelector(".reset-btn");

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {

            // 1) Reset values in localStorage
            localStorage.setItem("fokas-theme", "light");
            localStorage.setItem("fokas_setting_track", "open");
            localStorage.setItem("fokas_daily_goal_hours", "0");
            localStorage.setItem("fokas_daily_goal_minutes", "0");

            // 2) Update UI immediately
            applyTheme("light");
            applyTracking("open");
            if (goalHours && goalMinutes) {
                goalHours.value = 0;
                goalMinutes.value = 0;
            }

            // 3) Toast message
            showToast("Settings reset to default!");
        });
    }
});


// ============================================================
// TOAST POPUP FUNCTION
// ============================================================
function showToast(message) {

    // Remove old toast if exists
    const old = document.querySelector(".fokas-toast");
    if (old) old.remove();

    // Create new toast
    const toast = document.createElement("div");
    toast.className = "fokas-toast";
    toast.innerText = message;
    document.body.appendChild(toast);

    // Show (fade-in)
    setTimeout(() => toast.classList.add("show"), 50);

    // Hide (fade-out) and remove
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 500);
    }, 1800);
}

// Prevent empty input — always revert to 0
function fixEmptyInput(input) {
    if (input.value === "" || input.value === null) {
        input.value = 0;
    }
}

// Apply to both fields
goalHours.addEventListener("blur", () => fixEmptyInput(goalHours));
goalMinutes.addEventListener("blur", () => fixEmptyInput(goalMinutes));
