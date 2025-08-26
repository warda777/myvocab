// src/screens/Inbox.tsx
import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PALETTE } from "../theme";
import { Entry } from "../types";
import { useVocab } from "../vocab";

const TARGET_LANG_LABEL = "English (US)";

function EntryCard({ item, onPress }: { item: Entry; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.row}>
        <Text style={styles.badge}>{item.type === "word" ? "Wort" : "Satz"}</Text>
        <Text style={[styles.status, styles[`status_${item.status}` as const]]}>
          {item.status === "new" ? "Neu" : item.status === "learning" ? "Lernen" : "Langzeit"}
        </Text>
      </View>
      <Text style={styles.text}>{item.text}</Text>
      {item.translation ? <Text style={styles.sub}>{item.translation}</Text> : null}
    </TouchableOpacity>
  );
}

export default function InboxScreen() {
  const ctx = useVocab();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Inbox · {TARGET_LANG_LABEL}</Text>
      <FlatList
        data={ctx.items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 96 }}
        renderItem={({ item }) => (
          <EntryCard item={item} onPress={() => ctx.cycleStatus(item.id)} />
        )}
      />
      <TouchableOpacity style={styles.fab} onPress={ctx.addDummy}>
        <Text style={styles.fabText}>＋ Add word</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PALETTE.blackSteel, paddingTop: 48, paddingHorizontal: 16 },
  title: { color: PALETTE.paper, fontSize: 24, fontWeight: "700", marginBottom: 12 },

  card: {
    backgroundColor: PALETTE.paper,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: PALETTE.silver,
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },

  badge: {
    backgroundColor: PALETTE.goldLeaf,
    color: PALETTE.blackSteel,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: "600",
  },

  status: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, fontSize: 12 },
  status_new: { backgroundColor: PALETTE.goldLeaf, color: PALETTE.blackSteel },
  status_learning: { backgroundColor: PALETTE.silver, color: PALETTE.paper },
  status_longterm: { backgroundColor: PALETTE.blackSteel, color: PALETTE.paper },

  text: { color: PALETTE.blackSteel, fontSize: 18, marginBottom: 4 },
  sub: { color: PALETTE.silver, fontSize: 14 },

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
