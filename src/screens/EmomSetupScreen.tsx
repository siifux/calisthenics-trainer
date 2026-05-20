import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAppStore } from "../store/emomStore";
import type { ExerciseSlot } from "../types";
import { unlockAudio } from "../lib/audio";

function SlotRow({ slot, index }: { slot: ExerciseSlot; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: slot.id });
  const updateSlot = useAppStore((s) => s.updateSlot);
  const removeSlot = useAppStore((s) => s.removeSlot);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const isRest = slot.kind === "rest";

  return (
    <div ref={setNodeRef} style={style} className="slot-row">
      <button
        type="button"
        className="slot-row__handle"
        aria-label="Dra for å endre rekkefølge"
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      <div className="slot-row__minute">{index + 1}</div>
      <div className="slot-row__body">
        <input
          className="slot-row__name"
          type="text"
          value={slot.name}
          onChange={(e) => updateSlot(slot.id, { name: e.target.value })}
          placeholder={isRest ? "Pause" : "Øvelse"}
        />
        {!isRest && (
          <div className="slot-row__reps">
            <button
              type="button"
              className="step-btn"
              onClick={() =>
                updateSlot(slot.id, { reps: Math.max(1, (slot.reps ?? 1) - 1) })
              }
              aria-label="Færre reps"
            >
              −
            </button>
            <input
              className="reps-input"
              type="number"
              inputMode="numeric"
              min={1}
              value={slot.reps ?? 0}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                updateSlot(slot.id, { reps: Number.isFinite(n) ? Math.max(1, n) : 1 });
              }}
            />
            <span className="reps-label">reps</span>
            <button
              type="button"
              className="step-btn"
              onClick={() => updateSlot(slot.id, { reps: (slot.reps ?? 0) + 1 })}
              aria-label="Flere reps"
            >
              +
            </button>
          </div>
        )}
        {isRest && <div className="slot-row__rest">— pause —</div>}
      </div>
      <button
        type="button"
        className="slot-row__remove"
        onClick={() => removeSlot(slot.id)}
        aria-label="Fjern øvelse"
      >
        ✕
      </button>
    </div>
  );
}

export function EmomSetupScreen() {
  const setScreen = useAppStore((s) => s.setScreen);
  const config = useAppStore((s) => s.config);
  const setTotalMinutes = useAppStore((s) => s.setTotalMinutes);
  const addSlot = useAppStore((s) => s.addSlot);
  const reorderSlots = useAppStore((s) => s.reorderSlots);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = config.slots.findIndex((s) => s.id === active.id);
    const to = config.slots.findIndex((s) => s.id === over.id);
    if (from < 0 || to < 0) return;
    reorderSlots(from, to);
  }

  const canStart = config.slots.length > 0 && config.totalMinutes >= 1;

  return (
    <main className="screen screen--setup">
      <header className="screen__header screen__header--row">
        <button
          type="button"
          className="link-btn"
          onClick={() => setScreen("home")}
          aria-label="Tilbake"
        >
          ← Tilbake
        </button>
        <h1>EMOM</h1>
        <span className="spacer" />
      </header>

      <section className="duration-card">
        <label className="duration-card__label">Total varighet</label>
        <div className="duration-card__controls">
          <button
            type="button"
            className="step-btn step-btn--lg"
            onClick={() => setTotalMinutes(config.totalMinutes - 1)}
            aria-label="Mindre tid"
          >
            −
          </button>
          <div className="duration-card__value">
            <span className="duration-card__num">{config.totalMinutes}</span>
            <span className="duration-card__unit">min</span>
          </div>
          <button
            type="button"
            className="step-btn step-btn--lg"
            onClick={() => setTotalMinutes(config.totalMinutes + 1)}
            aria-label="Mer tid"
          >
            +
          </button>
        </div>
        <p className="hint">
          Listen looper hvis den er kortere enn total varighet.
        </p>
      </section>

      <section className="slot-list">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={config.slots.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {config.slots.map((slot, i) => (
              <SlotRow key={slot.id} slot={slot} index={i} />
            ))}
          </SortableContext>
        </DndContext>

        <div className="add-row">
          <button
            type="button"
            className="add-btn"
            onClick={() => addSlot("work")}
          >
            + Legg til øvelse
          </button>
          <button
            type="button"
            className="add-btn add-btn--secondary"
            onClick={() => addSlot("rest")}
          >
            + Legg til pause
          </button>
        </div>
      </section>

      <div className="sticky-bottom">
        <button
          type="button"
          className="primary-btn"
          disabled={!canStart}
          onClick={async () => {
            await unlockAudio();
            setScreen("emom-active");
          }}
        >
          Start økt
        </button>
      </div>
    </main>
  );
}
