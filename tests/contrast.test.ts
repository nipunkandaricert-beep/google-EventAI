import { describe, it, expect } from "vitest";

const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};

// Tailwind palette values used by the component classes in src/index.css.
const PAIRS: [string, string, string][] = [
  ["body text (light)", "#0f172a", "#f8fafc"],
  ["muted text (light)", "#475569", "#ffffff"],
  ["muted text (dark)", "#cbd5e1", "#0f172a"],
  ["body text (dark)", "#f1f5f9", "#020617"],
  ["primary button (light)", "#ffffff", "#4338ca"],
  ["primary button (dark)", "#020617", "#818cf8"],
  ["link (light)", "#3730a3", "#ffffff"],
  ["link (dark)", "#c7d2fe", "#0f172a"],
  ["placeholder (light)", "#475569", "#ffffff"],
  ["placeholder (dark)", "#94a3b8", "#020617"],
  ["alert (light)", "#451a03", "#fffbeb"],
  ["alert (dark)", "#fffbeb", "#451a03"],
  ["high contrast button", "#000000", "#ffff00"],
];

describe("WCAG 2.1 AA colour contrast of design tokens (4.5:1)", () => {
  it.each(PAIRS)("%s", (_name, fg, bg) => {
    expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });
});
