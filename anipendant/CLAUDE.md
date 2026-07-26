# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Test Commands

- `npm run dev` — Start Vite dev server (port 5173)
- `npm run build` — Full build: `tsc -b && vite build`
- `npm test` — Run all tests via Vitest
- `npm run test:watch` — Vitest watch mode
- `npm run preview` — Preview production build
- Run a single test file: `npx vitest run src/features/shows/import/__tests__/yaml-schema.test.ts`
- Run tests by name pattern: `npx vitest run --test-name-pattern "parse data"`

## Project Architecture

### Stack
- **Framework**: React 19 + TypeScript 6
- **Build**: Vite 8 with `@vitejs/plugin-react` (Oxc)
- **Routing**: React Router v7 (nested routes via `<Outlet />`)
- **Auth/Database**: Supabase (`@supabase/supabase-js`), session-based auth with `autoRefreshToken: true`
- **Styling**: Two global CSS files (`index.css` + `App.css`), no CSS modules, BEM-like classNames
- **Font**: Nunito (Google Fonts) — loaded via `<link>` in `index.html`
- **Path alias**: `@/` maps to `./src/` (configured in `vite.config.ts`)
- **Test**: Vitest 4 with jsdom, `@testing-library/react` 16, setup in `src/test/setup.ts`
- **Env**: `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Routing structure (`src/App.tsx`)
```
/auth          → AuthPage (public, no layout)
/onboarding    → ProtectedRoute → OnboardingPage (no layout)
/browse        → ProtectedRoute → Layout → BrowsePage
/browse/:id    → ProtectedRoute → Layout → AnimeDetail
/shows         → ProtectedRoute → Layout → ShowsPage
/shows/:id     → ProtectedRoute → Layout → ShowDetail
/account       → ProtectedRoute → Layout → AccountPage
*              → HomeRedirect (conditional redirect based on auth state)
```

The `Layout` component wraps `<Outlet />` with `<NavBar />` and `<PinGate />`. `ProtectedRoute` redirects to `/auth` if no user session exists. `HomeRedirect` directs to `/auth`, `/onboarding`, or `/browse` based on auth/profile state.

### Key modules

- **`useAuth`** (`src/hooks/useAuth.tsx`) — React context provider for Supabase auth. Exposes `user`, `loading`, `error`, `login()`, `register()`, `logout()`, `refreshProfile()`, `clearError()`. Profile data comes from `public.users` table via `supabase.from('users').select('*').eq('id', userId).single()`.

- **`useAnimeApi`** (`src/hooks/useAnimeApi.ts`) — Returns the user's configured anime provider (`AniList`, `Jikan`, or `Kitsu`) via `getProvider()`. Reads `user.selected_api` from auth context.

- **`usePinGuard`** (`src/hooks/usePinGuard.ts`) — Idle-based PIN lock. Checks `lastActivity` timestamp from `localStorage`, enforces re-auth via `supabase.rpc('verify_pin')` after idle threshold.

- **API adapters** (`src/lib/api/`) — Unified `AnimeProvider` interface with implementations for AniList, Jikan v4, and Kitsu. Adapter pattern — each normalizes data to types in `src/types/database.ts`. Registry at `registry.ts` maps string keys to adapter instances.

- **Database types** (`src/types/database.ts`) — Supabase `Database` type with tables: `users`, `shows`, `episodes`, `episode_mirrors`. Also defines unified `AnimeShow`, `AnimeShowDetail`, `AnimeEpisode` types used by all API adapters.

- **Supabase client** (`src/lib/supabase.js`) — Creates typed client, reads env vars, sets `autoRefreshToken: true` and `persistSession: true`.

- **YAML import** (`src/features/shows/import/`) — Parses YAML show/episode data using `js-yaml` and Zod schema validation.

### Design system (`index.css` + `App.css`)

Frutiger Aero / 2010 Mac aesthetic:
- Aqua blue accent (`#007AFF`), light blue (`#5AC8FA`), dot-grid background over `#E8EDF3`
- Glass surfaces (`backdrop-filter: blur(20px)`), Mac toolbar gradient, pill-shaped buttons
- Elastic jelly timing curve CSS variable: `--jelly: cubic-bezier(0.34, 1.56, 0.64, 1)`
- Light mode only (no dark mode)
- All animations use the jelly curve for elastic bounce feel
- Key CSS classes: `.navbar`, `.main-content`, `.btn`/`.btn-primary`/`.btn-danger`, `.auth-container`, `.anime-grid`/`.anime-card`, `.form-field`, `.pin-gate-card`, `.loading-dots`
