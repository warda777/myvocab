// src/screens/Settings.tsx
import React from "react";
import { Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PALETTE } from "../theme";

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subOnDark}>Einstellungen folgen.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PALETTE.blackSteel, paddingTop: 48, paddingHorizontal: 16 },
  title: { color: PALETTE.paper, fontSize: 24, fontWeight: "700", marginBottom: 12 },
  subOnDark: { color: PALETTE.paper, fontSize: 14 },
});
