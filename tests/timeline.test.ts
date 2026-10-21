import { describe, it, expect } from "vitest";
import { checkLeadTimeFeasibility, generateBackwardTimeline } from "../src/utils/timelineEngine";

describe("Timeline Engine - Backward Scheduling & Feasibility", () => {
  const simulatedToday = new Date("2026-10-21");

  it("flags a critical lead time warning if event date is less than 2 weeks away", () => {
    // 7 days away
    const shortEventDate = "2026-10-28";
    const result = checkLeadTimeFeasibility(shortEventDate, 50, simulatedToday);

    expect(result.isFeasible).toBe(false);
    expect(result.isUrgent).toBe(true);
    expect(result.warning).toContain("< 2 weeks");
  });

  it("flags a warning if large event (>= 100 guests) has under 2 months lead time", () => {
    // 4 weeks away with 150 guests
    const dateOneMonthAway = "2026-11-18";
    const result = checkLeadTimeFeasibility(dateOneMonthAway, 150, simulatedToday);

    expect(result.isFeasible).toBe(false);
    expect(result.warning).toContain("< 2 months");
  });

  it("passes feasibility check when lead time is adequate", () => {
    // 6 months away
    const dateSixMonthsAway = "2027-04-21";
    const result = checkLeadTimeFeasibility(dateSixMonthsAway, 120, simulatedToday);

    expect(result.isFeasible).toBe(true);
    expect(result.warning).toBeUndefined();
  });

  it("generates backward milestones where due dates occur chronologically before the event", () => {
    const eventDate = "2027-06-15";
    const timeline = generateBackwardTimeline(eventDate, "wedding");

    expect(timeline.length).toBeGreaterThan(0);
    for (const milestone of timeline) {
      expect(new Date(milestone.dueDate).getTime()).toBeLessThanOrEqual(new Date(eventDate).getTime());
    }
  });
});
