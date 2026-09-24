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

> **No Supabase setup needed.** Every copy of the app connects to the same central Supabase project, pinned in `frontend/src/lib/supabase.ts`. Accounts and activity are shared across all machines.

### 3. Run the dev server

```bash
npm run dev
```

Open <http://localhost:5173> in your browser.

---

## Database setup (one-time, project owner only)

1. In the Supabase dashboard, open **SQL Editor**, paste `frontend/supabase/schema.sql`, and run it. This creates `profiles` and `activity_logs`, the RLS policies, and the admin RPC.
2. Under **Authentication → Sign In / Providers → Email**, turn **Confirm email** **off** and save. Sign-up has no email verification: accounts are created and signed in immediately, and no emails are sent.
3. The SQL creates the shared demo account `demo@sankshep.ai` / `demo123`, used by the **Use Demo Credentials** button. To create the admin, paste `frontend/supabase/create_admin.sql` into the SQL Editor, replace `CHANGE_ME` with your chosen password (6+ characters), and run it. Re-run it any time to reset the admin password.

`admin@gmail.com` gets the `admin` role automatically.

Users can delete their own account from the account menu (click the avatar in the workspace header). The admin can delete any account from the Admin Panel. The demo and admin accounts can't be deleted.

---

## Project structure

```
frontend/
├── src/
│   ├── lib/
│   │   ├── supabase.ts        # Central Supabase client (pinned URL + key)
│   │   ├── groq.ts            # Fetch wrapper with round-robin key rotation
│   │   ├── pipeline.ts        # LangGraph-style parse + parallel format pipeline
│   │   └── activity.ts        # Activity logging + history/admin queries
│   ├── contexts/
│   │   └── AuthContext.tsx    # Supabase auth provider
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
│   │   ├── ActivityView.tsx   # The signed-in user's own history + stats
│   │   ├── ActivityFeed.tsx   # Shared chronological feed component
│   │   └── AdminPanel.tsx     # Admin-only: all users + global activity feed
│   ├── App.tsx                # BrowserRouter + AuthProvider + routes
│   └── index.css              # Tailwind v4 + design tokens
├── supabase/schema.sql    # Tables, RLS policies, triggers — run in Supabase
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

---

## Deploy to Vercel

1. Import the repo in Vercel and set **Root Directory** to `frontend`. `vercel.json` handles the build and the SPA route rewrites.
2. Add the environment variables `VITE_GROQ_KEY_1` … `VITE_GROQ_KEY_5` in Vercel → Project → Settings → Environment Variables. Supabase needs none.

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
