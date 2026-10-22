import type { TimelineItem, EventType } from "../types";

export interface LeadTimeCheck {
  isFeasible: boolean;
  leadTimeWeeks: number;
  leadTimeDays: number;
  leadTimeMonths: number;
  warning?: string;
  isUrgent: boolean;
}

/**
 * Checks lead time feasibility according to problem statement specifications:
 * - Flag if lead time is < 2 weeks for small events
 * - Flag if lead time is < 2 months for large events (> 100 guests)
 */
export function checkLeadTimeFeasibility(
  eventDateStr: string,
  guestCount: number,
  now: Date = new Date()
): LeadTimeCheck {
  const targetDate = new Date(eventDateStr);
  const diffMs = targetDate.getTime() - now.getTime();
  const leadTimeDays = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
  const leadTimeWeeks = Math.round(leadTimeDays / 7);
  const leadTimeMonths = parseFloat((leadTimeDays / 30.4).toFixed(1));

  let warning: string | undefined;
  let isFeasible = true;
  let isUrgent = false;

  if (leadTimeDays < 14) {
    isFeasible = false;
    isUrgent = true;
    warning = `⚠️ Critical Lead Time Warning: Event is only ${leadTimeDays} days away (< 2 weeks). Vendor & venue options will be severely limited.`;
  } else if (guestCount >= 100 && leadTimeMonths < 2.0) {
    isFeasible = false;
    isUrgent = true;
    warning = `⚠️ Lead Time Warning: Planning a large event (${guestCount} guests) with < 2 months lead time (${leadTimeWeeks} weeks). Catering & venue capacity may be scarce.`;
  } else if (leadTimeMonths < 1.0) {
    isUrgent = true;
    warning = `ℹ️ Accelerated Timeline: Less than 1 month lead time. Recommend fast-tracking vendor contracts.`;
  }

  return {
    isFeasible,
    leadTimeWeeks,
    leadTimeDays,
    leadTimeMonths,
    warning,
    isUrgent,
  };
}

/**
 * Calculates backward timeline milestones from event date.
 */
export function generateBackwardTimeline(eventDateStr: string, eventType: EventType): TimelineItem[] {
  const targetDate = new Date(eventDateStr);

  const subtractDays = (d: Date, days: number) => {
    const copy = new Date(d);
    copy.setUTCDate(copy.getUTCDate() - days);
    return copy.toISOString().split("T")[0];
  };

  if (eventType === "wedding") {
    return [
      {
        id: "t-1",
        title: "Book Venue & Set Date",
        description: "Secure vineyard/hall contract and pay initial deposit",
        dueDate: subtractDays(targetDate, 240),
        phase: "12-8 Months Out",
        completed: true,
      },
      {
        id: "t-2",
        title: "Hire Lead Photographer & DJ",
        description: "Lock in primary photographer and reception music entertainment",
        dueDate: subtractDays(targetDate, 180),
        phase: "6-5 Months Out",
        completed: true,
      },
      {
        id: "t-3",
        title: "Order Wedding Attire & Alterations",
        description: "Finalize gown/suits and schedule fittings",
        dueDate: subtractDays(targetDate, 120),
        phase: "4 Months Out",
        completed: false,
      },
      {
        id: "t-4",
        title: "Send Invitations & Collect RSVPs",
        description: "Mail invitations with dietary restrictions deadline",
        dueDate: subtractDays(targetDate, 60),
        phase: "2 Months Out",
        completed: false,
      },
      {
        id: "t-5",
        title: "Final Headcount to Caterer",
        description: "Confirm meal selections and seating chart",
        dueDate: subtractDays(targetDate, 20),
        phase: "3 Weeks Out",
        completed: false,
      },
      {
        id: "t-6",
        title: "Rehearsal Dinner & Final Prep",
        description: "Ceremony walkthrough and deliver venue décor items",
        dueDate: subtractDays(targetDate, 1),
        phase: "Final Days",
        completed: false,
      },
      {
        id: "t-7",
        title: "Wedding Day Execution",
        description: "Ceremony, photos, banquet reception, and send-off",
        dueDate: eventDateStr,
        phase: "Event Day",
        completed: false,
      },
    ];
  }

  // Generic backward timeline for other event types
  return [
    {
      id: "t-1",
      title: "Confirm Venue & Date",
      description: "Book space and confirm contract",
      dueDate: subtractDays(targetDate, 45),
      phase: "6 Weeks Out",
      completed: true,
    },
    {
      id: "t-2",
      title: "Send Invitations",
      description: "Digital invites and RSVP tracking",
      dueDate: subtractDays(targetDate, 30),
      phase: "4 Weeks Out",
      completed: false,
    },
    {
      id: "t-3",
      title: "Confirm Catering & Entertainment",
      description: "Lock in menu, cake, and audio equipment",
      dueDate: subtractDays(targetDate, 14),
      phase: "2 Weeks Out",
      completed: false,
    },
    {
      id: "t-4",
      title: "Event Celebration",
      description: "Setup, guest arrival, celebration, and load-out",
      dueDate: eventDateStr,
      phase: "Event Day",
      completed: false,
    },
  ];
}
