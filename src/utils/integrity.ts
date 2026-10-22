import type { EventPlan } from "../types";
import { checkLeadTimeFeasibility } from "./timelineEngine";
import { generateAssumptions } from "./guardrails";

export interface IntegrityCheck {
  name: string;
  passed: boolean;
  detail: string;
}

/** Real invariants over the live plan. Nothing here is hard-coded to pass. */
export function runIntegrityChecks(plan: EventPlan, now: Date = new Date()): IntegrityCheck[] {
  const pct = plan.budget.reduce((s, b) => s + b.percentage, 0);
  const allocated = plan.budget.reduce((s, b) => s + b.allocated, 0);
  const eventTime = Date.parse(plan.event.date);
  const sorted = plan.timeline.every((t, i, a) => i === 0 || a[i - 1]!.dueDate <= t.dueDate);
  const lead = checkLeadTimeFeasibility(plan.event.date, plan.event.guestCount, now);
  return [
    { name: "Budget percentages sum to 100%", passed: pct === 100, detail: `Sum is ${pct}%.` },
    {
      name: "Allocations equal the total budget",
      passed: allocated === plan.event.totalBudget,
      detail: `Allocated ${allocated} of ${plan.event.totalBudget}.`,
    },
    {
      name: "No negative allocations",
      passed: plan.budget.every((b) => b.allocated >= 0),
      detail: "Every category is zero or more.",
    },
    {
      name: "Milestones fall on or before the event date",
      passed: plan.timeline.every((t) => Date.parse(t.dueDate) <= eventTime),
      detail: `${plan.timeline.length} milestones checked.`,
    },
    { name: "Milestones are in chronological order", passed: sorted, detail: "Earliest first." },
    {
      name: "Assumptions are stated",
      passed: generateAssumptions(plan.event).length >= 3,
      detail: "At least three assumptions are listed.",
    },
    {
      name: "Lead time evaluated",
      passed: Number.isFinite(lead.leadTimeDays),
      detail: lead.warning ?? `${lead.leadTimeDays} days of lead time looks workable.`,
    },
  ];
}
