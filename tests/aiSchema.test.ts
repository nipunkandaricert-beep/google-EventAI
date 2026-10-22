import { describe, it, expect } from "vitest";
import { AiValidationError, extractJson, parsePlanContent, parseRefinement } from "../src/utils/aiSchema";

const step = (i: number) => ({ title: `Step ${i}`, description: "d", phase: "p", daysBeforeEvent: 100 - i });

describe("AI output validation", () => {
  it("accepts a well-formed plan and sanitises strings", () => {
    const plan = parsePlanContent({
      eventName: "<b>Big</b> Day",
      description: "x".repeat(500),
      timeline: [step(1), step(2), step(3), { title: "" }, "junk"],
      vendors: [{ category: "Venue", name: "Hall" }, { name: "" }, { name: "Lone" }],
      ideas: [
        { category: "bogus", content: "idea" },
        { category: "menu", content: "" },
      ],
      tasks: [
        { title: "t", priority: "urgent", daysBeforeEvent: 9999 },
        { title: "u", daysBeforeEvent: "x" },
      ],
      assumptions: ["a", 3, "<i>b</i>"],
    });
    expect(plan.eventName).toBe("Big Day");
    expect(plan.description).toHaveLength(300);
    expect(plan.timeline).toHaveLength(3);
    expect(plan.vendors.map((v) => v.category)).toEqual(["Venue", "Vendor"]);
    expect(plan.ideas).toEqual([{ category: "other", content: "idea" }]);
    expect(plan.tasks[0]).toMatchObject({ priority: "medium", daysBeforeEvent: 730 });
    expect(plan.tasks[1]!.daysBeforeEvent).toBe(0);
    expect(plan.assumptions).toEqual(["a", "b"]);
  });

  it("defaults missing optional fields and caps list sizes", () => {
    const plan = parsePlanContent({ timeline: Array.from({ length: 30 }, (_, i) => step(i)) });
    expect(plan.eventName).toBe("Your Event");
    expect(plan.timeline).toHaveLength(14);
    expect(plan.vendors).toEqual([]);
  });

  it("rejects malformed plans", () => {
    expect(() => parsePlanContent(null)).toThrow(AiValidationError);
    expect(() => parsePlanContent([])).toThrow(AiValidationError);
    expect(() => parsePlanContent({ timeline: [step(1)] })).toThrow(/too few/);
  });

  it("validates refinements and ignores out-of-range values", () => {
    const r = parseRefinement({
      reply: "Done",
      budgetDeltaPercent: -20,
      guestCount: 80.4,
      style: "rustic",
      addIdeas: [{ category: "decor", content: "lights" }],
      addTasks: [{ title: "t" }],
    });
    expect(r).toMatchObject({ reply: "Done", budgetDeltaPercent: -20, guestCount: 80, style: "rustic" });
    expect(r.addIdeas).toHaveLength(1);
    expect(r.addTasks).toHaveLength(1);
    const bad = parseRefinement({ reply: "ok", budgetDeltaPercent: -500, guestCount: 0, style: "weird" });
    expect(bad.budgetDeltaPercent).toBeUndefined();
    expect(bad.guestCount).toBeUndefined();
    expect(bad.style).toBeUndefined();
    expect(() => parseRefinement({})).toThrow(AiValidationError);
    expect(() => parseRefinement({ reply: "" })).toThrow(AiValidationError);
    expect(parseRefinement({ reply: "ok", budgetDeltaPercent: NaN }).budgetDeltaPercent).toBeUndefined();
  });

  it("extracts JSON, tolerating code fences", () => {
    expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(extractJson('{"a":2}')).toEqual({ a: 2 });
    expect(() => extractJson("not json")).toThrow(AiValidationError);
  });
});
