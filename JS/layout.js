if (typeof lucide !== "undefined") {
  lucide.createIcons();
}

// ==========================================
// AUTH CHECK
// ==========================================

const isLoggedIn =
  localStorage.getItem("isLoggedIn") || sessionStorage.getItem("isLoggedIn");

if (isLoggedIn !== "true") {
  window.location.href = "index.html";
}

// ==========================================
// USER INFO
// ==========================================

const username =
  localStorage.getItem("username") ||
  sessionStorage.getItem("username") ||
  "User";

document.getElementById("welcome").textContent = `Selamat Datang, ${username}`;

// ==========================================
// LOGOUT
// ==========================================

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  sessionStorage.clear();

  window.location.href = "index.html";
});

// ==========================================
// MQTT CONFIG
// ==========================================
const MQTT_BROKER = "broker.emqx.io";
const MQTT_PORT = 8084;
const MQTT_URL = `wss://${MQTT_BROKER}:${MQTT_PORT}/mqtt`;
const MQTT_SENSOR_TOPIC = "rizkyproject/wqm_sensor/23454";
const MQTT_STATUS_TOPIC = "rizkyproject/wqm_status/19832";

let mqttConnected = false;
const mqttStatus = document.getElementById("mqttStatus");

// ==========================================
// MQTT CONNECT
// ==========================================

const client = mqtt.connect(MQTT_URL);

client.on("connect", () => {
  console.log("MQTT Connected");

  mqttConnected = true;

  mqttStatus.innerHTML =
    '<span class="h-2 w-2 rounded-full bg-emerald-400"></span> Connected';

  mqttStatus.className =
    "flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm";

  // client.subscribe(MQTT_SENSOR_TOPIC);
  client.subscribe([MQTT_SENSOR_TOPIC, MQTT_STATUS_TOPIC]);
});

client.on("reconnect", () => {
  console.log("MQTT Reconnecting...");

  mqttStatus.innerHTML =
    '<span class="h-2 w-2 rounded-full bg-yellow-400"></span> Reconnecting';

  mqttStatus.className =
    "flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm";
});

client.on("offline", () => {
  mqttConnected = false;

  mqttStatus.innerHTML =
    '<span class="h-2 w-2 rounded-full bg-red-400"></span> Disconnected';

  mqttStatus.className =
    "flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm";
});

client.on("close", () => {
  mqttConnected = false;

  mqttStatus.innerHTML =
    '<span class="h-2 w-2 rounded-full bg-red-400"></span> Disconnected';

  mqttStatus.className =
    "flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm";
});

client.on("error", (error) => {
  console.error("MQTT Error:", error);
});

client.on("message", (topic, message) => {
  const payload = message.toString();

  console.log("Topic:", topic);
  console.log("Payload:", payload);

  // ==========================
  // STATUS ESP32
  // ==========================
  if (topic === MQTT_STATUS_TOPIC) {
    const device_data = JSON.parse(payload);
    updateEsp32Status(device_data.status);

    return;
  }

  // ==========================
  // DATA SENSOR
  // ==========================
  if (topic === MQTT_SENSOR_TOPIC) {
    try {
      const data = JSON.parse(payload);

      updateDashboard(data);
    } catch (error) {
      console.error("Invalid Sensor Payload:", error);
    }
  }
});

// ESP32 STATUS
const esp32Status = document.getElementById("esp32Status");
function updateEsp32Status(status) {
  if (status === "online") {
    esp32Status.innerHTML =
      '<span class="h-2 w-2 rounded-full bg-emerald-400"></span> Online';

    esp32Status.className =
      "flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm";
  } else if (status === "offline") {
    esp32Status.innerHTML =
      '<span class="h-2 w-2 rounded-full bg-red-400"></span> Offline';

    esp32Status.className =
      "flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm";
  } else {
    esp32Status.innerHTML =
      '<span class="h-2 w-2 rounded-full bg-slate-400"></span> Unknown';

    esp32Status.className =
      "flex items-center gap-2 px-4 py-2 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-400 text-sm";
  }
}
