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
    type: "community";
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

export function CommunityStudio(p: Props) {
  // Dedicated Community / Festival Form Inputs
  const [eventName, setEventName] = useState("Oakridge Autumn Arts & Music Festival");
  const [category, setCategory] = useState("Arts & Music Festival");
  const [festivalDate, setFestivalDate] = useState("2026-11-28");
  const [attendees, setAttendees] = useState(350);
  const [budget, setBudget] = useState(15000);
  const [style, setStyle] = useState<EventStyle>("outdoor");
  const [location, setLocation] = useState("Central Community Park");
  const [permits, setPermits] = useState("City park noise permit & liability insurance policy");
  const [logistics, setLogistics] = useState<string[]>([
    "Covered Stage & PA Sound",
    "Food Truck Zone (5 trucks)",
    "Volunteer Check-in Tent",
    "Portable Sanitation & Waste",
  ]);

  const toggleLogistic = (item: string) => {
    setLogistics((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
  };

  const handleGenerate = () => {
    const budgetCheck = validateBudgetGuardrail(budget);
    if (!budgetCheck.isValid) return;
    p.onGenerateWithDetails({
      type: "community",
      name: eventName,
      guestCount: attendees,
      totalBudget: budget,
      date: festivalDate,
      style,
      location,
      notes: `${category}. Permits: ${permits}. Infrastructure: ${logistics.join(", ")}`,
    });
  };

  const perGuest = Math.round(budget / Math.max(1, attendees));

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4">
      {/* Community Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 p-6 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/40 bg-teal-500/20 px-3 py-1 text-xs font-semibold text-teal-200">
              <span>🎪</span> Dedicated Festival & Community Studio
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Community & Festival Studio</h1>
            <p className="mt-1 text-sm text-teal-100">
              Built for outdoor parks, city permits, AV sound stages, food trucks, and volunteer team scheduling.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={p.onLoadSample}
              className="btn border border-white/80 bg-white/10 text-white hover:bg-white/20"
            >
              Explore Sample Festival
            </button>
            <button type="button" onClick={p.onBackToHome} className="btn bg-white text-emerald-950 hover:bg-teal-100">
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Content: Either Input Setup Mode OR Active Plan Dashboard */}
      {!p.hasPlan && !p.isSample ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          {/* Left Panel: Community Setup Form */}
          <section className="surface space-y-5 p-6">
            <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Festival Blueprint Configuration</h2>
              <p className="muted text-xs">Configure your public event, permits, and vendor allocations cleanly.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Festival / Event Name
                </label>
                <input
                  type="text"
                  className="input mt-1"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g. Autumn Arts & Music Festival"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Event Category
                </label>
                <select className="input mt-1" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="Arts & Music Festival">Arts & Music Festival</option>
                  <option value="Neighborhood Block Party">Neighborhood Block Party</option>
                  <option value="Charity 5K Walk / Fundraiser">Charity 5K / Fundraiser</option>
                  <option value="Food Truck Rally & Market">Food Truck Rally & Market</option>
                  <option value="Tech & Community Meetup">Tech & Community Meetup</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Festival Date
                </label>
                <input
                  type="date"
                  className="input mt-1"
                  value={festivalDate}
                  onChange={(e) => setFestivalDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Total Budget ($)
                </label>
                <input
                  type="number"
                  min="1000"
                  max="5000000"
                  step="1000"
                  className="input mt-1"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                />
                <p className="mt-1 text-xs text-teal-600 font-semibold">
                  ~ {formatMoney(perGuest, "USD")} per attendee
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Expected Attendees: <span className="text-teal-600 font-extrabold">{attendees}</span> people
                </label>
                <input
                  type="range"
                  min="50"
                  max="2000"
                  step="25"
                  className="mt-2 w-full accent-teal-600"
                  value={attendees}
                  onChange={(e) => setAttendees(Number(e.target.value))}
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>50 Intimate</span>
                  <span>500 Mid-size</span>
                  <span>2000 Major</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Venue & Style
                </label>
                <select className="input mt-1" value={style} onChange={(e) => setStyle(e.target.value as EventStyle)}>
                  <option value="outdoor">City Public Park (Outdoor)</option>
                  <option value="casual">Closed Street / Plaza</option>
                  <option value="modern">Conference / Convention Hall</option>
                  <option value="traditional">Community Cultural Center</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Park Location / Address
              </label>
              <input
                type="text"
                className="input mt-1"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Central Community Park, Main Pavilion"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                City Permits & Municipal Requirements
              </label>
              <input
                type="text"
                className="input mt-1"
                value={permits}
                onChange={(e) => setPermits(e.target.value)}
                placeholder="e.g. Noise variance, health department food permits, police traffic"
              />
            </div>

            {/* Logistics Checkboxes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Festival Infrastructure & Logistics
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Covered Stage & PA Sound",
                  "Food Truck Zone (5 trucks)",
                  "Volunteer Check-in Tent",
                  "Portable Sanitation & Waste",
                  "First Aid & Safety Booth",
                  "Kids Activities & Inflatables",
                  "Social Media & Printed Banners",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleLogistic(item)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                      logistics.includes(item)
                        ? "bg-teal-700 text-white shadow"
                        : "border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {logistics.includes(item) ? "✓ " : "+ "}
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Community Distribution Estimator */}
            <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 dark:border-teal-900/40 dark:bg-teal-950/20">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-300">
                Projected Festival Budget Split
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <div className="rounded bg-white p-2 dark:bg-slate-900 shadow-sm">
                  <span className="muted block">Permits & Stage (30%)</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatMoney(Math.round(budget * 0.3), "USD")}
                  </span>
                </div>
                <div className="rounded bg-white p-2 dark:bg-slate-900 shadow-sm">
                  <span className="muted block">Sound & AV (20%)</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatMoney(Math.round(budget * 0.2), "USD")}
                  </span>
                </div>
                <div className="rounded bg-white p-2 dark:bg-slate-900 shadow-sm">
                  <span className="muted block">Marketing (15%)</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatMoney(Math.round(budget * 0.15), "USD")}
                  </span>
                </div>
                <div className="rounded bg-white p-2 dark:bg-slate-900 shadow-sm">
                  <span className="muted block">Performers & Ops (25%)</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatMoney(Math.round(budget * 0.25), "USD")}
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
                {p.busy ? "Generating Festival Blueprint…" : "🎪 Generate Festival Blueprint"}
              </button>
            </div>
          </section>

          {/* Right Panel: Chat Assistant for Community */}
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
        /* Generated / Sample Community Plan Dashboard */
        <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
          <div className="space-y-4">
            <div className="surface p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-teal-600">Active Festival Blueprint</p>
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
