import { useCallback, useEffect, useState } from "react";
import { DEFAULT_MODEL, type AiConfig } from "../services/gemini";

const SESSION_KEY = "eventai_gemini_key";

function readSession(): string {
  try {
    return sessionStorage.getItem(SESSION_KEY) ?? "";
  } catch {
    return "";
  }
}

/** Theme, accessibility and AI settings. The API key lives in memory unless the user opts into tab-scoped storage. */
export function useSettings() {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
    } catch {
      /* storage unavailable */
    }
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [apiKey, setApiKeyState] = useState(readSession);
  const [remember, setRemember] = useState(() => readSession() !== "");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
    root.classList.toggle("hc", highContrast);
    root.classList.toggle("text-large", largeText);
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch {
      /* storage unavailable */
    }
  }, [isDark, highContrast, largeText]);

  const saveKey = useCallback((key: string, persistForTab: boolean) => {
    const trimmed = key.trim();
    setApiKeyState(trimmed);
    setRemember(persistForTab && trimmed !== "");
    try {
      if (persistForTab && trimmed) sessionStorage.setItem(SESSION_KEY, trimmed);
      else sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const proxyUrl = import.meta.env.VITE_GEMINI_PROXY_URL as string | undefined;
  const model = (import.meta.env.VITE_GEMINI_MODEL as string | undefined) ?? DEFAULT_MODEL;
  const ai: AiConfig = { apiKey: apiKey || undefined, proxyUrl: proxyUrl || undefined, model };

  return {
    isDark,
    setIsDark,
    highContrast,
    setHighContrast,
    largeText,
    setLargeText,
    ai,
    apiKey,
    remember,
    saveKey,
    usingProxy: Boolean(proxyUrl),
  };
}
