import type { EventStyle, EventType } from "../types";
import { toISODate } from "./format";

export interface ParsedEventIntake {
  type?: EventType;
  totalBudget?: number;
  currency?: string;
  guestCount?: number;
  style?: EventStyle;
  date?: string;
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const CURRENCY_SYMBOLS: Record<string, string> = { $: "USD", "₹": "INR", "€": "EUR", "£": "GBP" };
const SUFFIX: Record<string, number> = { k: 1e3, m: 1e6, lakh: 1e5, lakhs: 1e5, lac: 1e5 };

function toNumber(raw: string, suffix?: string): number {
  const base = parseFloat(raw.replace(/,/g, ""));
  return Math.round(base * (suffix ? (SUFFIX[suffix.toLowerCase()] ?? 1) : 1));
}

function parseBudget(text: string): { totalBudget?: number; currency?: string } {
  const symbol = text.match(/([$₹€£])\s*(\d[\d,]*(?:\.\d+)?)\s*(k|m|lakhs?|lac)?\b/i);
  if (symbol) return { totalBudget: toNumber(symbol[2]!, symbol[3]), currency: CURRENCY_SYMBOLS[symbol[1]!] };
  const word = text.match(
    /(\d[\d,]*(?:\.\d+)?)\s*(k|m|lakhs?|lac)?\s*(dollars?|usd|rupees|inr|euros?|pounds?|budget|funds?)\b/i
  );
  if (word) {
    const unit = word[3]!.toLowerCase();
    const currency = /rupee|inr/.test(unit)
      ? "INR"
      : /euro/.test(unit)
        ? "EUR"
        : /pound/.test(unit)
          ? "GBP"
          : /dollar|usd/.test(unit)
            ? "USD"
            : undefined;
    return { totalBudget: toNumber(word[1]!, word[2]), currency };
  }
  return {};
}

/** Returns an ISO date. Month-only mentions resolve to the 15th of the next such month. */
export function parseEventDate(text: string, now: Date = new Date()): string | undefined {
  const iso = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (iso) {
    const d = new Date(`${iso[0]}T00:00:00Z`);
    return Number.isNaN(d.getTime()) ? undefined : iso[0];
  }
  const m = text.match(
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b\.?\s*(\d{1,2})?(?:st|nd|rd|th)?(?:,?\s*(\d{4}))?/i
  );
  if (!m) return undefined;
  const month = MONTHS.indexOf(m[1]!.slice(0, 3).toLowerCase());
  const explicitDay = m[2] ? parseInt(m[2], 10) : undefined;
  const day = explicitDay && explicitDay >= 1 && explicitDay <= 31 ? explicitDay : 15;
  let year = m[3] ? parseInt(m[3], 10) : now.getUTCFullYear();
  let candidate = new Date(Date.UTC(year, month, day));
  if (!m[3] && candidate.getTime() <= now.getTime()) {
    year += 1;
    candidate = new Date(Date.UTC(year, month, day));
  }
  return candidate.getUTCMonth() === month ? toISODate(candidate) : undefined;
}

export function parseEventIntake(text: string, now: Date = new Date()): ParsedEventIntake {
  const lower = text.toLowerCase();
  const out: ParsedEventIntake = {};

  if (/wedding|marriage|engagement/.test(lower)) out.type = "wedding";
  else if (/birthday|bday/.test(lower)) out.type = "birthday";
  else if (/community|festival|meetup|fundraiser|charity/.test(lower)) out.type = "community";

  if (/outdoor|garden|vineyard|beach/.test(lower)) out.style = "outdoor";
  else if (/rustic|barn/.test(lower)) out.style = "rustic";
  else if (/modern|rooftop/.test(lower)) out.style = "modern";
  else if (/elegant|formal|black[- ]tie/.test(lower)) out.style = "elegant";
  else if (/traditional/.test(lower)) out.style = "traditional";
  else if (/casual|relaxed/.test(lower)) out.style = "casual";

  const guests = text.match(/(\d[\d,]*)\s*(guests?|people|attendees|persons?|pax)/i);
  if (guests) out.guestCount = parseInt(guests[1]!.replace(/,/g, ""), 10);

  const budget = parseBudget(text);
  if (budget.totalBudget !== undefined) out.totalBudget = budget.totalBudget;
  if (budget.currency) out.currency = budget.currency;

  const date = parseEventDate(text, now);
  if (date) out.date = date;
  return out;
}
