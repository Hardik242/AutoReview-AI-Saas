# AutoReview AI — Client

> Modern SaaS dashboard for managing AI-powered code reviews. Built with React, Vite, and shadcn/ui.

## ✨ Features

- **Collapsible Sidebar** — Desktop: persistent with icon-only mode (`Ctrl+B`). Mobile: sheet overlay
- **Dark / Light Mode** — Toggle in sidebar, persisted to localStorage, respects system preference
- **Dashboard** — Stats cards, area chart (reviews over time), bar chart (reviews by status)
- **Repository Management** — Searchable GitHub repo picker, connect/disconnect with one click
- **Review History** — Filterable by status, searchable by PR title, detail dialog with AI summary
- **Settings** — URL-synced tabs (`?tab=profile|billing|autofix|rules`), plan comparison, danger zone
- **Auth Guard** — All dashboard routes protected, auto-redirect on 401, login page redirect if authenticated
- **Stripe Integration** — Upgrade to Pro checkout, manage subscription via billing portal

## 🛠️ Tech Stack

| Layer         | Technology                      |
| ------------- | ------------------------------- |
| Framework     | React 19 + TypeScript           |
| Build         | Vite 7                          |
| Routing       | React Router 6                  |
| Styling       | Tailwind CSS 3                  |
| Components    | shadcn/ui (Radix UI primitives) |
| Data Fetching | TanStack Query (React Query)    |
| Charts        | Recharts                        |
| Animations    | Framer Motion                   |
| Toasts        | Sonner                          |
| Icons         | Lucide React                    |

## 📁 Project Structure

```
client/
├── public/
│   └── logo.png                 # App icon (favicon + navbar)
├── src/
│   ├── components/
│   │   ├── landing/
│   │   │   ├── Navbar.tsx        # Auth-aware landing navbar
│   │   │   ├── HeroSection.tsx   # Landing hero
│   │   │   ├── HowItWorksSection.tsx
│   │   │   ├── FeaturesSection.tsx
│   │   │   ├── PricingSection.tsx
│   │   │   └── Footer.tsx
│   │   ├── ui/                   # shadcn/ui components (49 components)
│   │   └── DashboardLayout.tsx   # Sidebar layout + auth guard
│   ├── hooks/
│   │   └── use-mobile.tsx        # Mobile detection hook
│   ├── lib/
│   │   ├── api.ts               # API client + TypeScript interfaces
│   │   └── utils.ts             # cn() utility
│   ├── pages/
│   │   ├── Index.tsx            # Landing page
│   │   ├── Login.tsx            # GitHub OAuth login
│   │   ├── Dashboard.tsx        # Stats + charts
│   │   ├── Repositories.tsx     # Repo management
│   │   ├── Reviews.tsx          # Review history
│   │   └── Settings.tsx         # Account settings (tabbed)
│   ├── App.tsx                  # Router + providers
│   ├── index.css                # Theme (warm amber, light/dark)
│   └── main.tsx                 # Entry point
├── index.html                   # SEO meta tags + favicon
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── package.json
```

## 🎨 Design System

### Theme

Warm amber color palette with light and dark mode support:

| Token      | Light                         | Dark                          |
| ---------- | ----------------------------- | ----------------------------- |
| Primary    | Amber `hsl(38 92% 50%)`       | Amber `hsl(38 92% 50%)`       |
| Accent     | Earth brown `hsl(24 56% 29%)` | Earth brown `hsl(24 56% 29%)` |
| Background | White `hsl(0 0% 100%)`        | Near-black `hsl(0 0% 8%)`     |
| Card       | White                         | Dark gray `hsl(0 0% 12%)`     |

### Typography

- **Sans:** Inter
- **Mono:** JetBrains Mono
- **Serif:** Source Serif 4

### Custom Utilities

- `.glass` / `.glass-strong` — Glassmorphism with backdrop blur
- `.gradient-text` — Primary→accent gradient text
- `.gradient-border` — Animated gradient border effect
- `.hover-lift` — Subtle elevation on hover
- `.btn-press` — Micro-animation on button press

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- API server running (see `../api/README.md`)

### Setup

```bash
# Install dependencies
npm install --legacy-peer-deps

# Create env file
echo "VITE_API_URL=http://localhost:8000" > .env

# Start dev server
npm run dev
```

### Scripts

| Script            | Description                 |
| ----------------- | --------------------------- |
| `npm run dev`     | Start Vite dev server (HMR) |
| `npm run build`   | Production build            |
| `npm run preview` | Preview production build    |

## 🔐 Auth Flow

```
Landing Page → "Get Started" → Login Page
  → "Continue with GitHub" → /api/v1/auth/github
  → GitHub OAuth consent screen
  → Callback sets HttpOnly cookies (access + refresh tokens)
  → Redirect to CLIENT_URL (/) → detects auth → redirects to /dashboard
  → DashboardLayout validates session via useQuery("user")
  → On 401 → redirect to /login
```

## 📊 Dashboard Data Flow

```
Dashboard.tsx
  ├── useQuery("user")   → GET /user/profile   → plan, usage
  ├── useQuery("stats")  → GET /user/stats     → charts, cards
  ├── useQuery("repos")  → GET /repos          → connected repos
  └── useQuery("reviews")→ GET /reviews?limit=5 → recent reviews
```

## 🌐 Environment Variables

| Variable       | Description          | Default                 |
| -------------- | -------------------- | ----------------------- |
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000` |

## 📦 Build

```bash
npm run build
# Output: dist/ (69KB CSS + 1MB JS, 311KB gzipped)
```

The `dist/` folder is a static SPA that can be deployed to any static hosting (Vercel, Netlify, Cloudflare Pages, etc.). Configure your hosting to redirect all routes to `index.html` for client-side routing.
