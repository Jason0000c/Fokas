// =========================
// FOKAS TIMER SYSTEM
// =========================

let fokasTimer = {
    startTime: null,
    elapsed: 0,
    interval: null,
    room: null
};

// -------------------------
// Room 데이터 가져오기
// -------------------------
function getTodayRoomSeconds(room) {
    const today = new Date().toISOString().slice(0, 10);
    const data = JSON.parse(localStorage.getItem(`fokas_history_${room}`) || "{}");

    // 날짜가 다르면 리셋
    if (!data[today]) {
        data[today] = 0;
        localStorage.setItem(`fokas_history_${room}`, JSON.stringify(data));
    }

    return data[today];
}

// -------------------------
// 초 저장
// -------------------------
function saveFocusTime(room, seconds) {
    const today = new Date().toISOString().slice(0, 10);
    let data = JSON.parse(localStorage.getItem(`fokas_history_${room}`) || "{}");

    // 누적 저장
    data[today] = seconds;
    localStorage.setItem(`fokas_history_${room}`, JSON.stringify(data));
}

// -------------------------
// 타이머 UI 업데이트
// -------------------------
function updateTimer() {
    const now = Date.now();
    focasElapsed = Math.floor((now - fokasTimer.startTime) / 1000);

    const h = String(Math.floor(focasElapsed / 3600)).padStart(2, "0");
    const m = String(Math.floor((focasElapsed % 3600) / 60)).padStart(2, "0");
    const s = String(focasElapsed % 60).padStart(2, "0");

    document.getElementById("timer").innerText = `${h}:${m}:${s}`;
}

// -------------------------
// 타이머 시작
// -------------------------
function startFokasTimer() {
    fokasTimer.interval = setInterval(updateTimer, 1000);
}

// -------------------------
// 타이머 종료 & 저장
// -------------------------
function stopFokasTimer() {
    clearInterval(fokasTimer.interval);

    const nowSec = Math.floor((Date.now() - fokasTimer.startTime) / 1000);

    // 오늘 누적 저장
    saveFocusTime(fokasTimer.room, nowSec);
}

// -------------------------
// Room 진입 시 호출
// -------------------------
function initFokasTimer(roomName) {
    fokasTimer.room = roomName;

    // 오늘 이미 저장된 초 가져오기
    const existing = getTodayRoomSeconds(roomName);

    // 기존 시간 유지하려면 → startTime을 과거로 설정
    fokasTimer.startTime = Date.now() - (existing * 1000);

    // === 여기 추가 ===
    updateTimer();  // 처음 로드시 즉시 UI 업데이트 (깜박임 방지)
    // =================

    // 시작
    startFokasTimer();

    // 종료 시 자동 저장
    window.addEventListener("beforeunload", stopFokasTimer);
}

// ============================
//  Visibility Mode (탭 숨김 감지)
// ============================
document.addEventListener("visibilitychange", () => {
    const mode = localStorage.getItem("fokas_setting_track") || "open";

    if (mode === "visible") {
        if (document.hidden) {
            // 탭 숨김 → 타이머 일시정지
            clearInterval(fokasTimer.interval);
            fokasTimer.interval = null;

        } else {
            // 탭 다시 보임 → 타이머 재시작
            if (!fokasTimer.interval) {
                // 현재까지의 경과를 반영하여 다시 시작
                fokasTimer.startTime = Date.now() - (focasElapsed * 1000);
                startFokasTimer();
            }
        }
    }
});
