// src/vocab.tsx
import React, { createContext, useContext, useMemo, useState } from "react";
import type { Entry, VocabContextType, AddEntryPayload } from "./types";

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
      prev.map((it) =>
        it.id === id ? { ...it, status: nextStatus(it.status) } : it
      )
    );
  }

  function addDummy() {
    addEntry({ type: "word", text: "coffee", translation: "Kaffee" });
  }

  function addEntry(payload: AddEntryPayload) {
    const id = Date.now().toString();
    const status: Entry["status"] = payload.status ?? "new";
    const tags = (payload.tags ?? []).map((t) => t.trim()).filter(Boolean);
    const newItem: Entry = {
      id,
      type: payload.type,
      text: payload.text,
      translation: payload.translation,
      status,
      tags,
    };
    setItems((prev) => [newItem, ...prev]);
  }

  const value = useMemo<VocabContextType>(
    () => ({ items, addDummy, addEntry, cycleStatus }),
    [items]
  );

  return (
    <VocabContext.Provider value={value}>{children}</VocabContext.Provider>
  );
}

export function useVocab(): VocabContextType {
  const ctx = useContext(VocabContext);
  if (!ctx) throw new Error("useVocab must be used inside <VocabProvider>");
  return ctx;
}
