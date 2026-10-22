import { describe, it, expect } from "vitest";
import { parseEventDate, parseEventIntake } from "../src/utils/intakeParser";

const NOW = new Date("2026-10-21T00:00:00Z");

describe("Intake parser", () => {
  it("extracts a wedding", () => {
    const r = parseEventIntake("We are planning a garden wedding for 150 guests with a $40,000 budget in October", NOW);
    expect(r).toMatchObject({
      type: "wedding",
      guestCount: 150,
      totalBudget: 40000,
      style: "outdoor",
      currency: "USD",
    });
    expect(r.date).toBe("2027-10-15");
  });

  it("extracts a birthday and a community festival", () => {
    expect(parseEventIntake("30th birthday party with $5,000 budget for 40 people", NOW)).toMatchObject({
      type: "birthday",
      guestCount: 40,
      totalBudget: 5000,
    });
    expect(parseEventIntake("Annual community festival for 500 attendees with $12,500 funds", NOW)).toMatchObject({
      type: "community",
      guestCount: 500,
      totalBudget: 12500,
    });
  });

  it("understands k/m/lakh suffixes and other currencies", () => {
    expect(parseEventIntake("wedding, $25k", NOW)).toMatchObject({ totalBudget: 25000, currency: "USD" });
    expect(parseEventIntake("wedding budget ₹5 lakh", NOW)).toMatchObject({ totalBudget: 500000, currency: "INR" });
    expect(parseEventIntake("party with €2.5k", NOW)).toMatchObject({ totalBudget: 2500, currency: "EUR" });
    expect(parseEventIntake("birthday, 3000 dollars", NOW).totalBudget).toBe(3000);
    expect(parseEventIntake("birthday, 2000 rupees", NOW).currency).toBe("INR");
    expect(parseEventIntake("meetup, 800 pounds", NOW).currency).toBe("GBP");
    expect(parseEventIntake("meetup, 800 euros", NOW).currency).toBe("EUR");
    expect(parseEventIntake("meetup, 12,500 funds", NOW).totalBudget).toBe(12500);
  });

  it("detects styles", () => {
    for (const [word, style] of [
      ["rustic barn", "rustic"],
      ["modern rooftop", "modern"],
      ["elegant black-tie", "elegant"],
      ["traditional", "traditional"],
      ["casual", "casual"],
    ] as const) {
      expect(parseEventIntake(`wedding ${word}`, NOW).style).toBe(style);
    }
  });

  it("returns nothing for unrelated text", () => {
    expect(parseEventIntake("hello there", NOW)).toEqual({});
  });

  it("parses dates", () => {
    expect(parseEventDate("on 2027-03-05", NOW)).toBe("2027-03-05");
    expect(parseEventDate("on 2027-13-45", NOW)).toBeUndefined();
    expect(parseEventDate("Nov 20, 2026", NOW)).toBe("2026-11-20");
    expect(parseEventDate("November 20", NOW)).toBe("2026-11-20");
    expect(parseEventDate("sometime in March", NOW)).toBe("2027-03-15");
    expect(parseEventDate("Oct 5", NOW)).toBe("2027-10-05");
    expect(parseEventDate("Feb 31", NOW)).toBeUndefined();
    expect(parseEventDate("no date here", NOW)).toBeUndefined();
  });
});
