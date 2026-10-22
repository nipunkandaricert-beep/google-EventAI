export type View = "home" | "wedding" | "birthday" | "community" | "planner";

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

const NAV_ITEMS: { view: View; label: string }[] = [
  { view: "home", label: "🏠 Home" },
  { view: "wedding", label: "💒 Wedding" },
  { view: "birthday", label: "🎂 Birthday" },
  { view: "community", label: "🎪 Festival" },
  { view: "planner", label: "📋 Planner" },
];

export function Header(p: Props) {
  const toggle = "btn btn-ghost";
  return (
    <header className="sticky top-0 z-40 border-b border-slate-300 bg-white/95 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2">
        <div className="flex items-center gap-2">
          {p.view !== "home" && (
            <button type="button" className="btn btn-ghost" onClick={() => p.onView("home")} aria-label="Back to home">
              ← Back
            </button>
          )}
          <button
            type="button"
            className="btn text-lg font-extrabold"
            onClick={() => p.onView("home")}
            aria-label="EventAI home"
          >
            🎉 EventAI
          </button>
        </div>
        <nav aria-label="Main" className="flex items-center gap-1 overflow-x-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.view}
              type="button"
              onClick={() => p.onView(item.view)}
              aria-current={p.view === item.view ? "page" : undefined}
              className={`btn whitespace-nowrap text-xs sm:text-sm ${
                p.view === item.view ? "btn-primary" : "btn-ghost"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Display and AI settings">
          <button type="button" className={toggle} aria-pressed={p.largeText} onClick={p.onLargeText}>
            A+
          </button>
          <button type="button" className={toggle} aria-pressed={p.highContrast} onClick={p.onHighContrast}>
            👁️ HC
          </button>
          <button type="button" className={toggle} aria-pressed={p.isDark} onClick={p.onDark}>
            {p.isDark ? "☀️" : "🌙"}
          </button>
          <button type="button" className={toggle} onClick={p.onSettings}>
            {p.aiReady ? "✅ Gemini" : "⚙️ Settings"}
          </button>
        </div>
      </div>
    </header>
  );
}
