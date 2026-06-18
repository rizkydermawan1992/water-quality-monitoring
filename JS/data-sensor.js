const API_URL =
  "https://n8n-35yaee339qxb.jkt6.sumopod.my.id/webhook/b421e689-bab6-4f51-afd1-01d5ad43dfe6";

const API_URL_FILTER =
  "https://n8n-35yaee339qxb.jkt6.sumopod.my.id/webhook/e1ece511-1225-45ce-b14c-a2e31ad89701";

let lastId = 0;
let currentPage = 1;
const rowsPerPage = 7;
let allData = [];
let filteredData = [];
let activeFilter = false;

// ==========================
// LOAD TABLE DATA
// ==========================
async function loadSensorData() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (!Array.isArray(data)) return;

    filteredData = data.filter(
      (item) =>
        item &&
        item.device_id &&
        item.ph_avg != null &&
        item.do_avg != null &&
        item.temp_avg != null &&
        item.device_timestamp,
    );

    allData = [...filteredData];

    renderTable();

    if (filteredData.length > 0) {
      lastId = filteredData[0].id ?? lastId;
    }
  } catch (err) {
    console.error(err);
  }
}
// ====================
//  RENDER TABLE
// ===================

function renderTable() {
  const tbody = document.getElementById("sensorTableBody");
  tbody.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;

  const pageData = filteredData.slice(start, end);

  pageData.forEach((item, index) => {
    tbody.innerHTML += `
      <tr class="border-b border-white/5 hover:bg-white/5 transition">
        <td class="px-4 py-3">${start + index + 1}</td>
        <td class="px-4 py-3">${item.device_id}</td>
        <td class="px-4 py-3 text-center">${item.ph_avg}</td>
        <td class="px-4 py-3 text-center">${item.do_avg}</td>
        <td class="px-4 py-3 text-center">${item.temp_avg}</td>
        <td class="px-4 py-3 text-center">${item.sample_count}</td>
        <td class="px-4 py-3 text-center whitespace-nowrap">
          ${item.device_timestamp}
        </td>
      </tr>
    `;
  });

  renderPagination();
}

// ====================
// RENDER PAGINATION
// ====================
function renderPagination() {
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  document.getElementById("pageInfo").innerText =
    `Page ${currentPage} of ${totalPages}`;
}

function nextPage() {
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderTable();
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
}

async function applyDateFilter() {
  const startDate = document.getElementById("startDate").value;

  const endDate = document.getElementById("endDate").value;

  activeFilter = true;

  if (!startDate || !endDate) {
    alert("Pilih tanggal awal dan akhir");
    return;
  }

  try {
    const response = await fetch(
      `${API_URL_FILTER}?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`,
    );

    const data = await response.json();

    if (!Array.isArray(data)) return;

    allData = data;
    filteredData = [...data];

    currentPage = 1;

    renderTable();
  } catch (err) {
    console.error(err);
  }
}

async function resetFilter() {
  document.getElementById("startDate").value = "";
  document.getElementById("endDate").value = "";

  activeFilter = false;

  currentPage = 1;

  await loadSensorData();
}

// ==========================
// SMART CHECK NEW DATA
// ==========================
async function checkNewData() {
  if (activeFilter) return;
  try {
    const res = await fetch(API_URL + "?last_id=" + lastId);
    const data = await res.json();

    // kalau backend TIDAK support flag, fallback sederhana:
    if (Array.isArray(data) && data.length > 0) {
      loadSensorData();
    }
  } catch (err) {
    console.error("checkNewData error:", err);
  }
}

// ==========================
// AUTO REFRESH
// ==========================
setInterval(checkNewData, 3000);

// initial load
loadSensorData();
