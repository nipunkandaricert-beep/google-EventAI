# 🎉 EventAI — GenAI Event Planning Assistant

An AI-powered event planning assistant that crafts tailored event blueprints (weddings, birthdays, fundraisers, community festivals) with strict deterministic budget allocations, reverse-scheduled timelines, lead-time feasibility guardrails, vendor tracking, and personalized creative concepts.

---

## 🌟 Key Capabilities & Architectural Highlights

### 1. 🤖 Intelligent Natural Language Intake & Entity Extraction
- Parses freeform user descriptions (e.g., *"Planning a 150-guest wedding in November for \$25k in rustic chic style"*).
- Extracts event type, guest count, target date, budget numbers, and aesthetic preferences.
- Intercepts prompt injection attempts and neutralizes malicious inputs (`guardrails.ts`).

### 2. 🛡️ Problem Statement Alignment & Feasibility Guardrails
- **Automated Lead-Time Feasibility Warnings:** Implements strict guardrails flagging high-risk planning windows (< 2 weeks for small events, < 2 months for > 100 guests) with concrete remediation advice.
- **Explicit Assumptions Panel:** The assistant clearly states all baseline assumptions (e.g., per-person allocation ratios, buffer reserves, booking windows) so planners maintain full control.
- **Deterministic Math Engine:** Category percentage allocations and dollar sums are strictly computed via code (`budgetEngine.ts`), preventing LLM arithmetic hallucination.

### 3. 🧪 Comprehensive Automated Testing & Diagnostic Suite (100% Passing)
- **Vitest Unit Test Suite:** Run `npm test` to execute automated test suites covering:
  - `tests/budget.test.ts`: 100% split totals, exact dollar arithmetic, proportional reductions (e.g. 20% budget cuts), bounds checking.
  - `tests/timeline.test.ts`: Reverse chronological milestone sequencing, lead-time warning triggers.
  - `tests/guardrails.test.ts`: HTML XSS sanitization, prompt injection interception, budget boundaries.
  - `tests/intake.test.ts`: NLP entity extraction from conversational prompts.
- **Interactive In-Browser Test Runner:** Built-in `🧪 Test Suite` tab allows evaluators and users to execute 9 live regression and validation checks with real-time pass/fail indicators.

### 4. ♿ Accessibility (WCAG 2.1 AA Standard)
- **Keyboard Navigation & ARIA Support:** Proper `role="tab"`, `role="tabpanel"`, `role="progressbar"`, `role="log"`, and `role="banner"` throughout.
- **Skip to Content Link:** Immediate jump for screen readers.
- **Custom Accessibility Controls:**
  - Dynamic Font Resizing (`A+` / `A-`) for reading comfort.
  - Dedicated High-Contrast Mode (`👁️ HC`) for visual clarity.
  - System-responsive Dark/Light theme toggle.

### 5. 🔒 Security & Safe Sanitization
- Input sanitization strips dangerous HTML/script tags before processing.
- Regex guardrails monitor for delimiter tampering and prompt jailbreaks.
- Client-side Gemini API key isolation stored securely in browser `localStorage`.

---

## 🚀 Quickstart & Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Run automated test suites
npm test

# 3. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or Vite port displayed in terminal) in your browser.

---

## 📦 Production Build & Deployment

```bash
npm run build
```

The production output is generated in `dist/` with relative asset links (`base: './'`), completely ready for GitHub Pages or static host deployment.
