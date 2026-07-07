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
// MQTT CONFIG FROM API
// ==========================================

const MQTT_CONFIG_API = 
"https://n8n-35yaee339qxb.jkt6.sumopod.my.id/webhook/bc9a8ab0-1276-42a7-b11b-6c9311ac30d3";


let MQTT_BROKER;
let MQTT_PORT;
let MQTT_SENSOR_TOPIC;
let MQTT_STATUS_TOPIC;

let client = null;

let mqttConnected = false;

const mqttStatus = document.getElementById("mqttStatus");


// ==========================================
// LOAD MQTT CONFIG
// ==========================================

async function loadMQTTConfig(){

  try {

    const response = await fetch(MQTT_CONFIG_API);

    const config = await response.json();


    MQTT_BROKER = config.broker;
    MQTT_PORT = config.port;
    MQTT_SENSOR_TOPIC = config.sensor_topic;
    MQTT_STATUS_TOPIC = config.status_topic;


    console.log("MQTT CONFIG:", config);
    connectMQTT();


  } catch(error){

    console.error(
      "Gagal mengambil MQTT Config:",
      error
    );

  }

}



// ==========================================
// MQTT CONNECT
// ==========================================

function connectMQTT(){


  const MQTT_URL =
  `wss://${MQTT_BROKER}:${MQTT_PORT}/mqtt`;


  console.log(
    "Connecting:",
    MQTT_URL
  );


  client = mqtt.connect(MQTT_URL);



  client.on("connect",()=>{


    console.log(
      "MQTT Connected"
    );


    mqttConnected = true;



    mqttStatus.innerHTML =
    `
    <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
    Connected
    `;


    mqttStatus.className =
    "flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm";



    client.subscribe(
      [
        MQTT_SENSOR_TOPIC,
        MQTT_STATUS_TOPIC
      ]
    );


  });



  client.on("reconnect",()=>{


    mqttStatus.innerHTML =
    `
    <span class="h-2 w-2 rounded-full bg-yellow-400"></span>
    Reconnecting
    `;


  });



  client.on("offline",()=>{


    mqttConnected=false;


    mqttStatus.innerHTML =
    `
    <span class="h-2 w-2 rounded-full bg-red-400"></span>
    Disconnected
    `;


  });



  client.on("close",()=>{


    mqttConnected=false;


    mqttStatus.innerHTML =
    `
    <span class="h-2 w-2 rounded-full bg-red-400"></span>
    Disconnected
    `;


  });



  client.on("error",(error)=>{


    console.error(
      "MQTT Error:",
      error
    );


  });



  client.on(
    "message",
    handleMQTTMessage
  );


}



// ==========================================
// HANDLE MQTT MESSAGE
// ==========================================

function handleMQTTMessage(topic,message){


  const payload =
  message.toString();


  console.log(
    "Topic:",
    topic
  );


  console.log(
    "Payload:",
    payload
  );



  // ======================
  // ESP32 STATUS
  // ======================

  if(topic === MQTT_STATUS_TOPIC){


    try{


      const device_data =
      JSON.parse(payload);


      updateEsp32Status(
        device_data.status
      );


    }catch(error){

      console.error(
        "Invalid Status Payload",
        error
      );

    }


    return;

  }



  // ======================
  // SENSOR DATA
  // ======================


  if(topic === MQTT_SENSOR_TOPIC){


    try{


      const data =
      JSON.parse(payload);



      updateDashboard(
        data
      );


    }catch(error){


      console.error(
        "Invalid Sensor Payload",
        error
      );


    }


  }


}



// ==========================================
// START
// ==========================================

loadMQTTConfig();

 
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
