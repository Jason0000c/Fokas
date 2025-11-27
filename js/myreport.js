/* ===============================
    1) HH:MM 포맷
================================*/
function formatHHMM(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

const WEEK_LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

/* 최근 7일 */
function getLast7Dates() {
    const arr = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        let d = new Date(today);
        d.setDate(today.getDate() - i);
        arr.push(d.toISOString().slice(0,10));
    }
    return arr;
}

/* 모든 room 합산 */
function getWeeklyTotalsSunSat() {
    const dates = getLast7Dates();
    const keys = Object.keys(localStorage).filter(k => k.startsWith("fokas_history_"));

    let weekly = { Sun:0, Mon:0, Tue:0, Wed:0, Thu:0, Fri:0, Sat:0 };

    keys.forEach(key => {
        const data = JSON.parse(localStorage.getItem(key) || "{}");
        dates.forEach(date => {
            let wd = WEEK_LABELS[new Date(date).getDay()];
            if (data[date]) weekly[wd] += data[date];
        });
    });

    return WEEK_LABELS.map(d => weekly[d]);
}

/* 테마 색 */
function getThemeColors() {
    const dark = document.documentElement.classList.contains("dark-mode");
    return dark
        ? { bar:"#4fc3f7", text:"#ccc", grid:"rgba(255,255,255,0.1)" }
        : { bar:"#2196f3", text:"#333", grid:"rgba(0,0,0,0.1)" };
}

let weeklyChart = null;

function drawWeeklyChart() {
    const totalsSec = getWeeklyTotalsSunSat();          // 각 요일별 총 초
    const totalsMin = totalsSec.map(sec => sec / 60);   // 그래프는 분 단위로 표시
    const theme = getThemeColors();

    const maxMin = Math.max(...totalsMin, 0);
    // 최대값 기준으로 여유 있게 y축 잡기 (5분 단위 올림 + 살짝 여유)
    const yMaxBase = Math.max(1, Math.ceil(maxMin / 5) * 5);
    const yMax = yMaxBase * 1.2;

    if (weeklyChart) weeklyChart.destroy();

    const ctx = document.getElementById("weeklyChart");

    weeklyChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: WEEK_LABELS,
            datasets: [{
                data: totalsMin,
                backgroundColor: theme.bar
            }]
        },
        options: {
            maintainAspectRatio: false,
            layout: {
                padding: { top: 24 }   // 🔥 위에 여백 추가 → 숫자 커도 안 잘림
            },
            plugins: {
                legend: { display:false },

                // 막대 위에 HH:MM 크게 표시
                datalabels: {
                    color: theme.text,
                    anchor: "end",
                    align: "end",
                    clamp: true,     // 차트 밖으로 안 튀게
                    clip: false,
                    offset: -4,      // 살짝 위로
                    formatter: (val, ctx) => formatHHMM(totalsSec[ctx.dataIndex]),
                    font: { size: 16 }  // 숫자 키우고 싶으면 여기 조절
                },

                // 툴팁 완전 OFF
                tooltip: { enabled:false }
            },
            scales: {
                x: {
                    ticks: { color: theme.text, font:{ size:14 } },
                    grid: { display:false }
                },
                y: {
                    min: 0,
                    max: yMax,
                    ticks: {
                        color: theme.text,
                        font: { size: 12 },
                        // 옆 숫자도 00h 00m 형식으로
                        callback: v => {
                            const sec = v * 60;       // 분 → 초로 바꿔서
                            return formatHHMM(sec);   // HH:MM 로 표기
                        }
                    },
                    grid: { color: theme.grid }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

document.addEventListener("DOMContentLoaded", drawWeeklyChart);
new MutationObserver(drawWeeklyChart)
    .observe(document.documentElement, { attributes:true, attributeFilter:["class"] });
