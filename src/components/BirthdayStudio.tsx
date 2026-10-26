import { lazy, Suspense, useMemo, useState } from "react";
import type { ChatMessage, EventPlan, EventStyle, TaskStatus, VendorStatus } from "../types";
import { formatMoney } from "../utils/format";
import { validateBudgetGuardrail } from "../utils/guardrails";
import { ChatPanel } from "./ChatPanel";
import type { Phase } from "../hooks/usePlanner";
import { BudgetSplitCard, FeaturePillSelector, StudioHeroHeader } from "./StudioCommon";

const Dashboard = lazy(() => import("./Dashboard"));

const BIRTHDAY_ACTIVITIES = [
  "Retro Arcade Machines",
  "Neon Photo Backdrop",
  "Specialty Cocktail Bar",
  "Live DJ & Sound System",
  "Custom Gourmet Dessert Bar",
  "Karaoke Lounge Stage",
  "Midnight Confetti Cannon",
] as const;

const BIRTHDAY_SPLIT_CATEGORIES = [
  { name: "Venue & Loft", percentage: 35 },
  { name: "Food & Cocktails", percentage: 30 },
  { name: "DJ & Entertainment", percentage: 18 },
  { name: "Cake & Decor", percentage: 10 },
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

/**
 * Dedicated Milestone Birthday Studio with personalized party themes and activities.
 */
export function BirthdayStudio(p: Props) {
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

  const perGuest = useMemo(() => Math.round(budget / Math.max(1, guestCount)), [budget, guestCount]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4">
      {/* Standardized Hero Banner */}
      <StudioHeroHeader
        badgeIcon="🎂"
        badgeLabel="Dedicated Birthday Bash Studio"
        title="Milestone Birthday Studio"
        subtitle="Tailored for milestone ages, rooftop lofts, custom cakes, DJ playlists, and 4-6 week planning tracks."
        sampleButtonLabel="Explore Sample Birthday"
        gradientClass="bg-gradient-to-r from-amber-950 via-orange-900 to-purple-900"
        onExploreSample={p.onLoadSample}
        onBackToHome={p.onBackToHome}
      />

      {/* Main Studio Content */}
      {!p.hasPlan && !p.isSample ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <section className="surface space-y-5 p-6">
            <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Birthday Bash Configuration</h2>
              <p className="muted text-xs">Configure your milestone party details without prefilled sample clutter.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="birthday-honoree"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Guest of Honor
                </label>
                <input
                  id="birthday-honoree"
                  type="text"
                  className="input mt-1"
                  value={honoree}
                  onChange={(e) => setHonoree(e.target.value)}
                  placeholder="e.g. Jordan"
                />
              </div>

              <div>
                <label
                  htmlFor="birthday-milestone"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Milestone Occasion
                </label>
                <select
                  id="birthday-milestone"
                  className="input mt-1"
                  value={milestone}
                  onChange={(e) => setMilestone(e.target.value)}
                >
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
                <label
                  htmlFor="birthday-date"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Party Date
                </label>
                <input
                  id="birthday-date"
                  type="date"
                  className="input mt-1"
                  value={partyDate}
                  onChange={(e) => setPartyDate(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="birthday-budget"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Total Birthday Budget ($)
                </label>
                <input
                  id="birthday-budget"
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
                <label
                  htmlFor="birthday-guests"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Guest Count: <span className="text-amber-600 font-extrabold">{guestCount}</span> guests
                </label>
                <input
                  id="birthday-guests"
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
                  <span>200 Bash</span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="birthday-style"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Party Vibe / Style
                </label>
                <select
                  id="birthday-style"
                  className="input mt-1"
                  value={style}
                  onChange={(e) => setStyle(e.target.value as EventStyle)}
                >
                  <option value="modern">Neon Rooftop / Modern</option>
                  <option value="casual">Casual Backyard Lounge</option>
                  <option value="elegant">Private Dinner & Cocktails</option>
                  <option value="outdoor">Poolside / Outdoor Patio</option>
                  <option value="traditional">Family Banquet</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="birthday-location"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Party Venue / Location
                </label>
                <input
                  id="birthday-location"
                  type="text"
                  className="input mt-1"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Downtown Loft Skydeck"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="birthday-cake"
                className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
              >
                Custom Cake & Dessert Theme
              </label>
              <input
                id="birthday-cake"
                type="text"
                className="input mt-1"
                value={cakeFlavor}
                onChange={(e) => setCakeFlavor(e.target.value)}
                placeholder="e.g. Geometric 30th neon tiered cake with cupcakes"
              />
            </div>

            {/* Modular Activity Pills */}
            <FeaturePillSelector
              title="Party Highlights & Entertainment"
              items={BIRTHDAY_ACTIVITIES}
              selectedItems={funActivities}
              activeColorClass="bg-amber-700"
              onToggle={toggleActivity}
            />

            {/* Modular Budget Split Card */}
            <BudgetSplitCard
              totalBudget={budget}
              categories={BIRTHDAY_SPLIT_CATEGORIES}
              cardBorderClass="border-amber-200 dark:border-amber-900/40"
              cardBgClass="bg-amber-50/50 dark:bg-amber-950/20"
              titleColorClass="text-amber-900 dark:text-amber-300"
            />

            {/* Launch Action */}
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={p.busy || budget < 500}
                className="btn btn-primary flex-1 py-3 text-base shadow-lg hover:shadow-indigo-500/25"
              >
                {p.busy ? "Generating Birthday Blueprint…" : "✨ Generate Birthday Blueprint"}
              </button>
            </div>
          </section>

          {/* Right Panel: Chat Assistant */}
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
        /* Generated Dashboard View */
        <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
          <div className="space-y-4">
            <div className="surface p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-amber-600">Active Blueprint</p>
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
