import { useEffect, useRef, useState } from "react";

/**
 * Wall-clock-presis timer. Holder en baseline-tid (epoch ms) for når
 * "minutt 0" startet, og beregner forløpt tid via Date.now() — slik at
 * den ikke driver selv om setInterval-callback hopper over en tick.
 *
 * Pause "fryser" elapsedMs ved å lagre offset og sette baseline på nytt
 * ved resume.
 */
export interface TimerState {
  elapsedMs: number;
  running: boolean;
}

export interface TimerControls extends TimerState {
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  addElapsedMs: (delta: number) => void;
}

export function useWallClockTimer(tickMs = 100): TimerControls {
  const [state, setState] = useState<TimerState>({ elapsedMs: 0, running: false });
  const baselineRef = useRef<number | null>(null);
  const frozenRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!state.running) return;
    const update = () => {
      if (baselineRef.current == null) return;
      const elapsed = frozenRef.current + (Date.now() - baselineRef.current);
      setState((s) => (s.elapsedMs === elapsed ? s : { ...s, elapsedMs: elapsed }));
    };
    intervalRef.current = window.setInterval(update, tickMs);
    return () => {
      if (intervalRef.current != null) window.clearInterval(intervalRef.current);
    };
  }, [state.running, tickMs]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (intervalRef.current != null) window.clearInterval(intervalRef.current);
    };
  }, []);

  return {
    elapsedMs: state.elapsedMs,
    running: state.running,
    start: () => {
      baselineRef.current = Date.now();
      frozenRef.current = 0;
      setState({ elapsedMs: 0, running: true });
    },
    pause: () => {
      if (baselineRef.current != null) {
        frozenRef.current += Date.now() - baselineRef.current;
        baselineRef.current = null;
      }
      setState((s) => ({ ...s, running: false }));
    },
    resume: () => {
      baselineRef.current = Date.now();
      setState((s) => ({ ...s, running: true }));
    },
    stop: () => {
      baselineRef.current = null;
      frozenRef.current = 0;
      setState({ elapsedMs: 0, running: false });
    },
    addElapsedMs: (delta: number) => {
      frozenRef.current += delta;
      setState((s) => ({ ...s, elapsedMs: s.elapsedMs + delta }));
    },
  };
}

export function formatMmSs(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatMmSsPadded(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
