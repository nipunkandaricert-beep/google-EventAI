import { describe, it, expect } from "vitest";
import { calculateBudgetBreakdown, applyBudgetCut, BUDGET_TEMPLATES } from "../src/utils/budgetEngine";

describe("Budget Engine - Deterministic Financial Math", () => {
  it("enforces that percentage splits strictly equal 100% across all event types", () => {
    for (const type of ["wedding", "birthday", "community"] as const) {
      const template = BUDGET_TEMPLATES[type];
      const sumPercentage = template.reduce((acc, curr) => acc + curr.percentage, 0);
      expect(sumPercentage).toBe(100);
    }
  });

  it("calculates category dollar allocations that strictly sum to the total budget", () => {
    const testBudgets = [5000, 15000, 35000, 100000];
    for (const total of testBudgets) {
      const breakdown = calculateBudgetBreakdown(total, "wedding");
      const sumAllocated = breakdown.reduce((acc, curr) => acc + curr.allocated, 0);
      expect(sumAllocated).toBe(total);
    }
  });

  it("applies proportional budget cuts accurately (e.g., 20% cut)", () => {
    const initialBudget = calculateBudgetBreakdown(10000, "birthday");
    const { updatedBudget, newTotal } = applyBudgetCut(initialBudget, 10000, 20);

    expect(newTotal).toBe(8000);
    const sumAllocated = updatedBudget.reduce((acc, curr) => acc + curr.allocated, 0);
    expect(sumAllocated).toBe(8000);
  });

  it("ensures allocated dollars are never negative even with edge case budgets", () => {
    const breakdown = calculateBudgetBreakdown(100, "community");
    for (const item of breakdown) {
      expect(item.allocated).toBeGreaterThanOrEqual(0);
    }
  });
});
