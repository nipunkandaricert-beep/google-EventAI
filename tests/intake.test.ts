import { describe, it, expect } from "vitest";
import { parseEventIntake } from "../src/utils/intakeParser";

describe("Intake Natural Language Parser", () => {
  it("extracts wedding event details accurately", () => {
    const input = "We are planning a garden wedding for 150 guests with a $40,000 budget in October";
    const res = parseEventIntake(input);

    expect(res.type).toBe("wedding");
    expect(res.guestCount).toBe(150);
    expect(res.totalBudget).toBe(40000);
    expect(res.style).toBe("outdoor");
  });

  it("extracts birthday party details accurately", () => {
    const input = "Planning a 30th birthday party with $5,000 budget for 40 people";
    const res = parseEventIntake(input);

    expect(res.type).toBe("birthday");
    expect(res.guestCount).toBe(40);
    expect(res.totalBudget).toBe(5000);
  });

  it("extracts community festival details accurately", () => {
    const input = "Annual community festival for 500 attendees with $12,500 funds";
    const res = parseEventIntake(input);

    expect(res.type).toBe("community");
    expect(res.guestCount).toBe(500);
    expect(res.totalBudget).toBe(12500);
  });
});
