// ============================================================
//  FOKAS — Time Summary / Tracking System
//  (Shared by Home + Report pages)
// ============================================================

const FOKAS_ROOMS = ["lofi", "jazz", "rain", "silence"];

// ------------------------------------------------------------
// Local Today Key (YYYY-MM-DD)
// ------------------------------------------------------------
function todayKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

// ------------------------------------------------------------
// Parse "YYYY-MM-DD" as LOCAL timezone (NOT UTC)
// ------------------------------------------------------------
function parseLocalDate(str) {
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
}

// ------------------------------------------------------------
// Week Start (Sunday 00:00 Local Time)
// ------------------------------------------------------------
function getWeekStart() {
    const now = new Date();
    const day = now.getDay();     // Sunday = 0
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - day);
    sunday.setHours(0, 0, 0, 0);
    return sunday;
}

// ------------------------------------------------------------
// Load room-specific time data
// ------------------------------------------------------------
function getRoomData(room) {
    return JSON.parse(localStorage.getItem(`fokas_history_${room}`) || "{}");
}

// ------------------------------------------------------------
// Calculate Today, Weekly, Total, Per-Room
// ------------------------------------------------------------
function calculateTimes() {
    const today = todayKey();
    const weekStart = getWeekStart();

    let todayTotal = 0;
    let weekTotal = 0;
    let total = 0;

    const perRoom = {
        lofi: 0,
        jazz: 0,
        rain: 0,
        silence: 0
    };

    FOKAS_ROOMS.forEach(room => {
        const data = getRoomData(room);

        Object.keys(data).forEach(date => {
            const sec = data[date];

            // Use local parsed date
            const d = parseLocalDate(date);

            total += sec;
            perRoom[room] += sec;

            if (date === today) todayTotal += sec;
            if (d >= weekStart) weekTotal += sec;
        });
    });

    return { todayTotal, weekTotal, total, perRoom };
}

// ------------------------------------------------------------
// Format seconds → "Hh Mm"
// ------------------------------------------------------------
function format(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h}h ${m}m`;
}

// ------------------------------------------------------------
// Apply Home Page Summary
// ------------------------------------------------------------
function applyHomePage(data) {
    const todayEl = document.getElementById("today-time");
    const weekEl = document.getElementById("week-time");

    if (!todayEl || !weekEl) return;

    todayEl.innerText = format(data.todayTotal);
    weekEl.innerText = format(data.weekTotal);
}

// ------------------------------------------------------------
// Apply Report Page Summary
// ------------------------------------------------------------
function applyReportPage(data) {
    const totalEl = document.getElementById("total-time");
    if (!totalEl) return;

    document.getElementById("today-time").innerText = format(data.todayTotal);
    document.getElementById("week-time").innerText = format(data.weekTotal);
    document.getElementById("total-time").innerText = format(data.total);

    document.getElementById("lofi-time").innerText = format(data.perRoom.lofi);
    document.getElementById("jazz-time").innerText = format(data.perRoom.jazz);
    document.getElementById("rain-time").innerText = format(data.perRoom.rain);
    document.getElementById("silence-time").innerText = format(data.perRoom.silence);
}

// ============================================================
// Daily Goal Check
// ============================================================
function checkDailyGoal(todaySeconds) {
    const h = parseInt(localStorage.getItem("fokas_daily_goal_hours") || 0, 10);
    const m = parseInt(localStorage.getItem("fokas_daily_goal_minutes") || 0, 10);

    const goalSec = h * 3600 + m * 60;
    if (goalSec === 0) return null;

    if (todaySeconds >= goalSec) {
        const messages = [
            "Great job today! You're on fire 🔥",
            "You smashed your focus goal! 💯",
            "Amazing consistency today ✨",
            "Focus champion of the day 😎",
            "Your discipline is next-level 🚀",
            "You're building powerful habits! 💪",
            "This is how progress is made 🌱",
            "Outstanding focus today 👑",
            "You crushed it! Keep going! 🌟",
            "Legendary focus session today 🔥"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }
    return null;
}

// ------------------------------------------------------------
// Refresh (Home + Report)
// ------------------------------------------------------------
function refreshSummaryAndGoal() {
    const data = calculateTimes();

    applyHomePage(data);
    applyReportPage(data);

    const goalEl = document.getElementById("goal-message");
    if (goalEl) {
        const msg = checkDailyGoal(data.todayTotal);
        goalEl.textContent = msg || "";
        if (msg && typeof confetti === "function") {
            runConfetti();
        }
    }

    if (typeof drawWeeklyChart === "function") {
        drawWeeklyChart();
    }
}

// ------------------------------------------------------------
// Init
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    refreshSummaryAndGoal();
    setInterval(refreshSummaryAndGoal, 60 * 1000);
});

// ============================================================
// Confetti
// ============================================================
function runConfetti() {
    confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.65 }
    });
    setTimeout(() => {
        confetti({
            particleCount: 100,
            spread: 90,
            origin: { y: 0.6 }
        });
    }, 800);

    setTimeout(() => {
        confetti({
            particleCount: 80,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
        });
        confetti({
            particleCount: 80,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
        });
    }, 500);
}
