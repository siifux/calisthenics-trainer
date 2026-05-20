import { create } from "zustand";
import type { EmomConfig, ExerciseSlot, Screen, SessionResult } from "../types";
import { uuid } from "../lib/uuid";
import { loadEmomConfig, saveEmomConfig } from "../lib/persistence";

const DEFAULT_CONFIG: EmomConfig = {
  id: "default",
  totalMinutes: 15,
  slots: [
    { id: uuid(), kind: "work", name: "Pull-ups", reps: 5 },
    { id: uuid(), kind: "work", name: "Push-ups", reps: 10 },
    { id: uuid(), kind: "rest", name: "Pause", reps: null },
  ],
  updatedAt: Date.now(),
};

interface AppState {
  screen: Screen;
  config: EmomConfig;
  lastResult: SessionResult | null;

  setScreen: (screen: Screen) => void;

  setTotalMinutes: (minutes: number) => void;
  addSlot: (kind: "work" | "rest") => void;
  removeSlot: (id: string) => void;
  updateSlot: (id: string, patch: Partial<ExerciseSlot>) => void;
  reorderSlots: (fromIndex: number, toIndex: number) => void;

  setLastResult: (result: SessionResult | null) => void;
}

const stored = loadEmomConfig();
const initialConfig: EmomConfig = stored ?? DEFAULT_CONFIG;

function persist(config: EmomConfig): EmomConfig {
  const next = { ...config, updatedAt: Date.now() };
  saveEmomConfig(next);
  return next;
}

export const useAppStore = create<AppState>((set) => ({
  screen: "home",
  config: initialConfig,
  lastResult: null,

  setScreen: (screen) => set({ screen }),

  setTotalMinutes: (minutes) =>
    set((s) => ({
      config: persist({ ...s.config, totalMinutes: Math.max(1, Math.round(minutes)) }),
    })),

  addSlot: (kind) =>
    set((s) => {
      const slot: ExerciseSlot =
        kind === "rest"
          ? { id: uuid(), kind: "rest", name: "Pause", reps: null }
          : { id: uuid(), kind: "work", name: "Ny øvelse", reps: 10 };
      return { config: persist({ ...s.config, slots: [...s.config.slots, slot] }) };
    }),

  removeSlot: (id) =>
    set((s) => ({
      config: persist({ ...s.config, slots: s.config.slots.filter((slot) => slot.id !== id) }),
    })),

  updateSlot: (id, patch) =>
    set((s) => ({
      config: persist({
        ...s.config,
        slots: s.config.slots.map((slot) =>
          slot.id === id ? { ...slot, ...patch } : slot,
        ),
      }),
    })),

  reorderSlots: (fromIndex, toIndex) =>
    set((s) => {
      const slots = [...s.config.slots];
      const [moved] = slots.splice(fromIndex, 1);
      slots.splice(toIndex, 0, moved);
      return { config: persist({ ...s.config, slots }) };
    }),

  setLastResult: (result) => set({ lastResult: result }),
}));
