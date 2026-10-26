# EventAI — GenAI Event Planning Assistant

[![CI](https://github.com/nipunkandaricert-beep/google-EventAI/actions/workflows/ci.yml/badge.svg)](https://github.com/nipunkandaricert-beep/google-EventAI/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

An intelligent, accessible, and production-ready GenAI event planning assistant built with React 19, TypeScript, Vite, Tailwind CSS, and the Google Gemini API.

**Live Demo:** https://nipunkandaricert-beep.github.io/google-EventAI/

---

## 1. Chosen Vertical

**Vertical:** **Event Planning & Management Assistant (Smart Consumer & Community Operations)**

EventAI acts as a personalized event operations director for three key event domains:
- 💒 **Weddings:** Ceremony & reception timeline, floral arches, photography shots, seating, catering, and 12-month backward milestones.
- 🎂 **Milestone Birthdays:** Theme development, entertainment bookings, DJ playlists, custom cake design, and 4-6 week sprint checklists.
- 🎪 **Community Festivals & Gatherings:** Municipal permits, public safety, AV staging, food truck zones, and volunteer team scheduling.

---

## 2. Approach & Architecture Logic

EventAI uses a **hybrid AI + deterministic code architecture**:

| Concern | Executed By | Rationale |
| --- | --- | --- |
| **Budget Math & Split Allocation** | **Deterministic Code** (`budgetEngine.ts`, Largest-Remainder / Hamilton-Hare method) | LLMs are notoriously prone to floating-point drift and rounding errors. Code guarantees that category allocations sum to 100% of the budget with zero penny leakage. |
| **Dates, Lead Times & Backward Scheduling** | **Deterministic Code** (`timelineEngine.ts`, pure UTC arithmetic) | Time-zone safe backward calculation from event date to intake date. Automatically detects compressed timelines. |
| **Creative Content & Theme Recommendations** | **Gemini 2.5 Flash** (via strict JSON schema) validated by `aiSchema.ts` | Contextual vendor profiles, theme ideas, creative checklists, and risk mitigations tailored to the exact event details. |
| **Conversational Refinement** | **Gemini + Code Rebalancing** | Gemini suggests structured modifications (e.g., "reduce budget by 15%", "switch to outdoor venue"); code reapplies guardrails and recalculates the ledger. |
| **Zero-Configuration Fallback** | **Offline Templates** (`offlineContent.ts`) | If no Gemini API key is configured or network is unavailable, the assistant falls back to rich, verified blueprint templates with clear UI attribution. |

---

## 3. How the Solution Works

1. **Intake & Intent Parsing:**
   - Users can describe their event in natural conversational language via the interactive Chat Assistant, choose one of the dedicated Studio Blueprint forms (Weddings, Birthdays, Community), or load curated sample benchmarks.
   - Guardrails (`guardrails.ts`) validate budget limits ($500 to $10,000,000), detect prompt injection attempts, and strip dangerous control characters.

2. **Blueprint Generation:**
   - Input is structured into intake parameters.
   - Gemini Generative Language API is called with typed JSON schema instructions.
   - If offline or on failure, verified local templates furnish realistic starter data.
   - `budgetEngine.ts` allocates category envelopes; `timelineEngine.ts` maps chronological milestones backwards from the event date.

3. **Interactive Plan Management & Execution:**
   - **Budget Ledger:** Track planned vs actual spending per item, with interactive updates and instant variance recalculation.
   - **Timeline Schedule:** Toggle completed milestones and view status indicators.
   - **Vendor Directory:** Manage procurement pipeline (prospecting, shortlisted, contacted, quoted, booked, paid).
   - **Brainstorming Ideas & Action Tasks:** Check off operational to-dos and star priority concepts.
   - **One-Click Export:** Download printable PDF blueprint summaries or copy text summaries to clipboard.

---

## 4. Assumptions Made

The assistant explicitly itemizes and displays every assumption in the plan summary:
1. **Currency & Localization:** Default currency is USD ($) unless specified otherwise.
2. **Standard Lead Times:** Major weddings assume an optimal 9–12 month lead time; community festivals assume 3–6 months for municipal permits; birthdays assume 4–8 weeks. Shorter lead times trigger automatic compression warnings.
3. **Contingency Buffer:** Every budget automatically reserves an 8–10% contingency buffer for unforeseen expenses or price surges.
4. **Guest Allocation:** Per-guest cost calculations divide the total budget by guest count, flagging budgets below standard industry thresholds.
5. **No Key Storage:** Gemini API keys are never stored in `localStorage` or transmitted via URL parameters; keys live in memory or can be routed through an optional Cloudflare Worker proxy (`proxy/worker.js`).

---

## 5. Evaluation Focus Areas Alignment

- **Code Quality:** Strict TypeScript (zero `any`), 100% modular component extraction (`StudioCommon.tsx`, `primitives.tsx`), clean separation of concerns (`services/`, `utils/`, `hooks/`, `components/`), Prettier code style, and oxlint with `--deny-warnings`.
- **Security:** Strict Content-Security-Policy injected during build, zero localStorage key persistence, sanitization of user strings (no `dangerouslySetInnerHTML`), and prompt-injection guardrails.
- **Efficiency:** Route-level code-splitting for all studios and dashboard, vendor chunk caching for React runtime, zero runtime CSS processors (Tailwind compiled ahead-of-time), bundle size under 300KB gzipped.
- **Testing:** 104 passing tests across 10 test suites covering unit logic, component rendering, contrast ratios, and full user flows with vitest-axe. Coverage exceeds 90% across statements, lines, and functions.
- **Accessibility:** axe-core integrated in tests (zero violations across all tabs), WAI-ARIA tab roving tabindex, aria-live region announcements for chat, high-contrast mode, dark mode toggle, large-text scaling, and skip-to-content links.
- **Problem Statement Alignment:** Purpose-built for the GenAI Event Planning Assistant challenge, with smart decision-making and practical usability.

---

## 6. Getting Started Locally

```bash
# Install dependencies
npm ci

# Start local development server
npm run dev
# App will run at http://localhost:5173
```

### Full Quality Check

```bash
npm run check
# Runs: lint -> format:check -> typecheck -> test:coverage -> build
```

---

## 7. Submission Compliance Check

- **Max 3 attempts:** Followed.
- **Repository size:** Git pack < 400 KB, source < 1.1 MB (limit: < 10 MB).
- **Public GitHub repository:** Publicly accessible at `https://github.com/nipunkandaricert-beep/google-EventAI`.
- **Single branch:** Main branch only (no auxiliary branches).

---

## License

MIT
