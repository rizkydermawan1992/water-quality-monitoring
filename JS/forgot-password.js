lucide.createIcons();

const FORGOT_URL =
  "https://n8n-35yaee339qxb.jkt6.sumopod.my.id/webhook/08ab6576-d1c3-49d8-8ac3-f10b0e34df66";

const form = document.getElementById("forgotForm");
const emailInput = document.getElementById("email");
const emailErr = document.getElementById("email-err");
const submitBtn = document.getElementById("submitBtn");
const alertBox = document.getElementById("alertBox");

const originalBtnHTML = submitBtn.innerHTML;

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

function setLoading(state) {
  submitBtn.disabled = state;

  if (state) {
    submitBtn.innerHTML = `
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
    submitBtn.innerHTML = originalBtnHTML;
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  hideAlert();

  const email = emailInput.value.trim();

  emailErr.classList.add("hidden");

  if (!email) {
    emailErr.classList.remove("hidden");

    emailInput.classList.add("border-red-500", "ring-2", "ring-red-500/20");

    return;
  }

  emailInput.classList.remove("border-red-500", "ring-2", "ring-red-500/20");

  setLoading(true);

  try {
    const response = await fetch(FORGOT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    });

    const data = await response.json().catch(() => null);

    if (response.ok) {
      showAlert(
        "success",
        data?.message ||
          "Jika email terdaftar, link reset password akan dikirim.",
      );

      form.reset();
    } else {
      showAlert(
        "error",
        data?.message || "Gagal mengirim permintaan reset password.",
      );
    }
  } catch (error) {
    console.error(error);

    showAlert(
      "error",
      "Tidak dapat terhubung ke server. Periksa koneksi atau URL webhook.",
    );
  } finally {
    setLoading(false);
  }
});
