import type { EventDetails } from "../types";

export const MAX_INPUT_LENGTH = 1000;

/** Escapes HTML-significant characters (use only when building HTML strings; React already escapes). */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Normalises text so look-alike and invisible characters cannot hide payloads. */
export function normalizeInput(input: string): string {
  return (
    input
      .normalize("NFKC")
      .replace(/[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g, "")
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_INPUT_LENGTH)
  );
}

const INJECTION_PATTERNS: RegExp[] = [
  /\b(ignore|disregard|forget|override|bypass)\b.{0,30}\b(previous|prior|above|earlier|all|any|the|your)\b.{0,30}\b(instructions?|prompts?|rules?|guardrails?|system)\b/i,
  /\b(reveal|show|print|leak|repeat|output)\b.{0,30}\b(system prompt|api[- ]?key|secrets?|hidden instructions?|keys)\b/i,
  /\byou are now\b.{0,40}\b(unrestricted|evil|dan|jailbroken|developer mode)\b/i,
  /\b(developer|god|dan) mode\b/i,
  /jailbreak/i,
  /<\s*script/i,
  /javascript\s*:/i,
  /<\|?(im_start|im_end|system)\|?>|\[\/?INST\]|<<\s*sys\s*>>|#{2,}\s*system\b/i,
];

/**
 * First-layer heuristic only. The real defences are: untrusted text is delimited in the
 * model prompt, and every model response is schema-validated before use.
 */
export function detectPromptInjection(input: string): { isSafe: boolean; reason?: string } {
  const text = normalizeInput(input);
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return { isSafe: false, reason: "Potential prompt injection or adversarial payload detected." };
    }
  }
  return { isSafe: true };
}

export function validateBudgetGuardrail(budget: number): { isValid: boolean; message?: string } {
  if (!Number.isFinite(budget) || budget <= 0) {
    return { isValid: false, message: "Budget must be a positive number." };
  }
  if (budget > 10_000_000) {
    return { isValid: false, message: "Budget exceeds the supported limit (10,000,000)." };
  }
  return { isValid: true };
}

export function validateGuestCount(guests: number): { isValid: boolean; message?: string } {
  if (!Number.isInteger(guests) || guests < 1 || guests > 50_000) {
    return { isValid: false, message: "Guest count must be a whole number between 1 and 50,000." };
  }
  return { isValid: true };
}

/** Problem statement requirement: the assistant must state its assumptions. */
export function generateAssumptions(event: EventDetails): string[] {
  const assumptions: string[] = [
    `Planning for ${event.guestCount} guests when sizing venue and catering.`,
    `Budget split uses fixed percentage templates that sum to exactly 100% of the total, calculated in code, not by the AI.`,
    `Timeline is scheduled backward from the event date (${event.date}).`,
  ];

  if (event.type === "wedding") {
    assumptions.push("Assumes a seated dinner, with roughly 45% of budget on venue and catering.");
    if (event.style === "outdoor") {
      assumptions.push("Outdoor style: a covered backup space is expected to come from the contingency buffer.");
    }
    if (event.culture) assumptions.push(`Customs and traditions to respect: ${event.culture}.`);
    if (event.dietaryNeeds?.length) {
      assumptions.push(`Catering should accommodate: ${event.dietaryNeeds.join(", ")}.`);
    }
  } else if (event.type === "birthday") {
    assumptions.push("Assumes a roughly 4-hour party with drinks and a custom cake.");
  } else if (event.type === "community") {
    assumptions.push("Assumes a public venue that needs local permits, sound clearance and event insurance.");
  }
  return assumptions;
}
