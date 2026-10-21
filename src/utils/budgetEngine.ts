import type { BudgetItem, EventType } from "../types";

/**
 * Default percentage splits per event type
 * Enforces rule: categories MUST sum to 100%
 */
export const BUDGET_TEMPLATES: Record<EventType, { category: string; percentage: number; notes: string }[]> = {
  wedding: [
    { category: "Venue & Catering", percentage: 45, notes: "Estate venue + 3-course dinner & bar" },
    { category: "Photography & Video", percentage: 12, notes: "Full day coverage + highlight reel" },
    { category: "Flowers & Décor", percentage: 9, notes: "Ceremony arch, bouquets, table centerpieces" },
    { category: "Attire & Beauty", percentage: 8, notes: "Bridal gown, suit rental, hair & makeup" },
    { category: "Music & Entertainment", percentage: 7, notes: "Ceremony acoustic duo + reception DJ" },
    { category: "Cake & Desserts", percentage: 3, notes: "Tiered cake + dessert table" },
    { category: "Stationery & Invitations", percentage: 2, notes: "Invitations, programs, signage" },
    { category: "Guest Transportation", percentage: 3, notes: "Guest shuttles from hotels" },
    { category: "Favors & Gifts", percentage: 3, notes: "Welcome bags & bridal party gifts" },
    { category: "Contingency Buffer", percentage: 8, notes: "Weather backup & last-minute needs" },
  ],
  birthday: [
    { category: "Venue/Space Rental", percentage: 33, notes: "Private event space or loft" },
    { category: "Food & Beverages", percentage: 30, notes: "Catering, appetizers & open bar" },
    { category: "Entertainment & DJ", percentage: 17, notes: "DJ set & interactive activities" },
    { category: "Theme & Décor", percentage: 8, notes: "Photo backdrop, balloons, lighting" },
    { category: "Custom Cake & Sweets", percentage: 7, notes: "Custom milestone cake" },
    { category: "Contingency Buffer", percentage: 5, notes: "Last-minute supplies buffer" },
  ],
  community: [
    { category: "Park Permit & Stage Setup", percentage: 30, notes: "City permits + portable covered stage" },
    { category: "Audio/Visual & Lighting", percentage: 20, notes: "PA sound system, mics, power generator" },
    { category: "Marketing & Promotion", percentage: 15, notes: "Social media ads + banners & yard signs" },
    { category: "Performers & Artists", percentage: 15, notes: "Stipends for musical & cultural acts" },
    { category: "Sanitation & Trash Services", percentage: 10, notes: "Portable restrooms & recycling bins" },
    { category: "Volunteer Hospitality & Buffer", percentage: 10, notes: "T-shirts, lunches, water stations" },
  ],
};

/**
 * Calculates a mathematically sound budget breakdown where:
 * 1. Percentages strictly sum to 100%
 * 2. Allocations strictly sum to totalBudget
 */
export function calculateBudgetBreakdown(totalBudget: number, eventType: EventType): BudgetItem[] {
  const template = BUDGET_TEMPLATES[eventType] || BUDGET_TEMPLATES.wedding;
  let remainingBudget = totalBudget;

  const items: BudgetItem[] = template.map((entry, index) => {
    // For last item, allocate remaining budget to guarantee exact penny/dollar match
    const isLast = index === template.length - 1;
    const allocated = isLast ? remainingBudget : Math.round(totalBudget * (entry.percentage / 100));
    remainingBudget -= allocated;

    return {
      id: `b-${index + 1}`,
      category: entry.category,
      allocated: Math.max(0, allocated),
      spent: 0,
      percentage: entry.percentage,
      notes: entry.notes,
    };
  });

  return items;
}

/**
 * Applies a percentage cut to the budget and recalculates allocations proportionally.
 */
export function applyBudgetCut(
  currentBudget: BudgetItem[],
  currentTotal: number,
  percentageCut: number
): { updatedBudget: BudgetItem[]; newTotal: number } {
  const factor = Math.max(0, 1 - percentageCut / 100);
  const newTotal = Math.round(currentTotal * factor);
  let remaining = newTotal;

  const updatedBudget = currentBudget.map((item, index) => {
    const isLast = index === currentBudget.length - 1;
    const allocated = isLast ? remaining : Math.round(newTotal * (item.percentage / 100));
    remaining -= allocated;

    return {
      ...item,
      allocated: Math.max(0, allocated),
      spent: Math.min(item.spent, allocated),
    };
  });

  return { updatedBudget, newTotal };
}
