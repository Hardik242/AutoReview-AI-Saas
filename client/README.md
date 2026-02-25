# AutoReview AI — Client

> Modern SaaS dashboard for managing AI-powered code reviews. Built with Next.js 16 App Router, shadcn/ui, and Tailwind CSS 4.

## ✨ Features

- **Collapsible Sidebar** — Desktop: persistent with icon-only mode (`Ctrl+B`). Mobile: sheet overlay
- **Dark / Light Mode** — Toggle in sidebar, persisted to localStorage, respects system preference
- **Dashboard** — Stats cards, area chart (reviews over time), bar chart (reviews by status)
- **Repository Management** — Searchable GitHub repo picker, connect/disconnect with one click
- **Review History** — Filterable by status, searchable by PR title, detail dialog with markdown-rendered AI summary
- **Settings** — URL-synced tabs (`?tab=profile|billing|rules`), plan comparison
- **Auth Guard** — All dashboard routes protected, auto-redirect on 401, login page redirect if authenticated
- **Stripe Integration** — Upgrade to Pro checkout, manage subscription via billing portal
- **SEO** — Next.js Metadata API for search engine optimization
- **Loading States** — Suspense boundaries with skeleton loaders

## 🛠️ Tech Stack

| Layer         | Technology                      |
| ------------- | ------------------------------- |
| Framework     | Next.js 16 (App Router)         |
| Language      | React 19 + TypeScript           |
| Styling       | Tailwind CSS 4                  |
| Components    | shadcn/ui (Radix UI primitives) |
| Data Fetching | TanStack Query (React Query)    |
| Charts        | Recharts                        |
| Animations    | Framer Motion                   |
| Toasts        | Sonner                          |
| Icons         | Lucide React                    |

## 📁 Project Structure

```
client/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx           # Sidebar + auth guard
│   │   ├── loading.tsx          # Dashboard skeleton loader
│   │   ├── dashboard/page.tsx   # Stats + charts
│   │   ├── repositories/page.tsx# Repo management
│   │   ├── reviews/page.tsx     # Review history
│   │   └── settings/page.tsx    # Account settings (tabbed)
│   ├── login/page.tsx           # GitHub OAuth login
│   ├── globals.css              # Theme (warm amber, light/dark)
│   ├── layout.tsx               # Root layout + providers + metadata
│   ├── loading.tsx              # Root skeleton loader
│   ├── not-found.tsx            # 404 page
│   ├── page.tsx                 # Landing page
│   └── providers.tsx            # QueryClient + ThemeProvider
├── public/
│   └── logo.png                 # App icon (favicon + navbar)
├── src/
│   ├── components/
│   │   ├── landing/             # Landing page sections (Hero, Features, Pricing, etc.)
│   │   └── ui/                  # shadcn/ui components
│   ├── hooks/
│   │   ├── use-mobile.tsx       # Mobile detection hook
│   │   └── use-toast.ts         # Toast state management
│   └── lib/
│       ├── api.ts               # API client + TypeScript interfaces
│       └── utils.ts             # cn() utility
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
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
npm install

# Create env file
cp .env.example .env

# Start dev server
npm run dev
```

### Scripts

| Script          | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start Next.js dev server |
| `npm run build` | Production build         |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint               |

## 🔐 Auth Flow

```
Landing Page → "Get Started" → Login Page
  → "Continue with GitHub" → /api/v1/auth/github
  → GitHub OAuth consent screen
  → Callback sets HttpOnly cookies (access + refresh tokens)
  → Redirect to CLIENT_URL (/) → detects auth → redirects to /dashboard
  → Dashboard layout validates session via useQuery("user")
  → On 401 → redirect to /login
```

## 📊 Dashboard Data Flow

```
Dashboard page
  ├── useQuery("user")   → GET /user/profile   → plan, usage
  ├── useQuery("stats")  → GET /user/stats     → charts, cards
  ├── useQuery("repos")  → GET /repos          → connected repos
  └── useQuery("reviews")→ GET /reviews?limit=5 → recent reviews
```

## 🌐 Environment Variables

| Variable              | Description          | Default                 |
| --------------------- | -------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |

## 📦 Deployment

Deploy to **Vercel** with zero configuration — Vercel auto-detects Next.js and handles builds, routing, and edge caching. Set `NEXT_PUBLIC_API_URL` in Vercel's environment variables to your production API URL.
