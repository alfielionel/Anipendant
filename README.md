<div align="left">

[![Version](https://img.shields.io/badge/version-0.0.1-007AFF?style=flat&labelColor=1D1D1F)](https://github.com/alfielionel/Anipendant)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=flat&logo=vite&labelColor=1D1D1F)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React_19-222222?style=flat&logo=react&labelColor=1D1D1F)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white&labelColor=1D1D1F)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript_6-3178C6?style=flat&logo=typescript&logoColor=white&labelColor=1D1D1F)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deployed_on_Vercel-000000?style=flat&logo=vercel&labelColor=1D1D1F)](https://anipendant.vercel.app)

</div>

<br/>
<br/>

<div align="center">

# 🩵 Anipendant

### *Track, organise, and binge your anime — with 2010s nostalgia.*

A **Frutiger Aero**-inspired anime library manager powered by **AniList** and **Kitsu**. Search shows, save them to your personal library, track episodes, and add mirror links — all wrapped in a glossy, Aqua-blue glass interface that'll make you feel like you just booted up a Mac from 2008.

**[→ Live Demo](https://anipendant.vercel.app)**  •  **[→ Bug Report](https://github.com/alfielionel/Anipendant/issues)**

<br/>

</div>

## ✨ Features

| | |
|---|---|
| 🔍 **Browse Anime** | Search 10,000+ titles via AniList or Kitsu with live typeahead |
| 📚 **Personal Library** | Save shows, track episodes, add mirror/streaming links per episode |
| 📥 **Bulk Import YAML** | Import whole seasons from a `.yaml` file with Zod-validated schemas |
| 📱 **PIN Lock** | Optional idle-based PIN gate with security question recovery |
| 🎨 **Frutiger Aero UI** | Glossy glassmorphism, dot-grid backgrounds, Aqua gradients, elastic jelly animations — light mode only, as god intended |
| 🔗 **Mirror Tracking** | Add multiple streaming URLs per episode with labels |
| 🧩 **Multi-API** | Switch between AniList and Kitsu in settings at any time |

## 🚀 Quick Start

### One-click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alfielionel/Anipendant)

### Or run locally

```bash
# Clone
git clone https://github.com/alfielionel/Anipendant.git
cd Anipendant/anipendant

# Install
npm install

# Set up environment
cp .env.example .env
# Open .env and add your Supabase URL + anon key (see below)

# Start
npm run dev
```

### Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste the contents of `supabase/migrations/001_initial_schema.sql` → **Run**
3. Go to **Project Settings** → **API** → copy your `Project URL` and `anon public key`
4. Add them to `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
5. In Supabase **Authentication** → **Settings**: enable **Email + Password** sign-ups

> **Important:** The migration creates a trigger that auto-creates a public user profile when someone signs up. No extra setup needed.

## 🧰 Stack

<div align="center">

[![React 19](https://img.shields.io/badge/React_19-222222?style=flat&logo=react)](https://react.dev)
[![TypeScript 6](https://img.shields.io/badge/TypeScript_6-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite 8](https://img.shields.io/badge/Vite_8-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![React Router 7](https://img.shields.io/badge/React_Router_7-CA4245?style=flat&logo=reactrouter&logoColor=white)](https://reactrouter.com)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com)
[![Vitest 4](https://img.shields.io/badge/Vitest_4-6E9F18?style=flat&logo=vitest&logoColor=white)](https://vitest.dev)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel)](https://vercel.com)

</div>

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript 6, React Router 7 |
| **Build** | Vite 8 + Oxc |
| **Auth & DB** | Supabase (Postgres + Row-Level Security) |
| **Styling** | CSS-only (no framework) — 2 global stylesheets, BEM-like classes |
| **API** | AniList (GraphQL), Kitsu (REST) |
| **Testing** | Vitest 4 + jsdom + Testing Library |
| **Deploy** | Vercel (GitHub-connected auto-deploys) |

## 🎨 Design

Anipendant revives the **Frutiger Aero** aesthetic — the glossy, optimistic design language from late 2000s Mac OS X and Windows Vista.

- **Font:** Nunito (rounded, warm, friendly via Google Fonts)
- **Colours:** Aqua blue (`#007AFF`), light blue (`#5AC8FA`), glass whites, mac toolbar gradients
- **Surfaces:** `backdrop-filter: blur(20px)` on everything — auth cards, modals, PIN gate
- **Background:** Dot-grid pattern (`radial-gradient circle`) over a light desktop blue-grey
- **Motion:** Elastic jelly curve (`cubic-bezier(0.34, 1.56, 0.64, 1)`) on hover, pop, and entrance animations
- **Vibe:** Light mode only. No dark mode. This is a sunny morning in 2008.

## 📁 Project Structure

```
anipendant/
├── src/
│   ├── components/        # Reusable UI (NavBar, Layout, Loading, PinGate, modals)
│   ├── features/
│   │   ├── auth/          # Login, Register, AuthPage
│   │   ├── onboarding/    # Multi-step setup (username, PIN, API choice)
│   │   ├── browse/        # Search, AnimeCard, AnimeDetail, SearchBar
│   │   └── shows/         # My Shows, ShowCard, ShowDetail, episode management
│   ├── hooks/             # useAuth, useAnimeApi, usePinGuard
│   ├── lib/
│   │   ├── api/           # AniList + Kitsu adapters (AnimeProvider interface)
│   │   └── supabase.ts    # Supabase client
│   └── types/             # Database types, AnimeProvider interface
├── supabase/migrations/   # SQL schema for Postgres
├── vercel.json            # Vercel config (rootDirectory: anipendant)
└── .env.example           # Environment template
```

## 🧪 Testing

```bash
npm test          # Run all tests
npm run test:watch  # Watch mode
npx vitest run --test-name-pattern "parse data"  # Run by pattern
```

Tests use **Vitest 4** with **jsdom** and **@testing-library/react**. All component tests run in a simulated browser environment.

## 🚢 Deployment

The project is configured for **Vercel**. Pushes to `master` trigger production auto-deploys (via GitHub integration — set up from the Vercel dashboard).

```bash
# Or deploy from CLI
vercel deploy --prod --yes
```

**Environment variables** (set in Vercel dashboard → Project Settings → Environment Variables):

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon public key |

> [!NOTE]
> Variables prefixed with `VITE_` are public (bundled into the client). The Supabase anon key is safe to expose — it's protected by Row-Level Security on your database.

## 📄 License

MIT — see [LICENSE](LICENSE).

---

<div align="center">

Made with 🩵 by [alfielionel](https://github.com/alfielionel)

</div>
