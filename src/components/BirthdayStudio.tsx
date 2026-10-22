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
    type: "birthday";
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

export function BirthdayStudio(p: Props) {
  // Dedicated Birthday Form Inputs
  const [honoree, setHonoree] = useState("Jordan");
  const [milestone, setMilestone] = useState("30th Milestone Bash");
  const [partyDate, setPartyDate] = useState("2026-11-14");
  const [guestCount, setGuestCount] = useState(50);
  const [budget, setBudget] = useState(6000);
  const [style, setStyle] = useState<EventStyle>("modern");
  const [location, setLocation] = useState("Downtown Loft Skydeck");
  const [cakeFlavor, setCakeFlavor] = useState("Tiered Dark Chocolate Salted Caramel Cake");
  const [funActivities, setFunActivities] = useState<string[]>([
    "Retro Arcade Machines",
    "Neon Photo Backdrop",
    "Specialty Cocktail Bar",
  ]);

  const toggleActivity = (act: string) => {
    setFunActivities((prev) => (prev.includes(act) ? prev.filter((i) => i !== act) : [...prev, act]));
  };

  const handleGenerate = () => {
    const budgetCheck = validateBudgetGuardrail(budget);
    if (!budgetCheck.isValid) return;
    p.onGenerateWithDetails({
      type: "birthday",
      name: `${honoree}'s ${milestone}`,
      guestCount,
      totalBudget: budget,
      date: partyDate,
      style,
      location,
      notes: `Cake: ${cakeFlavor}. Party features: ${funActivities.join(", ")}`,
    });
  };

  const perGuest = Math.round(budget / Math.max(1, guestCount));

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4">
      {/* Birthday Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950 via-orange-900 to-purple-900 p-6 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-200">
              <span>🎂</span> Dedicated Birthday Bash Studio
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Milestone Birthday Studio</h1>
            <p className="mt-1 text-sm text-amber-100">
              Tailored for milestone ages, rooftop lofts, custom cakes, DJ playlists, and 4-6 week planning tracks.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={p.onLoadSample}
              className="btn border border-white/80 bg-white/10 text-white hover:bg-white/20"
            >
              Explore Sample Birthday
            </button>
            <button type="button" onClick={p.onBackToHome} className="btn bg-white text-amber-950 hover:bg-amber-100">
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Content: Either Input Setup Mode OR Active Plan Dashboard */}
      {!p.hasPlan && !p.isSample ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          {/* Left Panel: Birthday Setup Form */}
          <section className="surface space-y-5 p-6">
            <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Birthday Bash Configuration</h2>
              <p className="muted text-xs">Configure your milestone party details without prefilled sample clutter.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Guest of Honor
                </label>
                <input
                  type="text"
                  className="input mt-1"
                  value={honoree}
                  onChange={(e) => setHonoree(e.target.value)}
                  placeholder="e.g. Jordan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Milestone Occasion
                </label>
                <select className="input mt-1" value={milestone} onChange={(e) => setMilestone(e.target.value)}>
                  <option value="1st Birthday Extravaganza">1st Birthday</option>
                  <option value="Sweet 16 Dance Party">Sweet 16</option>
                  <option value="21st Birthday Bash">21st Celebration</option>
                  <option value="30th Milestone Bash">30th "Dirty Thirty"</option>
                  <option value="40th Retro Celebration">40th Milestone</option>
                  <option value="50th Golden Jubilee">50th Half-Century</option>
                  <option value="Kids Theme Party">Kids Adventure Party</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Party Date
                </label>
                <input
                  type="date"
                  className="input mt-1"
                  value={partyDate}
                  onChange={(e) => setPartyDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Total Birthday Budget ($)
                </label>
                <input
                  type="number"
                  min="500"
                  max="1000000"
                  step="500"
                  className="input mt-1"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                />
                <p className="mt-1 text-xs text-amber-600 font-semibold">~ {formatMoney(perGuest, "USD")} per guest</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Guest Count: <span className="text-amber-600 font-extrabold">{guestCount}</span> guests
                </label>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  className="mt-2 w-full accent-amber-600"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>10 VIPs</span>
                  <span>50 Friends</span>
                  <span>200 Festival</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Party Vibe / Style
                </label>
                <select className="input mt-1" value={style} onChange={(e) => setStyle(e.target.value as EventStyle)}>
                  <option value="modern">Neon Rooftop / Modern</option>
                  <option value="casual">Casual Backyard Lounge</option>
                  <option value="elegant">Private Dinner & Cocktails</option>
                  <option value="outdoor">Poolside / Outdoor Patio</option>
                  <option value="traditional">Family Banquet</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Party Venue / Location
                </label>
                <input
                  type="text"
                  className="input mt-1"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Downtown Loft Skydeck"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Custom Cake & Dessert Theme
              </label>
              <input
                type="text"
                className="input mt-1"
                value={cakeFlavor}
                onChange={(e) => setCakeFlavor(e.target.value)}
                placeholder="e.g. Geometric 30th neon tiered cake with cupcakes"
              />
            </div>

            {/* Fun Party Features Checkboxes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Entertainment & Party Features
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "DJ & Lighting Package",
                  "Retro Arcade Machines",
                  "Neon Photo Backdrop",
                  "Specialty Cocktail Bar",
                  "Trivia / Drinking Games",
                  "Instant Polaroid Station",
                  "Late-Night Pizza Delivery",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleActivity(item)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                      funActivities.includes(item)
                        ? "bg-amber-700 text-white shadow"
                        : "border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {funActivities.includes(item) ? "✓ " : "+ "}
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Birthday Distribution Estimator */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                Projected Birthday Budget Split
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <div className="rounded bg-white p-2 dark:bg-slate-900 shadow-sm">
                  <span className="muted block">Venue Rental (33%)</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatMoney(Math.round(budget * 0.33), "USD")}
                  </span>
                </div>
                <div className="rounded bg-white p-2 dark:bg-slate-900 shadow-sm">
                  <span className="muted block">Bar & Food (30%)</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatMoney(Math.round(budget * 0.3), "USD")}
                  </span>
                </div>
                <div className="rounded bg-white p-2 dark:bg-slate-900 shadow-sm">
                  <span className="muted block">DJ & Music (17%)</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatMoney(Math.round(budget * 0.17), "USD")}
                  </span>
                </div>
                <div className="rounded bg-white p-2 dark:bg-slate-900 shadow-sm">
                  <span className="muted block">Cake & Décor (15%)</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatMoney(Math.round(budget * 0.15), "USD")}
                  </span>
                </div>
              </div>
            </div>

            {/* Launch Action */}
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={p.busy || budget < 500}
                className="btn btn-primary flex-1 py-3 text-base shadow-lg hover:shadow-indigo-500/25"
              >
                {p.busy ? "Generating Birthday Blueprint…" : "🎉 Generate Birthday Blueprint"}
              </button>
            </div>
          </section>

          {/* Right Panel: Chat Assistant for Birthdays */}
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
        /* Generated / Sample Birthday Plan Dashboard */
        <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
          <div className="space-y-4">
            <div className="surface p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-amber-600">Active Birthday Blueprint</p>
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
