import type { BudgetItem, EventPlan, TaskItem, TaskStatus, VendorStatus } from "../types";
import { formatMoney } from "../utils/format";
import type { IntegrityCheck } from "../utils/integrity";

const money = (plan: EventPlan, n: number) => formatMoney(n, plan.event.currency);

export function BudgetTab({ plan, onSpent }: { plan: EventPlan; onSpent: (id: string, v: number) => void }) {
  return (
    <ul className="space-y-3">
      {plan.budget.map((b: BudgetItem) => {
        const over = b.spent > b.allocated;
        return (
          <li key={b.id} className="surface p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-bold">
                {b.category} <span className="muted text-sm font-normal">({b.percentage}%)</span>
              </h3>
              <p className="font-semibold">{money(plan, b.allocated)}</p>
            </div>
            {b.notes && <p className="muted text-sm">{b.notes}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <progress
                className="h-3 w-40"
                value={Math.min(b.spent, b.allocated)}
                max={Math.max(1, b.allocated)}
                aria-label={`${b.category} spent`}
              />
              <label className="text-sm">
                Spent{" "}
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  className="input inline-block w-28"
                  value={b.spent}
                  onChange={(e) => onSpent(b.id, Number(e.target.value))}
                />
              </label>
              <span className="text-sm font-semibold">
                {over
                  ? `⚠ Over by ${money(plan, b.spent - b.allocated)}`
                  : `${money(plan, b.allocated - b.spent)} left`}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function TimelineTab({
  plan,
  today,
  onToggle,
}: {
  plan: EventPlan;
  today: string;
  onToggle: (id: string) => void;
}) {
  return (
    <ol className="space-y-3 border-l-2 border-indigo-300 pl-4 dark:border-indigo-700">
      {plan.timeline.map((t) => {
        const overdue = !t.completed && t.dueDate < today;
        return (
          <li key={t.id} className="surface p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" className="mt-1 h-5 w-5" checked={t.completed} onChange={() => onToggle(t.id)} />
              <span>
                <span className="block font-bold">{t.title}</span>
                <span className="muted block text-sm">{t.description}</span>
                <span className="block text-sm font-semibold">
                  <time dateTime={t.dueDate}>{t.dueDate}</time> · {t.phase}
                  {overdue && " · ⚠ Overdue"}
                </span>
              </span>
            </label>
          </li>
        );
      })}
    </ol>
  );
}

const VENDOR_STATUSES: VendorStatus[] = ["needed", "contacted", "quoted", "booked", "paid"];

export function VendorsTab({ plan, onStatus }: { plan: EventPlan; onStatus: (id: string, s: VendorStatus) => void }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {plan.vendors.map((v) => (
        <li key={v.id} className="surface p-4">
          <p className="muted text-xs font-semibold uppercase">{v.category}</p>
          <h3 className="font-bold">{v.name}</h3>
          <label className="mt-2 block text-sm">
            Status
            <select
              className="input mt-1"
              value={v.status}
              onChange={(e) => onStatus(v.id, e.target.value as VendorStatus)}
            >
              {VENDOR_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </li>
      ))}
    </ul>
  );
}

export function IdeasTab({ plan, onToggle }: { plan: EventPlan; onToggle: (id: string) => void }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {plan.ideas.map((i) => (
        <li key={i.id} className="surface p-4">
          <p className="muted text-xs font-semibold uppercase">{i.category}</p>
          <p className="mt-1">{i.content}</p>
          <button type="button" aria-pressed={i.saved} onClick={() => onToggle(i.id)} className="btn btn-ghost mt-3">
            {i.saved ? "★ Saved" : "☆ Save idea"}
          </button>
        </li>
      ))}
    </ul>
  );
}

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "pending", label: "To do" },
  { status: "in-progress", label: "In progress" },
  { status: "completed", label: "Done" },
];

export function TasksTab({ plan, onStatus }: { plan: EventPlan; onStatus: (id: string, s: TaskStatus) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {COLUMNS.map((col) => {
        const items = plan.tasks.filter((t: TaskItem) => t.status === col.status);
        return (
          <section key={col.status} aria-label={col.label}>
            <h3 className="mb-2 font-bold">
              {col.label} ({items.length})
            </h3>
            <ul className="space-y-2">
              {items.map((t) => (
                <li key={t.id} className="surface p-3 text-sm">
                  <p className="font-semibold">{t.title}</p>
                  <p className="muted">
                    Due <time dateTime={t.dueDate}>{t.dueDate}</time> · {t.priority} priority
                  </p>
                  <label className="mt-2 block">
                    <span className="sr-only">Move {t.title} to</span>
                    <select
                      className="input"
                      value={t.status}
                      onChange={(e) => onStatus(t.id, e.target.value as TaskStatus)}
                    >
                      {COLUMNS.map((c) => (
                        <option key={c.status} value={c.status}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export function IntegrityTab({ checks }: { checks: IntegrityCheck[] }) {
  const passed = checks.filter((c) => c.passed).length;
  return (
    <div>
      <p className="font-semibold" role="status">
        {passed} of {checks.length} plan integrity checks passing
      </p>
      <ul className="mt-3 space-y-2">
        {checks.map((c) => (
          <li key={c.name} className="surface p-3 text-sm">
            <span className="font-bold">{c.passed ? "✓ Pass" : "✗ Fail"}</span> · {c.name}
            <span className="muted block">{c.detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
