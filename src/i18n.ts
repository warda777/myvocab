// src/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

const deviceLang = (
  Localization.getLocales?.()[0]?.languageTag?.split("-")[0] ?? "en"
).toLowerCase();

const resources = {
  en: {
    translation: {
      tabs: { inbox: "Inbox", learn: "Learn", settings: "Settings" },
      inbox: {
        tags: { all: "All tags" }, // EN
        title: "Inbox · {{lang}}",
        searchPlaceholder: "Search…",
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
        addDialog: {
          title: "Add entry",
          textLabel: "Text",
          translationLabel: "Translation (optional)",
          textPh: "e.g. order",
          translationPh: "e.g. Bestellung",
          cancel: "Cancel",
          save: "Save",
          tagsLabel: "Tags (comma-separated)",
          tagsPh: "e.g. travel, restaurant",
        },
      },
      learn: {
        title: "Learn",
        show: "Show translation",
        hide: "Hide",
        next: "Next",
        hint: "Tap “Show translation”",
        empty: "No entries.",
      },
      settings: {
        title: "Settings",
        language: "Language",
        note: "Note: Titles update immediately. Tab texts may update after reopening — we’ll improve that.",
      },
    },
  },
  de: {
    translation: {
      tabs: { inbox: "Inbox", learn: "Lernen", settings: "Einstellungen" },
      inbox: {
        tags: { all: "Alle Tags" }, // DE
        title: "Inbox · {{lang}}",
        searchPlaceholder: "Suche…",
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
        addDialog: {
          title: "Eintrag hinzufügen",
          textLabel: "Text",
          translationLabel: "Übersetzung (optional)",
          textPh: "z. B. bestellen",
          translationPh: "z. B. order",
          cancel: "Abbrechen",
          save: "Speichern",
          tagsLabel: "Tags (kommagetrennt)",
          tagsPh: "z. B. Reisen, Restaurant",
        },
      },
      learn: {
        title: "Lernen",
        show: "Übersetzung zeigen",
        hide: "Ausblenden",
        next: "Nächstes",
        hint: "Tippe auf „Übersetzung zeigen“",
        empty: "Keine Einträge.",
      },
      settings: {
        title: "Einstellungen",
        language: "Sprache",
        note: "Hinweis: Titel aktualisieren sofort. Tab-Texte können sich erst nach erneutem Öffnen aktualisieren – das verbessern wir noch.",
      },
    },
  },
  es: {
    translation: {
      tabs: { inbox: "Bandeja", learn: "Aprender", settings: "Ajustes" },
      inbox: {
        tags: { all: "Todas las etiquetas" }, // ES
        title: "Bandeja · {{lang}}",
        searchPlaceholder: "Buscar…",
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
        addDialog: {
          title: "Añadir elemento",
          textLabel: "Texto",
          translationLabel: "Traducción (opcional)",
          textPh: "p. ej., ordenar",
          translationPh: "p. ej., pedido",
          cancel: "Cancelar",
          save: "Guardar",
          tagsLabel: "Etiquetas (separadas por comas)",
          tagsPh: "p. ej., viaje, restaurante",
        },
      },
      learn: {
        title: "Aprender",
        show: "Mostrar traducción",
        hide: "Ocultar",
        next: "Siguiente",
        hint: "Toca “Mostrar traducción”",
        empty: "No hay elementos.",
      },
      settings: {
        title: "Ajustes",
        language: "Idioma",
        note: "Nota: Los títulos se actualizan al instante. Los textos de pestañas pueden actualizarse al reabrir — lo mejoraremos.",
      },
    },
  },
} as const;

i18n
  .use(initReactI18next)
  .init({
    lng: deviceLang,
    fallbackLng: "en",
    resources,
    interpolation: { escapeValue: false },
  })
  .catch(() => {});

export default i18n;
