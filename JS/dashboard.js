// ==========================================
// ELEMENTS
// ==========================================

const phValue = document.getElementById("phValue");
const doValue = document.getElementById("doValue");
const tempValue = document.getElementById("tempValue");

const phStatus = document.getElementById("phStatus");
const doStatus = document.getElementById("doStatus");
const tempStatus = document.getElementById("tempStatus");

// ==========================================
// CHART DEFAULTS
// ==========================================

Chart.defaults.color = "#94a3b8";
Chart.defaults.borderColor = "rgba(148,163,184,0.15)";

// ==========================================
// CREATE CHART
// ==========================================

function createChart(canvasId, label, color) {
  return new Chart(document.getElementById(canvasId), {
    type: "line",

    data: {
      labels: [],
      datasets: [
        {
          label,
          data: [],
          borderColor: color,
          backgroundColor: color,
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 2,
          pointHoverRadius: 5,
          fill: false,
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      animation: {
        duration: 400,
      },

      plugins: {
        legend: {
          display: false,
        },
      },

      scales: {
        x: {
          ticks: {
            maxTicksLimit: 6,
          },
        },

        y: {
          beginAtZero: false,
        },
      },
    },
  });
}

// ==========================================
// CHARTS
// ==========================================

const phChart = createChart("phChart", "pH", "#28d406");
const doChart = createChart("doChart", "Dissolved Oxygen", "#e72020");
const tempChart = createChart("tempChart", "Temperature", "#dc7e13");

// ==========================================
// UPDATE CHART
// ==========================================

function updateChart(chart, value) {
  const time = new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  chart.data.labels.push(time);
  chart.data.datasets[0].data.push(value);

  if (chart.data.labels.length > 20) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }

  chart.update();
}

// ==========================================
// STATUS BADGE
// ==========================================

function setBadge(element, text, style) {
  element.textContent = text;
  element.className = `px-3 py-1 rounded-lg text-xs font-medium ${style}`;
}

// ==========================================
// WATER STATUS
// ==========================================

// Global variables
let phMin, phMax;
let doMin, doMax;
let tempMin, tempMax;

const API_THRESHOLD = "https://n8n-35yaee339qxb.jkt6.sumopod.my.id/webhook/94a1b592-766a-401a-8332-3ead14815dc1";

async function loadThreshold() {
  try {
    const res = await fetch(API_THRESHOLD, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    if (!data || typeof data !== "object") return;

    console.log(data);

    phMin = Number(data.ph_min);
    phMax = Number(data.ph_max);

    doMin = Number(data.do_min);
    doMax = Number(data.do_max);

    tempMin = Number(data.temp_min);
    tempMax = Number(data.temp_max);

  } catch (err) {
    console.error("Load Threshold error:", err);
  }
}

function updateWaterCondition(ph, dissolvedOxygen, temperature) {

  // PH
  if (isNaN(ph)) {
    setBadge(phStatus, "-", "bg-slate-800 text-slate-400");
  } else if (ph < phMin) {
    setBadge(phStatus, "Rendah", "bg-red-500/20 text-red-400");
  } else if (ph > phMax) {
    setBadge(phStatus, "Tinggi", "bg-orange-500/20 text-orange-400");
  } else {
    setBadge(phStatus, "Normal", "bg-emerald-500/20 text-emerald-400");
  }


  // DO
  if (isNaN(dissolvedOxygen)) {
    setBadge(doStatus, "-", "bg-slate-800 text-slate-400");
  } else if (dissolvedOxygen < doMin) {
    setBadge(doStatus, "Rendah", "bg-red-500/20 text-red-400");
  } else if (dissolvedOxygen > doMax) {
    setBadge(doStatus, "Tinggi", "bg-blue-500/20 text-blue-400");
  } else {
    setBadge(doStatus, "Normal", "bg-emerald-500/20 text-emerald-400");
  }

  // Temperature
  if (isNaN(temperature)) {
    setBadge(tempStatus, "-", "bg-slate-800 text-slate-400");
  } else if (temperature < tempMin) {
    setBadge(tempStatus, "Rendah", "bg-blue-500/20 text-blue-400");
  } else if (temperature > tempMax) {
    setBadge(tempStatus, "Tinggi", "bg-orange-500/20 text-orange-400");
  } else {
    setBadge(tempStatus, "Normal", "bg-emerald-500/20 text-emerald-400");
  }
}
// ==========================================
// UPDATE DASHBOARD
// ==========================================

function updateDashboard(data) {
  const ph = parseFloat(data.ph);

  const dissolvedOxygen = parseFloat(data.do);

  const temperature = parseFloat(data.temp);

  phValue.textContent = !isNaN(ph) ? ph.toFixed(2) : "-";

  doValue.textContent = !isNaN(dissolvedOxygen)
    ? dissolvedOxygen.toFixed(2)
    : "-";

  tempValue.textContent = !isNaN(temperature)
    ? `${temperature.toFixed(2)}`
    : "-";

  updateWaterCondition(ph, dissolvedOxygen, temperature);

  if (!isNaN(ph)) {
    updateChart(phChart, ph);
  }

  if (!isNaN(dissolvedOxygen)) {
    updateChart(doChart, dissolvedOxygen);
  }

  if (!isNaN(temperature)) {
    updateChart(tempChart, temperature);
  }
}

// ==========================================
// DUMMY MODE
// Nonaktif otomatis saat MQTT aktif
// ==========================================

// setInterval(() => {
//   updateDashboard({
//     ph: (6 + Math.random() * 3).toFixed(2),
//     do: (4 + Math.random() * 5).toFixed(2),
//     temp: (25 + Math.random() * 5).toFixed(1),
//   });
// }, 1000);

// ==========================================
// INIT
// ==========================================
(async () => {
  await loadThreshold();
  console.log("Threshold selesai dimuat");
})();
updateEsp32Status("unknown");
console.log("Water Quality Monitoring Dashboard Loaded");
