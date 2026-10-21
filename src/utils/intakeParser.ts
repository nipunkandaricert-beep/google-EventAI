export interface ParsedEventIntake {
  type?: "wedding" | "birthday" | "community";
  totalBudget?: number;
  guestCount?: number;
  style?: string;
}

export function parseEventIntake(text: string): ParsedEventIntake {
  const lower = text.toLowerCase();
  
  // Event Type
  let type: ParsedEventIntake["type"];
  if (lower.includes("wedding")) type = "wedding";
  else if (lower.includes("birthday")) type = "birthday";
  else if (lower.includes("community") || lower.includes("festival") || lower.includes("meetup")) type = "community";

  // Style
  let style: string | undefined;
  if (lower.includes("outdoor") || lower.includes("garden")) style = "outdoor";
  else if (lower.includes("rustic") || lower.includes("barn")) style = "rustic";
  else if (lower.includes("modern") || lower.includes("rooftop")) style = "modern";

  // Guest Count: look for "150 guests" or "50 people" or "300 attendees"
  let guestCount: number | undefined;
  const guestMatch = text.match(/(\d+[\d,]*)\s*(guests?|people|attendees|persons?)/i);
  if (guestMatch) {
    guestCount = parseInt(guestMatch[1].replace(/,/g, ""), 10);
  }

  // Budget: look for "$40,000" or "$5000" or "40000 budget" or "12500 funds"
  let totalBudget: number | undefined;
  const dollarMatch = text.match(/\$(\d+[\d,]*)/);
  if (dollarMatch) {
    totalBudget = parseInt(dollarMatch[1].replace(/,/g, ""), 10);
  } else {
    const budgetWordMatch = text.match(/(\d+[\d,]*)\s*(dollars?|budget|funds?)/i);
    if (budgetWordMatch) {
      totalBudget = parseInt(budgetWordMatch[1].replace(/,/g, ""), 10);
    }
  }

  return { type, totalBudget, guestCount, style };
}
