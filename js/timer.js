// =========================
// FOKAS TIMER SYSTEM
// =========================

// 전역 경과시간(초) – 여러 군데에서 쓰이니까 명시적으로 선언
let focasElapsed = 0;

let fokasTimer = {
    startTime: null,   // Date.now() 기준 ms
    interval: null,
    room: null
};

// -------------------------
// Room 데이터 가져오기
// -------------------------
function getTodayRoomSeconds(room) {
    const today = new Date().toISOString().slice(0, 10);
    const data = JSON.parse(localStorage.getItem(`fokas_history_${room}`) || "{}");

    if (!data[today]) {
        data[today] = 0;
        localStorage.setItem(`fokas_history_${room}`, JSON.stringify(data));
    }

    return data[today];
}

// -------------------------
// 초 저장 (오늘 누적 초 저장)
// -------------------------
function saveFocusTime(room, seconds) {
    const today = new Date().toISOString().slice(0, 10);
    let data = JSON.parse(localStorage.getItem(`fokas_history_${room}`) || "{}");

    data[today] = seconds;
    localStorage.setItem(`fokas_history_${room}`, JSON.stringify(data));
}

// -------------------------
// 타이머 UI 업데이트 (+ 매초 저장)
// -------------------------
function updateTimer() {
    // 타이머가 아직 시작 안 됐거나, room 정보가 없으면 아무것도 안 함
    if (!fokasTimer.startTime || !fokasTimer.room) return;

    const now = Date.now();
    focasElapsed = Math.floor((now - fokasTimer.startTime) / 1000);

    // ★ 매초 현재까지의 누적 시간을 localStorage에 저장
    saveFocusTime(fokasTimer.room, focasElapsed);

    const h = String(Math.floor(focasElapsed / 3600)).padStart(2, "0");
    const m = String(Math.floor((focasElapsed % 3600) / 60)).padStart(2, "0");
    const s = String(focasElapsed % 60).padStart(2, "0");

    const el = document.getElementById("timer");
    if (el) el.innerText = `${h}:${m}:${s}`;
}

// -------------------------
// 타이머 시작
// -------------------------
function startFokasTimer() {
    if (fokasTimer.interval) return; // 중복 방지
    fokasTimer.interval = setInterval(updateTimer, 1000);
}

// -------------------------
// 타이머 종료 & 저장
// -------------------------
function stopFokasTimer() {
    if (fokasTimer.interval) {
        clearInterval(fokasTimer.interval);
        fokasTimer.interval = null;
    }
    if (!fokasTimer.startTime || !fokasTimer.room) return;

    const totalSec = Math.floor((Date.now() - fokasTimer.startTime) / 1000);
    focasElapsed = totalSec;
    saveFocusTime(fokasTimer.room, totalSec);
}

// -------------------------
// Room 진입 시 호출
// -------------------------
function initFokasTimer(roomName) {
    fokasTimer.room = roomName;

    // 오늘 이미 저장된 초 가져오기
    const existing = getTodayRoomSeconds(roomName);
    focasElapsed = existing;

    // 기존 시간 포함해서 startTime을 과거로 세팅
    fokasTimer.startTime = Date.now() - (existing * 1000);

    // 처음 로드 시 UI 1번 업데이트
    updateTimer();

    // 타이머 시작
    startFokasTimer();

    // 종료 시 자동 저장 (PC 위주, 모바일은 보조 정도로 생각)
    window.addEventListener("beforeunload", stopFokasTimer);
}

// ============================
//  Visibility Mode (탭 숨김 감지)
// ============================
document.addEventListener("visibilitychange", () => {
    const mode = localStorage.getItem("fokas_setting_track") || "open";

    if (mode === "visible") {
        if (document.hidden) {
            // 탭 숨김 → 현재까지 시간 저장 + 타이머 일시정지
            if (fokasTimer.startTime && fokasTimer.room) {
                const nowSec = Math.floor((Date.now() - fokasTimer.startTime) / 1000);
                focasElapsed = nowSec;
                saveFocusTime(fokasTimer.room, nowSec);
            }
            if (fokasTimer.interval) {
                clearInterval(fokasTimer.interval);
                fokasTimer.interval = null;
            }
        } else {
            // 탭 다시 보임 → 저장된 focasElapsed 기준으로 재시작
            if (!fokasTimer.interval && fokasTimer.room) {
                fokasTimer.startTime = Date.now() - (focasElapsed * 1000);
                startFokasTimer();
            }
        }
    }
});
