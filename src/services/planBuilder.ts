import { OFFLINE_CONTENT } from "../data/offlineContent";
import type {
  AiPlanContent,
  AiRefinement,
  AiTask,
  EventDetails,
  EventPlan,
  EventStyle,
  EventType,
  IdeaItem,
  TaskItem,
  TimelineItem,
  VendorItem,
} from "../types";
import type { ParsedEventIntake } from "../utils/intakeParser";
import { adjustBudget, calculateBudgetBreakdown } from "../utils/budgetEngine";
import { addDaysISO, daysBetween, toISODate } from "../utils/format";
import { generateAssumptions } from "../utils/guardrails";
import { generateBackwardTimeline } from "../utils/timelineEngine";

const DEFAULT_LEAD_DAYS = 120;
const DEFAULT_GUESTS: Record<EventType, number> = { wedding: 100, birthday: 30, community: 200 };

/** Fills any gaps in parsed intake with defaults, and says so (assumptions must be explicit). */
export function completeDetails(
  parsed: ParsedEventIntake,
  now: Date = new Date()
): { event: EventDetails; assumed: string[] } {
  const assumed: string[] = [];
  const type = parsed.type ?? "wedding";
  if (!parsed.type) assumed.push("No event type given; assumed a wedding.");
  const guestCount = parsed.guestCount ?? DEFAULT_GUESTS[type];
  if (!parsed.guestCount) assumed.push(`No guest count given; assumed ${guestCount}.`);
  const date = parsed.date ?? addDaysISO(now, DEFAULT_LEAD_DAYS);
  if (!parsed.date) assumed.push(`No date given; assumed ${DEFAULT_LEAD_DAYS} days from today (${date}).`);
  const totalBudget = parsed.totalBudget ?? 0;
  const style: EventStyle = parsed.style ?? "modern";
  if (!parsed.style) assumed.push("No style given; assumed modern.");
  return {
    event: {
      id: `evt-${now.getTime()}`,
      type,
      name: "Your Event",
      date,
      location: "",
      guestCount,
      totalBudget,
      style,
      currency: parsed.currency ?? "USD",
    },
    assumed,
  };
}

const toTask = (t: AiTask, i: number, eventDate: string): TaskItem => ({
  id: `tk-${i + 1}`,
  title: t.title,
  dueDate: addDaysISO(eventDate, -t.daysBeforeEvent),
  status: "pending",
  phase: t.phase,
  priority: t.priority,
});

/** Builds a full plan. Budget and dates are always computed in code. */
export function buildPlan(event: EventDetails, content: AiPlanContent | null, assumed: string[] = []): EventPlan {
  const offline = OFFLINE_CONTENT[event.type];
  const timeline: TimelineItem[] = content
    ? [...content.timeline]
        .sort((a, b) => b.daysBeforeEvent - a.daysBeforeEvent)
        .map((s, i) => ({
          id: `t-${i + 1}`,
          title: s.title,
          description: s.description,
          dueDate: addDaysISO(event.date, -s.daysBeforeEvent),
          phase: s.phase,
          completed: false,
        }))
    : generateBackwardTimeline(event.date, event.type).map((t) => ({ ...t, completed: false }));

  const source = content ?? { ...offline, eventName: "", description: "" };
  const vendors: VendorItem[] = source.vendors.map((v, i) => ({
    id: `v-${i + 1}`,
    category: v.category,
    name: v.name,
    status: "needed",
  }));
  const ideas: IdeaItem[] = source.ideas.map((idea, i) => ({
    id: `i-${i + 1}`,
    category: idea.category,
    content: idea.content,
    saved: false,
  }));
  const tasks = source.tasks.map((t, i) => toTask(t, i, event.date)).sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const named: EventDetails = {
    ...event,
    name: content?.eventName || `${event.type[0]!.toUpperCase()}${event.type.slice(1)} on ${event.date}`,
    description: content?.description || undefined,
  };
  return {
    event: named,
    budget: calculateBudgetBreakdown(event.totalBudget, event.type),
    timeline,
    vendors,
    ideas,
    tasks,
    assumptions: [...assumed, ...source.assumptions],
  };
}

/** Applies a (model- or rule-produced) refinement. Budget changes are applied by code. */
export function applyRefinement(plan: EventPlan, r: AiRefinement): EventPlan {
  const next: EventPlan = structuredClone(plan);
  if (r.budgetDeltaPercent !== undefined && r.budgetDeltaPercent !== 0) {
    const { updatedBudget, newTotal } = adjustBudget(next.budget, next.event.totalBudget, r.budgetDeltaPercent);
    next.budget = updatedBudget;
    next.event.totalBudget = newTotal;
  }
  if (r.guestCount !== undefined) next.event.guestCount = r.guestCount;
  if (r.style) next.event.style = r.style;
  const stamp = next.ideas.length + next.tasks.length;
  r.addIdeas.forEach((idea, i) =>
    next.ideas.unshift({ id: `i-new-${stamp}-${i}`, category: idea.category, content: idea.content, saved: true })
  );
  r.addTasks.forEach((t, i) => next.tasks.push(toTask(t, stamp + i, next.event.date)));
  next.tasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  return next;
}

/** Keyword-based refinement used when Gemini is unavailable. Honest about its limits. */
export function refineOffline(instruction: string): AiRefinement {
  const lower = instruction.toLowerCase();
  const pct = lower.match(/(\d{1,3})\s*(?:%|percent)/);
  const amount = pct ? Math.min(90, parseInt(pct[1]!, 10)) : undefined;
  const none = { addIdeas: [], addTasks: [] };

  if (amount !== undefined && /\b(cut|reduce|lower|decrease|trim)\b/.test(lower)) {
    return {
      reply: `Reduced the total budget by ${amount}% and rebalanced every category.`,
      budgetDeltaPercent: -amount,
      ...none,
    };
  }
  if (amount !== undefined && /\b(increase|raise|add|boost)\b/.test(lower) && /budget/.test(lower)) {
    return {
      reply: `Increased the total budget by ${amount}% and rebalanced every category.`,
      budgetDeltaPercent: amount,
      ...none,
    };
  }
  if (/outdoor|garden/.test(lower)) {
    return {
      reply: "Switched to an outdoor style and added a weather-backup idea.",
      style: "outdoor",
      addIdeas: [
        { category: "decor", content: "Reserve a covered backup space or marquee and string lights for the evening." },
      ],
      addTasks: [],
    };
  }
  if (/photo ?booth/.test(lower)) {
    return {
      reply: "Added a photo booth idea and a booking task.",
      addIdeas: [
        { category: "entertainment", content: "Instant-print photo booth with props and a shared digital album." },
      ],
      addTasks: [
        { title: "Book a photo booth rental", phase: "Coordination", priority: "medium", daysBeforeEvent: 45 },
      ],
    };
  }
  return {
    reply:
      "Offline mode can only handle budget changes (e.g. “cut the budget by 15%”), outdoor styling and photo booths. Add a Gemini key in Settings for open-ended changes.",
    ...none,
  };
}

/** Shifts every date in a plan so the event lands on `newEventDate`. */
export function rebaseDates(plan: EventPlan, newEventDate: string): EventPlan {
  const shift = daysBetween(plan.event.date, newEventDate);
  const move = (d: string) => addDaysISO(d, shift);
  return {
    ...structuredClone(plan),
    event: { ...plan.event, date: newEventDate },
    timeline: plan.timeline.map((t) => ({ ...t, dueDate: move(t.dueDate) })),
    tasks: plan.tasks.map((t) => ({ ...t, dueDate: move(t.dueDate) })),
  };
}

export function sampleEventDate(type: EventType, now: Date = new Date()): string {
  const lead = { wedding: 240, birthday: 45, community: 90 }[type];
  return toISODate(new Date(now.getTime() + lead * 86_400_000));
}

export { generateAssumptions };
