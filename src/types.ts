// src/types.ts
export type Entry = {
  id: string;
  type: "word" | "sentence";
  text: string;
  translation?: string;
  status: "new" | "learning" | "longterm";
  tags?: string[]; // ← NEU
};

export type AddEntryPayload = {
  type: "word" | "sentence";
  text: string;
  translation?: string;
  status?: Entry["status"]; // default: "new"
  tags?: string[]; // ← NEU
};

export type VocabContextType = {
  items: Entry[];
  addDummy: () => void;
  addEntry: (payload: AddEntryPayload) => void;
  cycleStatus: (id: string) => void;
};
