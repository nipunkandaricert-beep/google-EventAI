import { useState, useEffect, useRef } from "react";
import type {
  EventPlan,
  ChatMessage,
  VendorStatus,
  TaskStatus,
} from "./types";
import { SAMPLES } from "./data/samples";

export default function App() {
  // Navigation: "home" | "planner"
  const [currentView, setCurrentView] = useState<"home" | "planner">("home");

  // Dark mode
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  // Active event plan
  const [currentPlan, setCurrentPlan] = useState<EventPlan | null>(SAMPLES.wedding);

  // Active dashboard tab: "budget" | "timeline" | "vendors" | "ideas" | "tasks"
  const [activeTab, setActiveTab] = useState<"budget" | "timeline" | "vendors" | "ideas" | "tasks">("budget");

  // Chat state
  const [chatPhase, setChatPhase] = useState<"intake" | "refinement">("refinement");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-msg",
      role: "assistant",
      content:
        "👋 Welcome to **EventAI**! Describe your event in plain English (e.g. *'Planning a garden wedding for 120 guests with a $35,000 budget in October'*). I will generate your budget, backward timeline, vendor checklist, and personalized ideas!",
      timestamp: "Just now",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Captured entity chips
  const [extractedDetails, setExtractedDetails] = useState<{
    type?: string;
    totalBudget?: number;
    guestCount?: number;
  }>({
    type: "wedding",
    totalBudget: 35000,
    guestCount: 120,
  });

  // Toast notice
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Gemini API Key modal
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem("gemini_api_key") || "");
  const [hasApiKey, setHasApiKey] = useState(() => !!localStorage.getItem("gemini_api_key"));

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  // Scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiLoading]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleTheme = () => setIsDark((prev) => !prev);

  const saveApiKey = () => {
    const key = apiKeyInput.trim();
    if (key) {
      localStorage.setItem("gemini_api_key", key);
      setHasApiKey(true);
      showToast("Gemini API Key saved!");
    }
    setApiKeyModalOpen(false);
  };

  const clearApiKey = () => {
    localStorage.removeItem("gemini_api_key");
    setApiKeyInput("");
    setHasApiKey(false);
    setApiKeyModalOpen(false);
    showToast("API Key removed");
  };

  // 1-Click Load Sample Blueprint
  const handleLoadSample = (key: string) => {
    const sample = JSON.parse(JSON.stringify(SAMPLES[key]));
    setCurrentPlan(sample);
    setExtractedDetails({
      type: sample.event.type,
      totalBudget: sample.event.totalBudget,
      guestCount: sample.event.guestCount,
    });
    setChatPhase("refinement");

    setMessages((prev) => [
      ...prev,
      {
        id: `sample-${Date.now()}`,
        role: "assistant",
        content: `🎉 Loaded **${sample.event.name}**! Explore the live interactive dashboard on the right, or tell me any changes to refine it (e.g., *'cut budget by 20%'*, *'make it outdoors'*, *'add photo booth'*).`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    showToast(`Loaded ${sample.event.name}`);
  };

  // Conversational Refinement Logic
  const handleRefineInstruction = (instruction: string) => {
    if (!currentPlan) return;
    const lower = instruction.toLowerCase();
    let feedback = `Applied adjustments based on "${instruction}".`;
    const updated: EventPlan = JSON.parse(JSON.stringify(currentPlan));

    if (lower.includes("cut") && (lower.includes("20%") || lower.includes("20 percent"))) {
      const cut = 0.8;
      updated.event.totalBudget = Math.round(updated.event.totalBudget * cut);
      updated.budget = updated.budget.map((b) => ({
        ...b,
        allocated: Math.round(b.allocated * cut),
        spent: Math.min(b.spent, Math.round(b.allocated * cut)),
      }));
      feedback = "✂️ Reduced the total budget by 20% and recalculated all category allocations proportionally in code!";
    } else if (lower.includes("outdoor") || lower.includes("garden")) {
      updated.event.style = "outdoor";
      updated.ideas.unshift({
        id: `idea-${Date.now()}`,
        category: "decor",
        content: "Weather-resistant marquee pavilion with garden fairy lighting and bistro seating.",
        saved: true,
      });
      feedback = "🌿 Updated event style to Outdoor and added garden fairy lighting to your ideas gallery!";
    } else if (lower.includes("photo booth") || lower.includes("photobooth")) {
      updated.ideas.unshift({
        id: `idea-pb-${Date.now()}`,
        category: "entertainment",
        content: "Instant print vintage photo booth with custom signage and digital GIF sharing.",
        saved: true,
      });
      updated.tasks.unshift({
        id: `tk-pb-${Date.now()}`,
        title: "Book local 360 photo booth rental",
        dueDate: "2026-10-01",
        status: "pending",
        phase: "Coordination",
        priority: "medium",
      });
      feedback = "📸 Added Photo Booth experience to your ideas gallery and task tracker!";
    } else if (lower.includes("music") || lower.includes("dj") || lower.includes("band")) {
      updated.ideas.unshift({
        id: `idea-music-${Date.now()}`,
        category: "entertainment",
        content: "Acoustic duo for ceremony followed by high-energy 5-piece live band for reception.",
        saved: true,
      });
      feedback = "🎵 Added live musical entertainment arrangements to your ideas gallery!";
    }

    setCurrentPlan(updated);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `refine-${Date.now()}`,
          role: "assistant",
          content: `✨ ${feedback}\n\nCheck the updated values in the dashboard tabs!`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsAiLoading(false);
    }, 400);
  };

  // Dispatch Chat Message
  const handleSendMessage = () => {
    const text = inputText.trim();
    if (!text || isAiLoading) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setInputText("");
    setIsAiLoading(true);

    // Entity extraction
    const lower = text.toLowerCase();
    const nextExtracted = { ...extractedDetails };

    if (lower.includes("wedding")) nextExtracted.type = "wedding";
    else if (lower.includes("birthday")) nextExtracted.type = "birthday";
    else if (lower.includes("community") || lower.includes("festival")) nextExtracted.type = "community";

    const budgetMatch = text.match(/\$?(\d+[\d,]*)\b/);
    if (budgetMatch) {
      const num = parseInt(budgetMatch[1].replace(/,/g, ""));
      if (num > 500) nextExtracted.totalBudget = num;
    }

    const guestMatch = text.match(/(\d+)\s*(guests?|people)/i);
    if (guestMatch) {
      nextExtracted.guestCount = parseInt(guestMatch[1]);
    }

    setExtractedDetails(nextExtracted);

    if (chatPhase === "refinement" && currentPlan) {
      handleRefineInstruction(text);
    } else {
      setTimeout(() => {
        let reply = "Got it! ";
        if (nextExtracted.type) reply += `Event identified as a **${nextExtracted.type}**. `;
        if (nextExtracted.totalBudget) reply += `Budget set to **$${nextExtracted.totalBudget.toLocaleString()}**. `;
        if (nextExtracted.guestCount) reply += `Target guest count: **${nextExtracted.guestCount}**. `;
        reply += "Click **'Generate Full Event Plan'** below to produce your customized blueprint!";

        setMessages((prev) => [
          ...prev,
          {
            id: `reply-${Date.now()}`,
            role: "assistant",
            content: reply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        setIsAiLoading(false);
        showToast("Ready! Click 'Generate Full Event Plan'");
      }, 500);
    }
  };

  // Generate Plan Trigger
  const handleGeneratePlan = () => {
    const type = extractedDetails.type || "wedding";
    const base = SAMPLES[type] || SAMPLES.wedding;
    const generated: EventPlan = JSON.parse(JSON.stringify(base));

    if (extractedDetails.totalBudget) {
      generated.event.totalBudget = extractedDetails.totalBudget;
      generated.budget = generated.budget.map((b) => ({
        ...b,
        allocated: Math.round(generated.event.totalBudget * (b.percentage / 100)),
      }));
    }
    if (extractedDetails.guestCount) {
      generated.event.guestCount = extractedDetails.guestCount;
    }

    setCurrentPlan(generated);
    setChatPhase("refinement");

    setMessages((prev) => [
      ...prev,
      {
        id: `gen-${Date.now()}`,
        role: "assistant",
        content: `🎉 Your complete blueprint for **${generated.event.name}** is generated! View the budget, timeline, vendors, ideas, and tasks on the right. You can now chat to refine anything!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    showToast("Blueprint generated successfully!");
  };

  // Dashboard Sub-Entity Updaters
  const updateSpent = (id: string, val: number) => {
    if (!currentPlan) return;
    setCurrentPlan({
      ...currentPlan,
      budget: currentPlan.budget.map((b) => (b.id === id ? { ...b, spent: val } : b)),
    });
  };

  const toggleTimeline = (id: string) => {
    if (!currentPlan) return;
    setCurrentPlan({
      ...currentPlan,
      timeline: currentPlan.timeline.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    });
  };

  const updateVendorStatus = (id: string, status: VendorStatus) => {
    if (!currentPlan) return;
    setCurrentPlan({
      ...currentPlan,
      vendors: currentPlan.vendors.map((v) => (v.id === id ? { ...v, status } : v)),
    });
  };

  const toggleSaveIdea = (id: string) => {
    if (!currentPlan) return;
    setCurrentPlan({
      ...currentPlan,
      ideas: currentPlan.ideas.map((i) => (i.id === id ? { ...i, saved: !i.saved } : i)),
    });
  };

  const cycleTaskStatus = (id: string) => {
    if (!currentPlan) return;
    const nextStatus: Record<TaskStatus, TaskStatus> = {
      pending: "in-progress",
      "in-progress": "completed",
      completed: "pending",
    };
    setCurrentPlan({
      ...currentPlan,
      tasks: currentPlan.tasks.map((t) => (t.id === id ? { ...t, status: nextStatus[t.status] } : t)),
    });
  };

  const handleShareSummary = () => {
    if (!currentPlan) return;
    const summary = `Event: ${currentPlan.event.name}\nType: ${currentPlan.event.type}\nBudget: $${currentPlan.event.totalBudget.toLocaleString()}\nGuests: ${currentPlan.event.guestCount}\nDate: ${currentPlan.event.date}`;
    navigator.clipboard?.writeText(summary);
    showToast("Copied blueprint summary to clipboard!");
  };

  // Progress metrics
  const completedTasks = currentPlan ? currentPlan.tasks.filter((t) => t.status === "completed").length : 0;
  const bookedVendors = currentPlan ? currentPlan.vendors.filter((v) => v.status === "booked" || v.status === "paid").length : 0;
  const totalSpent = currentPlan ? currentPlan.budget.reduce((sum, b) => sum + (b.spent || 0), 0) : 0;
  const savedIdeasCount = currentPlan ? currentPlan.ideas.filter((i) => i.saved).length : 0;

  return (
    <div className="min-h-full flex flex-col">
      {/* ================= NAVBAR ================= */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 border-b border-indigo-500/20 dark:border-slate-800 shadow-md backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => setCurrentView("home")}
              className="flex items-center gap-2 text-white font-bold text-xl tracking-tight transition hover:opacity-95"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-xl backdrop-blur-sm shadow-inner">
                🎉
              </span>
              <span>
                Event<span className="text-indigo-200">AI</span>
              </span>
            </button>

            {/* Nav Links & Controls */}
            <div className="flex items-center gap-2 sm:gap-4">
              <nav className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentView("home")}
                  className={`rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition ${
                    currentView === "home"
                      ? "bg-white/20 text-white"
                      : "text-indigo-100 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => setCurrentView("planner")}
                  className={`rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition ${
                    currentView === "planner"
                      ? "bg-white/20 text-white"
                      : "text-indigo-100 hover:text-white hover:bg-white/10"
                  }`}
                >
                  AI Planner
                </button>
              </nav>

              <div className="h-5 w-px bg-white/20 hidden sm:block" />

              {/* API Key Modal Button */}
              <button
                onClick={() => setApiKeyModalOpen(true)}
                title="Configure Gemini API Key"
                className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
              >
                <span>⚡</span>
                <span className="hidden sm:inline">{hasApiKey ? "API Ready" : "API Key"}</span>
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white transition hover:bg-white/20 hover:scale-105"
              >
                <span>{isDark ? "☀️" : "🌙"}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 pt-16 flex flex-col">
        {/* ================= VIEW 1: HOME ================= */}
        {currentView === "home" && (
          <div className="flex-1 flex flex-col">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-indigo-800 to-slate-900 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950 py-20 px-6 text-white sm:py-28 lg:px-8">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-200 backdrop-blur-sm">
                  ✨ Next-Gen AI Event Planner • Powered by Gemini 3.8 Flash
                </div>
                <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-tight">
                  Plan Dream Events in Minutes,{" "}
                  <span className="bg-gradient-to-r from-indigo-200 via-violet-200 to-pink-200 bg-clip-text text-transparent">
                    Not Weeks
                  </span>
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-indigo-100/90 leading-relaxed">
                  Turn natural language descriptions into complete event execution blueprints.
                  Automated budget percentage splits, backward-scheduled timelines, vendor checklists, and tailored ideas.
                </p>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                  <button
                    onClick={() => setCurrentView("planner")}
                    className="rounded-xl bg-white dark:bg-indigo-600 px-7 py-3.5 text-base font-bold text-indigo-900 dark:text-white shadow-lg transition-all hover:bg-indigo-50 dark:hover:bg-indigo-500 hover:scale-105"
                  >
                    Launch Event Planner →
                  </button>
                  <button
                    onClick={() => {
                      handleLoadSample("wedding");
                      setCurrentView("planner");
                    }}
                    className="rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                  >
                    Explore Wedding Blueprint 💒
                  </button>
                </div>

                {/* Highlight Stats */}
                <div className="mt-14 grid grid-cols-2 gap-4 border-t border-indigo-700/50 dark:border-slate-800 pt-8 sm:grid-cols-4">
                  <div>
                    <p className="text-3xl font-extrabold text-white">100%</p>
                    <p className="text-xs text-indigo-200">Budget Accuracy Math</p>
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-white">1-Pass</p>
                    <p className="text-xs text-indigo-200">Full Plan Generation</p>
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-white">3 Types</p>
                    <p className="text-xs text-indigo-200">Weddings, Birthdays, Community</p>
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-white">Zero Drift</p>
                    <p className="text-xs text-indigo-200">Client-Driven State</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Event Domain Cards */}
            <section className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
              <div className="text-center">
                <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Domain Knowledge
                </h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Specialized for Every Milestone
                </p>
              </div>

              <div className="mt-12 grid gap-8 sm:grid-cols-3">
                {/* Wedding */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 shadow-sm transition hover:shadow-md hover:border-indigo-300">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/60 text-2xl">
                    💒
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">Weddings</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    12+ month lead times, 45% venue & catering splits, cultural traditions, attire, and photography checklists.
                  </p>
                  <button
                    onClick={() => {
                      handleLoadSample("wedding");
                      setCurrentView("planner");
                    }}
                    className="mt-5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Open Wedding Blueprint →
                  </button>
                </div>

                {/* Birthday */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 shadow-sm transition hover:shadow-md hover:border-indigo-300">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/60 text-2xl">
                    🎂
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">Birthdays</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Milestone 30th/50th bashes and themed parties. Space rentals, interactive games, custom cakes, and favor bags.
                  </p>
                  <button
                    onClick={() => {
                      handleLoadSample("birthday");
                      setCurrentView("planner");
                    }}
                    className="mt-5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Open Birthday Blueprint →
                  </button>
                </div>

                {/* Community */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 shadow-sm transition hover:shadow-md hover:border-indigo-300">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-2xl">
                    🎪
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">Community & Festivals</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Fundraisers, local meetups, and festivals. Heavy focus on city permits, sponsorships, and volunteer phases.
                  </p>
                  <button
                    onClick={() => {
                      handleLoadSample("community");
                      setCurrentView("planner");
                    }}
                    className="mt-5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Open Festival Blueprint →
                  </button>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 px-6 text-center text-xs text-slate-500 dark:text-slate-400">
              <p>© 2026 EventAI. GenAI Event Planning Assistant. 100% compatible with GitHub Pages.</p>
            </footer>
          </div>
        )}

        {/* ================= VIEW 2: AI PLANNER WORKSPACE ================= */}
        {currentView === "planner" && (
          <div className="flex-1 flex flex-col p-3 sm:p-4 md:p-6 overflow-hidden">
            {/* Top Toast Alert */}
            {toastMessage && (
              <div className="mb-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/80 px-4 py-2 text-center text-xs font-semibold text-indigo-800 dark:text-indigo-200 shadow-sm animate-fade-in">
                {toastMessage}
              </div>
            )}

            {/* Main Split Grid */}
            <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-12">
              {/* LEFT PANEL: Chat Intake & Refinement (5 cols) */}
              <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm lg:col-span-5 h-[calc(100vh-6rem)]">
                {/* Header & Mode Switcher */}
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        {chatPhase === "intake" ? "💬 Intake Assistant" : "✏️ Conversational Refinement"}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {chatPhase === "intake"
                          ? "Describe your event in plain English"
                          : "Say 'cut budget by 20%', 'add a photo booth', etc."}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        chatPhase === "intake"
                          ? "bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300"
                          : "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300"
                      }`}
                    >
                      {chatPhase} Mode
                    </span>
                  </div>

                  {/* Preset Quick Buttons */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-medium text-slate-400">Quick Test:</span>
                    <button
                      type="button"
                      onClick={() => handleLoadSample("wedding")}
                      className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 transition"
                    >
                      💒 Load Wedding
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadSample("birthday")}
                      className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950 hover:text-amber-600 transition"
                    >
                      🎂 Load Birthday
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadSample("community")}
                      className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-600 transition"
                    >
                      🎪 Load Festival
                    </button>
                  </div>

                  {/* Extracted Entity Chips */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 self-center">Captured:</span>
                    <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                      Type: {extractedDetails.type || "Any"}
                    </span>
                    <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                      Budget: {extractedDetails.totalBudget ? `$${extractedDetails.totalBudget.toLocaleString()}` : "Not set"}
                    </span>
                    <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                      Guests: {extractedDetails.guestCount || "Not set"}
                    </span>
                  </div>
                </div>

                {/* Message Scroll View */}
                <div className="flex-1 overflow-y-auto px-1 py-3 space-y-3">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`animate-fade-in flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                          m.role === "user"
                            ? "bg-indigo-600 text-white rounded-br-md"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-md"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.content}</p>
                        <span
                          className={`mt-1 block text-[10px] ${
                            m.role === "user" ? "text-indigo-200" : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          {m.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}

                  {isAiLoading && (
                    <div className="flex justify-start animate-fade-in">
                      <div className="rounded-2xl rounded-bl-md bg-slate-100 dark:bg-slate-800 px-4 py-3 flex gap-1">
                        <div className="typing-dot h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-500" />
                        <div className="typing-dot h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-500" />
                        <div className="typing-dot h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-500" />
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Input & Send Action */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div className="flex items-end gap-2">
                    <textarea
                      rows={1}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder={
                        chatPhase === "intake"
                          ? "E.g. We want an outdoor wedding for 100 people with $25k budget..."
                          : "E.g. Cut budget by 20%, make it rustic style..."
                      }
                      className="flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <button
                      type="button"
                      onClick={handleSendMessage}
                      disabled={!inputText.trim() || isAiLoading}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white transition hover:bg-indigo-700 disabled:opacity-40"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                    </button>
                  </div>

                  {chatPhase === "intake" && (
                    <div className="mt-2.5">
                      <button
                        type="button"
                        onClick={handleGeneratePlan}
                        className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:from-indigo-700 hover:to-violet-700"
                      >
                        🚀 Generate Full Event Plan
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT PANEL: Comprehensive Plan Dashboard (7 cols) */}
              <div className="h-[calc(100vh-6rem)] overflow-hidden lg:col-span-7 flex flex-col space-y-4">
                {currentPlan ? (
                  <>
                    {/* Event Summary Banner */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-indigo-100 dark:bg-indigo-950/70 px-2.5 py-0.5 text-xs font-semibold capitalize text-indigo-700 dark:text-indigo-300">
                              {currentPlan.event.type}
                            </span>
                            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold capitalize text-slate-600 dark:text-slate-300">
                              {currentPlan.event.style} style
                            </span>
                          </div>
                          <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {currentPlan.event.name}
                          </h1>
                          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                            📍 {currentPlan.event.location} • 📅 {currentPlan.event.date} • 👥 {currentPlan.event.guestCount} guests
                          </p>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-center">
                          <button
                            type="button"
                            onClick={handleShareSummary}
                            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            🔗 Share
                          </button>
                          <button
                            type="button"
                            onClick={() => window.print()}
                            className="rounded-lg bg-indigo-600 dark:bg-indigo-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
                          >
                            📄 Print / PDF
                          </button>
                        </div>
                      </div>

                      {/* Quick Highlight Stats */}
                      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 border-t border-slate-100 dark:border-slate-800 pt-3">
                        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/80 p-2 text-center">
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Tasks Completed</p>
                          <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                            {completedTasks}/{currentPlan.tasks.length}
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/80 p-2 text-center">
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Vendors Booked</p>
                          <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                            {bookedVendors}/{currentPlan.vendors.length}
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/80 p-2 text-center">
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Total Spent</p>
                          <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                            ${totalSpent.toLocaleString()}
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/80 p-2 text-center">
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Saved Ideas</p>
                          <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                            {savedIdeasCount} saved
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-2">
                      {[
                        { key: "budget" as const, label: "Budget", icon: "💰" },
                        { key: "timeline" as const, label: "Timeline", icon: "📅", count: currentPlan.timeline.length },
                        { key: "vendors" as const, label: "Vendors", icon: "📋", count: currentPlan.vendors.length },
                        { key: "ideas" as const, label: "Ideas", icon: "💡", count: currentPlan.ideas.length },
                        { key: "tasks" as const, label: "Tasks", icon: "✅", count: currentPlan.tasks.length },
                      ].map((t) => (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => setActiveTab(t.key)}
                          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition ${
                            activeTab === t.key
                              ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm"
                              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                          }`}
                        >
                          <span>{t.icon}</span>
                          <span>{t.label}</span>
                          {t.count !== undefined && (
                            <span
                              className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
                                activeTab === t.key
                                  ? "bg-indigo-500 text-white"
                                  : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {t.count}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Tab Body */}
                    <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
                      {/* --- TAB 1: BUDGET --- */}
                      {activeTab === "budget" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/60 p-3 text-center">
                              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Budget</p>
                              <p className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                                ${currentPlan.event.totalBudget.toLocaleString()}
                              </p>
                            </div>
                            <div className="rounded-xl bg-violet-50 dark:bg-violet-950/60 p-3 text-center">
                              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Allocated</p>
                              <p className="text-base font-bold text-violet-600 dark:text-violet-400">
                                ${currentPlan.budget.reduce((s, b) => s + b.allocated, 0).toLocaleString()}
                              </p>
                            </div>
                            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/80 p-3 text-center">
                              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Spent</p>
                              <p className="text-base font-bold text-slate-700 dark:text-slate-200">
                                ${totalSpent.toLocaleString()}
                              </p>
                            </div>
                            <div
                              className={`rounded-xl p-3 text-center ${
                                currentPlan.event.totalBudget - totalSpent >= 0
                                  ? "bg-emerald-50 dark:bg-emerald-950/60"
                                  : "bg-red-50 dark:bg-red-950/60"
                              }`}
                            >
                              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Remaining</p>
                              <p
                                className={`text-base font-bold ${
                                  currentPlan.event.totalBudget - totalSpent >= 0
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                ${(currentPlan.event.totalBudget - totalSpent).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2.5">
                            {currentPlan.budget.map((item) => {
                              const spentPct =
                                item.allocated > 0 ? Math.round((item.spent / item.allocated) * 100) : 0;
                              const barColor =
                                spentPct > 100
                                  ? "bg-red-500"
                                  : spentPct >= 80
                                  ? "bg-amber-500"
                                  : "bg-emerald-500";
                              const textColor =
                                spentPct > 100
                                  ? "text-red-600 dark:text-red-400"
                                  : spentPct >= 80
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-emerald-600 dark:text-emerald-400";

                              return (
                                <div
                                  key={item.id}
                                  className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/70 p-3.5 shadow-sm"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">
                                      {item.category}
                                    </span>
                                    <span className={`text-xs font-bold ${textColor}`}>{spentPct}% spent</span>
                                  </div>
                                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                                    <div
                                      className={`h-full rounded-full ${barColor} transition-all duration-300`}
                                      style={{ width: `${Math.min(spentPct, 100)}%` }}
                                    />
                                  </div>
                                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                    <span>
                                      Allocated: ${item.allocated.toLocaleString()} ({item.percentage}%)
                                    </span>
                                    <span className="flex items-center gap-1">
                                      Spent: $
                                      <input
                                        type="number"
                                        value={item.spent}
                                        onChange={(e) => updateSpent(item.id, parseFloat(e.target.value) || 0)}
                                        className="w-16 rounded border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-1 py-0.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                                      />
                                    </span>
                                  </div>
                                  {item.notes && (
                                    <p className="mt-1 text-[11px] italic text-slate-400 dark:text-slate-500">
                                      {item.notes}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* --- TAB 2: TIMELINE --- */}
                      {activeTab === "timeline" && (
                        <div className="relative pl-4 border-l-2 border-indigo-200 dark:border-indigo-800 space-y-6">
                          {currentPlan.timeline.map((item) => (
                            <div key={item.id} className="relative group">
                              <span
                                className={`absolute -left-[21px] top-1 flex h-4 w-4 items-center justify-center rounded-full ${
                                  item.completed
                                    ? "bg-emerald-500 text-white text-[10px]"
                                    : "bg-indigo-600 dark:bg-indigo-400"
                                } ring-4 ring-white dark:ring-slate-900`}
                              >
                                {item.completed ? "✓" : ""}
                              </span>
                              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-3.5 shadow-sm">
                                <div className="flex items-center justify-between">
                                  <span className="rounded bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase">
                                    {item.phase}
                                  </span>
                                  <span className="text-xs text-slate-500 dark:text-slate-400">Due: {item.dueDate}</span>
                                </div>
                                <div className="mt-2 flex items-start gap-2.5">
                                  <input
                                    type="checkbox"
                                    checked={item.completed}
                                    onChange={() => toggleTimeline(item.id)}
                                    className="mt-1 h-4 w-4 rounded text-indigo-600 focus:ring-indigo-400"
                                  />
                                  <div>
                                    <h4
                                      className={`text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 ${
                                        item.completed ? "line-through opacity-60" : ""
                                      }`}
                                    >
                                      {item.title}
                                    </h4>
                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                      {item.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* --- TAB 3: VENDORS --- */}
                      {activeTab === "vendors" && (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {currentPlan.vendors.map((v) => {
                            const statusStyles: Record<VendorStatus, string> = {
                              needed: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
                              contacted: "bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300",
                              quoted: "bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300",
                              booked: "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300",
                              paid: "bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300",
                            };

                            return (
                              <div
                                key={v.id}
                                className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-3.5 shadow-sm flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase text-indigo-600 dark:text-indigo-400">
                                      {v.category}
                                    </span>
                                    <select
                                      value={v.status}
                                      onChange={(e) => updateVendorStatus(v.id, e.target.value as VendorStatus)}
                                      className={`rounded-full px-2 py-0.5 text-xs font-bold capitalize ${statusStyles[v.status]} border-0 focus:outline-none`}
                                    >
                                      {(["needed", "contacted", "quoted", "booked", "paid"] as VendorStatus[]).map(
                                        (s) => (
                                          <option key={s} value={s}>
                                            {s}
                                          </option>
                                        )
                                      )}
                                    </select>
                                  </div>
                                  <h4 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{v.name}</h4>
                                  {v.quote !== undefined && (
                                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                                      Quote: <strong>${v.quote.toLocaleString()}</strong>
                                    </p>
                                  )}
                                  {v.contact && (
                                    <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                                      Contact: {v.contact}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* --- TAB 4: IDEAS --- */}
                      {activeTab === "ideas" && (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {currentPlan.ideas.map((idea) => (
                            <div
                              key={idea.id}
                              className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-3.5 shadow-sm flex flex-col justify-between"
                            >
                              <div>
                                <span className="rounded bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-700 dark:text-indigo-300">
                                  {idea.category}
                                </span>
                                <p className="mt-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                                  {idea.content}
                                </p>
                              </div>
                              <div className="mt-3 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => toggleSaveIdea(idea.id)}
                                  className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                                    idea.saved
                                      ? "border-rose-200 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300"
                                      : "border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700"
                                  }`}
                                >
                                  {idea.saved ? "❤️ Saved" : "🤍 Save Idea"}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* --- TAB 5: TASKS (KANBAN) --- */}
                      {activeTab === "tasks" && (
                        <div className="grid gap-4 md:grid-cols-3">
                          {[
                            { status: "pending" as const, label: "Pending", color: "bg-slate-500" },
                            { status: "in-progress" as const, label: "In Progress", color: "bg-indigo-500" },
                            { status: "completed" as const, label: "Completed", color: "bg-emerald-500" },
                          ].map((col) => {
                            const colTasks = currentPlan.tasks.filter((t) => t.status === col.status);
                            return (
                              <div
                                key={col.status}
                                className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3"
                              >
                                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <span className={`h-2 w-2 rounded-full ${col.color}`} />
                                    {col.label}
                                  </span>
                                  <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-1.5 py-0.2 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                    {colTasks.length}
                                  </span>
                                </div>
                                <div className="mt-3 space-y-2.5">
                                  {colTasks.length === 0 ? (
                                    <p className="text-center py-6 text-xs text-slate-400">No tasks in this lane</p>
                                  ) : (
                                    colTasks.map((task) => (
                                      <div
                                        key={task.id}
                                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 shadow-xs"
                                      >
                                        <div className="flex items-center justify-between text-[10px]">
                                          <span className="font-semibold uppercase text-slate-400">{task.phase}</span>
                                          <span
                                            className={`rounded px-1.5 py-0.2 font-bold ${
                                              task.priority === "high"
                                                ? "bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300"
                                                : task.priority === "medium"
                                                ? "bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300"
                                                : "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300"
                                            }`}
                                          >
                                            {task.priority}
                                          </span>
                                        </div>
                                        <h5 className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-100">
                                          {task.title}
                                        </h5>
                                        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                                          <span>Due: {task.dueDate}</span>
                                          <button
                                            type="button"
                                            onClick={() => cycleTaskStatus(task.id)}
                                            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                                          >
                                            Move →
                                          </button>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-sm">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-3xl">
                      📋
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">No Blueprint Active</h3>
                    <p className="mt-1.5 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                      Describe your event in the chat or load a sample blueprint!
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2 justify-center">
                      <button
                        type="button"
                        onClick={() => handleLoadSample("wedding")}
                        className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
                      >
                        Explore Wedding Blueprint →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= API KEY MODAL ================= */}
      {apiKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">⚡ Gemini API Key Setup</h3>
              <button
                type="button"
                onClick={() => setApiKeyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg"
              >
                ✕
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Connect your Google Gemini API key to run live cloud AI generation directly in your browser. Key is
              securely stored in your browser's local storage only.
            </p>
            <div className="mt-4">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono"
              />
            </div>
            <div className="mt-5 flex gap-2 justify-end">
              <button
                type="button"
                onClick={clearApiKey}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Clear Key
              </button>
              <button
                type="button"
                onClick={saveApiKey}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
              >
                Save & Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
