import type { EventDetails } from "../types";

/**
 * XSS prevention: Escapes unsafe HTML characters.
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Prompt injection defense: Detects attempts to hijack model system instructions.
 */
export function detectPromptInjection(input: string): { isSafe: boolean; reason?: string } {
  const patterns = [
    /ignore (all )?previous instructions/i,
    /override (the )?system prompt/i,
    /you are now (an unrestricted|evil)/i,
    /reveal (your|the) api key/i,
    /jailbreak/i,
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  ];

  for (const pattern of patterns) {
    if (pattern.test(input)) {
      return {
        isSafe: false,
        reason: "Potential prompt injection or adversarial payload detected.",
      };
    }
  }

  return { isSafe: true };
}

/**
 * Guardrail: Asserts that total budget is positive and reasonable.
 */
export function validateBudgetGuardrail(budget: number): { isValid: boolean; message?: string } {
  if (isNaN(budget) || budget <= 0) {
    return { isValid: false, message: "Budget must be a positive number greater than $0." };
  }
  if (budget > 10000000) {
    return { isValid: false, message: "Budget exceeds enterprise limits ($10,000,000)." };
  }
  return { isValid: true };
}

/**
 * Problem Statement Requirement: "the assistant should state its assumptions".
 * Generates transparent assumptions formulated for the active plan.
 */
export function generateAssumptions(event: EventDetails): string[] {
  const assumptions: string[] = [
    `Assumed guest count of ${event.guestCount} attendees for catering & venue capacity modeling.`,
    `Budget math anchored strictly on percentage splits summing to exactly 100% ($${event.totalBudget.toLocaleString()}).`,
    `Lead-time schedule calculated backward from target date (${event.date}).`,
  ];

  if (event.type === "wedding") {
    assumptions.push("Assumed formal seated dinner service with 45% venue & catering allocation.");
    if (event.style === "outdoor") {
      assumptions.push("Weather contingency: Marquee tent / covered backup space budgeted within 8% contingency.");
    }
    if (event.culture) {
      assumptions.push(`Customs & traditions respected: ${event.culture} protocol incorporated into timeline.`);
    }
    if (event.dietaryNeeds && event.dietaryNeeds.length > 0) {
      assumptions.push(`Catering accommodates specified dietary preferences: ${event.dietaryNeeds.join(", ")}.`);
    }
  } else if (event.type === "birthday") {
    assumptions.push("Assumed 4-hour evening party format with cocktail bar and custom cake service.");
  } else if (event.type === "community") {
    assumptions.push("Assumed public municipal park access requiring city sound permits and safety insurance.");
  }

  return assumptions;
}
