// src/screens/Inbox.tsx
import React from "react";
import { Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PALETTE } from "../theme";
import { useVocab } from "../vocab";
import EntryCard from "../components/EntryCard";

const TARGET_LANG_LABEL = "English (US)";

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
