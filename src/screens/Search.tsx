import React, { useEffect, useState } from "react";
import { supabase, searchEntries, recentEntries } from "../supabaseClient";

type Entry = {
  id: string;
  term: string;
  lang: string;
  context: string | null;
  translation_de?: string | null; // ← neu
  synonyms_en?: string[] | null; // ← neu
  created_at: string;
  updated_at: string | null;
};

// Kleine Unter-Komponente für eine Trefferzeile (mit Aufklappen)
function EntryRow({ e }: { e: Entry }) {
  const [open, setOpen] = React.useState(false);
  return (
    <li
      key={e.id}
      style={{
        padding: "10px 8px",
        borderBottom: "1px solid #eee",
        cursor: "pointer",
      }}
      onClick={() => setOpen((v) => !v)}
      title="Klicken zum Ein-/Ausklappen"
    >
      <div style={{ fontWeight: 700 }}>
        {e.term} <span style={{ opacity: 0.6 }}>[{e.lang}]</span>
      </div>
      {e.translation_de && (
        <div style={{ marginTop: 2 }}>
          <span style={{ fontSize: 13, opacity: 0.7 }}>DE:</span>{" "}
          <span>{e.translation_de}</span>
        </div>
      )}
      {e.context && (
        <div style={{ fontSize: 13, opacity: 0.7 }}>{e.context}</div>
      )}
      <div style={{ fontSize: 12, opacity: 0.6 }}>
        {new Date(e.created_at).toLocaleString()}
      </div>

      {/* Synonyme einklappen */}
      {open && (
        <div style={{ marginTop: 6, fontSize: 14 }}>
          <div style={{ opacity: 0.7, marginBottom: 2 }}>Synonyms</div>
          {e.synonyms_en && e.synonyms_en.length > 0 ? (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {e.synonyms_en.map((s) => (
                <span
                  key={s}
                  style={{
                    padding: "2px 6px",
                    border: "1px solid #ddd",
                    borderRadius: 12,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <div style={{ opacity: 0.6 }}>keine Synonyme</div>
          )}
        </div>
      )}
    </li>
  );
}

export default function Search() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [query, setQuery] = useState("");
  const [lang, setLang] = useState<string>("");
  const [items, setItems] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setSession(s)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setErr(error.message);
    setLoading(false);
  }
  async function loadRecent() {
    setLoading(true);
    setErr(null);
    try {
      const data = await recentEntries({ lang: lang || undefined, limit: 50 });
      setItems(data ?? []);
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function runSearch() {
    setLoading(true);
    setErr(null);
    try {
      const data = await searchEntries(query, {
        lang: lang || undefined,
        limit: 50,
      });
      setItems(data ?? []);
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session) loadRecent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return (
    <div
      style={{
        padding: 16,
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      {!session && (
        <form onSubmit={signIn} style={{ maxWidth: 420 }}>
          <h2>Sign in</h2>
          <input
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 8 }}
          />
          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 8 }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ padding: "8px 12px" }}
          >
            {loading ? "…" : "Einloggen"}
          </button>
          {err && <p style={{ color: "crimson" }}>{err}</p>}
        </form>
      )}

      {session && (
        <>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <input
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ flex: 1, padding: 10 }}
            />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              style={{ padding: 10 }}
            >
              <option value="">any</option>
              <option value="en">en</option>
              <option value="de">de</option>
            </select>
            <button
              onClick={() => (query.trim() ? runSearch() : loadRecent())}
              disabled={loading}
              style={{ padding: "8px 12px" }}
            >
              {loading ? "…" : query.trim() ? "Search" : "Recent"}
            </button>
          </div>

          {err && <p style={{ color: "crimson" }}>{err}</p>}

          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {items.map((e) => (
              <EntryRow key={e.id} e={e} />
            ))}
            {!loading && items.length === 0 && (
              <li style={{ opacity: 0.7 }}>Keine Treffer</li>
            )}
          </ul>
        </>
      )}
    </div>
  );
}
