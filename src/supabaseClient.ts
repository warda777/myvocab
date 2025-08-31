// src/supabaseClient.ts
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from "@supabase/supabase-js";

const PROJECT_URL = "https://naplllscmpqexahxtbwg.supabase.co";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcGxsbHNjbXBxZXhhaHh0YndnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMTYxNDUsImV4cCI6MjA3MTc5MjE0NX0.LGWHQnsahkEyOxsIGVLZW7igzkhCjdwdoJsZseIe3fo";

export const supabase = createClient(PROJECT_URL, ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export async function ensureSignedIn() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) return;

  const email = process.env.EXPO_PUBLIC_SUPABASE_EMAIL;
  const password = process.env.EXPO_PUBLIC_SUPABASE_PASSWORD;

  if (!email || !password) {
    console.log('No Supabase dev credentials set – skipping auto sign-in.');
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}
// Volltextsuche über die generierte 'fts'-Spalte
export async function searchEntries(
  query: string,
  opts?: { lang?: string; limit?: number }
) {
  let q = supabase
    .from("entries")
    .select(
      "id, term, lang, context, translation_de, synonyms_en, created_at, updated_at"
    ) // ← erweitert
    .textSearch("fts", query, { type: "plain", config: "simple" })
    .order("created_at", { ascending: false })
    .limit(opts?.limit ?? 20);

  if (opts?.lang) q = q.eq("lang", opts.lang);

  const { data, error } = await q;
  if (error) throw error;
  return data;
}
export async function recentEntries(opts?: { lang?: string; limit?: number }) {
  let q = supabase
    .from("entries")
    .select(
      "id, term, lang, context, translation_de, synonyms_en, created_at, updated_at"
    )
    .order("created_at", { ascending: false })
    .limit(opts?.limit ?? 20);

  if (opts?.lang) q = q.eq("lang", opts.lang);

  const { data, error } = await q;
  if (error) throw error;
  return data;
}
