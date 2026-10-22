import type { AiPlanContent, EventType } from "../types";

/** Deterministic fallback used when no Gemini key/proxy is configured or a call fails. */
export const OFFLINE_CONTENT: Record<EventType, Omit<AiPlanContent, "timeline" | "eventName" | "description">> = {
  wedding: {
    vendors: [
      { category: "Venue", name: "Venue shortlist (get 3 quotes)" },
      { category: "Catering", name: "Caterer with tasting session" },
      { category: "Photography", name: "Photographer and videographer" },
      { category: "Florist", name: "Florist or décor studio" },
      { category: "Music", name: "DJ or live band" },
      { category: "Bakery", name: "Cake designer" },
      { category: "Transport", name: "Guest shuttle or transfers" },
    ],
    ideas: [
      {
        category: "theme",
        content: "Pick a two- or three-colour palette and carry it through stationery, flowers and table styling.",
      },
      { category: "menu", content: "Offer a signature drink pair and a late-night snack station." },
      { category: "activity", content: "Set up a guestbook station where guests leave a photo and a note." },
      { category: "decor", content: "Use string lights and greenery to soften the ceremony space." },
      { category: "entertainment", content: "Book a short acoustic set for the ceremony before the reception DJ." },
    ],
    tasks: [
      {
        title: "Draft the guest list and collect addresses",
        phase: "Planning",
        priority: "high",
        daysBeforeEvent: 270,
      },
      { title: "Book ceremony officiant", phase: "Planning", priority: "high", daysBeforeEvent: 180 },
      { title: "Schedule catering tasting", phase: "Coordination", priority: "medium", daysBeforeEvent: 90 },
      { title: "Confirm final headcount with caterer", phase: "Coordination", priority: "high", daysBeforeEvent: 21 },
      { title: "Share day-of schedule with all vendors", phase: "Final week", priority: "high", daysBeforeEvent: 5 },
    ],
    assumptions: ["Offline mode: plan content comes from built-in templates, not AI."],
  },
  birthday: {
    vendors: [
      { category: "Venue", name: "Space or hall rental" },
      { category: "Catering", name: "Caterer or restaurant package" },
      { category: "Entertainment", name: "DJ, host or activity provider" },
      { category: "Bakery", name: "Custom cake maker" },
      { category: "Décor", name: "Balloon and backdrop supplier" },
    ],
    ideas: [
      { category: "theme", content: "Choose a theme tied to the guest of honour's favourite era, place or hobby." },
      { category: "menu", content: "Serve shareable appetizers plus one signature dessert." },
      { category: "activity", content: "Run a short game or trivia round about the birthday person." },
      { category: "decor", content: "Create a photo backdrop with lighting guests will want to pose in." },
    ],
    tasks: [
      { title: "Send invitations and track RSVPs", phase: "Planning", priority: "high", daysBeforeEvent: 28 },
      { title: "Order the cake", phase: "Coordination", priority: "high", daysBeforeEvent: 14 },
      { title: "Confirm headcount with the caterer", phase: "Coordination", priority: "medium", daysBeforeEvent: 7 },
      { title: "Prepare playlist and decor kit", phase: "Final week", priority: "medium", daysBeforeEvent: 3 },
    ],
    assumptions: ["Offline mode: plan content comes from built-in templates, not AI."],
  },
  community: {
    vendors: [
      { category: "Permits", name: "Local authority permit office" },
      { category: "Audio/Visual", name: "Sound and lighting rental" },
      { category: "Stage", name: "Stage or tent supplier" },
      { category: "Sanitation", name: "Portable restroom and waste service" },
      { category: "Marketing", name: "Print shop and social ad channel" },
    ],
    ideas: [
      { category: "theme", content: "Anchor the event on one local story or cause so promotion stays focused." },
      { category: "activity", content: "Add a kids' corner and a local makers' market to widen appeal." },
      { category: "entertainment", content: "Mix one headline act with several local performers." },
      { category: "other", content: "Recruit volunteer leads per zone: entry, stage, food, clean-up." },
    ],
    tasks: [
      { title: "Apply for permits and insurance", phase: "Planning", priority: "high", daysBeforeEvent: 90 },
      { title: "Recruit and brief volunteers", phase: "Coordination", priority: "medium", daysBeforeEvent: 30 },
      { title: "Launch public promotion", phase: "Marketing", priority: "high", daysBeforeEvent: 28 },
      { title: "Run a site walk-through and safety check", phase: "Final week", priority: "high", daysBeforeEvent: 3 },
    ],
    assumptions: ["Offline mode: plan content comes from built-in templates, not AI."],
  },
};
