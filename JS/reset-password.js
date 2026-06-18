// ========================================
// CONFIG
// ========================================

const RESET_URL =
  "https://n8n-35yaee339qxb.jkt6.sumopod.my.id/webhook/68dd28ea-c896-404b-bb35-4376ef6dde29";

lucide.createIcons();

// ========================================
// TOKEN
// ========================================

const token = new URLSearchParams(window.location.search).get("token");

// ========================================
// ELEMENTS
// ========================================

const resetForm = document.getElementById("resetForm");

const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");

const resetBtn = document.getElementById("resetBtn");

const alertBox = document.getElementById("alertBox");

// ========================================
// ALERT
// ========================================

function showAlert(type, message) {
  alertBox.classList.remove("hidden");

  if (type === "success") {
    alertBox.className =
      "mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 px-4 py-3 text-sm";
  } else {
    alertBox.className =
      "mt-6 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 px-4 py-3 text-sm";
  }

  alertBox.textContent = message;
}

// ========================================
// ERROR
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

newPassword.addEventListener("input", () => {
  clearError("newPassword");
});

confirmPassword.addEventListener("input", () => {
  clearError("confirmPassword");
});

// ========================================
// PASSWORD TOGGLE
// ========================================

function setupToggle(buttonId, inputId, iconId) {
  const button = document.getElementById(buttonId);
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);

  button.addEventListener("click", () => {
    const hidden = input.type === "password";

    input.type = hidden ? "text" : "password";

    icon.setAttribute("data-lucide", hidden ? "eye-off" : "eye");

    lucide.createIcons();
  });
}

setupToggle("toggleNewPassword", "newPassword", "newPasswordIcon");

setupToggle("toggleConfirmPassword", "confirmPassword", "confirmPasswordIcon");

// ========================================
// LOADING
// ========================================

function setLoading(state) {
  resetBtn.disabled = state;

  if (state) {
    resetBtn.innerHTML = `
      <div class="flex items-center gap-2">
        <svg
          class="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24">

          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
            class="opacity-25">
          </circle>

          <path
            fill="currentColor"
            class="opacity-75"
            d="M4 12a8 8 0 018-8v8H4z">
          </path>

        </svg>

        <span>Menyimpan...</span>
      </div>
    `;
  } else {
    resetBtn.innerHTML = `
      <i data-lucide="save" class="w-5 h-5"></i>
      <span id="btnText">Simpan Password</span>
    `;

    lucide.createIcons();
  }
}

// ========================================
// SUBMIT
// ========================================

resetForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  clearError("newPassword");
  clearError("confirmPassword");

  if (!token) {
    showAlert("error", "Token reset password tidak ditemukan.");
    return;
  }

  const password = newPassword.value.trim();
  const confirm = confirmPassword.value.trim();

  let valid = true;

  if (password.length < 6) {
    showError("newPassword", "Password minimal 6 karakter.");
    valid = false;
  }

  if (password !== confirm) {
    showError("confirmPassword", "Konfirmasi password tidak cocok.");
    valid = false;
  }

  if (!valid) return;

  setLoading(true);

  try {
    const response = await fetch(RESET_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        password,
      }),
    });

    const data = await response.json().catch(() => null);

    if (response.ok) {
      showAlert("success", data?.message || "Password berhasil diubah.");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    } else {
      showAlert(
        "error",
        data?.message || "Token tidak valid atau sudah kadaluarsa.",
      );
    }
  } catch (error) {
    console.error(error);

    showAlert("error", "Tidak dapat terhubung ke server.");
  } finally {
    setLoading(false);
  }
});
