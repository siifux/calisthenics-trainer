import { useEffect, useMemo, useRef, useState } from "react";
import { useAppStore } from "../store/emomStore";
import { useWallClockTimer, formatMmSsPadded, formatMmSs } from "../lib/timer";
import { playMinuteCue, playTick, vibrate } from "../lib/audio";
import { requestWakeLock, releaseWakeLock } from "../lib/wakeLock";
import type { ExerciseSlot } from "../types";

const MS_PER_MIN = 60_000;

function slotForMinute(slots: ExerciseSlot[], minuteIndex: number): ExerciseSlot {
  return slots[minuteIndex % slots.length];
}

export function EmomActiveScreen() {
  const setScreen = useAppStore((s) => s.setScreen);
  const config = useAppStore((s) => s.config);
  const setLastResult = useAppStore((s) => s.setLastResult);

  const totalMs = config.totalMinutes * MS_PER_MIN;
  const timer = useWallClockTimer(100);

  const [skipOffsetMs, setSkipOffsetMs] = useState(0);
  const [confirmingStop, setConfirmingStop] = useState(false);
  const startedAtRef = useRef<number>(Date.now());
  const lastMinuteIndexRef = useRef<number>(-1);
  const lastCountdownSecondRef = useRef<number>(-1);
  const finishedRef = useRef<boolean>(false);

  const effectiveElapsedMs = timer.elapsedMs + skipOffsetMs;
  const remainingMs = Math.max(0, totalMs - effectiveElapsedMs);

  const currentMinuteIndex = Math.min(
    config.totalMinutes - 1,
    Math.floor(effectiveElapsedMs / MS_PER_MIN),
  );
  const minuteElapsedMs = effectiveElapsedMs - currentMinuteIndex * MS_PER_MIN;
  const minuteRemainingMs = Math.max(0, MS_PER_MIN - minuteElapsedMs);

  const currentSlot = slotForMinute(config.slots, currentMinuteIndex);
  const nextSlot =
    currentMinuteIndex + 1 < config.totalMinutes
      ? slotForMinute(config.slots, currentMinuteIndex + 1)
      : null;

  // Start timer on mount + acquire wake lock
  useEffect(() => {
    startedAtRef.current = Date.now();
    timer.start();
    requestWakeLock();
    return () => {
      releaseWakeLock();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Minute-change cue
  useEffect(() => {
    if (!timer.running) return;
    if (currentMinuteIndex !== lastMinuteIndexRef.current) {
      if (lastMinuteIndexRef.current !== -1) {
        playMinuteCue();
        vibrate([120, 60, 120]);
      }
      lastMinuteIndexRef.current = currentMinuteIndex;
    }
  }, [currentMinuteIndex, timer.running]);

  // Last-3-seconds countdown tick
  useEffect(() => {
    if (!timer.running) return;
    const secondsLeftInMinute = Math.ceil(minuteRemainingMs / 1000);
    if (
      secondsLeftInMinute <= 3 &&
      secondsLeftInMinute > 0 &&
      secondsLeftInMinute !== lastCountdownSecondRef.current
    ) {
      lastCountdownSecondRef.current = secondsLeftInMinute;
      playTick();
    }
    if (secondsLeftInMinute > 3) {
      lastCountdownSecondRef.current = -1;
    }
  }, [minuteRemainingMs, timer.running]);

  // Session-finish detection
  useEffect(() => {
    if (finishedRef.current) return;
    if (remainingMs <= 0 && timer.running) {
      finishedRef.current = true;
      timer.pause();
      const endedAt = Date.now();
      const completed = config.totalMinutes;
      const perExercise = aggregatePerExercise(config.slots, completed);
      setLastResult({
        startedAt: startedAtRef.current,
        endedAt,
        completedMinutes: completed,
        skippedMinutes: Math.round(skipOffsetMs / MS_PER_MIN),
        totalMinutes: config.totalMinutes,
        perExercise,
      });
      vibrate([200, 100, 200, 100, 400]);
      playMinuteCue();
      setScreen("summary");
    }
  }, [remainingMs, timer, config, skipOffsetMs, setLastResult, setScreen]);

  function handleSkip() {
    const intoCurrentMinute = effectiveElapsedMs - currentMinuteIndex * MS_PER_MIN;
    const advance = MS_PER_MIN - intoCurrentMinute;
    setSkipOffsetMs((prev) => prev + advance);
  }

  function handleStop() {
    timer.pause();
    const endedAt = Date.now();
    const completedFull = currentMinuteIndex; // minutes fully done
    setLastResult({
      startedAt: startedAtRef.current,
      endedAt,
      completedMinutes: completedFull,
      skippedMinutes: Math.round(skipOffsetMs / MS_PER_MIN),
      totalMinutes: config.totalMinutes,
      perExercise: aggregatePerExercise(config.slots, completedFull),
    });
    setScreen("summary");
  }

  const progressPct = Math.min(100, (effectiveElapsedMs / totalMs) * 100);
  const isRest = currentSlot.kind === "rest";
  const pulseClass = useMemo(() => {
    const secLeft = Math.ceil(minuteRemainingMs / 1000);
    return secLeft <= 3 && secLeft > 0 ? "pulse" : "";
  }, [minuteRemainingMs]);

  return (
    <main className={`screen screen--active ${isRest ? "rest" : "work"} ${pulseClass}`}>
      <div className="active-top">
        <div className="active-top__remaining">
          <span className="label">Tid igjen</span>
          <span className="value">{formatMmSsPadded(remainingMs)}</span>
        </div>
        <div className="progress">
          <div className="progress__bar" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="active-top__minute">
          Minutt {currentMinuteIndex + 1} / {config.totalMinutes}
        </div>
      </div>

      <div className="active-main">
        {isRest ? (
          <div className="exercise exercise--rest">
            <div className="exercise__name">PAUSE</div>
          </div>
        ) : (
          <div className="exercise">
            <div className="exercise__name">{currentSlot.name}</div>
            <div className="exercise__reps">× {currentSlot.reps ?? 0} reps</div>
          </div>
        )}

        <div className="minute-clock">{formatMmSs(minuteRemainingMs)}</div>

        {nextSlot && (
          <div className="next-up">
            Neste:{" "}
            <strong>
              {nextSlot.kind === "rest"
                ? "Pause"
                : `${nextSlot.reps ?? 0} × ${nextSlot.name}`}
            </strong>
          </div>
        )}
      </div>

      <div className="active-controls">
        {timer.running ? (
          <button
            type="button"
            className="primary-btn primary-btn--pause"
            onClick={() => timer.pause()}
          >
            Pause
          </button>
        ) : (
          <button
            type="button"
            className="primary-btn"
            onClick={() => timer.resume()}
          >
            Fortsett
          </button>
        )}

        <div className="active-controls__row">
          <button type="button" className="ghost-btn" onClick={handleSkip}>
            Hopp over
          </button>
          {confirmingStop ? (
            <button
              type="button"
              className="ghost-btn ghost-btn--danger"
              onClick={handleStop}
            >
              Bekreft stopp
            </button>
          ) : (
            <button
              type="button"
              className="ghost-btn"
              onClick={() => setConfirmingStop(true)}
            >
              Stopp
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

function aggregatePerExercise(
  slots: ExerciseSlot[],
  completedMinutes: number,
): { name: string; reps: number }[] {
  const totals = new Map<string, number>();
  for (let i = 0; i < completedMinutes; i++) {
    const slot = slots[i % slots.length];
    if (slot.kind !== "work") continue;
    const r = slot.reps ?? 0;
    totals.set(slot.name, (totals.get(slot.name) ?? 0) + r);
  }
  return Array.from(totals.entries()).map(([name, reps]) => ({ name, reps }));
}
