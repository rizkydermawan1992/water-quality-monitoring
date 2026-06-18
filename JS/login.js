// ========================================
// KONFIGURASI
// ========================================

lucide.createIcons();

const N8N_WEBHOOK_URL =
  "https://n8n-35yaee339qxb.jkt6.sumopod.my.id/webhook/a7bf179b-7204-4f39-b2be-a98456b8eb83";

// ========================================
// AUTO LOGIN CHECK
// ========================================

const loggedIn =
  localStorage.getItem("isLoggedIn") || sessionStorage.getItem("isLoggedIn");

if (loggedIn === "true") {
  window.location.href = "dashboard.html";
}

// ========================================
// ELEMENT
// ========================================

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const rememberInput = document.getElementById("remember");

const loginBtn = document.getElementById("loginBtn");
const togglePw = document.getElementById("togglePw");

const alertBox = document.getElementById("alertBox");

// ========================================
// PASSWORD TOGGLE
// ========================================

togglePw.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";

  passwordInput.type = isPassword ? "text" : "password";

  togglePw.innerHTML = `
    <i
      data-lucide="${isPassword ? "eye-off" : "eye"}"
      class="w-5 h-5">
    </i>
  `;

  lucide.createIcons();
});

// ========================================
// VALIDATION
// ========================================

function showError(field, message) {
  const input = document.getElementById(field);
  const error = document.getElementById(`${field}-err`);

  input.classList.add("border-red-500", "ring-2", "ring-red-500/20");

  error.textContent = message;
  error.classList.remove("hidden");
}

function clearError(field) {
  const input = document.getElementById(field);
  const error = document.getElementById(`${field}-err`);

  input.classList.remove("border-red-500", "ring-2", "ring-red-500/20");

  error.classList.add("hidden");
}

usernameInput.addEventListener("input", () => {
  clearError("username");
});

passwordInput.addEventListener("input", () => {
  clearError("password");
});

// ========================================
// ALERT
// ========================================

function showAlert(type, message) {
  alertBox.classList.remove("hidden");

  if (type === "success") {
    alertBox.className =
      "mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 px-4 py-3 text-sm";
  } else {
    alertBox.className =
      "mt-5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 px-4 py-3 text-sm";
  }

  alertBox.textContent = message;
}

function hideAlert() {
  alertBox.className = "hidden mt-5 rounded-xl border px-4 py-3 text-sm";

  alertBox.textContent = "";
}

// ========================================
// BUTTON LOADING
// ========================================

function setLoading(isLoading) {
  loginBtn.disabled = isLoading;

  if (isLoading) {
    loginBtn.innerHTML = `
      <div class="flex items-center justify-center gap-2">
        <svg
          class="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24">

          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4">
          </circle>

          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z">
          </path>

        </svg>

        <span>Memproses...</span>
      </div>
    `;
  } else {
    loginBtn.innerHTML = `
      <span>Login</span>
    `;
  }
}

// ========================================
// LOGIN PROCESS
// ========================================

async function login() {
  hideAlert();

  let valid = true;

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  clearError("username");
  clearError("password");

  if (!username) {
    showError("username", "Username tidak boleh kosong");
    valid = false;
  }

  if (!password) {
    showError("password", "Password tidak boleh kosong");
    valid = false;
  }

  if (!valid) return;

  setLoading(true);

  try {
    const payload = {
      username,
      password,
      remember: rememberInput.checked,
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (response.ok) {
      const userName = data?.username || username;

      if (rememberInput.checked) {
        sessionStorage.clear();

        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", userName);
      } else {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("username");

        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("username", userName);
      }

      showAlert(
        "success",
        data?.message || "Login berhasil. Mengarahkan ke dashboard...",
      );

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1500);
    } else {
      showAlert(
        "error",
        data?.message ||
          `Login gagal (${response.status}). Periksa username dan password.`,
      );
    }
  } catch (error) {
    console.error("Login Error:", error);

    showAlert(
      "error",
      "Tidak dapat terhubung ke server. Periksa koneksi internet atau URL webhook n8n.",
    );
  } finally {
    setLoading(false);
  }
}

// ========================================
// EVENT
// ========================================

loginBtn.addEventListener("click", login);

// ENTER KEY
usernameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") login();
});

passwordInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") login();
});

// ========================================
// LOG
// ========================================

console.log("Login page initialized.");
