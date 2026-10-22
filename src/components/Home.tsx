import type { EventType } from "../types";

const CARDS: { type: EventType; icon: string; title: string; body: string }[] = [
  {
    type: "wedding",
    icon: "💒",
    title: "Weddings",
    body: "Long lead times, a venue-and-catering-heavy budget, cultural customs, attire and photography checklists.",
  },
  {
    type: "birthday",
    icon: "🎂",
    title: "Birthdays",
    body: "Milestone parties with venue, food, entertainment, décor and a custom cake.",
  },
  {
    type: "community",
    icon: "🎪",
    title: "Community & festivals",
    body: "Fundraisers and meetups with permits, sound, sanitation and volunteer coordination.",
  },
];

export function Home({ onStart, onSample }: { onStart: () => void; onSample: (t: EventType) => void }) {
  return (
    <div>
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
      <section className="mx-auto max-w-7xl px-6 py-14" aria-labelledby="domains">
        <h2 id="domains" className="text-center text-3xl font-bold">
          Built for every milestone
        </h2>
        <ul className="mt-10 grid gap-6 sm:grid-cols-3">
          {CARDS.map((c) => (
            <li key={c.type} className="surface p-6">
              <p className="text-3xl" aria-hidden="true">
                {c.icon}
              </p>
              <h3 className="mt-3 text-xl font-bold">{c.title}</h3>
              <p className="muted mt-2 text-sm leading-relaxed">{c.body}</p>
              <button type="button" onClick={() => onSample(c.type)} className="link mt-4 text-sm">
                Open sample {c.type} blueprint
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
