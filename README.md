# 🎉 EventAI — GenAI Event Planning Assistant

An AI-powered event planning assistant that helps you plan weddings, birthdays, and community festivals with intelligent budget breakdowns, backward timelines, vendor checklists, and personalized ideas.

## ✨ Features

- **🤖 AI-Powered Planning & Intake:** Describe your event naturally to extract guest count, date, budget, and vibe.
- **💰 Smart Budget Breakdown:** Category percentage splits with color-coded progress bars and live editable spent amounts.
- **📅 Backward Timeline:** Milestones scheduled backwards from your event date with completion checkboxes.
- **📋 Vendor Checklist:** Status management (`needed` → `contacted` → `quoted` → `booked` → `paid`).
- **💡 Personalized Ideas:** Themes, décor, cocktails, and activities with bookmarking hearts.
- **✅ Task Kanban Board:** Interactive task management with priority badges.
- **☀️ / 🌙 Dark Mode:** Instant theme switching with persistent memory.
- **⚡ Gemini API Ready:** Direct client-side connection option for Google Gemini API (`gemini-3.8-flash`).

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Building for Production / GitHub Pages

```bash
npm run build
```

The production output is generated in the `dist/` folder with relative paths (`base: './'`), making it 100% compatible with GitHub Pages or any static host.
