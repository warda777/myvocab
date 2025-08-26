// src/vocab.tsx
import React, { createContext, useContext, useMemo, useState } from "react";
import type { Entry, VocabContextType } from "./types";

const VocabContext = createContext<VocabContextType | undefined>(undefined);

function nextStatus(s: Entry["status"]): Entry["status"] {
  return s === "new" ? "learning" : s === "learning" ? "longterm" : "new";
}

export function VocabProvider({
  children,
  initialItems,
}: {
  children: React.ReactNode;
  initialItems: Entry[];
}) {
  const [items, setItems] = useState<Entry[]>(initialItems);

  function cycleStatus(id: string) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status: nextStatus(it.status) } : it))
    );
  }
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

  const value = useMemo<VocabContextType>(() => ({ items, addDummy, cycleStatus }), [items]);
  return <VocabContext.Provider value={value}>{children}</VocabContext.Provider>;
}

export function useVocab(): VocabContextType {
  const ctx = useContext(VocabContext);
  if (!ctx) throw new Error("useVocab must be used inside <VocabProvider>");
  return ctx;
}
