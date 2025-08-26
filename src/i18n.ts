// src/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

// Gerätesprache holen (z. B. "de-DE" -> "de")
const deviceLang = (
  Localization.getLocales?.()[0]?.languageTag?.split("-")[0] ?? "en"
).toLowerCase();

const resources = {
  en: {
    translation: {
      tabs: { inbox: "Inbox", learn: "Learn", settings: "Settings" },
      inbox: {
        searchPlaceholder: "Search…",
        title: "Inbox · {{lang}}",
        filters: {
          all: "All",
          new: "New",
          learning: "Learning",
          longterm: "Long term",
          both: "Both",
          word: "Words",
          sentence: "Sentences",
        },
        empty: "No entries in the current filter.",
        add: "＋ Add word",
      },
      learn: {
        title: "Learn",
        show: "Show translation",
        hide: "Hide",
        next: "Next",
        hint: "Tap “Show translation”",
        empty: "No entries.",
      },
      settings: { title: "Settings" },
    },
  },
  de: {
    translation: {
      tabs: { inbox: "Inbox", learn: "Lernen", settings: "Einstellungen" },
      inbox: {
        searchPlaceholder: "Suche…",
        title: "Inbox · {{lang}}",
        filters: {
          all: "Alle",
          new: "Neu",
          learning: "Lernen",
          longterm: "Langzeit",
          both: "Beides",
          word: "Wörter",
          sentence: "Sätze",
        },
        empty: "Keine Einträge im aktuellen Filter.",
        add: "＋ Wort hinzufügen",
      },
      learn: {
        title: "Lernen",
        show: "Übersetzung zeigen",
        hide: "Ausblenden",
        next: "Nächstes",
        hint: "Tippe auf „Übersetzung zeigen“",
        empty: "Keine Einträge.",
      },
      settings: { title: "Einstellungen" },
    },
  },
  es: {
    translation: {
      tabs: { inbox: "Bandeja", learn: "Aprender", settings: "Ajustes" },
      inbox: {
        searchPlaceholder: "Buscar…",
        title: "Bandeja · {{lang}}",
        filters: {
          all: "Todos",
          new: "Nuevo",
          learning: "En aprendizaje",
          longterm: "Largo plazo",
          both: "Ambos",
          word: "Palabras",
          sentence: "Frases",
        },
        empty: "No hay elementos en el filtro actual.",
        add: "＋ Añadir palabra",
      },
      learn: {
        title: "Aprender",
        show: "Mostrar traducción",
        hide: "Ocultar",
        next: "Siguiente",
        hint: "Toca “Mostrar traducción”",
        empty: "No hay elementos.",
      },
      settings: { title: "Ajustes" },
    },
  },
} as const;

i18n
  .use(initReactI18next)
  .init({
    lng: deviceLang, // Gerätesprache verwenden
    fallbackLng: "en", // Fallback: Englisch
    resources,
    interpolation: { escapeValue: false },
  })
  .catch(() => {
    /* noop */
  });

export default i18n;
