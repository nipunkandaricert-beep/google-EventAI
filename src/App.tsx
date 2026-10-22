import { lazy, Suspense, useState } from "react";
import { ChatPanel } from "./components/ChatPanel";
import { Header, type View } from "./components/Header";
import { Home } from "./components/Home";
import { WeddingStudio } from "./components/WeddingStudio";
import { BirthdayStudio } from "./components/BirthdayStudio";
import { CommunityStudio } from "./components/CommunityStudio";
import { Toast } from "./components/primitives";
import { SettingsModal } from "./components/SettingsModal";
import { usePlanner } from "./hooks/usePlanner";
import { useSettings } from "./hooks/useSettings";
import { isConfigured } from "./services/gemini";
import type { EventType } from "./types";
import { formatMoney } from "./utils/format";
import { validateBudgetGuardrail } from "./utils/guardrails";

const Dashboard = lazy(() => import("./components/Dashboard"));

export default function App() {
  const [view, setView] = useState<View>("home");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settings = useSettings();
  const planner = usePlanner(settings.ai);

  const openSample = (type: EventType) => {
    planner.loadSample(type);
    if (type === "wedding") setView("wedding");
    else if (type === "birthday") setView("birthday");
    else if (type === "community") setView("community");
    else setView("planner");
  };

  const copySummary = () => {
    const { event } = planner.plan;
    const text = `${event.name}\n${event.type} on ${event.date}\nGuests: ${event.guestCount}\nBudget: ${formatMoney(event.totalBudget, event.currency)}`;
    void navigator.clipboard?.writeText(text);
    planner.notify("Summary copied");
  };

  const canGenerate =
    validateBudgetGuardrail(planner.intake.totalBudget ?? NaN).isValid && Boolean(planner.intake.type);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-indigo-700 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <div inert={settingsOpen}>
        <Header
          view={view}
          onView={(v) => {
            if (v === "wedding" || v === "birthday" || v === "community") {
              // When entering a studio fresh, ensure input mode is shown
              if (planner.isSample && planner.plan.event.type !== v) {
                planner.reset();
              }
            }
            setView(v);
          }}
          isDark={settings.isDark}
          onDark={() => settings.setIsDark((v) => !v)}
          highContrast={settings.highContrast}
          onHighContrast={() => settings.setHighContrast((v) => !v)}
          largeText={settings.largeText}
          onLargeText={() => settings.setLargeText((v) => !v)}
          onSettings={() => setSettingsOpen(true)}
          aiReady={isConfigured(settings.ai)}
        />
        <main id="main" tabIndex={-1}>
          {view === "home" && (
            <Home
              onStart={() => {
                setView("planner");
              }}
              onOpenStudio={(v) => {
                planner.reset();
                setView(v);
              }}
              onSample={openSample}
            />
          )}

          {view === "wedding" && (
            <WeddingStudio
              plan={planner.plan}
              isSample={planner.isSample}
              hasPlan={planner.hasPlan}
              phase={planner.phase}
              source={planner.source}
              messages={planner.messages}
              busy={planner.busy}
              onSend={(t) => void planner.send(t)}
              onGenerateWithDetails={planner.generateWithDetails}
              onLoadSample={() => planner.loadSample("wedding")}
              onReset={planner.reset}
              onSpent={planner.updateSpent}
              onToggleTimeline={planner.toggleTimeline}
              onVendor={planner.setVendorStatus}
              onIdea={planner.toggleIdea}
              onTask={planner.setTaskStatus}
              onCopy={copySummary}
              onBackToHome={() => setView("home")}
            />
          )}

          {view === "birthday" && (
            <BirthdayStudio
              plan={planner.plan}
              isSample={planner.isSample}
              hasPlan={planner.hasPlan}
              phase={planner.phase}
              source={planner.source}
              messages={planner.messages}
              busy={planner.busy}
              onSend={(t) => void planner.send(t)}
              onGenerateWithDetails={planner.generateWithDetails}
              onLoadSample={() => planner.loadSample("birthday")}
              onReset={planner.reset}
              onSpent={planner.updateSpent}
              onToggleTimeline={planner.toggleTimeline}
              onVendor={planner.setVendorStatus}
              onIdea={planner.toggleIdea}
              onTask={planner.setTaskStatus}
              onCopy={copySummary}
              onBackToHome={() => setView("home")}
            />
          )}

          {view === "community" && (
            <CommunityStudio
              plan={planner.plan}
              isSample={planner.isSample}
              hasPlan={planner.hasPlan}
              phase={planner.phase}
              source={planner.source}
              messages={planner.messages}
              busy={planner.busy}
              onSend={(t) => void planner.send(t)}
              onGenerateWithDetails={planner.generateWithDetails}
              onLoadSample={() => planner.loadSample("community")}
              onReset={planner.reset}
              onSpent={planner.updateSpent}
              onToggleTimeline={planner.toggleTimeline}
              onVendor={planner.setVendorStatus}
              onIdea={planner.toggleIdea}
              onTask={planner.setTaskStatus}
              onCopy={copySummary}
              onBackToHome={() => setView("home")}
            />
          )}

          {view === "planner" && (
            <div className="mx-auto grid max-w-7xl gap-4 p-4 lg:grid-cols-[22rem_1fr]">
              <h1 className="sr-only">Event planner</h1>
              <ChatPanel
                messages={planner.messages}
                busy={planner.busy}
                phase={planner.phase}
                canGenerate={canGenerate}
                onSend={(t) => void planner.send(t)}
                onGenerate={() => void planner.generate()}
                onReset={planner.reset}
              />
              <Suspense
                fallback={
                  <p role="status" className="muted p-4">
                    Loading dashboard…
                  </p>
                }
              >
                <Dashboard
                  plan={planner.plan}
                  isSample={planner.isSample}
                  source={planner.source}
                  onSpent={planner.updateSpent}
                  onToggleTimeline={planner.toggleTimeline}
                  onVendor={planner.setVendorStatus}
                  onIdea={planner.toggleIdea}
                  onTask={planner.setTaskStatus}
                  onCopy={copySummary}
                />
              </Suspense>
            </div>
          )}
        </main>
      </div>
      <SettingsModal
        key={String(settingsOpen)}
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        apiKey={settings.apiKey}
        remember={settings.remember}
        usingProxy={settings.usingProxy}
        onSave={(k, r) => {
          settings.saveKey(k, r);
          planner.notify(k ? "Gemini key set for this session" : "Gemini key cleared");
        }}
      />
      <Toast message={planner.toast} />
    </>
  );
}
