// src/types.ts
export type Entry = {
  id: string;
  type: "word" | "sentence";
  text: string;
  translation?: string;
  status: "new" | "learning" | "longterm";
};

export type VocabContextType = {
  items: Entry[];
  addDummy: () => void;
  cycleStatus: (id: string) => void;
};
