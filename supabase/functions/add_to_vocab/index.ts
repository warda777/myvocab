// supabase/functions/add_to_vocab/index.ts
// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PROJECT_URL = Deno.env.get("PROJECT_URL")!;
const ANON_KEY = Deno.env.get("ANON_KEY")!;
const DEEPL_KEY = Deno.env.get("DEEPL_KEY"); // optional

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function translateEnToDe(text: string): Promise<string | null> {
  try {
    if (DEEPL_KEY) {
      const params = new URLSearchParams();
      params.set("auth_key", DEEPL_KEY);
      params.set("text", text);
      params.set("source_lang", "EN");
      params.set("target_lang", "DE");
      const r = await fetch("https://api-free.deepl.com/v2/translate", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
      const j = await r.json();
      const t = j?.translations?.[0]?.text;
      return typeof t === "string" && t.length ? t : null;
    } else {
      // Fallback ohne Key (Rate-Limit möglich)
      const r = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
          text
        )}&langpair=en|de`
      );
      const j = await r.json();
      const t = j?.responseData?.translatedText;
      return typeof t === "string" && t.length ? t : null;
    }
  } catch {
    return null;
  }
}

async function synonymsEn(word: string): Promise<string[]> {
  try {
    const r = await fetch(
      `https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&max=8`
    );
    const arr = await r.json();
    return Array.isArray(arr)
      ? arr.map((o: any) => o.word).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabase = createClient(PROJECT_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { term, lang = "en", context } = await req.json().catch(() => ({}));
    if (!term || typeof term !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing 'term' (string)" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Enrichment vorbereiten (nur wenn EN)
    let translation_de: string | null = null;
    let synonyms_en: string[] = [];
    if (lang.toLowerCase() === "en") {
      [translation_de, synonyms_en] = await Promise.all([
        translateEnToDe(term),
        synonymsEn(term),
      ]);
    }

    // 1) Insert versuchen (gleich mit Übersetzung/Synonymen)
    let { data, error } = await supabase
      .from("entries")
      .insert([
        { user_id: user.id, term, lang, context, translation_de, synonyms_en },
      ])
      .select()
      .single();

    if (!error) {
      return new Response(JSON.stringify({ ok: true, entry: data }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // 2) Bei Duplikat vorhandenen Datensatz anreichern
    if (error.code === "23505") {
      const { data: existing } = await supabase
        .from("entries")
        .select("*")
        .eq("user_id", user.id)
        .ilike("term", term)
        .ilike("lang", lang)
        .single();

      if (existing) {
        const patch: any = {};
        if (context && context !== existing.context) patch.context = context;
        if (!existing.translation_de && translation_de)
          patch.translation_de = translation_de;
        if (
          (!existing.synonyms_en || existing.synonyms_en.length === 0) &&
          synonyms_en.length > 0
        ) {
          patch.synonyms_en = synonyms_en;
        }

        if (Object.keys(patch).length > 0) {
          const { data: updated } = await supabase
            .from("entries")
            .update(patch)
            .eq("id", existing.id)
            .select()
            .single();

          return new Response(
            JSON.stringify({
              ok: true,
              entry: updated ?? existing,
              dedup: true,
              updated: true,
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            }
          );
        }

        return new Response(
          JSON.stringify({ ok: true, entry: existing, dedup: true }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    }

    // 3) Andere Fehler
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
