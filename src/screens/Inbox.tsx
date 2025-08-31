// src/screens/Inbox.tsx
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useMemo, useState } from "react";
import { supabase, recentEntries, ensureSignedIn } from "../supabaseClient";
import {
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { PALETTE } from "../theme";
import { useVocab } from "../vocab";
import EntryCard from "../components/EntryCard";
import { useFocusEffect } from "@react-navigation/native";
import { AppState } from "react-native";
import type { ListRenderItem } from "react-native";

const TARGET_LANG_LABEL = "English (US)";

type StatusFilter = "all" | "new" | "learning" | "longterm";
type TypeFilter = "both" | "word" | "sentence";

export default function InboxScreen() {
  const { t } = useTranslation();
  const ctx = useVocab();

  // ---------------------------
  // Remote (Supabase) Einträge
  // ---------------------------
  type ListItem = (typeof ctx.items)[number];

  type RemoteEntry = {
    id: string;
    term: string;
    lang: string;
    context: string | null;
    translation_de?: string | null;
    synonyms_en?: string[] | null; 
    created_at: string;
  };

  const [remoteItems, setRemoteItems] = useState<RemoteEntry[] | null>(null);
  const [loadingRemote, setLoadingRemote] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      let alive = true;

      (async () => {
        try {
          setLoadingRemote(true);
          await ensureSignedIn();
          const rows = await recentEntries({ lang: "en", limit: 100 });
          if (alive) setRemoteItems(rows as RemoteEntry[]);
        } catch (e) {
          console.error("reload failed", e);
        } finally {
          if (alive) setLoadingRemote(false);
        }
      })();

      return () => {
        alive = false;
      };
    }, [])
  );

  useEffect(() => {
    const sub = AppState.addEventListener("change", async (state) => {
      if (state === "active") {
        try {
          setLoadingRemote(true);
          await ensureSignedIn();
          const rows = await recentEntries({ lang: "en", limit: 100 });
          setRemoteItems(rows as RemoteEntry[]);
        } catch (e) {
          console.error("reload on active failed", e);
        } finally {
          setLoadingRemote(false);
        }
      }
    });
    return () => sub.remove();
  }, []);

  // 1) Reload-Helfer oben im Component hinzufügen
  async function reload() {
    try {
      setLoadingRemote(true);
      await ensureSignedIn();
      const rows = await recentEntries({ lang: "en", limit: 100 });
      setRemoteItems(rows as RemoteEntry[]);
    } catch (e) {
      console.error("reload failed", e);
    } finally {
      setLoadingRemote(false);
    }
  }

  // ---------------------------
  // Lokale Suche & Filter
  // ---------------------------
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("both");
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    for (const it of ctx.items) (it.tags ?? []).forEach((tg) => s.add(tg));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [ctx.items]);

  const byStatus =
    statusFilter === "all"
      ? ctx.items
      : ctx.items.filter((it) => it.status === statusFilter);

  const byType =
    typeFilter === "both"
      ? byStatus
      : byStatus.filter((it) => it.type === typeFilter);

  const byTag =
    tagFilter == null
      ? byType
      : byType.filter((it) => (it.tags ?? []).includes(tagFilter));

  const qNorm = q.trim().toLowerCase();
  const data =
    qNorm.length === 0
      ? byTag
      : byTag.filter((it) => {
          const hay = (it.text + " " + (it.translation ?? "")).toLowerCase();
          return hay.includes(qNorm);
        });

  // ----------------------------------------------------
  // Supabase → lokales Item-Format mappen + Datenquelle
  // ----------------------------------------------------
  const remoteAsLocal: ListItem[] | null =
    remoteItems?.map(
      (e): ListItem => ({
        id: e.id,
        type: e.term.trim().includes(" ") ? "sentence" : "word",
        text: e.term,
        translation: e.translation_de ?? undefined,
        status: "new",
        tags: e.synonyms_en && e.synonyms_en.length > 0
        ? [`${e.synonyms_en.length} syn.`]
        : [],
      })
    ) ?? null;

  const itemsForList: ReadonlyArray<ListItem> =
    remoteAsLocal ?? (data as ListItem[]);

  // ---------------------------
  // Dialog "Neuer Eintrag"
  // ---------------------------
  const [showAdd, setShowAdd] = useState(false);
  const [newType, setNewType] = useState<"word" | "sentence">("word");
  const [newText, setNewText] = useState("");
  const [newTrans, setNewTrans] = useState("");
  const [newTags, setNewTags] = useState("");

  function resetAdd() {
    setNewType("word");
    setNewText("");
    setNewTrans("");
    setNewTags("");
  }

  function saveAdd() {
    const text = newText.trim();
    const translation = newTrans.trim();
    const tags = newTags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!text) return;
    ctx.addEntry({
      type: newType,
      text,
      translation: translation || undefined,
      status: "new",
      tags,
    });
    resetAdd();
    setShowAdd(false);
  }

  async function saveFromClipboard() {
    try {
      setLoadingRemote(true);
      await ensureSignedIn();

      const raw = (await Clipboard.getStringAsync())?.trim();
      if (!raw) {
        alert("Zwischenablage ist leer.");
        return;
      }

      // nimm das erste Wort (ohne Satzzeichen)
      const term = raw.split(/\s+/)[0].replace(/[^\p{L}\p{N}-]/gu, "");
      if (!term) {
        alert("Kein gültiges Wort gefunden.");
        return;
      }

      // 1) In Edge Function speichern (nicht löschen!)
      const { error } = await supabase.functions.invoke("add_to_vocab", {
        body: { term, lang: "en", context: "mobile:clipboard" },
      });
      if (error) throw error;

      // 2) Liste neu laden (einzige Änderung: Typ-Cast)
      const data = await recentEntries({ lang: "en", limit: 100 });
      setRemoteItems(data as RemoteEntry[]);
    } catch (e: any) {
      console.error(e);
      alert(`Fehler beim Speichern: ${e.message || String(e)}`);
    } finally {
      setLoadingRemote(false);
    }
  }

  const renderItem: ListRenderItem<ListItem> = ({ item }) => (
    <EntryCard
      item={item}
      onPress={() => {
        if (ctx.items.some((x) => x.id === item.id)) {
          ctx.cycleStatus(item.id);
        }
      }}
    />
  );

  // ---------------------------
  // Render
  // ---------------------------
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
          clearButtonMode="while-editing"
        />
        {q.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={() => setQ("")}>
            <Text style={styles.clearTxt}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        onPress={saveFromClipboard}
        style={[styles.chip, { alignSelf: "flex-start", marginBottom: 8 }]}
      >
        <Text style={styles.chipText}>Aus Zwischenablage speichern 📋</Text>
      </TouchableOpacity>

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

      {/* NEU: Filter: Tags (nur zeigen, wenn es Tags gibt) */}
      {allTags.length > 0 && (
        <View style={styles.filterRow}>
          <TouchableOpacity
            onPress={() => setTagFilter(null)}
            style={[styles.chip, tagFilter == null && styles.chipActive]}
          >
            <Text
              style={[
                styles.chipText,
                tagFilter == null && styles.chipTextActive,
              ]}
            >
              {t("inbox.tags.all")}
            </Text>
          </TouchableOpacity>
          {allTags.map((tg) => (
            <TouchableOpacity
              key={tg}
              onPress={() => setTagFilter(tg)}
              style={[styles.chip, tagFilter === tg && styles.chipActive]}
            >
              <Text
                style={[
                  styles.chipText,
                  tagFilter === tg && styles.chipTextActive,
                ]}
              >
                {tg}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <FlatList
        style={{ flex: 1 }}
        data={itemsForList as ListItem[]}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 96 }}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ color: PALETTE.paper, opacity: 0.7, paddingTop: 24 }}>
            {t("inbox.empty")}
          </Text>
        }
        refreshing={loadingRemote}
        onRefresh={reload}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowAdd(true)}>
        <Text style={styles.fabText}>{t("inbox.add")}</Text>
      </TouchableOpacity>

      {/* Modal: Neuer Eintrag */}
      <Modal
        visible={showAdd}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAdd(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t("inbox.addDialog.title")}</Text>

            {/* Typ wählen */}
            <Text style={styles.labelLight}>{t("inbox.filters.both")}</Text>
            <View style={{ flexDirection: "row", marginBottom: 10 }}>
              <TouchableOpacity
                style={[
                  styles.chipLight,
                  newType === "word" && styles.chipLightActive,
                ]}
                onPress={() => setNewType("word")}
              >
                <Text
                  style={[
                    styles.chipLightText,
                    newType === "word" && styles.chipLightTextActive,
                  ]}
                >
                  {t("inbox.filters.word")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.chipLight,
                  newType === "sentence" && styles.chipLightActive,
                ]}
                onPress={() => setNewType("sentence")}
              >
                <Text
                  style={[
                    styles.chipLightText,
                    newType === "sentence" && styles.chipLightTextActive,
                  ]}
                >
                  {t("inbox.filters.sentence")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Text & Übersetzung */}
            <Text style={styles.labelLight}>
              {t("inbox.addDialog.textLabel")}
            </Text>
            <TextInput
              value={newText}
              onChangeText={setNewText}
              placeholder={t("inbox.addDialog.textPh")}
              placeholderTextColor="#7a8488"
              style={styles.input}
            />
            <Text style={[styles.labelLight, { marginTop: 10 }]}>
              {t("inbox.addDialog.translationLabel")}
            </Text>
            <TextInput
              value={newTrans}
              onChangeText={setNewTrans}
              placeholder={t("inbox.addDialog.translationPh")}
              placeholderTextColor="#7a8488"
              style={styles.input}
            />

            {/* Tags */}
            <Text style={[styles.labelLight, { marginTop: 10 }]}>
              {t("inbox.addDialog.tagsLabel")}
            </Text>
            <TextInput
              value={newTags}
              onChangeText={setNewTags}
              placeholder={t("inbox.addDialog.tagsPh")}
              placeholderTextColor="#7a8488"
              style={styles.input}
            />

            {/* Buttons */}
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.btnGhost}
                onPress={() => {
                  resetAdd();
                  setShowAdd(false);
                }}
              >
                <Text style={styles.btnGhostTxt}>
                  {t("inbox.addDialog.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.btnPrimary,
                  newText.trim() === "" && { opacity: 0.6 },
                ]}
                onPress={saveAdd}
                disabled={newText.trim() === ""}
              >
                <Text style={styles.btnPrimaryTxt}>
                  {t("inbox.addDialog.save")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingRight: 36,
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
    zIndex: 2,
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

  // Modal
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    backgroundColor: PALETTE.paper,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: PALETTE.silver,
  },
  modalTitle: {
    color: PALETTE.blackSteel,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  // Light-Chips (auf heller Karte)
  chipLight: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: PALETTE.silver,
    marginRight: 8,
    backgroundColor: "transparent",
  },
  chipLightActive: {
    backgroundColor: PALETTE.goldLeaf,
    borderColor: PALETTE.goldLeaf,
  },
  chipLightText: { color: PALETTE.blackSteel, fontWeight: "600" },
  chipLightTextActive: { color: PALETTE.blackSteel },

  labelLight: { color: PALETTE.blackSteel, marginBottom: 6, fontWeight: "600" },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: PALETTE.silver,
    color: PALETTE.blackSteel,
  },

  btnRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 14 },
  btnGhost: { paddingHorizontal: 14, paddingVertical: 10, marginRight: 8 },
  btnGhostTxt: { color: PALETTE.blackSteel, fontWeight: "700" },
  btnPrimary: {
    backgroundColor: PALETTE.goldLeaf,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnPrimaryTxt: { color: PALETTE.blackSteel, fontWeight: "700" },
});
