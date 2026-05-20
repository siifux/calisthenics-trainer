export type ExerciseKind = "work" | "rest";

export interface ExerciseSlot {
  id: string;
  kind: ExerciseKind;
  name: string;
  reps: number | null;
}

export interface EmomConfig {
  id: string;
  name?: string;
  totalMinutes: number;
  slots: ExerciseSlot[];
  updatedAt: number;
}

export type Screen = "home" | "emom-setup" | "emom-active" | "summary";

export interface SessionResult {
  startedAt: number;
  endedAt: number;
  completedMinutes: number;
  skippedMinutes: number;
  totalMinutes: number;
  perExercise: { name: string; reps: number }[];
}
