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

type Entry = {
  id: string;
  type: "word" | "sentence";
  text: string;
  translation?: string;
  status: "new" | "learning" | "longterm";
};

const TARGET_LANG_LABEL = "English (US)";

// Demo-Daten
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

// Farbpalette – Klassisch Metallisch
const PALETTE = {
  blackSteel: "#080706",
  paper: "#EFEFEF",
  goldLeaf: "#D1B280",
  silver: "#594D46",
};

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
  const [items, setItems] = useState<Entry[]>(INITIAL_DATA);

  function addDummy() {
    const id = Date.now().toString();
    const newItem: Entry = {
      id,
      type: "word",
      text: "coffee",
      translation: "Kaffee",
      status: "new",
    };
    setItems((prev) => [newItem, ...prev]);
  }

  function nextStatus(s: Entry["status"]): Entry["status"] {
    return s === "new" ? "learning" : s === "learning" ? "longterm" : "new";
  }

  function cycleStatus(id: string) {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, status: nextStatus(it.status) } : it
      )
    );
  }
  // …
  return (
    <SafeAreaView style={styles.container}>
      {/* … */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 96 }}
        renderItem={({ item }) => (
          <EntryCard item={item} onPress={() => cycleStatus(item.id)} />
        )}
      />
      {
        <TouchableOpacity style={styles.fab} onPress={addDummy}>
          <Text style={styles.fabText}>＋ Add word</Text>
        </TouchableOpacity>
      }
    </SafeAreaView>
  );
}

function LearnScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Learn</Text>
      <Text style={styles.subOnDark}>Hier kommt später der Lernmodus.</Text>
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
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: PALETTE.goldLeaf,
            tabBarInactiveTintColor: PALETTE.silver,
            tabBarStyle: {
              backgroundColor: PALETTE.blackSteel,
              borderTopColor: PALETTE.silver,
            },
          }}
        >
          <Tab.Screen name="Inbox" component={InboxScreen} />
          <Tab.Screen name="Learn" component={LearnScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  // dunkler Hintergrund
  container: {
    flex: 1,
    backgroundColor: PALETTE.blackSteel,
    paddingTop: 48,
    paddingHorizontal: 16,
  },

  // Überschrift hell + Akzent
  title: {
    color: PALETTE.paper,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },

  // Karte hell auf dunklem Hintergrund
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

  // Badge (Typ)
  badge: {
    backgroundColor: PALETTE.goldLeaf,
    color: PALETTE.blackSteel,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: "600",
  },

  // Status-Badges
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

  // Textfarben auf Karte
  text: { color: PALETTE.blackSteel, fontSize: 18, marginBottom: 4 },
  sub: { color: PALETTE.silver, fontSize: 14 },

  // Text auf dunklem Hintergrund
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
});
