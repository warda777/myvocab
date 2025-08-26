// src/screens/Learn.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PALETTE } from "../theme";
import { useVocab } from "../vocab";

export default function LearnScreen() {
  const ctx = useVocab();
  const pool = ctx.items; // später: z. B. nur "new"

  const [i, setI] = useState(0);
  const [show, setShow] = useState(false);
  const item = pool[i];

  function next() {
    if (pool.length === 0) return;
    setShow(false);
    setI((prev) => (prev + 1) % pool.length);
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Learn</Text>
        <Text style={styles.subOnDark}>Keine Einträge.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Learn</Text>

      <View style={[styles.card, { paddingVertical: 24 }]}>
        <Text style={{ color: PALETTE.blackSteel, fontSize: 22, fontWeight: "700", marginBottom: 6 }}>
          {item.text}
        </Text>

        {show ? (
          <Text style={[styles.sub, { fontSize: 18 }]}>{item.translation ?? "—"}</Text>
        ) : (
          <Text style={[styles.sub, { fontStyle: "italic" }]}>Tippe auf „Übersetzung zeigen“</Text>
        )}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => setShow((s) => !s)}>
          <Text style={styles.btnText}>{show ? "Ausblenden" : "Übersetzung zeigen"}</Text>
        </TouchableOpacity>
        <View style={{ width: 12 }} />
        <TouchableOpacity style={styles.btnPrimary} onPress={next}>
          <Text style={styles.btnText}>Nächstes</Text>
        </TouchableOpacity>
      </View>
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

  sub: { color: PALETTE.silver, fontSize: 14 },
  subOnDark: { color: PALETTE.paper, fontSize: 14 },

  actionsRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },

  btnPrimary: {
    backgroundColor: PALETTE.goldLeaf,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnSecondary: {
    backgroundColor: PALETTE.silver,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnText: { color: PALETTE.paper, fontWeight: "700" },
});
