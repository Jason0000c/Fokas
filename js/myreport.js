function formatHHMM(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

const WEEK_LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

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

/* Theme Color */
function getThemeColors() {
    const dark = document.documentElement.classList.contains("dark-mode");
    return dark
        ? { bar:"#4fc3f7", text:"#ccc", grid:"rgba(255,255,255,0.1)" }
        : { bar:"#2196f3", text:"#333", grid:"rgba(0,0,0,0.1)" };
}

let weeklyChart = null;

function drawWeeklyChart() {
    const totalsSec = getWeeklyTotalsSunSat();
    const totalsMin = totalsSec.map(sec => sec / 60);
    const theme = getThemeColors();

    const maxMin = Math.max(...totalsMin, 0);

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
                padding: { top: 24 }
            },
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
                    grid: { display:false }
                },
                y: {
                    min: 0,
                    max: yMax,
                    ticks: {
                        color: theme.text,
                        font: { size: 12 },
                        callback: v => {
                            const sec = v * 60;
                            return formatHHMM(sec);
                        }
                    },
                    grid: { color: theme.grid }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function updateWeeklyRange() {
    const now = new Date();
    const day = now.getDay(); // 0=Sun, 1=Mon ...

    // Get Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((day + 6) % 7));

    // Sunday
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    // English month names
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Format: February 10
    const fmt = d => `${months[d.getMonth()]} ${d.getDate()}`;

    document.getElementById("weekly-range").textContent =
        `Weekly Activity (${fmt(monday)} – ${fmt(sunday)})`;
}

updateWeeklyRange();
drawWeeklyChart();