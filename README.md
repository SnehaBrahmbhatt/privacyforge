# privacyforge
PrivacyForge generates realistic synthetic data that preserves patterns without exposing sensitive information. It helps developers safely train and test AI models while staying compliant with privacy regulations. This removes data access barriers, reduces risk, and enables faster, secure innovation.
# PrivacyForge Frontend

AI-Powered Privacy Compliance Suite — React + Vite + Tailwind + Watermelon UI

## Quick Start

```bash
cd privacyforge-frontend
npm install
npm run dev
```

Open **http://localhost:5173**

> Make sure your FastAPI backend is running at **http://localhost:8000**  
> The Vite dev server proxies `/api/*` → `http://localhost:8000/*`

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS v3 + Watermelon UI components |
| State | TanStack Query v5 |
| Routing | React Router v6 |
| UI Primitives | Radix UI |
| Icons | Lucide React |
| Animations | Tailwind Animate |

## Watermelon UI Integration

All UI components are built following the [Watermelon UI](https://ui.watermelon.sh) design system (copy-paste approach — no npm package needed):

- **Buttons** — `src/components/ui/button.tsx` — variants: `default`, `outline`, `ghost`, `glass`, `stripe`
- **Cards** — `src/components/ui/card.tsx` — with `glow` and `glass` props
- **Modals** — `src/components/ui/dialog.tsx` — green top-border accent, blur overlay
- **Badges** — `src/components/ui/badge.tsx` — success / warning / danger / info / wm
- **Progress** — `src/components/ui/progress.tsx` — linear + ring variants
- **Toast** — `src/components/ui/toast.tsx` + `src/hooks/use-toast.ts`

## Backend API

All calls go through the Vite proxy to `http://localhost:8000`:

| Endpoint | Method | Used by |
|----------|--------|---------|
| `/health` | GET | Sidebar status indicator |
| `/scan` | POST | Privacy Scan page |
| `/anonymize` | POST | Anonymize page |
| `/compliance/check` | POST | Compliance page |
| `/dashboard/stats` | GET | Dashboard |
| `/scans/history` | GET | History page |
| `/scans/:id` | GET | History detail modal |

## Dark Mode

Dark mode is toggled via the sidebar button and persisted in `localStorage` as `pf-theme`.  
It also respects `prefers-color-scheme` on first load.

## Features

- ✅ **Dashboard** — live stats, risk score ring, recent scan list
- ✅ **Privacy Scan** — PII detection with entity tags, risk score, recommendations
- ✅ **Anonymize** — 4 strategies (mask/redact/replace/hash), entity type filtering
- ✅ **Compliance** — GDPR / CCPA / HIPAA / PDPA checks with violation details
- ✅ **History** — filterable scan log with Watermelon UI modal drill-down
- ✅ **Dark mode** — full dark/light toggle
- ✅ **Responsive** — mobile sidebar, adaptive grid layouts
- ✅ **Error states** — graceful fallback when backend is offline
- ✅ **Loading skeletons** — no layout shift during fetches

