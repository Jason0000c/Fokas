// ===============================
//  Weekly Chart (Report page)
// ===============================

function formatHHMM(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

const WEEK_LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// 🔧 Local YYYY-MM-DD → Local Date object
function parseLocalDate(str) {
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
}

// Local → YYYY-MM-DD
function toLocalDateString(d) {
    const y   = d.getFullYear();
    const mon = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${mon}-${day}`;
}

// 🔧 Last 7 days (local)
function getLast7Dates() {
    const arr = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        arr.push(toLocalDateString(d));
    }
    return arr;
}

// 🔧 Sunday ~ Saturday weekly totals
function getWeeklyTotalsSunSat() {
    const dates = getLast7Dates();
    const keys  = Object.keys(localStorage).filter(k => k.startsWith("fokas_history_"));

    const weekly = { Sun:0, Mon:0, Tue:0, Wed:0, Thu:0, Fri:0, Sat:0 };

    keys.forEach(key => {
        let data;
        try {
            data = JSON.parse(localStorage.getItem(key) || "{}");
        } catch (e) {
            console.error("[FOKAS] Weekly parse error:", key, e);
            data = {};
        }

        dates.forEach(date => {
            if (!data[date]) return;

            const wd = WEEK_LABELS[parseLocalDate(date).getDay()];
            weekly[wd] += data[date];
        });
    });

    return WEEK_LABELS.map(d => weekly[d]);
}

// theme colors
function getThemeColors() {
    const dark = document.documentElement.classList.contains("dark-mode");
    return dark
        ? { bar:"#4fc3f7", text:"#ccc", grid:"rgba(255,255,255,0.1)" }
        : { bar:"#2196f3", text:"#333", grid:"rgba(0,0,0,0.1)" };
}

let weeklyChart = null;

// ===============================
// Draw Weekly Chart
// ===============================
function drawWeeklyChart() {
    const canvas = document.getElementById("weeklyChart");
    if (!canvas || typeof Chart === "undefined") return;

    const totalsSec = getWeeklyTotalsSunSat();   // local-based Sunday~Saturday
    const totalsMin = totalsSec.map(sec => sec / 60);
    const theme = getThemeColors();

    const maxMin   = Math.max(...totalsMin, 0);
    const yMaxBase = Math.max(1, Math.ceil(maxMin / 5) * 5);
    const yMax     = yMaxBase * 1.2;

    if (weeklyChart) weeklyChart.destroy();

    const ctx = canvas.getContext("2d");

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
            layout: { padding: { top: 24 } },
            plugins: {
                legend: { display:false },
                datalabels: {
                    color: theme.text,
                    anchor: "end",
                    align: "end",
                    clamp: true,
                    clip: false,
                    offset: -4,
                    formatter: (val, ctx) => formatHHMM(totalsSec[ctx.dataIndex]),
                    font: { size: 16 }
                },
                tooltip: { enabled:false }
            },
            scales: {
                x: {
                    ticks: { color: theme.text, font:{ size:14 } },
                    grid:  { display:false }
                },
                y: {
                    min: 0,
                    max: yMax,
                    ticks: {
                        color: theme.text,
                        font: { size: 12 },
                        callback: v => formatHHMM(v * 60)
                    },
                    grid: { color: theme.grid }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// ===============================
// Weekly Range (Sun → Sat)
// ===============================
function updateWeeklyRange() {
    const label = document.getElementById("weekly-range");
    if (!label) return;

    const now = new Date();
    const day = now.getDay(); // Sunday=0

    const sunday = new Date(now);
    sunday.setDate(now.getDate() - day);
    sunday.setHours(0, 0, 0, 0);

    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);

    const months = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ];

    const fmt = d => `${months[d.getMonth()]} ${d.getDate()}`;

    label.textContent = `Weekly Activity (${fmt(sunday)} – ${fmt(saturday)})`;
}

// Init
document.addEventListener("DOMContentLoaded", () => {
    updateWeeklyRange();
    drawWeeklyChart();
});
