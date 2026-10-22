import { useEffect, useId, useRef, useState } from "react";
import type { ChatMessage } from "../types";
import { MAX_INPUT_LENGTH } from "../utils/guardrails";
import type { Phase } from "../hooks/usePlanner";
import { InlineText } from "./primitives";

interface Props {
  messages: ChatMessage[];
  busy: boolean;
  phase: Phase;
  canGenerate: boolean;
  onSend: (text: string) => void;
  onGenerate: () => void;
  onReset: () => void;
}

export function ChatPanel({ messages, busy, phase, canGenerate, onSend, onGenerate, onReset }: Props) {
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: "nearest" });
  }, [messages.length]);

  const submit = () => {
    if (!text.trim() || busy) return;
    onSend(text);
    setText("");
  };

  return (
    <section aria-labelledby={`${id}-h`} className="surface flex h-[34rem] flex-col lg:h-auto">
      <div className="flex items-center justify-between gap-2 border-b border-slate-300 p-3 dark:border-slate-700">
        <h2 id={`${id}-h`} className="font-bold">
          Planning assistant
        </h2>
        {phase === "refining" && (
          <button type="button" className="btn btn-ghost" onClick={onReset}>
            Plan a new event
          </button>
        )}
      </div>
      <div role="log" aria-live="polite" aria-label="Conversation" className="flex-1 space-y-3 overflow-y-auto p-3">
        {messages.map((m) => (
          <p
            key={m.id}
            className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${m.role === "user" ? "ml-auto bg-indigo-700 text-white dark:bg-indigo-400 dark:text-slate-950" : "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"}`}
          >
            <span className="sr-only">{m.role === "user" ? "You: " : "EventAI: "}</span>
            <InlineText text={m.content} />
          </p>
        ))}
        {busy && (
          <p className="muted text-sm" role="status">
            EventAI is working…
          </p>
        )}
        <div ref={endRef} />
      </div>
      <div className="space-y-2 border-t border-slate-300 p-3 dark:border-slate-700">
        {phase === "intake" && (
          <button type="button" className="btn btn-primary w-full" disabled={!canGenerate || busy} onClick={onGenerate}>
            Generate plan
          </button>
        )}
        <label htmlFor={`${id}-in`} className="text-sm font-semibold">
          {phase === "intake" ? "Describe your event" : "Ask for a change"}
        </label>
        <div className="flex gap-2">
          <textarea
            id={`${id}-in`}
            className="input resize-none"
            rows={2}
            maxLength={MAX_INPUT_LENGTH}
            value={text}
            placeholder={phase === "intake" ? "Garden wedding, 120 guests, $35,000, October" : "Cut the budget by 15%"}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
          />
          <button type="button" className="btn btn-primary" onClick={submit} disabled={busy || !text.trim()}>
            Send
          </button>
        </div>
        <p className="muted text-xs">Enter to send, Shift+Enter for a new line.</p>
      </div>
    </section>
  );
}
