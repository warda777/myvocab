// background.js (MV3 service worker)
// Kontextmenü "Add to myVocab" + Aufruf deiner Edge Function mit Nutzer-Token (RLS bleibt aktiv)

const PROJECT_URL = "https://naplllscmpqexahxtbwg.supabase.co";
const FUNCTION_URL = `${PROJECT_URL}/functions/v1/add_to_vocab`;
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcGxsbHNjbXBxZXhhaHh0YndnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMTYxNDUsImV4cCI6MjA3MTc5MjE0NX0.LGWHQnsahkEyOxsIGVLZW7igzkhCjdwdoJsZseIe3fo";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "add_to_vocab",
    title: "Add to myVocab",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "add_to_vocab") return;

  const term = (info.selectionText || "").trim();
  if (!term) {
    console.log("Kein Text markiert.");
    return;
  }

  try {
    const token = await getAccessToken();
    if (!token) {
      console.log("Kein Token. Bitte zuerst in den Options anmelden.");
      return;
    }

    const res = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        term,
        lang: "en",
        context: tab?.url || "",
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      throw new Error(data.error || res.statusText);
    }

    console.log(`Gespeichert: "${term}"`);
  } catch (err) {
    console.log("Fehler beim Speichern:", String(err));
  }
});

async function getAccessToken() {
  const keys = [
    "access_token",
    "refresh_token",
    "expires_at",
    "sb_email",
    "sb_password",
  ];
  const { access_token, refresh_token, expires_at, sb_email, sb_password } =
    await chrome.storage.local.get(keys);

  const now = Math.floor(Date.now() / 1000);

  // Gültiges Access Token vorhanden?
  if (access_token && expires_at && now < expires_at - 60) {
    return access_token;
  }

  // Versuche Refresh
  if (refresh_token) {
    const t = await refreshWithRefreshToken(refresh_token);
    if (t) return t;
  }

  // Fallback: Passwort-Login (nachdem du es in den Options gespeichert hast)
  if (sb_email && sb_password) {
    const t = await signInWithPassword(sb_email, sb_password);
    if (t) return t;
  }

  return null;
}

async function signInWithPassword(email, password) {
  const res = await fetch(`${PROJECT_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error_description || data.error || res.statusText);
  }
  await chrome.storage.local.set({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
  });
  return data.access_token;
}

async function refreshWithRefreshToken(refreshToken) {
  const res = await fetch(
    `${PROJECT_URL}/auth/v1/token?grant_type=refresh_token`,
    {
      method: "POST",
      headers: {
        apikey: ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return null;
  await chrome.storage.local.set({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
  });
  return data.access_token;
}
