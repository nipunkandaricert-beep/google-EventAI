export type View = "home" | "planner";

interface Props {
  view: View;
  onView: (v: View) => void;
  isDark: boolean;
  onDark: () => void;
  highContrast: boolean;
  onHighContrast: () => void;
  largeText: boolean;
  onLargeText: () => void;
  onSettings: () => void;
  aiReady: boolean;
}

export function Header(p: Props) {
  const toggle = "btn btn-ghost";
  return (
    <header className="sticky top-0 z-40 border-b border-slate-300 bg-white/95 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2">
        <button
          type="button"
          className="btn text-lg font-extrabold"
          onClick={() => p.onView("home")}
          aria-label="EventAI home"
        >
          🎉 EventAI
        </button>
        <nav aria-label="Main" className="flex items-center gap-1">
          {(["home", "planner"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => p.onView(v)}
              aria-current={p.view === v ? "page" : undefined}
              className={`btn ${p.view === v ? "btn-primary" : "btn-ghost"}`}
            >
              {v === "home" ? "Home" : "Planner"}
            </button>
          ))}
        </nav>
        <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Display and AI settings">
          <button type="button" className={toggle} aria-pressed={p.largeText} onClick={p.onLargeText}>
            Large text
          </button>
          <button type="button" className={toggle} aria-pressed={p.highContrast} onClick={p.onHighContrast}>
            High contrast
          </button>
          <button type="button" className={toggle} aria-pressed={p.isDark} onClick={p.onDark}>
            Dark mode
          </button>
          <button type="button" className={toggle} onClick={p.onSettings}>
            {p.aiReady ? "Gemini: on" : "Gemini: off"} · Settings
          </button>
        </div>
      </div>
    </header>
  );
}
