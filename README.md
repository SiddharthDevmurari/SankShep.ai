# Sankshep.ai

Gen AI Platform for Automated Content Transformation — SIH 2026 (NTRO Problem Statement).

Turn any long-form source (PDF, DOCX, URL, pasted text) into polished, multi-format deliverables: executive summaries, video scripts, LinkedIn posts, slide decks, advisories, and more — all in parallel, in seconds.

---

## Features

- **10 output formats** — Video Script, LinkedIn Post, Twitter/X Post, Advisory, Infographic, Executive Summary, PPT Presentation, Blog Post, Simplified Explanation, Language Translation
- **LangGraph-style parallel pipeline** — parse node → N simultaneous format nodes via `Promise.allSettled`
- **Groq + LLaMA 3.3-70B** — round-robin across up to 5 API keys to avoid rate limits
- **Independent regeneration** — refine any single tab without touching the others
- **Split-pane editor** — parsed source on the left, editable output on the right, mockup view toggle
- **Supabase auth** with mock fallback — works out of the box with no Supabase account
- **Admin panel** — visible only to `admin@gmail.com`
- **Demo credentials** — auto-fill + auto-submit on the login page

---

## Quick start

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and add at least one Groq API key:

```
VITE_GROQ_KEY_1=gsk_your_key_here
```

Get a free key at <https://console.groq.com>.

> **Supabase is optional.** Leave `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` blank to use the built-in mock auth.

### 3. Run the dev server

```bash
npm run dev
```

Open <http://localhost:5173> in your browser.

---

## Demo accounts

| Role  | Email               | Password |
|-------|---------------------|----------|
| User  | demo@sankshep.ai    | demo123  |
| Admin | admin@gmail.com     | admin    |

Click **"Try demo account"** on the login page to auto-fill and submit instantly.

---

## Project structure

```
frontend/
├── src/
│   ├── lib/
│   │   ├── supabase.ts        # Supabase client (null when env vars absent)
│   │   ├── groq.ts            # Fetch wrapper with round-robin key rotation
│   │   └── pipeline.ts        # LangGraph-style parse + parallel format pipeline
│   ├── contexts/
│   │   └── AuthContext.tsx    # Dual Supabase / mock auth provider
│   ├── components/
│   │   ├── GlobalHeader.tsx   # Persistent header (Home / Workspace / Logout)
│   │   └── ProtectedRoute.tsx # Redirects to /login when unauthenticated
│   ├── pages/
│   │   ├── LandingPage.tsx    # Marketing landing page (/)
│   │   ├── LoginPage.tsx      # Login / signup (/login)
│   │   └── WorkspacePage.tsx  # Tabbed workspace shell (/workspace)
│   ├── workspace/
│   │   ├── TransformView.tsx  # LeftPanel + RightPanel wired to pipeline
│   │   ├── LeftPanel.tsx      # File upload, URL, paste, format/tone config
│   │   ├── RightPanel.tsx     # Output tabs, split pane, regeneration
│   │   ├── ActivityView.tsx   # Activity & Insights placeholder
│   │   └── AdminPanel.tsx     # Admin-only system status panel
│   ├── App.tsx                # BrowserRouter + AuthProvider + routes
│   └── index.css              # Tailwind v4 + design tokens
├── .env.local.example
├── package.json
└── vite.config.ts
```

---

## Environment variables

| Variable              | Required | Description                              |
|-----------------------|----------|------------------------------------------|
| `VITE_GROQ_KEY_1`     | Yes      | Primary Groq API key                     |
| `VITE_GROQ_KEY_2`…`5` | No       | Extra keys for round-robin rotation      |
| `VITE_SUPABASE_URL`   | No       | Supabase project URL (mock auth if blank)|
| `VITE_SUPABASE_ANON_KEY` | No    | Supabase anon key                        |

---

## Build for production

```bash
npm run build
# output: frontend/dist/
```

---

## Tech stack

- **React 19** + Vite 8 + TypeScript 5.7
- **Tailwind CSS v4** via `@tailwindcss/vite` (no config file)
- **react-router-dom v7** for client-side routing
- **@supabase/supabase-js** for auth
- **Groq API** (`llama-3.3-70b-versatile`) called directly from the browser
