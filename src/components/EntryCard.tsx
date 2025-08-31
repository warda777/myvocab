// src/components/EntryCard.tsx
import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { PALETTE } from "../theme";
import { Entry } from "../types";

export default function EntryCard({
  item,
  onPress,
}: {
  item: Entry;
  onPress: () => void;
}) {
  const { t } = useTranslation();

  const statusLabel =
    item.status === "new"
      ? t("inbox.filters.new")
      : item.status === "learning"
      ? t("inbox.filters.learning")
      : t("inbox.filters.longterm");

  const typeLabel =
    item.type === "word"
      ? t("inbox.filters.word")
      : t("inbox.filters.sentence");

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.row}>
        <Text style={styles.badge}>{typeLabel}</Text>
        <Text style={[styles.status, styles[`status_${item.status}` as const]]}>
          {statusLabel}
        </Text>
      </View>

      <Text style={styles.text}>{item.text}</Text>
      {item.translation ? (
        <Text style={styles.sub}>{item.translation}</Text>
      ) : null}

      {/* Tags (optional) */}
      {item.tags && item.tags.length > 0 ? (
        <View style={styles.tagsRow}>
          {item.tags.map((tg) => (
            <View key={tg} style={styles.tagChip}>
              <Text style={styles.tagText}>{tg}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: PALETTE.paper,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: PALETTE.silver,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  badge: {
    backgroundColor: PALETTE.goldLeaf,
    color: PALETTE.blackSteel,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: "600",
  },

  status: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 12,
  },
  status_new: { backgroundColor: PALETTE.goldLeaf, color: PALETTE.blackSteel },
  status_learning: { backgroundColor: PALETTE.silver, color: PALETTE.paper },
  status_longterm: {
    backgroundColor: PALETTE.blackSteel,
    color: PALETTE.paper,
  },

  text: { color: PALETTE.blackSteel, fontSize: 18, marginBottom: 4 },
  sub: { color: PALETTE.silver, fontSize: 14 },

  // Tags
  tagsRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  tagChip: {
    borderColor: PALETTE.silver,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: "transparent",
  },
  tagText: { color: PALETTE.blackSteel, fontSize: 12, fontWeight: "600" },
});
