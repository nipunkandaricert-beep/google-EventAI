import { useCallback, useRef, useState } from "react";
import { SAMPLES } from "../data/samples";
import {
  applyRefinement,
  buildPlan,
  completeDetails,
  refineOffline,
  rebaseDates,
  sampleEventDate,
} from "../services/planBuilder";
import { generatePlanContent, GeminiError, isConfigured, refinePlanWithAi, type AiConfig } from "../services/gemini";
import type { ChatMessage, EventDetails, EventPlan, EventStyle, EventType, TaskStatus, VendorStatus } from "../types";
import { validateBudgetGuardrail, detectPromptInjection, normalizeInput } from "../utils/guardrails";
import { parseEventIntake, type ParsedEventIntake } from "../utils/intakeParser";
import { formatMoney } from "../utils/format";

export type Phase = "intake" | "refining";

const stamp = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
let counter = 0;
const msg = (role: ChatMessage["role"], content: string): ChatMessage => ({
  id: `m-${++counter}`,
  role,
  content,
  timestamp: stamp(),
});

const WELCOME = msg(
  "assistant",
  "Welcome to **EventAI**. Describe your event in plain English, for example: *garden wedding for 120 guests, $35,000 budget, in October*. I need at least the event type and a budget."
);

export function describeError(err: unknown): string {
  return err instanceof GeminiError ? err.message : "Something went wrong while contacting Gemini.";
}

export function usePlanner(ai: AiConfig) {
  const [plan, setPlan] = useState<EventPlan>(() => rebaseDates(SAMPLES.wedding!, sampleEventDate("wedding")));
  const [isSample, setIsSample] = useState(true);
  const [hasPlan, setHasPlan] = useState(false);
  const [phase, setPhase] = useState<Phase>("intake");
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [intake, setIntake] = useState<ParsedEventIntake>({});
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [source, setSource] = useState<"ai" | "offline" | null>(null);
  const userTexts = useRef<string[]>([]);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const say = useCallback((text: string) => setMessages((m) => [...m, msg("assistant", text)]), []);
  const notify = useCallback((text: string) => {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const generate = useCallback(
    async (parsed: ParsedEventIntake) => {
      const budgetCheck = validateBudgetGuardrail(parsed.totalBudget ?? NaN);
      if (!budgetCheck.isValid) {
        say(`I still need a budget before I can plan. ${budgetCheck.message ?? ""}`);
        return;
      }
      setBusy(true);
      const { event, assumed } = completeDetails(parsed);
      event.totalBudget = parsed.totalBudget!;
      let content = null;
      let note = "";
      if (isConfigured(ai)) {
        try {
          content = await generatePlanContent(event, userTexts.current.join("\n"), ai);
        } catch (err) {
          note = ` ${describeError(err)} I used offline templates instead.`;
        }
      } else {
        note = " No Gemini key is set, so I used offline templates. Add a key in Settings for AI-written plans.";
      }
      const next = buildPlan(event, content, assumed);
      setPlan(next);
      setHasPlan(true);
      setIsSample(false);
      setSource(content ? "ai" : "offline");
      setPhase("refining");
      setBusy(false);
      say(
        `Your plan for **${next.event.name}** is ready (${formatMoney(next.event.totalBudget, next.event.currency)}, ${next.event.guestCount} guests).${note} Ask me to refine it.`
      );
      notify("Plan generated");
    },
    [ai, say, notify]
  );

  const generateWithDetails = useCallback(
    async (details: {
      type: EventType;
      name: string;
      guestCount: number;
      totalBudget: number;
      date: string;
      style: EventStyle;
      location?: string;
      notes?: string;
    }) => {
      const budgetCheck = validateBudgetGuardrail(details.totalBudget);
      if (!budgetCheck.isValid) {
        say(`I still need a valid budget. ${budgetCheck.message ?? ""}`);
        return;
      }
      setBusy(true);
      const event: EventDetails = {
        id: `evt-${Date.now()}`,
        type: details.type,
        name: details.name,
        date: details.date,
        location: details.location || "",
        guestCount: details.guestCount,
        totalBudget: details.totalBudget,
        style: details.style,
        currency: "USD",
        description: details.notes,
      };
      const assumed: string[] = [`Generated from dedicated ${details.type} studio inputs.`];
      let content = null;
      let note = "";
      if (isConfigured(ai)) {
        try {
          content = await generatePlanContent(
            event,
            details.notes || `${details.name} for ${details.guestCount} guests`,
            ai
          );
        } catch (err) {
          note = ` ${describeError(err)} I used offline templates instead.`;
        }
      } else {
        note = " No Gemini key is set, so I used offline templates. Add a key in Settings for AI-written plans.";
      }
      const next = buildPlan(event, content, assumed);
      setPlan(next);
      setHasPlan(true);
      setIsSample(false);
      setSource(content ? "ai" : "offline");
      setPhase("refining");
      setBusy(false);
      say(
        `Your blueprint for **${next.event.name}** is ready (${formatMoney(next.event.totalBudget, next.event.currency)}, ${next.event.guestCount} guests).${note} You can track spending, tick milestones, or ask for refinements.`
      );
      notify("Plan generated");
    },
    [ai, say, notify]
  );

  const send = useCallback(
    async (raw: string) => {
      const text = normalizeInput(raw);
      if (!text || busy) return;
      if (!detectPromptInjection(text).isSafe) {
        setMessages((m) => [
          ...m,
          msg(
            "assistant",
            "That message looks like an attempt to change my instructions, so I ignored it. Please describe your event."
          ),
        ]);
        notify("Message blocked by safety check");
        return;
      }
      setMessages((m) => [...m, msg("user", text)]);
      userTexts.current.push(text);

      if (phase === "refining") {
        setBusy(true);
        let refinement = refineOffline(text);
        if (isConfigured(ai)) {
          try {
            refinement = await refinePlanWithAi(plan, text, ai);
          } catch (err) {
            refinement = {
              ...refineOffline(text),
              reply: `${describeError(err)} ${refineOffline(text).reply}`,
            };
          }
        }
        setPlan((p) => applyRefinement(p, refinement));
        setBusy(false);
        say(refinement.reply);
        return;
      }

      const merged = { ...intake };
      for (const [k, v] of Object.entries(parseEventIntake(text)))
        if (v !== undefined) (merged as Record<string, unknown>)[k] = v;
      setIntake(merged);
      const have = [
        merged.type && `type: ${merged.type}`,
        merged.totalBudget && `budget: ${formatMoney(merged.totalBudget, merged.currency)}`,
        merged.guestCount && `guests: ${merged.guestCount}`,
        merged.date && `date: ${merged.date}`,
      ].filter(Boolean);
      if (merged.type && merged.totalBudget) {
        say(
          `Got it (${have.join(", ")}). Missing details will be assumed and listed. Press **Generate plan** when ready.`
        );
      } else {
        const need = [!merged.type && "event type", !merged.totalBudget && "budget"].filter(Boolean).join(" and ");
        say(`Thanks${have.length ? ` (${have.join(", ")})` : ""}. I still need the ${need}.`);
      }
    },
    [ai, busy, intake, phase, plan, say, notify]
  );

  const loadSample = useCallback(
    (type: EventType) => {
      setPlan(rebaseDates(SAMPLES[type]!, sampleEventDate(type)));
      setIsSample(true);
      setHasPlan(true);
      setSource(null);
      setPhase("refining");
      say(
        `Loaded the sample ${type} blueprint with dates shifted to the future. Describe a new event to build your own.`
      );
      notify(`Loaded sample ${type}`);
    },
    [say, notify]
  );

  const reset = useCallback(() => {
    setPhase("intake");
    setHasPlan(false);
    setIsSample(false);
    setIntake({});
    userTexts.current = [];
    say("Starting fresh. Describe your next event or configure details.");
  }, [say]);

  const update = useCallback((fn: (p: EventPlan) => EventPlan) => setPlan(fn), []);
  const updateSpent = (id: string, val: number) =>
    update((p) => ({
      ...p,
      budget: p.budget.map((b) => (b.id === id ? { ...b, spent: Math.max(0, Math.round(val) || 0) } : b)),
    }));
  const toggleTimeline = (id: string) =>
    update((p) => ({
      ...p,
      timeline: p.timeline.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    }));
  const setVendorStatus = (id: string, status: VendorStatus) =>
    update((p) => ({
      ...p,
      vendors: p.vendors.map((v) => (v.id === id ? { ...v, status } : v)),
    }));
  const toggleIdea = (id: string) =>
    update((p) => ({
      ...p,
      ideas: p.ideas.map((i) => (i.id === id ? { ...i, saved: !i.saved } : i)),
    }));
  const setTaskStatus = (id: string, status: TaskStatus) =>
    update((p) => ({
      ...p,
      tasks: p.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    }));

  return {
    plan,
    isSample,
    hasPlan,
    phase,
    messages,
    intake,
    busy,
    toast,
    source,
    send,
    generate: () => generate(intake),
    generateWithDetails,
    loadSample,
    reset,
    notify,
    updateSpent,
    toggleTimeline,
    setVendorStatus,
    toggleIdea,
    setTaskStatus,
  };
}
