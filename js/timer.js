// ============================================================
//  FOKAS — Focus Timer System
//  (Room-based tracking with per-day accumulation, local-time)
// ============================================================

// Global elapsed time in seconds (shared across the file)
let focasElapsed = 0;

let focasTimer = {
    startTime: null,    // Timestamp (ms) from Date.now()
    interval: null,     // setInterval handler
    room: null,         // Current active room name
    currentDate: null   // Local date string "YYYY-MM-DD"
};

console.log("[FOKAS] timer.js loaded");


// ------------------------------------------------------------
// Utility: Local date as "YYYY-MM-DD" (location-aware)
// ------------------------------------------------------------
function fokasTodayKeyLocal() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}


// ------------------------------------------------------------
// Load today's stored seconds for a specific room
// Ensures key exists in storage
// ------------------------------------------------------------
function getTodayRoomSeconds(room) {
    const today = fokasTodayKeyLocal();
    let data;

    try {
        data = JSON.parse(localStorage.getItem(`fokas_history_${room}`) || "{}");
    } catch (e) {
        console.error("[FOKAS] Failed to parse storage for", room, e);
        data = {};
    }

    if (!data[today]) {
        data[today] = 0;
        localStorage.setItem(`fokas_history_${room}`, JSON.stringify(data));
    }

    return data[today];
}


// ------------------------------------------------------------
// Save accumulated seconds for today's date (per-room)
// ------------------------------------------------------------
function saveFocusTime(room, seconds) {
    const today = fokasTodayKeyLocal();
    let data;

    try {
        data = JSON.parse(localStorage.getItem(`fokas_history_${room}`) || "{}");
    } catch (e) {
        console.error("[FOKAS] Failed to parse storage for", room, e);
        data = {};
    }

    data[today] = seconds;
    localStorage.setItem(`fokas_history_${room}`, JSON.stringify(data));
}


// ------------------------------------------------------------
// Update timer display & save progress every second
//  - Handles date change (midnight) and resets daily timer
// ------------------------------------------------------------
function updateFokasTimer() {
    if (!focasTimer.startTime || !focasTimer.room) return;

    const now = Date.now();
    const todayStr = fokasTodayKeyLocal();

    // Day changed (e.g., midnight in local timezone)
    if (focasTimer.currentDate && todayStr !== focasTimer.currentDate) {
        console.log("[FOKAS] New day detected, resetting daily timer");
        focasElapsed = 0;
        focasTimer.startTime = now;
        focasTimer.currentDate = todayStr;
    }

    focasElapsed = Math.floor((now - focasTimer.startTime) / 1000);

    // Persist today's progress
    saveFocusTime(focasTimer.room, focasElapsed);

    const h = String(Math.floor(focasElapsed / 3600)).padStart(2, "0");
    const m = String(Math.floor((focasElapsed % 3600) / 60)).padStart(2, "0");
    const s = String(focasElapsed % 60).padStart(2, "0");

    const el = document.getElementById("timer");
    if (!el) {
        // Safety: if timer DOM is missing, just log once
        // (but do not crash interval)
        // console.warn("[FOKAS] #timer element not found");
        return;
    }
    el.innerText = `${h}:${m}:${s}`;
}


// ------------------------------------------------------------
// Start interval timer
// ------------------------------------------------------------
function startFokasTimer() {
    if (focasTimer.interval) return; // prevent duplicates
    console.log("[FOKAS] startFokasTimer() called");
    focasTimer.interval = setInterval(updateFokasTimer, 1000);
}


// ------------------------------------------------------------
// Stop timer and save the most recent time
// ------------------------------------------------------------
function stopFokasTimer() {
    if (focasTimer.interval) {
        clearInterval(focasTimer.interval);
        focasTimer.interval = null;
        console.log("[FOKAS] Timer stopped");
    }
    if (!focasTimer.startTime || !focasTimer.room) return;

    const totalSec = Math.floor((Date.now() - focasTimer.startTime) / 1000);
    focasElapsed = totalSec;
    saveFocusTime(focasTimer.room, totalSec);
}


// ------------------------------------------------------------
// Initialize timer when entering a room
//  - Called from each room HTML: initFokasTimer("lofi"), etc.
// ------------------------------------------------------------
function initFokasTimer(roomName) {
    const timerEl = document.getElementById("timer");
    if (!timerEl) {
        console.error("[FOKAS] initFokasTimer called but #timer element not found");
        return;
    }

    focasTimer.room = roomName;
    focasTimer.currentDate = fokasTodayKeyLocal();

    // Load existing seconds for today
    const existing = getTodayRoomSeconds(roomName);
    focasElapsed = existing;

    // Adjust startTime so elapsed calculation includes saved time
    focasTimer.startTime = Date.now() - (existing * 1000);

    console.log(`[FOKAS] Timer initialized for room: ${roomName}, existing = ${existing}s`);

    // Initial display update
    updateFokasTimer();

    // Start ticking
    startFokasTimer();

    // Save on page unload (desktop-oriented, mobile not guaranteed)
    window.addEventListener("beforeunload", stopFokasTimer);
}


// ============================================================
// Visibility Tracking Mode (optional)
// If mode = "visible": stop timer when tab is hidden
// ============================================================
document.addEventListener("visibilitychange", () => {
    const mode = localStorage.getItem("fokas_setting_track") || "open";

    if (mode === "visible") {

        if (document.hidden) {
            // When tab becomes hidden, save progress & pause timer
            if (focasTimer.startTime && focasTimer.room) {
                const nowSec = Math.floor((Date.now() - focasTimer.startTime) / 1000);
                focasElapsed = nowSec;
                saveFocusTime(focasTimer.room, nowSec);
            }
            if (focasTimer.interval) {
                clearInterval(focasTimer.interval);
                focasTimer.interval = null;
                console.log("[FOKAS] Timer paused (tab hidden)");
            }

        } else {
            // When tab becomes visible, resume timer using saved time
            if (!focasTimer.interval && focasTimer.room) {
                focasTimer.startTime = Date.now() - (focasElapsed * 1000);
                focasTimer.currentDate = fokasTodayKeyLocal();
                startFokasTimer();
                console.log("[FOKAS] Timer resumed (tab visible)");
            }
        }
    }
});
