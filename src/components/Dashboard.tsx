import { useMemo, useState } from "react";
import type { EventPlan, TaskStatus, VendorStatus } from "../types";
import { formatMoney, toISODate } from "../utils/format";
import { generateAssumptions } from "../utils/guardrails";
import { runIntegrityChecks } from "../utils/integrity";
import { checkLeadTimeFeasibility } from "../utils/timelineEngine";
import { Tabs, type TabDef } from "./primitives";
import { BudgetTab, IdeasTab, IntegrityTab, TasksTab, TimelineTab, VendorsTab } from "./tabs";

type TabKey = "budget" | "timeline" | "vendors" | "ideas" | "tasks" | "integrity";
const TABS: TabDef<TabKey>[] = [
  { key: "budget", label: "Budget" },
  { key: "timeline", label: "Timeline" },
  { key: "vendors", label: "Vendors" },
  { key: "ideas", label: "Ideas" },
  { key: "tasks", label: "Tasks" },
  { key: "integrity", label: "Integrity checks" },
];

interface Props {
  plan: EventPlan;
  isSample: boolean;
  source: "ai" | "offline" | null;
  onSpent: (id: string, v: number) => void;
  onToggleTimeline: (id: string) => void;
  onVendor: (id: string, s: VendorStatus) => void;
  onIdea: (id: string) => void;
  onTask: (id: string, s: TaskStatus) => void;
  onCopy: () => void;
}

export default function Dashboard(p: Props) {
  const [tab, setTab] = useState<TabKey>("budget");
  const { plan } = p;
  const [now] = useState(() => new Date());
  const today = toISODate(now);
  const lead = useMemo(
    () => checkLeadTimeFeasibility(plan.event.date, plan.event.guestCount, now),
    [plan.event.date, plan.event.guestCount, now]
  );
  const checks = useMemo(() => runIntegrityChecks(plan), [plan]);
  const assumptions = [...generateAssumptions(plan.event), ...(plan.assumptions ?? [])];
  const spent = plan.budget.reduce((s, b) => s + b.spent, 0);
  const done = plan.tasks.filter((t) => t.status === "completed").length;
  const booked = plan.vendors.filter((v) => v.status === "booked" || v.status === "paid").length;

  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <section aria-label="Event dashboard" className="surface space-y-4 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">{plan.event.name}</h2>
          <p className="muted text-sm">
            {plan.event.type} · <time dateTime={plan.event.date}>{plan.event.date}</time> · {plan.event.guestCount}{" "}
            guests · {plan.event.style}
          </p>
          <p className="muted text-xs">
            {p.isSample
              ? "Sample data"
              : p.source === "ai"
                ? "Written by Gemini; budget and dates calculated in code"
                : "Offline template; budget and dates calculated in code"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" onClick={handleDownloadPdf}>
            📄 Download PDF
          </button>
          <button type="button" className="btn btn-ghost" onClick={p.onCopy}>
            Copy summary
          </button>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Budget", formatMoney(plan.event.totalBudget, plan.event.currency)],
          ["Spent", formatMoney(spent, plan.event.currency)],
          ["Tasks done", `${done}/${plan.tasks.length}`],
          ["Vendors booked", `${booked}/${plan.vendors.length}`],
        ].map(([k, v]) => (
          <div key={k} className="surface p-3">
            <dt className="muted text-xs font-semibold uppercase">{k}</dt>
            <dd className="text-xl font-bold">{v}</dd>
          </div>
        ))}
      </dl>

      {lead.warning && (
        <p
          role="alert"
          className="rounded-lg border-2 border-amber-700 bg-amber-50 p-3 text-sm font-semibold text-amber-950 dark:border-amber-300 dark:bg-amber-950 dark:text-amber-50"
        >
          {lead.warning}
        </p>
      )}

      <details open className="surface p-3">
        <summary className="cursor-pointer font-bold">Assumptions ({assumptions.length})</summary>
        <ul className="muted mt-2 list-disc space-y-1 pl-5 text-sm">
          {assumptions.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </details>

      <Tabs tabs={TABS} active={tab} onChange={setTab} label="Plan sections">
        {tab === "budget" && <BudgetTab plan={plan} onSpent={p.onSpent} />}
        {tab === "timeline" && <TimelineTab plan={plan} today={today} onToggle={p.onToggleTimeline} />}
        {tab === "vendors" && <VendorsTab plan={plan} onStatus={p.onVendor} />}
        {tab === "ideas" && <IdeasTab plan={plan} onToggle={p.onIdea} />}
        {tab === "tasks" && <TasksTab plan={plan} onStatus={p.onTask} />}
        {tab === "integrity" && <IntegrityTab checks={checks} />}
      </Tabs>
    </section>
  );
}
