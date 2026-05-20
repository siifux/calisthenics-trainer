import { useAppStore } from "../store/emomStore";

interface ModeCardProps {
  title: string;
  subtitle: string;
  disabled?: boolean;
  onClick?: () => void;
}

function ModeCard({ title, subtitle, disabled, onClick }: ModeCardProps) {
  return (
    <button
      type="button"
      className={`mode-card${disabled ? " mode-card--disabled" : ""}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <div className="mode-card__title">{title}</div>
      <div className="mode-card__subtitle">{subtitle}</div>
      {disabled && <div className="mode-card__badge">Coming soon</div>}
    </button>
  );
}

export function HomeScreen() {
  const setScreen = useAppStore((s) => s.setScreen);

  return (
    <main className="screen screen--home">
      <header className="screen__header">
        <h1>Calisthenics</h1>
        <p className="screen__sub">Velg treningsøkt</p>
      </header>

      <div className="mode-list">
        <ModeCard
          title="EMOM"
          subtitle="Every Minute On the Minute"
          onClick={() => setScreen("emom-setup")}
        />
        <ModeCard
          title="AMRAP"
          subtitle="As Many Rounds As Possible"
          disabled
        />
        <ModeCard
          title="Climbing focused"
          subtitle="Klatre-spesifikk økt"
          disabled
        />
      </div>
    </main>
  );
}
