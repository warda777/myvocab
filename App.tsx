import "react-native-gesture-handler";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { PALETTE } from "./src/theme";
import { Entry } from "./src/types";
import { VocabProvider, useVocab } from "./src/vocab";

const TARGET_LANG_LABEL = "English (US)";

const INITIAL_DATA: Entry[] = [
  { id: "1", type: "word", text: "table", translation: "Tisch", status: "new" },
  {
    id: "2",
    type: "sentence",
    text: "Could I get the check, please?",
    translation: "Könnte ich bitte die Rechnung bekommen?",
    status: "learning",
  },
  {
    id: "3",
    type: "word",
    text: "check",
    translation: "Rechnung (US)",
    status: "new",
  },
];

function EntryCard({ item, onPress }: { item: Entry; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.row}>
        <Text style={styles.badge}>
          {item.type === "word" ? "Wort" : "Satz"}
        </Text>
        <Text style={[styles.status, styles[`status_${item.status}` as const]]}>
          {item.status === "new"
            ? "Neu"
            : item.status === "learning"
            ? "Lernen"
            : "Langzeit"}
        </Text>
      </View>
      <Text style={styles.text}>{item.text}</Text>
      {item.translation ? (
        <Text style={styles.sub}>{item.translation}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

function InboxScreen() {
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

function LearnScreen() {
  const ctx = useVocab();
  const pool = ctx.items;

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
        <Text
          style={{
            color: PALETTE.blackSteel,
            fontSize: 22,
            fontWeight: "700",
            marginBottom: 6,
          }}
        >
          {item.text}
        </Text>

        {show ? (
          <Text style={[styles.sub, { fontSize: 18 }]}>
            {item.translation ?? "—"}
          </Text>
        ) : (
          <Text style={[styles.sub, { fontStyle: "italic" }]}>
            Tippe auf „Übersetzung zeigen“
          </Text>
        )}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => setShow((s) => !s)}
        >
          <Text style={styles.btnText}>
            {show ? "Ausblenden" : "Übersetzung zeigen"}
          </Text>
        </TouchableOpacity>
        <View style={{ width: 12 }} />
        <TouchableOpacity style={styles.btnPrimary} onPress={next}>
          <Text style={styles.btnText}>Nächstes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subOnDark}>Einstellungen folgen.</Text>
    </SafeAreaView>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <VocabProvider initialItems={INITIAL_DATA}>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarActiveTintColor: PALETTE.goldLeaf,
              tabBarInactiveTintColor: PALETTE.silver,
              tabBarStyle: {
                backgroundColor: PALETTE.blackSteel,
                borderTopColor: PALETTE.silver,
              },
              tabBarIcon: ({ color, size }) => {
                const name =
                  route.name === "Inbox"
                    ? "book-outline"
                    : route.name === "Learn"
                    ? "school-outline"
                    : "settings-outline";
                return (
                  <Ionicons
                    name={name as any}
                    size={size ?? 22}
                    color={color}
                  />
                );
              },
            })}
          >
            <Tab.Screen name="Inbox" component={InboxScreen} />
            <Tab.Screen name="Learn" component={LearnScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
          </Tab.Navigator>
        </NavigationContainer>
        <StatusBar style="light" />
      </VocabProvider>
    </SafeAreaProvider>
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
  subOnDark: { color: PALETTE.paper, fontSize: 14 },

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
