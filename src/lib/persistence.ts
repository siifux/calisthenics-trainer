import type { EmomConfig } from "../types";

const KEY = "calisthenics-trainer:emom-config:v1";

export function loadEmomConfig(): EmomConfig | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EmomConfig;
    if (!parsed.slots || !Array.isArray(parsed.slots)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveEmomConfig(config: EmomConfig): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(config));
  } catch {
    /* quota / private mode — ignore */
  }
}
