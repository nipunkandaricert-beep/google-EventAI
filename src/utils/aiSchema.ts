import type { AiIdea, AiPlanContent, AiRefinement, AiTask, AiTimelineStep, EventStyle } from "../types";

const IDEA_CATEGORIES = ["theme", "menu", "activity", "decor", "entertainment", "other"] as const;
const PRIORITIES = ["low", "medium", "high"] as const;
const STYLES: EventStyle[] = ["elegant", "casual", "rustic", "modern", "traditional", "outdoor"];

export class AiValidationError extends Error {}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Strips tags and control characters and caps length; model output is untrusted. */
function text(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return (
    v
      .replace(/<[^>]*>/g, "")
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u001F\u007F]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, max)
  );
}

function days(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.min(730, Math.max(0, Math.round(n))) : 0;
}

function list<T>(v: unknown, cap: number, map: (item: Record<string, unknown>) => T | null): T[] {
  if (!Array.isArray(v)) return [];
  const out: T[] = [];
  for (const item of v) {
    if (out.length >= cap) break;
    if (!isRecord(item)) continue;
    const mapped = map(item);
    if (mapped) out.push(mapped);
  }
  return out;
}

const toStep = (i: Record<string, unknown>): AiTimelineStep | null => {
  const title = text(i.title, 120);
  return title
    ? {
        title,
        description: text(i.description, 300),
        phase: text(i.phase, 40) || "Planning",
        daysBeforeEvent: days(i.daysBeforeEvent),
      }
    : null;
};
const toTask = (i: Record<string, unknown>): AiTask | null => {
  const title = text(i.title, 120);
  if (!title) return null;
  const priority = PRIORITIES.find((p) => p === i.priority) ?? "medium";
  return { title, phase: text(i.phase, 40) || "Planning", priority, daysBeforeEvent: days(i.daysBeforeEvent) };
};
const toIdea = (i: Record<string, unknown>): AiIdea | null => {
  const content = text(i.content, 240);
  if (!content) return null;
  return { category: IDEA_CATEGORIES.find((c) => c === i.category) ?? "other", content };
};

export function parsePlanContent(raw: unknown): AiPlanContent {
  if (!isRecord(raw)) throw new AiValidationError("Model response was not a JSON object.");
  const timeline = list(raw.timeline, 14, toStep);
  if (timeline.length < 3) throw new AiValidationError("Model response had too few timeline steps.");
  return {
    eventName: text(raw.eventName, 80) || "Your Event",
    description: text(raw.description, 300),
    timeline,
    vendors: list(raw.vendors, 12, (i) => {
      const name = text(i.name, 80);
      return name ? { category: text(i.category, 40) || "Vendor", name } : null;
    }),
    ideas: list(raw.ideas, 12, toIdea),
    tasks: list(raw.tasks, 14, toTask),
    assumptions: (Array.isArray(raw.assumptions) ? raw.assumptions : [])
      .map((a) => text(a, 200))
      .filter(Boolean)
      .slice(0, 8),
  };
}

export function parseRefinement(raw: unknown): AiRefinement {
  if (!isRecord(raw)) throw new AiValidationError("Model response was not a JSON object.");
  const reply = text(raw.reply, 400);
  if (!reply) throw new AiValidationError("Model response had no reply.");
  const delta = typeof raw.budgetDeltaPercent === "number" ? raw.budgetDeltaPercent : undefined;
  const guests = typeof raw.guestCount === "number" ? Math.round(raw.guestCount) : undefined;
  return {
    reply,
    budgetDeltaPercent:
      delta !== undefined && Number.isFinite(delta) && delta >= -90 && delta <= 200 ? delta : undefined,
    guestCount: guests !== undefined && guests >= 1 && guests <= 50_000 ? guests : undefined,
    style: STYLES.find((s) => s === raw.style),
    addIdeas: list(raw.addIdeas, 5, toIdea),
    addTasks: list(raw.addTasks, 5, toTask),
  };
}

/** Extracts JSON from a model reply, tolerating markdown code fences. */
export function extractJson(textBody: string): unknown {
  const cleaned = textBody
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new AiValidationError("Model response was not valid JSON.");
  }
}
