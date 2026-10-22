const LOCALES: Record<string, string> = { INR: "en-IN", EUR: "de-DE", GBP: "en-GB", USD: "en-US" };

export function formatMoney(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat(LOCALES[currency] ?? "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** UTC-based ISO date (YYYY-MM-DD) so results never shift with the viewer's time zone. */
export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDaysISO(base: Date | string, days: number): string {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + days);
  return toISODate(d);
}

export function daysBetween(fromISO: string, toISOStr: string): number {
  return Math.round((Date.parse(toISOStr) - Date.parse(fromISO)) / 86_400_000);
}
