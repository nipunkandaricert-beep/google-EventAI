import { describe, it, expect } from "vitest";
import { SAMPLES } from "../src/data/samples";
import {
  applyRefinement,
  buildPlan,
  completeDetails,
  rebaseDates,
  refineOffline,
  sampleEventDate,
} from "../src/services/planBuilder";
import { runIntegrityChecks } from "../src/utils/integrity";

const NOW = new Date("2026-10-21T00:00:00Z");
const ai = {
  eventName: "Garden Day",
  description: "desc",
  timeline: [
    { title: "Late", description: "", phase: "p", daysBeforeEvent: 5 },
    { title: "Early", description: "", phase: "p", daysBeforeEvent: 120 },
    { title: "Mid", description: "", phase: "p", daysBeforeEvent: 40 },
  ],
  vendors: [{ category: "Venue", name: "Hall" }],
  ideas: [{ category: "theme" as const, content: "Idea" }],
  tasks: [
    { title: "B", phase: "p", priority: "low" as const, daysBeforeEvent: 5 },
    { title: "A", phase: "p", priority: "high" as const, daysBeforeEvent: 50 },
  ],
  assumptions: ["AI assumption"],
};

describe("completeDetails", () => {
  it("states every default it applies", () => {
    const { event, assumed } = completeDetails({ totalBudget: 5000 }, NOW);
    expect(event).toMatchObject({
      type: "wedding",
      guestCount: 100,
      style: "modern",
      totalBudget: 5000,
      currency: "USD",
    });
    expect(event.date).toBe("2027-02-18");
    expect(assumed).toHaveLength(4);
  });
  it("assumes nothing when everything is given", () => {
    const { assumed, event } = completeDetails(
      { type: "birthday", totalBudget: 900, guestCount: 20, date: "2027-01-01", style: "casual", currency: "INR" },
      NOW
    );
    expect(assumed).toEqual([]);
    expect(event.currency).toBe("INR");
  });
});

describe("buildPlan", () => {
  const { event, assumed } = completeDetails(
    { type: "wedding", totalBudget: 33333, guestCount: 90, date: "2027-04-10" },
    NOW
  );

  it("computes budget and dates in code from AI content", () => {
    const plan = buildPlan(event, ai, assumed);
    expect(plan.event.name).toBe("Garden Day");
    expect(plan.budget.reduce((s, b) => s + b.allocated, 0)).toBe(33333);
    expect(plan.timeline.map((t) => t.title)).toEqual(["Early", "Mid", "Late"]);
    expect(plan.timeline[0]!.dueDate).toBe("2026-12-11");
    expect(plan.tasks.map((t) => t.title)).toEqual(["A", "B"]);
    expect(plan.timeline.every((t) => !t.completed)).toBe(true);
    expect(plan.assumptions).toContain("AI assumption");
    expect(runIntegrityChecks(plan, NOW).every((c) => c.passed)).toBe(true);
  });

  it("builds a full offline plan for every event type", () => {
    for (const type of ["wedding", "birthday", "community"] as const) {
      const plan = buildPlan({ ...event, type }, null);
      expect(plan.event.name).toContain("on 2027-04-10");
      expect(plan.vendors.length).toBeGreaterThan(0);
      expect(plan.timeline.every((t) => !t.completed)).toBe(true);
      expect(runIntegrityChecks(plan, NOW).every((c) => c.passed)).toBe(true);
    }
  });
});

describe("refinements", () => {
  const plan = buildPlan(
    completeDetails({ type: "wedding", totalBudget: 10000, guestCount: 50, date: "2027-04-10" }, NOW).event,
    null
  );

  it("applies budget, guests, style, ideas and tasks without mutating the input", () => {
    const next = applyRefinement(plan, {
      reply: "ok",
      budgetDeltaPercent: -20,
      guestCount: 40,
      style: "rustic",
      addIdeas: [{ category: "decor", content: "x" }],
      addTasks: [{ title: "New", phase: "p", priority: "low", daysBeforeEvent: 10 }],
    });
    expect(next.event).toMatchObject({ totalBudget: 8000, guestCount: 40, style: "rustic" });
    expect(next.budget.reduce((s, b) => s + b.allocated, 0)).toBe(8000);
    expect(next.ideas[0]!.content).toBe("x");
    expect(next.tasks.some((t) => t.title === "New")).toBe(true);
    expect(plan.event.totalBudget).toBe(10000);
    expect(
      applyRefinement(plan, { reply: "n", budgetDeltaPercent: 0, addIdeas: [], addTasks: [] }).event.totalBudget
    ).toBe(10000);
  });

  it("offline refinement handles supported requests honestly", () => {
    expect(refineOffline("cut the budget by 20%").budgetDeltaPercent).toBe(-20);
    expect(refineOffline("reduce by 15 percent").budgetDeltaPercent).toBe(-15);
    expect(refineOffline("increase the budget by 10%").budgetDeltaPercent).toBe(10);
    expect(refineOffline("cut 500%").budgetDeltaPercent).toBe(-90);
    expect(refineOffline("make it a garden party").style).toBe("outdoor");
    expect(refineOffline("add a photo booth").addTasks).toHaveLength(1);
    expect(refineOffline("make it spooky").reply).toMatch(/Gemini key/);
  });
});

describe("sample dates", () => {
  it("rebases samples into the future", () => {
    const target = sampleEventDate("wedding", NOW);
    const plan = rebaseDates(SAMPLES.wedding!, target);
    expect(plan.event.date).toBe(target);
    expect(plan.timeline.every((t) => t.dueDate <= target)).toBe(true);
    expect(sampleEventDate("birthday", NOW) < sampleEventDate("community", NOW)).toBe(true);
    expect(SAMPLES.wedding!.event.date).not.toBe(target);
  });
});

describe("integrity checks", () => {
  it("fail when the plan is actually broken", () => {
    const plan = buildPlan(
      completeDetails({ type: "birthday", totalBudget: 1000, date: "2027-04-10" }, NOW).event,
      null
    );
    plan.budget[0]!.allocated += 7;
    plan.timeline[0]!.dueDate = "2030-01-01";
    const failed = runIntegrityChecks(plan, NOW)
      .filter((c) => !c.passed)
      .map((c) => c.name);
    expect(failed).toContain("Allocations equal the total budget");
    expect(failed).toContain("Milestones fall on or before the event date");
    expect(failed).toContain("Milestones are in chronological order");
  });
});
