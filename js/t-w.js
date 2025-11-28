// ============================================================
//  FOKAS — Time Summary / Tracking System
//  (Shared by Home + Report pages)
// ============================================================

const FOKAS_ROOMS = ["lofi", "jazz", "rain", "silence"];

// Utility: Return today's local date as YYYY-MM-DD (location-aware)
function todayKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}


// ------------------------------------------------------------
// Utility: Return Monday of the current week (00:00:00)
// ------------------------------------------------------------
function getWeekStart() {
    const now = new Date();
    const day = now.getDay();                     // Sunday = 0
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
}


// ------------------------------------------------------------
// Load room-specific time data from localStorage
// ------------------------------------------------------------
function getRoomData(room) {
    return JSON.parse(localStorage.getItem(`fokas_history_${room}`) || "{}");
}


// ------------------------------------------------------------
// Calculate today's, weekly, total, and per-room times
// ------------------------------------------------------------
function calculateTimes() {
    const today = todayKey();
    const monday = getWeekStart();

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
            const d = new Date(date);

            total += sec;
            perRoom[room] += sec;

            if (date === today) todayTotal += sec;
            if (d >= monday) weekTotal += sec;
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
// Apply calculated data to Home page UI
// ------------------------------------------------------------
function applyHomePage(data) {
    const todayEl = document.getElementById("today-time");
    const weekEl  = document.getElementById("week-time");
    if (!todayEl || !weekEl) return; // Not Home page

    todayEl.innerText = format(data.todayTotal);
    weekEl.innerText  = format(data.weekTotal);
}


// ------------------------------------------------------------
// Apply calculated data to Report page UI
// ------------------------------------------------------------
function applyReportPage(data) {
    const totalEl = document.getElementById("total-time");
    if (!totalEl) return; // Not Report page

    document.getElementById("today-time").innerText   = format(data.todayTotal);
    document.getElementById("week-time").innerText    = format(data.weekTotal);
    document.getElementById("total-time").innerText   = format(data.total);

    document.getElementById("lofi-time").innerText    = format(data.perRoom.lofi);
    document.getElementById("jazz-time").innerText    = format(data.perRoom.jazz);
    document.getElementById("rain-time").innerText    = format(data.perRoom.rain);
    document.getElementById("silence-time").innerText = format(data.perRoom.silence);
}


// ============================================================
// Daily Goal Evaluation + Congratulatory Message
// ============================================================
function checkDailyGoal(todaySeconds) {
    const h = parseInt(localStorage.getItem("fokas_daily_goal_hours") || 0, 10);
    const m = parseInt(localStorage.getItem("fokas_daily_goal_minutes") || 0, 10);

    const goalSec = h * 3600 + m * 60;
    if (goalSec === 0) return null; // no goal set

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
// Refresh summary + goal message (+ chart if available)
// ------------------------------------------------------------
function refreshSummaryAndGoal() {
    const data = calculateTimes();

    // Home + Report shared
    applyHomePage(data);
    applyReportPage(data);

    // Goal message only where #goal-message exists (Report page)
    const goalEl = document.getElementById("goal-message");
    if (goalEl) {
        const msg = checkDailyGoal(data.todayTotal);
        goalEl.textContent = msg || "";
        if (msg && typeof confetti === "function") {
            runConfetti();
        }
    }

    // If weekly chart script is loaded, redraw (Report page only)
    if (typeof drawWeeklyChart === "function") {
        drawWeeklyChart();
    }
}


// ============================================================
// Initial Execution + Periodic Refresh (Home + Report)
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
    // First paint
    refreshSummaryAndGoal();

    // Refresh every 60 seconds so midnight change is reflected
    setInterval(refreshSummaryAndGoal, 60 * 1000);
});


// ============================================================
// Confetti Celebration Effect
// ============================================================
function runConfetti() {
    // Initial burst
    confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.65 }
    });

    // Second burst
    setTimeout(() => {
        confetti({
            particleCount: 100,
            spread: 90,
            origin: { y: 0.6 }
        });
    }, 800);

    // Side bursts
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
