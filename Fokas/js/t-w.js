// =====================================
//  FOKAS  —  Time Summary System
//  (Home + Report 공용)
// =====================================

const FOKAS_ROOMS = ["lofi", "jazz", "rain", "silence"];

// 날짜 YYYY-MM-DD
function todayKey() {
    return new Date().toISOString().slice(0, 10);
}

// 주 시작(월요일)
function getWeekStart() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);

    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
}

// 로컬스토리지 읽기
function getRoomData(room) {
    return JSON.parse(localStorage.getItem(`fokas_history_${room}`) || "{}");
}

// 전체 데이터 계산
function calculateTimes() {
    const today = todayKey();
    const monday = getWeekStart();

    let todayTotal = 0;
    let weekTotal = 0;
    let total = 0;

    let perRoom = {
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

// 포맷 변환
function format(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h}h ${m}m`;
}

// Home 페이지 자동 처리
function applyHomePage(data) {
    if (!document.getElementById("today-time")) return; // Home이 아닐 때 종료

    document.getElementById("today-time").innerText = format(data.todayTotal);
    document.getElementById("week-time").innerText = format(data.weekTotal);
}

// Report 페이지 자동 처리
function applyReportPage(data) {
    if (!document.getElementById("total-time")) return; // Report가 아닐 때 종료

    document.getElementById("today-time").innerText = format(data.todayTotal);
    document.getElementById("week-time").innerText = format(data.weekTotal);
    document.getElementById("total-time").innerText = format(data.total);

    document.getElementById("lofi-time").innerText = format(data.perRoom.lofi);
    document.getElementById("jazz-time").innerText = format(data.perRoom.jazz);
    document.getElementById("rain-time").innerText = format(data.perRoom.rain);
    document.getElementById("silence-time").innerText = format(data.perRoom.silence);
}

// ===== 실행 시작 =====
document.addEventListener("DOMContentLoaded", () => {
    const data = calculateTimes();
    applyHomePage(data);
    applyReportPage(data);
});

// =================================
// Daily Goal Check & Congratulations
// =================================

function checkDailyGoal(todaySeconds) {
    const h = parseInt(localStorage.getItem("fokas_daily_goal_hours") || 0);
    const m = parseInt(localStorage.getItem("fokas_daily_goal_minutes") || 0);

    const goalSec = h * 3600 + m * 60;
    if (goalSec === 0) return null; // 목표가 0이면 메시지 없음

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

document.addEventListener("DOMContentLoaded", () => {
    const data = calculateTimes();
    applyHomePage(data);
    applyReportPage(data);

    const msg = checkDailyGoal(data.todayTotal);

    if (msg && document.getElementById("goal-message")) {
        document.getElementById("goal-message").innerText = msg;

        // ====== Confetti 효과 실행 ======
        runConfetti();
    }
});

function runConfetti() {
    // 1) 즉시 터지는 기본 컷
    confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.65 }
    });

    // 2) 800ms 뒤 또 한 번
    setTimeout(() => {
        confetti({
            particleCount: 100,
            spread: 90,
            origin: { y: 0.6 }
        });
    }, 800);

    // 3) 좌우에서 살짝씩
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
