import { describe, it, expect } from "vitest";
import {
  adjustBudget,
  allocateByPercentage,
  applyBudgetCut,
  BUDGET_TEMPLATES,
  calculateBudgetBreakdown,
} from "../src/utils/budgetEngine";

const TYPES = ["wedding", "birthday", "community"] as const;

describe("Budget engine", () => {
  it("templates sum to exactly 100%", () => {
    for (const type of TYPES) expect(BUDGET_TEMPLATES[type].reduce((a, c) => a + c.percentage, 0)).toBe(100);
  });

  it("allocations always sum to the total, for every type and many totals (incl. tiny ones)", () => {
    for (const type of TYPES) {
      for (const total of [0, 1, 7, 99, 100, 101, 999, 5000, 12345, 35000, 1_000_003]) {
        const sum = calculateBudgetBreakdown(total, type).reduce((a, c) => a + c.allocated, 0);
        expect(sum).toBe(total);
      }
    }
  });

  it("never produces negative or fractional allocations", () => {
    for (const total of [1, 3, 17, 100]) {
      for (const item of calculateBudgetBreakdown(total, "wedding")) {
        expect(item.allocated).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(item.allocated)).toBe(true);
      }
    }
  });

  it("largest-remainder allocation handles degenerate input", () => {
    expect(allocateByPercentage(100, [])).toEqual([]);
    expect(allocateByPercentage(100, [0, 0])).toEqual([0, 0]);
    expect(allocateByPercentage(-5, [50, 50])).toEqual([0, 0]);
    expect(allocateByPercentage(10, [1, 1, 1]).reduce((a, b) => a + b, 0)).toBe(10);
  });

  it("applies cuts and increases while keeping splits exact", () => {
    const initial = calculateBudgetBreakdown(10000, "birthday");
    const cut = applyBudgetCut(initial, 10000, 20);
    expect(cut.newTotal).toBe(8000);
    expect(cut.updatedBudget.reduce((a, c) => a + c.allocated, 0)).toBe(8000);
    const up = adjustBudget(initial, 10000, 25);
    expect(up.newTotal).toBe(12500);
    expect(up.updatedBudget.reduce((a, c) => a + c.allocated, 0)).toBe(12500);
  });

  it("caps spent amounts when the budget shrinks", () => {
    const initial = calculateBudgetBreakdown(10000, "birthday").map((b) => ({ ...b, spent: b.allocated }));
    const { updatedBudget } = adjustBudget(initial, 10000, -50);
    for (const b of updatedBudget) expect(b.spent).toBeLessThanOrEqual(b.allocated);
  });

  it("falls back to the wedding template for unknown types", () => {
    // @ts-expect-error deliberately invalid
    expect(calculateBudgetBreakdown(1000, "unknown")).toHaveLength(BUDGET_TEMPLATES.wedding.length);
  });
});
