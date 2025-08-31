// options.js – speichert Login-Daten in chrome.storage.local
const emailEl = document.getElementById("email");
const passEl  = document.getElementById("password");
const saveBtn = document.getElementById("save");
const clearBtn= document.getElementById("clear");
const status  = document.getElementById("status");

function show(msg, ok=true) {
  status.textContent = msg;
  status.className = ok ? "muted ok" : "muted err";
}

document.addEventListener("DOMContentLoaded", async () => {
  const { sb_email, sb_password } = await chrome.storage.local.get(["sb_email", "sb_password"]);
  if (sb_email) emailEl.value = sb_email;
  if (sb_password) passEl.value = sb_password;
});

saveBtn.addEventListener("click", async () => {
  const email = (emailEl.value || "").trim();
  const password = passEl.value || "";
  if (!email || !password) {
    show("Bitte E-Mail und Passwort eingeben.", false);
    return;
  }
  await chrome.storage.local.set({
    sb_email: email,
    sb_password: password,
    // Tokens invalidieren, damit der Service Worker neu einloggt:
    access_token: null,
    refresh_token: null,
    expires_at: 0
  });
  show("Gespeichert. Beim nächsten Aufruf wird automatisch ein neues Token geholt.");
});

clearBtn.addEventListener("click", async () => {
  await chrome.storage.local.set({
    access_token: null,
    refresh_token: null,
    expires_at: 0
  });
  show("Tokens gelöscht. Beim nächsten Speichern oder Aufruf wird neu eingeloggt.");
});
