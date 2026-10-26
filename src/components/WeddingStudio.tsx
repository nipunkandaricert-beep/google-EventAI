import { lazy, Suspense, useMemo, useState } from "react";
import type { ChatMessage, EventPlan, EventStyle, TaskStatus, VendorStatus } from "../types";
import { formatMoney } from "../utils/format";
import { validateBudgetGuardrail } from "../utils/guardrails";
import { ChatPanel } from "./ChatPanel";
import type { Phase } from "../hooks/usePlanner";
import { BudgetSplitCard, FeaturePillSelector, StudioHeroHeader } from "./StudioCommon";

const Dashboard = lazy(() => import("./Dashboard"));

const WEDDING_PRIORITY_FEATURES = [
  "Drone Photography",
  "Live String Duo",
  "Fairy Lights Arch",
  "Custom Cocktail Bar",
  "Photo Booth Station",
  "Guest Shuttle Bus",
  "Late-Night Snack Bar",
] as const;

const WEDDING_SPLIT_CATEGORIES = [
  { name: "Venue & Catering", percentage: 45 },
  { name: "Photo & Video", percentage: 12 },
  { name: "Flowers & Décor", percentage: 9 },
  { name: "Buffer / Contingency", percentage: 8 },
] as const;

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

/**
 * Dedicated Wedding Planning Studio with specialized intake parameters.
 */
export function WeddingStudio(p: Props) {
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

  const perGuest = useMemo(() => Math.round(budget / Math.max(1, guestCount)), [budget, guestCount]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4">
      {/* Standardized Hero Banner */}
      <StudioHeroHeader
        badgeIcon="💒"
        badgeLabel="Dedicated Wedding Studio"
        title="Royal Wedding Studio"
        subtitle="Tailored specifically for ceremonies, receptions, attire, floral arches, and 12-month reverse timelines."
        sampleButtonLabel="Explore Sample Wedding"
        gradientClass="bg-gradient-to-r from-rose-950 via-pink-900 to-rose-900"
        onExploreSample={p.onLoadSample}
        onBackToHome={p.onBackToHome}
      />

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
                  <option value="outdoor">Botanical Garden</option>
                  <option value="traditional">Traditional Cathedral</option>
                  <option value="casual">Bohemian Beach</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="wedding-location"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Venue & City
                </label>
                <input
                  id="wedding-location"
                  type="text"
                  className="input mt-1"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Napa Valley, CA"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="wedding-customs"
                className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
              >
                Special Traditions, Customs & Notes
              </label>
              <textarea
                id="wedding-customs"
                className="input mt-1"
                rows={2}
                value={customs}
                onChange={(e) => setCustoms(e.target.value)}
                placeholder="e.g. Sangeet celebration on night before, vegetarian & gluten-free options"
              />
            </div>

            {/* Modular Feature Pills */}
            <FeaturePillSelector
              title="Priority Wedding Features"
              items={WEDDING_PRIORITY_FEATURES}
              selectedItems={mustHaves}
              activeColorClass="bg-rose-700"
              onToggle={toggleMustHave}
            />

            {/* Modular Budget Split Card */}
            <BudgetSplitCard
              totalBudget={budget}
              categories={WEDDING_SPLIT_CATEGORIES}
              cardBorderClass="border-rose-200 dark:border-rose-900/40"
              cardBgClass="bg-rose-50/50 dark:bg-rose-950/20"
              titleColorClass="text-rose-900 dark:text-rose-300"
            />

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
              canGenerate={false}
              onSend={p.onSend}
              onGenerate={handleGenerate}
              onReset={p.onReset}
            />
          </div>
          <Suspense
            fallback={
              <p role="status" className="muted p-4">
                Loading dashboard…
              </p>
            }
          >
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
          </Suspense>
        </div>
      )}
    </div>
  );
}
