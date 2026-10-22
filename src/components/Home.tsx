import type { EventType } from "../types";

const CARDS: {
  type: EventType;
  icon: string;
  title: string;
  tagline: string;
  body: string;
  gradient: string;
  accent: string;
  features: string[];
}[] = [
  {
    type: "wedding",
    icon: "💒",
    title: "Wedding Planner",
    tagline: "Your dream day, perfectly orchestrated",
    body: "From venue scouting to vows — manage long lead times, ceremony customs, attire checklists, and photographer timelines all in one place.",
    gradient: "from-rose-900 to-pink-800",
    accent: "rose",
    features: [
      "Venue & catering-heavy budget templates",
      "12-month backward timeline",
      "Cultural customs & dietary tracking",
      "Attire, beauty & photography checklists",
      "Seating chart & RSVP management ideas",
    ],
  },
  {
    type: "birthday",
    icon: "🎂",
    title: "Birthday Planner",
    tagline: "Milestone celebrations made effortless",
    body: "Whether it's a kid's party or a milestone 30th — plan the perfect venue, cake, entertainment, and surprises with AI-powered suggestions.",
    gradient: "from-amber-900 to-orange-800",
    accent: "amber",
    features: [
      "Venue, food & entertainment budgets",
      "4-6 week planning timeline",
      "Custom cake & dessert tracking",
      "Theme-based décor ideas",
      "Guest activity & game suggestions",
    ],
  },
  {
    type: "community",
    icon: "🎪",
    title: "Community & Festival Planner",
    tagline: "Bring your community together",
    body: "Fundraisers, meetups, and outdoor festivals — handle permits, sound systems, volunteer coordination, and public safety in a single dashboard.",
    gradient: "from-emerald-900 to-teal-800",
    accent: "emerald",
    features: [
      "Permit & insurance tracking",
      "Audio/visual & stage setup budgets",
      "Volunteer recruitment & scheduling",
      "Marketing & community outreach tasks",
      "Sanitation & safety checklists",
    ],
  },
];

interface Props {
  onStart: () => void;
  onStartWithType: (type: EventType) => void;
  onSample: (t: EventType) => void;
}

export function Home({ onStart, onStartWithType, onSample }: Props) {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero bg-gradient-to-b from-indigo-900 to-slate-900 px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <p className="inline-block rounded-full border border-indigo-300/40 px-3 py-1 text-xs font-semibold text-indigo-100">
            GenAI event planning · Google Gemini · built for Google Prompt Wars
          </p>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Plan your event in minutes, not weeks
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-indigo-100">
            Describe your event in plain English. EventAI builds a budget, a backward-scheduled timeline, a vendor
            checklist and ideas, and states every assumption it made.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={onStart} className="btn bg-white text-indigo-950 hover:bg-indigo-100">
              Launch planner →
            </button>
            <button
              type="button"
              onClick={() => onSample("wedding")}
              className="btn border border-white text-white hover:bg-white/10"
            >
              Explore a sample wedding
            </button>
          </div>
          <ul className="mt-12 grid gap-4 border-t border-indigo-400/40 pt-8 text-left sm:grid-cols-3">
            <li>
              <strong>Math you can trust.</strong> Budget splits and dates are computed in code, never by the model.
            </li>
            <li>
              <strong>AI where it helps.</strong> Gemini writes timelines, ideas and tasks; output is validated before
              use.
            </li>
            <li>
              <strong>Works offline.</strong> Without an API key you still get a complete template-based plan.
            </li>
          </ul>
        </div>
      </section>

      {/* Event Type Cards — Separate UI for each category */}
      <section className="mx-auto max-w-7xl px-6 py-14" aria-labelledby="domains">
        <h2 id="domains" className="text-center text-3xl font-bold">
          Built for every milestone
        </h2>
        <p className="muted mx-auto mt-3 max-w-xl text-center text-sm">
          Choose your event type to get a tailored planning experience with type-specific budgets, timelines, and
          creative ideas.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {CARDS.map((c) => (
            <div key={c.type} className="surface flex flex-col overflow-hidden">
              {/* Card Header with themed gradient */}
              <div className={`bg-gradient-to-br ${c.gradient} px-6 py-8 text-white`}>
                <p className="text-4xl" aria-hidden="true">
                  {c.icon}
                </p>
                <h3 className="mt-3 text-2xl font-extrabold">{c.title}</h3>
                <p className="mt-1 text-sm font-medium opacity-90">{c.tagline}</p>
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col p-6">
                <p className="muted text-sm leading-relaxed">{c.body}</p>

                {/* Feature list */}
                <ul className="mt-4 flex-1 space-y-2">
                  {c.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 text-green-600 dark:text-green-400" aria-hidden="true">
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Action buttons */}
                <div className="mt-6 flex flex-wrap gap-2">
                  <button type="button" onClick={() => onStartWithType(c.type)} className="btn btn-primary flex-1">
                    Plan a {c.type === "community" ? "festival" : c.type}
                  </button>
                  <button type="button" onClick={() => onSample(c.type)} className="btn btn-ghost">
                    View sample
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-slate-100 px-6 py-14 dark:bg-slate-900">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold">How it works</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "1",
                icon: "💬",
                title: "Describe",
                desc: "Tell EventAI about your event in plain English — type, guests, budget, date, and vibe.",
              },
              {
                step: "2",
                icon: "⚡",
                title: "Generate",
                desc: "AI builds a full plan with budget breakdown, timeline, vendors, ideas, and tasks.",
              },
              {
                step: "3",
                icon: "✏️",
                title: "Refine",
                desc: "Ask for changes — cut the budget by 20%, switch to outdoor, add a photo booth.",
              },
              {
                step: "4",
                icon: "📋",
                title: "Execute",
                desc: "Track spending, check off milestones, manage vendors, and save your favourite ideas.",
              },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-2xl dark:bg-indigo-900">
                  {s.icon}
                </div>
                <h3 className="mt-4 font-bold">
                  {s.step}. {s.title}
                </h3>
                <p className="muted mt-2 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-300 px-6 py-8 text-center dark:border-slate-700">
        <p className="muted text-sm">
          EventAI — GenAI Event Planning Assistant · Built with React, Vite & Google Gemini
        </p>
        <p className="muted mt-1 text-xs">
          Budget calculations and dates are always computed in code, never by the AI model.
        </p>
      </footer>
    </div>
  );
}
