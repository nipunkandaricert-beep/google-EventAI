import type { EventType } from "../types";
import type { View } from "./Header";

const CARDS: {
  type: EventType;
  icon: string;
  title: string;
  tagline: string;
  body: string;
  gradient: string;
  features: string[];
}[] = [
  {
    type: "wedding",
    icon: "💒",
    title: "Wedding Studio",
    tagline: "Your dream ceremony & reception, perfectly orchestrated",
    body: "From romantic vineyard estates to grand ballrooms — manage 12-month reverse timelines, ceremony customs, attire checklists, and photographer shot lists.",
    gradient: "from-rose-950 via-pink-900 to-rose-900",
    features: [
      "Venue & catering-heavy budget splits (45%)",
      "12-month backward milestone timeline",
      "Cultural customs & multi-day ceremony tracking",
      "Attire, beauty & photography shot lists",
      "Custom cocktail bar & floral arch concepts",
    ],
  },
  {
    type: "birthday",
    icon: "🎂",
    title: "Birthday Bash Studio",
    tagline: "Milestone celebrations made effortless and unforgettable",
    body: "Whether it's a 30th neon rooftop bash, a sweet 16 dance party, or a child's adventure party — plan the cake, DJ music, retro games, and surprises.",
    gradient: "from-amber-950 via-orange-900 to-purple-900",
    features: [
      "Venue, bar & entertainment budgets",
      "Fast 4-6 week planning track",
      "Custom cake flavor & dessert table tracker",
      "Neon photo backdrops & retro arcade games",
      "Party trivia & interactive drinking games",
    ],
  },
  {
    type: "community",
    icon: "🎪",
    title: "Festival & Community Studio",
    tagline: "Bring your neighborhood & supporters together safely",
    body: "Open-air music festivals, charity 5K runs, and street fairs — handle city park permits, stage AV sound, sanitation restrooms, and volunteer shift rosters.",
    gradient: "from-emerald-950 via-teal-900 to-slate-900",
    features: [
      "City park noise & health department permits",
      "Covered stage, PA system & generator rental",
      "Food truck zone & artisan vendor slots",
      "Volunteer team recruitment & shift schedules",
      "Sanitation restrooms & waste recycling plans",
    ],
  },
];

interface Props {
  onStart: () => void;
  onOpenStudio: (view: View) => void;
  onSample: (t: EventType) => void;
}

export function Home({ onStart, onOpenStudio, onSample }: Props) {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero bg-gradient-to-b from-indigo-950 via-indigo-900 to-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <p className="inline-block rounded-full border border-indigo-300/40 bg-indigo-500/20 px-4 py-1.5 text-xs font-semibold text-indigo-100 shadow-sm">
            ✨ Intelligent Event Blueprint Studio · Google Gemini Ready
          </p>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
            Plan extraordinary events in minutes
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-indigo-100/90 leading-relaxed">
            Experience dedicated planning studios tailored specifically for weddings, milestone birthdays, and community
            festivals with strict mathematical budget precision.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={onStart}
              className="btn bg-white text-indigo-950 hover:bg-indigo-100 shadow-lg text-base px-6 py-3"
            >
              Launch planner →
            </button>
            <button
              type="button"
              onClick={() => onSample("wedding")}
              className="btn border border-white text-white hover:bg-white/10 text-base px-6 py-3"
            >
              Explore a sample wedding
            </button>
          </div>
          <ul className="mt-12 grid gap-6 border-t border-indigo-400/30 pt-8 text-left sm:grid-cols-3 text-sm">
            <li className="space-y-1">
              <strong className="block text-white text-base">💰 Math you can trust</strong>
              <span className="text-indigo-200">
                Budget category splits and milestone dates are computed strictly in code, never hallucinated by AI.
              </span>
            </li>
            <li className="space-y-1">
              <strong className="block text-white text-base">🎨 Dedicated Studios</strong>
              <span className="text-indigo-200">
                Customized interfaces for weddings, birthdays, and festivals with type-specific inputs and estimators.
              </span>
            </li>
            <li className="space-y-1">
              <strong className="block text-white text-base">⚡ Works 100% Offline</strong>
              <span className="text-indigo-200">
                Rich built-in template engines generate complete event plans even without an API key.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Dedicated Event Studios Section */}
      <section className="mx-auto max-w-7xl px-6 py-16" aria-labelledby="domains">
        <div className="text-center">
          <h2 id="domains" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Dedicated Event Planning Studios
          </h2>
          <p className="muted mx-auto mt-3 max-w-2xl text-sm sm:text-base">
            Select an event studio below to access customized input controls, specialized budget distribution engines,
            and dedicated checklists.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {CARDS.map((c) => (
            <div
              key={c.type}
              className="surface flex flex-col overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-slate-200 dark:border-slate-800"
            >
              {/* Studio Header Card */}
              <div className={`bg-gradient-to-br ${c.gradient} p-6 text-white`}>
                <p className="text-4xl" aria-hidden="true">
                  {c.icon}
                </p>
                <h3 className="mt-3 text-2xl font-extrabold">{c.title}</h3>
                <p className="mt-1 text-xs font-medium text-white/80">{c.tagline}</p>
              </div>

              {/* Studio Body */}
              <div className="flex flex-1 flex-col p-6 space-y-4">
                <p className="muted text-sm leading-relaxed">{c.body}</p>

                {/* Features List */}
                <ul className="flex-1 space-y-2 text-xs">
                  {c.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold" aria-hidden="true">
                        ✓
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Actions */}
                <div className="pt-2 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => onOpenStudio(c.type as View)}
                    className="btn btn-primary flex-1 font-bold text-sm"
                  >
                    Open {c.type === "community" ? "Festival" : c.type[0].toUpperCase() + c.type.slice(1)} Studio
                  </button>
                  <button
                    type="button"
                    onClick={() => onSample(c.type)}
                    className="btn btn-ghost text-xs whitespace-nowrap"
                  >
                    View sample
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-slate-100 px-6 py-16 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-extrabold">How EventAI Works</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "1",
                icon: "⚙️",
                title: "Choose Studio",
                desc: "Open a dedicated studio for weddings, birthdays, or festivals with customized parameters.",
              },
              {
                step: "2",
                icon: "📝",
                title: "Configure Inputs",
                desc: "Specify guest counts, total budget, target dates, and aesthetic style without preloaded clutter.",
              },
              {
                step: "3",
                icon: "⚡",
                title: "Generate Plan",
                desc: "Deterministic math calculates percentage splits; Gemini crafts tailored timelines and ideas.",
              },
              {
                step: "4",
                icon: "📋",
                title: "Track & Refine",
                desc: "Manage spent amounts, mark vendor statuses, and adapt easily with natural language chat.",
              },
            ].map((s) => (
              <div key={s.step} className="surface p-6 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-2xl dark:bg-indigo-950/60">
                  {s.icon}
                </div>
                <h3 className="font-bold text-base">
                  {s.step}. {s.title}
                </h3>
                <p className="muted text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-300 px-6 py-8 text-center dark:border-slate-800">
        <p className="muted text-sm font-semibold">🎉 EventAI — GenAI Event Planning Assistant</p>
        <p className="muted mt-1 text-xs">
          Built with React 19, TypeScript, Tailwind CSS & Google Gemini · All calculations deterministic
        </p>
      </footer>
    </div>
  );
}
