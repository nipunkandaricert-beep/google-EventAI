# EventAI — GenAI Event Planning Assistant

[![CI](https://github.com/nipunkandaricert-beep/google-EventAI/actions/workflows/ci.yml/badge.svg)](https://github.com/nipunkandaricert-beep/google-EventAI/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Describe a wedding, birthday or community event in plain English and EventAI returns a budget, a backward-scheduled timeline, a vendor checklist, ideas and tasks, and **states every assumption it made**. Built for Google Prompt Wars with React, TypeScript, Vite, Tailwind CSS and the Google Gemini API.

**Live demo:** https://nipunkandaricert-beep.github.io/google-EventAI/

## How it works

| Concern | Who does it | Why |
| --- | --- | --- |
| Budget splits and totals | **Code** (`budgetEngine.ts`, largest-remainder allocation) | LLMs are unreliable at arithmetic; allocations always sum exactly to the budget. |
| Dates, lead-time warnings | **Code** (`timelineEngine.ts`, UTC date maths) | Deterministic and time-zone safe. |
| Timeline, vendors, ideas, tasks, assumptions | **Gemini** (JSON mode), validated by `aiSchema.ts` | Creative, event-specific content. |
| Refinement ("cut the budget by 15%", "make it outdoor") | **Gemini** proposes a structured change, **code** applies it | The model never edits numbers directly. |
| No key, or Gemini fails | **Offline templates**, clearly labelled in the UI | The app always produces a complete plan. |

Missing details (type, guests, date, style) are filled with defaults that are listed in the **Assumptions** panel. A budget is required.

## Getting started

```bash
npm ci
npm run dev        # http://localhost:5173
```

Open **Settings** in the header and paste a [Google AI Studio](https://aistudio.google.com/) key to enable AI-written plans. Without a key the app runs in offline mode.

### Safer for public deployments: the proxy

A static site cannot hide an API key. Deploy `proxy/worker.js` (Cloudflare Worker, instructions inside), then build with:

```bash
VITE_GEMINI_PROXY_URL=https://your-worker.workers.dev npm run build
```

The browser then never sees a key, and the production CSP is automatically widened to allow only that origin.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run check` | Lint, format check, typecheck, tests with coverage thresholds, build |
| `npm test` / `npm run test:coverage` | Vitest unit and component tests |
| `npm run test:tz` | Same tests under a daylight-saving time zone |
| `npm run lint` / `npm run format` | oxlint / Prettier |
| `npm run audit` | `npm audit` for production dependencies |

## Quality gates

- **Testing:** unit tests for the budget, timeline, intake, guardrail, schema, Gemini-service (mocked `fetch`, retries, timeouts, blocked/invalid output) and plan-builder logic, plus React Testing Library flows for chat, generation, refinement, settings and every dashboard tab. Coverage thresholds (90% lines/functions/statements, 80% branches) are enforced in CI.
- **Accessibility:** axe-core runs against the home page, every dashboard tab and the settings dialog in the test suite. Tabs follow the WAI-ARIA pattern (arrow keys, Home/End, roving tabindex); the dialog traps and restores focus; chat is an `aria-live` log; status is never conveyed by colour alone; high-contrast mode, large text and `prefers-reduced-motion` are supported. A test checks WCAG AA contrast ratios for the design tokens. `lighthouse.yml` asserts a 100 accessibility score in CI.
- **Security:** see [SECURITY.md](SECURITY.md): key kept out of `localStorage` and URLs, untrusted text delimited in prompts, model output validated and sanitised, strict production CSP, no runtime third-party scripts, Dependabot.
- **Code quality:** strict TypeScript, small focused components and hooks, pure logic in `src/utils` and `src/services`, oxlint with `--deny-warnings`, Prettier, `.editorconfig`.
- **Efficiency:** Tailwind compiled at build time (no runtime CDN script), the dashboard is code-split, and the LLM is only called for creative content.

## Project structure

```
src/
  components/   UI (Header, Home, ChatPanel, Dashboard, tabs, SettingsModal, primitives)
  hooks/        usePlanner (chat + plan state), useSettings (theme, a11y, key)
  services/     gemini.ts (API client), planBuilder.ts (assemble + refine plans)
  utils/        budgetEngine, timelineEngine, intakeParser, guardrails, aiSchema, integrity, format
  data/         sample blueprints, offline template content
tests/          Vitest + Testing Library + axe
proxy/          Optional Cloudflare Worker that keeps the Gemini key server-side
```

## License

MIT
