import "react-native-gesture-handler";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
type IconName = ComponentProps<typeof Ionicons>["name"];
import { supabase, ensureSignedIn } from "./src/supabaseClient";

import { PALETTE } from "./src/theme";
import { Entry } from "./src/types";
import { VocabProvider } from "./src/vocab";
import InboxScreen from "./src/screens/Inbox";
import LearnScreen from "./src/screens/Learn";
import SettingsScreen from "./src/screens/Settings";
import "./src/i18n"; // init i18next (DE/ES/EN …)
import { useTranslation } from "react-i18next";
import Search from "./src/screens/Search";

function TabLabel({ tKey }: { tKey: string }) {
  const { t } = useTranslation();
  return <Text>{t(tKey)}</Text>;
}

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

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <VocabProvider initialItems={INITIAL_DATA}>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarShowLabel: false, // ← Labels ausblenden (nur Icons)
              tabBarActiveTintColor: PALETTE.goldLeaf,
              tabBarInactiveTintColor: PALETTE.silver,
              tabBarStyle: {
                backgroundColor: PALETTE.blackSteel,
                borderTopColor: PALETTE.silver,
              },
              tabBarIcon: ({ color, size }) => {
                let icon: IconName; // <— statt string

                if (route.name === "Inbox") icon = "book-outline";
                else if (route.name === "Learn") icon = "school-outline";
                else if (route.name === "Settings") icon = "settings-outline";
                else if (route.name === "Search") icon = "search-outline";
                else icon = "ellipse-outline";

                return <Ionicons name={icon} size={size} color={color} />;
              },
            })}
          >
            <Tab.Screen
              name="Inbox"
              component={InboxScreen}
              options={{ tabBarLabel: () => <TabLabel tKey="tabs.inbox" /> }}
            />
            <Tab.Screen
              name="Learn"
              component={LearnScreen}
              options={{ tabBarLabel: () => <TabLabel tKey="tabs.learn" /> }}
            />
            <Tab.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ tabBarLabel: () => <TabLabel tKey="tabs.settings" /> }}
            />
            <Tab.Screen name="Search" component={Search} />
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
