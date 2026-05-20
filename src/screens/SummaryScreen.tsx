import { useAppStore } from "../store/emomStore";

function formatDurationSec(ms: number): string {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m} min ${s.toString().padStart(2, "0")} s`;
}

export function SummaryScreen() {
  const result = useAppStore((s) => s.lastResult);
  const setScreen = useAppStore((s) => s.setScreen);

  if (!result) {
    return (
      <main className="screen screen--summary">
        <h1>Ingen økt fullført</h1>
        <button
          type="button"
          className="primary-btn"
          onClick={() => setScreen("home")}
        >
          Til startskjerm
        </button>
      </main>
    );
  }

  const duration = result.endedAt - result.startedAt;

  return (
    <main className="screen screen--summary">
      <header className="screen__header">
        <h1>Bra jobba!</h1>
        <p className="screen__sub">Økt fullført</p>
      </header>

      <section className="summary-card">
        <div className="summary-row">
          <span>Varighet</span>
          <strong>{formatDurationSec(duration)}</strong>
        </div>
        <div className="summary-row">
          <span>Minutter fullført</span>
          <strong>
            {result.completedMinutes} / {result.totalMinutes}
          </strong>
        </div>
        {result.skippedMinutes > 0 && (
          <div className="summary-row">
            <span>Hoppet over</span>
            <strong>{result.skippedMinutes} min</strong>
          </div>
        )}
      </section>

      {result.perExercise.length > 0 && (
        <section className="summary-card">
          <h2 className="summary-card__title">Totalt antall reps</h2>
          {result.perExercise.map((row) => (
            <div className="summary-row" key={row.name}>
              <span>{row.name}</span>
              <strong>{row.reps}</strong>
            </div>
          ))}
        </section>
      )}

      <div className="sticky-bottom sticky-bottom--col">
        <button
          type="button"
          className="primary-btn"
          onClick={() => setScreen("emom-active")}
        >
          Kjør samme økt igjen
        </button>
        <button
          type="button"
          className="ghost-btn"
          onClick={() => setScreen("home")}
        >
          Til startskjerm
        </button>
      </div>
    </main>
  );
}
