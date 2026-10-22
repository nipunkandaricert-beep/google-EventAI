import { useState } from "react";
import type { ChatMessage, EventPlan, EventStyle, TaskStatus, VendorStatus } from "../types";
import { formatMoney } from "../utils/format";
import { validateBudgetGuardrail } from "../utils/guardrails";
import { ChatPanel } from "./ChatPanel";
import Dashboard from "./Dashboard";
import type { Phase } from "../hooks/usePlanner";

interface Props {
  plan: EventPlan;
  isSample: boolean;
  hasPlan: boolean;
  phase: Phase;
  source: "ai" | "offline" | null;
  messages: ChatMessage[];
  busy: boolean;
  onSend: (text: string) => void;
  onGenerateWithDetails: (details: {
    type: "wedding";
    name: string;
    guestCount: number;
    totalBudget: number;
    date: string;
    style: EventStyle;
    location?: string;
    notes?: string;
  }) => void;
  onLoadSample: () => void;
  onReset: () => void;
  onSpent: (id: string, val: number) => void;
  onToggleTimeline: (id: string) => void;
  onVendor: (id: string, s: VendorStatus) => void;
  onIdea: (id: string) => void;
  onTask: (id: string, s: TaskStatus) => void;
  onCopy: () => void;
  onBackToHome: () => void;
}

export function WeddingStudio(p: Props) {
  // Dedicated Wedding Form Inputs
  const [coupleNames, setCoupleNames] = useState("Maya & Lucas");
  const [weddingDate, setWeddingDate] = useState("2026-10-18");
  const [guestCount, setGuestCount] = useState(120);
  const [budget, setBudget] = useState(35000);
  const [style, setStyle] = useState<EventStyle>("rustic");
  const [location, setLocation] = useState("Napa Valley, CA");
  const [customs, setCustoms] = useState("Outdoor sunset ceremony, wine-pairing dinner");
  const [mustHaves, setMustHaves] = useState<string[]>(["Drone Photography", "Live String Duo", "Fairy Lights Arch"]);

  const toggleMustHave = (item: string) => {
    setMustHaves((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
  };

  const handleGenerate = () => {
    const budgetCheck = validateBudgetGuardrail(budget);
    if (!budgetCheck.isValid) return;
    p.onGenerateWithDetails({
      type: "wedding",
      name: `${coupleNames}'s Wedding`,
      guestCount,
      totalBudget: budget,
      date: weddingDate,
      style,
      location,
      notes: `${customs}. Priority features: ${mustHaves.join(", ")}`,
    });
  };

  const perGuest = Math.round(budget / Math.max(1, guestCount));

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4">
      {/* Wedding Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-rose-950 via-pink-900 to-rose-900 p-6 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-400/40 bg-pink-500/20 px-3 py-1 text-xs font-semibold text-pink-200">
              <span>💒</span> Dedicated Wedding Studio
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Royal Wedding Studio</h1>
            <p className="mt-1 text-sm text-pink-100">
              Tailored specifically for ceremonies, receptions, attire, floral arches, and 12-month reverse timelines.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={p.onLoadSample}
              className="btn border border-white/80 bg-white/10 text-white hover:bg-white/20"
            >
              Explore Sample Wedding
            </button>
            <button type="button" onClick={p.onBackToHome} className="btn bg-white text-rose-950 hover:bg-pink-100">
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Content: Either Input Setup Mode OR Active Plan Dashboard */}
      {!p.hasPlan && !p.isSample ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          {/* Left Panel: Wedding Setup Form */}
          <section className="surface space-y-5 p-6">
            <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Wedding Blueprint Configuration</h2>
              <p className="muted text-xs">
                Fill in your wedding details to generate a customized budget, vendor list, and timeline.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="wedding-names"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Couple / Wedding Name
                </label>
                <input
                  id="wedding-names"
                  type="text"
                  className="input mt-1"
                  value={coupleNames}
                  onChange={(e) => setCoupleNames(e.target.value)}
                  placeholder="e.g. Maya & Lucas"
                />
              </div>

              <div>
                <label
                  htmlFor="wedding-date"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Target Wedding Date
                </label>
                <input
                  id="wedding-date"
                  type="date"
                  className="input mt-1"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="wedding-guests"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Estimated Guest Count: <span className="text-indigo-600 font-extrabold">{guestCount}</span> guests
                </label>
                <input
                  id="wedding-guests"
                  type="range"
                  min="20"
                  max="500"
                  step="5"
                  className="mt-2 w-full accent-rose-600"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>20 Intimate</span>
                  <span>150 Medium</span>
                  <span>500 Grand</span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="wedding-budget"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Total Wedding Budget ($)
                </label>
                <input
                  id="wedding-budget"
                  type="number"
                  min="1000"
                  max="10000000"
                  step="1000"
                  className="input mt-1"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                />
                <p className="mt-1 text-xs text-rose-600 font-semibold">~ {formatMoney(perGuest, "USD")} per guest</p>
              </div>

              <div>
                <label
                  htmlFor="wedding-style"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Aesthetic Style
                </label>
                <select
                  id="wedding-style"
                  className="input mt-1"
                  value={style}
                  onChange={(e) => setStyle(e.target.value as EventStyle)}
                >
                  <option value="rustic">Rustic Vineyard</option>
                  <option value="elegant">Elegant Ballroom</option>
                  <option value="modern">Modern Minimalist</option>
                  <option value="outdoor">Garden / Outdoor</option>
                  <option value="traditional">Traditional Religious</option>
                  <option value="casual">Casual Beach / Backyard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Location / City
                </label>
                <input
                  type="text"
                  className="input mt-1"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Napa Valley, CA"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Special Traditions, Customs & Notes
              </label>
              <textarea
                className="input mt-1"
                rows={2}
                value={customs}
                onChange={(e) => setCustoms(e.target.value)}
                placeholder="e.g. Sangeet celebration on night before, vegetarian & gluten-free options"
              />
            </div>

            {/* Must Have Features Checkboxes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Priority Wedding Features
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Drone Photography",
                  "Live String Duo",
                  "Fairy Lights Arch",
                  "Custom Cocktail Bar",
                  "Photo Booth Station",
                  "Guest Shuttle Bus",
                  "Late-Night Snack Bar",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleMustHave(item)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                      mustHaves.includes(item)
                        ? "bg-rose-700 text-white shadow"
                        : "border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {mustHaves.includes(item) ? "✓ " : "+ "}
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Budget Distribution Estimator */}
            <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900/40 dark:bg-rose-950/20">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900 dark:text-rose-300">
                Projected Wedding Budget Split
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <div className="rounded bg-white p-2 dark:bg-slate-900 shadow-sm">
                  <span className="muted block">Venue & Catering (45%)</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatMoney(Math.round(budget * 0.45), "USD")}
                  </span>
                </div>
                <div className="rounded bg-white p-2 dark:bg-slate-900 shadow-sm">
                  <span className="muted block">Photo & Video (12%)</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatMoney(Math.round(budget * 0.12), "USD")}
                  </span>
                </div>
                <div className="rounded bg-white p-2 dark:bg-slate-900 shadow-sm">
                  <span className="muted block">Flowers & Décor (9%)</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatMoney(Math.round(budget * 0.09), "USD")}
                  </span>
                </div>
                <div className="rounded bg-white p-2 dark:bg-slate-900 shadow-sm">
                  <span className="muted block">Buffer / Contingency (8%)</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatMoney(Math.round(budget * 0.08), "USD")}
                  </span>
                </div>
              </div>
            </div>

            {/* Launch Action */}
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={p.busy || budget < 1000}
                className="btn btn-primary flex-1 py-3 text-base shadow-lg hover:shadow-indigo-500/25"
              >
                {p.busy ? "Generating Wedding Blueprint…" : "✨ Generate Wedding Blueprint"}
              </button>
            </div>
          </section>

          {/* Right Panel: Chat Assistant for Weddings */}
          <div className="space-y-4">
            <ChatPanel
              messages={p.messages}
              busy={p.busy}
              phase={p.phase}
              canGenerate={true}
              onSend={p.onSend}
              onGenerate={handleGenerate}
              onReset={p.onReset}
            />
          </div>
        </div>
      ) : (
        /* Generated / Sample Wedding Plan Dashboard */
        <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
          <div className="space-y-4">
            <div className="surface p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-rose-600">Active Blueprint</p>
                <p className="font-bold text-sm">{p.plan.event.name}</p>
              </div>
              <button type="button" onClick={p.onReset} className="btn btn-ghost text-xs">
                ✏️ Reconfigure Inputs
              </button>
            </div>
            <ChatPanel
              messages={p.messages}
              busy={p.busy}
              phase={p.phase}
              canGenerate={true}
              onSend={p.onSend}
              onGenerate={handleGenerate}
              onReset={p.onReset}
            />
          </div>

          <Dashboard
            plan={p.plan}
            isSample={p.isSample}
            source={p.source}
            onSpent={p.onSpent}
            onToggleTimeline={p.onToggleTimeline}
            onVendor={p.onVendor}
            onIdea={p.onIdea}
            onTask={p.onTask}
            onCopy={p.onCopy}
          />
        </div>
      )}
    </div>
  );
}
