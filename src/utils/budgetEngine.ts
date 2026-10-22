import type { BudgetItem, EventType } from "../types";

/** Default percentage splits per event type. Each template MUST sum to 100. */
export const BUDGET_TEMPLATES: Record<EventType, { category: string; percentage: number; notes: string }[]> = {
  wedding: [
    { category: "Venue & Catering", percentage: 45, notes: "Venue hire plus seated dinner and bar" },
    { category: "Photography & Video", percentage: 12, notes: "Full-day coverage and highlight reel" },
    { category: "Flowers & Décor", percentage: 9, notes: "Ceremony styling, bouquets, centerpieces" },
    { category: "Attire & Beauty", percentage: 8, notes: "Outfits, alterations, hair and makeup" },
    { category: "Music & Entertainment", percentage: 7, notes: "Ceremony music and reception DJ or band" },
    { category: "Cake & Desserts", percentage: 3, notes: "Cake and dessert table" },
    { category: "Stationery & Invitations", percentage: 2, notes: "Invitations, programs, signage" },
    { category: "Guest Transportation", percentage: 3, notes: "Shuttles or transfers for guests" },
    { category: "Favors & Gifts", percentage: 3, notes: "Welcome bags and party gifts" },
    { category: "Contingency Buffer", percentage: 8, notes: "Weather backup and last-minute needs" },
  ],
  birthday: [
    { category: "Venue/Space Rental", percentage: 33, notes: "Private space or hall" },
    { category: "Food & Beverages", percentage: 30, notes: "Catering, appetizers and drinks" },
    { category: "Entertainment & DJ", percentage: 17, notes: "Music and interactive activities" },
    { category: "Theme & Décor", percentage: 8, notes: "Backdrop, balloons, lighting" },
    { category: "Custom Cake & Sweets", percentage: 7, notes: "Milestone cake" },
    { category: "Contingency Buffer", percentage: 5, notes: "Last-minute supplies" },
  ],
  community: [
    { category: "Permits & Stage Setup", percentage: 30, notes: "Local permits and a covered stage" },
    { category: "Audio/Visual & Lighting", percentage: 20, notes: "PA system, mics, power" },
    { category: "Marketing & Promotion", percentage: 15, notes: "Social ads, banners, signage" },
    { category: "Performers & Artists", percentage: 15, notes: "Stipends for acts" },
    { category: "Sanitation & Waste", percentage: 10, notes: "Restrooms and recycling" },
    { category: "Volunteer Hospitality & Buffer", percentage: 10, notes: "Shirts, meals, water stations" },
  ],
};

/**
 * Largest-remainder allocation: whole-unit amounts that always sum exactly to `total`
 * (when total >= 0), with no negative values and no dependence on item order.
 */
export function allocateByPercentage(total: number, percentages: number[]): number[] {
  const target = Math.max(0, Math.round(total));
  const pctSum = percentages.reduce((a, b) => a + b, 0);
  if (percentages.length === 0 || pctSum <= 0) return percentages.map(() => 0);

  const raw = percentages.map((p) => (target * p) / pctSum);
  const result = raw.map(Math.floor);
  const leftover = target - result.reduce((a, b) => a + b, 0);
  const byFraction = raw.map((r, i) => ({ i, frac: r - Math.floor(r) })).sort((a, b) => b.frac - a.frac || a.i - b.i);
  for (let k = 0; k < leftover; k++) result[byFraction[k % byFraction.length]!.i]! += 1;
  return result;
}

export function calculateBudgetBreakdown(totalBudget: number, eventType: EventType): BudgetItem[] {
  const template = BUDGET_TEMPLATES[eventType] ?? BUDGET_TEMPLATES.wedding;
  const amounts = allocateByPercentage(
    totalBudget,
    template.map((t) => t.percentage)
  );
  return template.map((entry, index) => ({
    id: `b-${index + 1}`,
    category: entry.category,
    allocated: amounts[index]!,
    spent: 0,
    percentage: entry.percentage,
    notes: entry.notes,
  }));
}

/** Scales the budget by deltaPercent (negative = cut, positive = increase), keeping splits exact. */
export function adjustBudget(
  currentBudget: BudgetItem[],
  currentTotal: number,
  deltaPercent: number
): { updatedBudget: BudgetItem[]; newTotal: number } {
  const factor = Math.max(0, 1 + deltaPercent / 100);
  const newTotal = Math.round(currentTotal * factor);
  const amounts = allocateByPercentage(
    newTotal,
    currentBudget.map((b) => b.percentage)
  );
  const updatedBudget = currentBudget.map((item, i) => ({
    ...item,
    allocated: amounts[i]!,
    spent: Math.min(item.spent, amounts[i]!),
  }));
  return { updatedBudget, newTotal };
}

export function applyBudgetCut(currentBudget: BudgetItem[], currentTotal: number, percentageCut: number) {
  return adjustBudget(currentBudget, currentTotal, -percentageCut);
}
