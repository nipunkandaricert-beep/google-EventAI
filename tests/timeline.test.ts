import { describe, it, expect } from "vitest";
import { checkLeadTimeFeasibility, generateBackwardTimeline } from "../src/utils/timelineEngine";

const TODAY = new Date("2026-10-21T00:00:00Z");

describe("Timeline engine", () => {
  it("flags under two weeks as critical", () => {
    const r = checkLeadTimeFeasibility("2026-10-28", 50, TODAY);
    expect(r).toMatchObject({ isFeasible: false, isUrgent: true });
    expect(r.warning).toContain("< 2 weeks");
  });
  it("flags large events with under two months", () => {
    const r = checkLeadTimeFeasibility("2026-11-18", 150, TODAY);
    expect(r.isFeasible).toBe(false);
    expect(r.warning).toContain("< 2 months");
  });
  it("flags accelerated timelines under a month for small events", () => {
    const r = checkLeadTimeFeasibility("2026-11-15", 20, TODAY);
    expect(r.isFeasible).toBe(true);
    expect(r.isUrgent).toBe(true);
  });
  it("passes with adequate lead time", () => {
    const r = checkLeadTimeFeasibility("2027-04-21", 120, TODAY);
    expect(r.isFeasible).toBe(true);
    expect(r.warning).toBeUndefined();
  });
  it("uses the real clock by default", () => {
    const soon = new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10);
    expect(checkLeadTimeFeasibility(soon, 10).isFeasible).toBe(false);
  });
  it("schedules every milestone on or before the event for each type", () => {
    for (const type of ["wedding", "birthday", "community"] as const) {
      const timeline = generateBackwardTimeline("2027-06-15", type);
      expect(timeline.length).toBeGreaterThan(0);
      for (const m of timeline) expect(Date.parse(m.dueDate)).toBeLessThanOrEqual(Date.parse("2027-06-15"));
    }
  });
  it("is exact across daylight-saving changes (UTC date math)", () => {
    const t = generateBackwardTimeline("2027-03-15", "wedding");
    const first = t[0]!;
    expect(first.dueDate).toBe(new Date(Date.UTC(2027, 2, 15) - 240 * 86_400_000).toISOString().slice(0, 10));
  });
});
