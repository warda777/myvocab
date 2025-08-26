// src/screens/Settings.tsx
import React from "react";
import { Text, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { PALETTE } from "../theme";

const LANGS = [
  { code: "de", label: "Deutsch" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const current = (i18n.language || "en").split("-")[0];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{t("settings.title")}</Text>

      <Text style={styles.section}>{t("settings.language", "Sprache")}</Text>
      <View style={styles.row}>
        {LANGS.map((l) => (
          <TouchableOpacity
            key={l.code}
            style={[styles.chip, current === l.code && styles.chipActive]}
            onPress={() => i18n.changeLanguage(l.code)}
          >
            <Text
              style={[
                styles.chipText,
                current === l.code && styles.chipTextActive,
              ]}
            >
              {l.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.note}>
        {t(
          "settings.note",
          "Hinweis: Titel aktualisieren sofort. Tab-Texte können sich erst nach erneutem Öffnen aktualisieren – das verbessern wir gleich."
        )}
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.blackSteel,
    paddingTop: 48,
    paddingHorizontal: 16,
  },
  title: {
    color: PALETTE.paper,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
  },
  section: {
    color: PALETTE.paper,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },

  row: { flexDirection: "row", marginBottom: 12 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: PALETTE.silver,
    marginRight: 8,
    backgroundColor: "transparent",
  },
  chipActive: {
    backgroundColor: PALETTE.goldLeaf,
    borderColor: PALETTE.goldLeaf,
  },
  chipText: { color: PALETTE.paper, fontWeight: "600" },
  chipTextActive: { color: PALETTE.blackSteel },

  note: { color: PALETTE.paper, opacity: 0.8 },
});
