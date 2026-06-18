
const API_SETTINGS = "https://n8n-35yaee339qxb.jkt6.sumopod.my.id/webhook/fb52459f-ea21-4674-bcf1-2f2f0a3e5afb";


const API_UPDATE = "https://n8n-35yaee339qxb.jkt6.sumopod.my.id/webhook/5a121907-ee95-4993-9597-592ff665e026";

const userName = sessionStorage.getItem("username"); // ambil username di session

// ==========================
// LOAD INITIAL SETTINGS
// ==========================
async function loadSettings() {
  try {
    const res = await fetch(API_SETTINGS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "get_settings",
        username: userName,
      }),
    });

    const data = await res.json();
    if (!data || typeof data !== "object") return;

    // MQTT
    mqttBroker.value = data.mqtt_broker ?? "";
    mqttPort.value = data.mqtt_port ?? "";
    mqttTopicSensor.value = data.mqtt_topic_sensor ?? "";
    mqttTopicStatus.value = data.mqtt_topic_status ?? "";

    // Telegram
    chatId.value = data.telegram_chat_id ?? "";

    // Threshold
    phMin.value = data.ph_min ?? "";
    phMax.value = data.ph_max ?? "";
    doMin.value = data.do_min ?? "";
    doMax.value = data.do_max ?? "";
    tempMin.value = data.temp_min ?? "";
    tempMax.value = data.temp_max ?? "";
  } catch (err) {
    console.error("Load settings error:", err);
  }
}

// ==========================
// SAVE MQTT
// ==========================
async function saveMQTT() {
  await sendUpdate({
    action: "save_mqtt",
    mqtt_broker: mqttBroker.value,
    mqtt_port: mqttPort.value,
    mqtt_topic_sensor: mqttTopicSensor.value,
    mqtt_topic_status: mqttTopicStatus.value,
  });
}

// ==========================
// CHANGE PASSWORD
// ==========================
async function changePassword() {
  const oldPass = oldPassword.value;
  const newPass = newPassword.value;
  const confirmPass = confirmPassword.value;

  // VALIDASI 1: kosong
  if (!oldPass || !newPass || !confirmPass) {
    alert("Semua field harus diisi!");
    return;
  }

  // VALIDASI 2: password tidak sama
  if (newPass !== confirmPass) {
    alert("New password dan confirm password tidak sama!");
    return;
  }

  // VALIDASI 3: minimal panjang password
  if (newPass.length < 6) {
    alert("Password minimal 6 karakter!");
    return;
  }

  await sendUpdate({
    action: "change_password",
    old_password: oldPass,
    new_password: newPass,
  });

  // reset field setelah sukses
  oldPassword.value = "";
  newPassword.value = "";
  confirmPassword.value = "";
}

// ==========================
// SAVE TELEGRAM
// ==========================
async function saveChatID() {
  await sendUpdate({
    action: "save_telegram",
    telegram_chat_id: chatId.value,
  });
}

// ==========================
// SAVE THRESHOLD
// ==========================
async function saveThreshold() {
  await sendUpdate({
    action: "save_threshold",
    ph_min: phMin.value,
    ph_max: phMax.value,
    do_min: doMin.value,
    do_max: doMax.value,
    temp_min: tempMin.value,
    temp_max: tempMax.value,
  });
}

// ==========================
// GENERIC POST FUNCTION
// ==========================
async function sendUpdate(payload) {
  try {
    const res = await fetch(API_UPDATE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        username: userName,
      }),
    });

    
    const result = await res.json();
    alert(result.message);
  } catch (err) {
    console.error("Save error:", err);
    alert("Failed to update settings");
  }
}

// INIT
loadSettings();
