// src/screens/Inbox.tsx
import React, { useState } from "react";
import {
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { PALETTE } from "../theme";
import { useVocab } from "../vocab";
import EntryCard from "../components/EntryCard";

const TARGET_LANG_LABEL = "English (US)";

type StatusFilter = "all" | "new" | "learning" | "longterm";
type TypeFilter = "both" | "word" | "sentence";

export default function InboxScreen() {
  const { t } = useTranslation();
  const ctx = useVocab();

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("both");

  const byStatus =
    statusFilter === "all"
      ? ctx.items
      : ctx.items.filter((it) => it.status === statusFilter);
  const byType =
    typeFilter === "both"
      ? byStatus
      : byStatus.filter((it) => it.type === typeFilter);

  const qNorm = q.trim().toLowerCase();
  const data =
    qNorm.length === 0
      ? byType
      : byType.filter((it) => {
          const hay = (it.text + " " + (it.translation ?? "")).toLowerCase();
          return hay.includes(qNorm);
        });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        {t("inbox.title", { lang: TARGET_LANG_LABEL })}
      </Text>

      {/* Suche */}
      <View style={styles.searchWrap}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder={t("inbox.searchPlaceholder")}
          placeholderTextColor="#9aa3a7"
          style={styles.searchInput}
          returnKeyType="search"
          clearButtonMode="while-editing" // iOS
        />
        {q.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={() => setQ("")}>
            <Text style={styles.clearTxt}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter: Status */}
      <View style={styles.filterRow}>
        {(["all", "new", "learning", "longterm"] as StatusFilter[]).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setStatusFilter(f)}
            style={[styles.chip, statusFilter === f && styles.chipActive]}
          >
            <Text
              style={[
                styles.chipText,
                statusFilter === f && styles.chipTextActive,
              ]}
            >
              {t(`inbox.filters.${f}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter: Typ */}
      <View style={styles.filterRow}>
        {(["both", "word", "sentence"] as TypeFilter[]).map((tType) => (
          <TouchableOpacity
            key={tType}
            onPress={() => setTypeFilter(tType)}
            style={[styles.chip, typeFilter === tType && styles.chipActive]}
          >
            <Text
              style={[
                styles.chipText,
                typeFilter === tType && styles.chipTextActive,
              ]}
            >
              {t(
                tType === "both"
                  ? "inbox.filters.both"
                  : tType === "word"
                  ? "inbox.filters.word"
                  : "inbox.filters.sentence"
              )}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 96 }}
        renderItem={({ item }) => (
          <EntryCard item={item} onPress={() => ctx.cycleStatus(item.id)} />
        )}
        ListEmptyComponent={
          <Text style={{ color: PALETTE.paper, opacity: 0.7, paddingTop: 24 }}>
            {t("inbox.empty")}
          </Text>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={ctx.addDummy}>
        <Text style={styles.fabText}>{t("inbox.add")}</Text>
      </TouchableOpacity>
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
    marginBottom: 12,
  },

  // Suche
  searchWrap: { marginBottom: 12, position: "relative" },
  searchInput: {
    backgroundColor: PALETTE.paper,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: PALETTE.silver,
    color: PALETTE.blackSteel,
    paddingRight: 36, // Platz für das X
  },
  clearBtn: {
    position: "absolute",
    right: 8,
    top: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  clearTxt: { color: PALETTE.silver, fontSize: 18, lineHeight: 18 },

  // Filter-Leisten
  filterRow: { flexDirection: "row", marginBottom: 12 },
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

  // FAB
  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
    backgroundColor: PALETTE.goldLeaf,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: { color: PALETTE.blackSteel, fontWeight: "700" },
});
