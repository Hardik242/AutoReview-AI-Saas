# AutoReview AI — API

> AI-powered code review engine for GitHub pull requests. Built with Node.js, Express, and TypeScript.

## 🏗️ Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   GitHub      │────▶│  Express API  │────▶│   BullMQ      │
│   Webhooks    │     │  (Express 5)  │     │   Workers     │
└──────────────┘     └──────┬───────┘     └──────┬───────┘
                            │                     │
                     ┌──────▼───────┐     ┌──────▼───────┐
                     │  PostgreSQL   │     │   Gemini AI   │
                     │  + pgvector   │     │   (Review)    │
                     └──────────────┘     └──────────────┘
```

## ✨ Features

### Core

- **GitHub OAuth** — Custom OAuth flow with HttpOnly JWT cookies (access + refresh tokens)
- **Webhook Processing** — HMAC-SHA256 verified GitHub webhooks for PR events
- **Repository Management** — Connect/disconnect repos, auto-fetch user's GitHub repos via Octokit

### AI Review Engine

- **Gemini-Powered Reviews** — Uses Google Gemini to analyze code diffs and generate reviews
- **RAG Context** — pgvector-based code embeddings for repository-aware context retrieval
- **Inline Comments** — Posts line-by-line code review comments directly on PRs (Pro)
- **Auto-Fix** — Automatically commits suggested fixes to PR branches (Pro)

### Background Jobs

- **Dual Queue System** — BullMQ with priority queues: `review-free` (concurrency: 2) and `review-pro` (concurrency: 5)
- **Redis-Backed** — Persistent job queue with retry logic

### Monetization

- **Stripe Integration** — Checkout sessions, billing portal, subscription webhooks
- **Tiered Plans** — Free (30 reviews/mo, summary only) and Pro (300 reviews/mo, inline + auto-fix + custom rules)

### Analytics

- **Dashboard Stats** — Total repos, monthly reviews, issues found, success rate
- **Daily Review Chart** — 30-day review activity data for frontend charts
- **Review History** — Full history with status, PR title, summary, issues count

## 🛠️ Tech Stack

| Layer      | Technology                              |
| ---------- | --------------------------------------- |
| Runtime    | Node.js + TypeScript                    |
| Framework  | Express 5                               |
| Database   | PostgreSQL + Drizzle ORM                |
| Vector DB  | pgvector (code embeddings)              |
| Queue      | BullMQ + Redis (ioredis)                |
| AI         | Google Gemini (`@google/generative-ai`) |
| GitHub     | Octokit                                 |
| Payments   | Stripe                                  |
| Auth       | JWT (HttpOnly cookies)                  |
| Validation | Zod                                     |

## 📁 Project Structure

```
api/
├── src/
│   ├── config/
│   │   └── env.ts              # Environment validation (Zod)
│   ├── controllers/
│   │   ├── auth.controller.ts   # GitHub OAuth callback
│   │   ├── repo.controller.ts   # Repo CRUD + GitHub repo listing
│   │   ├── review.controller.ts # Review history
│   │   ├── rules.controller.ts  # Custom review rules CRUD
│   │   ├── stripe.controller.ts # Checkout/portal sessions
│   │   ├── user.controller.ts   # Profile, auto-fix, stats
│   │   └── webhook.controller.ts# GitHub + Stripe webhooks
│   ├── db/
│   │   ├── index.ts             # Drizzle client
│   │   └── schema.ts            # Tables: users, repos, reviews, rules, embeddings
│   ├── middlewares/
│   │   ├── auth.middleware.ts    # JWT verification
│   │   └── webhook.middleware.ts # HMAC-SHA256 signature verification
│   ├── routes/                  # Express routers
│   ├── services/
│   │   ├── gemini.service.ts    # AI review generation + embeddings
│   │   ├── github.service.ts    # Octokit: PR diffs, comments, fixes, repo listing
│   │   ├── rag.service.ts       # pgvector similarity search
│   │   ├── repo.service.ts      # Repository CRUD
│   │   ├── review.processor.ts  # Full review pipeline orchestrator
│   │   ├── rules.service.ts     # Custom rules CRUD
│   │   ├── stripe.service.ts    # Stripe checkout, portal, subscription handlers
│   │   └── user.service.ts      # User profile, auto-fix, stats aggregation
│   ├── utils/
│   │   └── jwt.ts               # Token generation + verification
│   ├── index.ts                 # Express app entry point
│   └── worker.ts                # BullMQ worker entry point
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL with pgvector extension
- Redis

### Setup

```bash
# Install dependencies
npm install

# Copy env template
cp .env.example .env
# Fill in all values (see Environment Variables below)

# Push database schema
npx drizzle-kit push

# Start API + Worker
npm run dev:all
```

### Scripts

| Script            | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start API server (nodemon)           |
| `npm run worker`  | Start BullMQ worker (nodemon)        |
| `npm run dev:all` | Start both API + Worker concurrently |

## 🔐 Environment Variables

| Variable                | Description                                 |
| ----------------------- | ------------------------------------------- |
| `PORT`                  | Server port (default: 8000)                 |
| `NODE_ENV`              | `development` or `production`               |
| `CLIENT_URL`            | Frontend URL for CORS + redirects           |
| `DATABASE_URL`          | PostgreSQL connection string                |
| `GITHUB_CLIENT_ID`      | GitHub OAuth App client ID                  |
| `GITHUB_CLIENT_SECRET`  | GitHub OAuth App client secret              |
| `GITHUB_REDIRECT_URI`   | OAuth callback URL                          |
| `GITHUB_WEBHOOK_SECRET` | HMAC secret for webhook verification        |
| `JWT_ACCESS_SECRET`     | Access token signing secret                 |
| `JWT_REFRESH_SECRET`    | Refresh token signing secret                |
| `REDIS_URL`             | Redis connection URL                        |
| `GEMINI_API_KEY`        | Google Gemini API key                       |
| `STRIPE_SECRET_KEY`     | Stripe secret key (`sk_test_...`)           |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) |
| `STRIPE_PRO_PRICE_ID`   | Stripe Price ID for Pro plan (`price_...`)  |

## 📡 API Endpoints

### Auth

| Method | Endpoint                       | Description                   |
| ------ | ------------------------------ | ----------------------------- |
| GET    | `/api/v1/auth/github`          | Initiate GitHub OAuth         |
| GET    | `/api/v1/auth/github/callback` | OAuth callback (sets cookies) |
| POST   | `/api/v1/auth/logout`          | Clear auth cookies            |
| POST   | `/api/v1/auth/refresh`         | Refresh access token          |

### User

| Method | Endpoint                | Description                      |
| ------ | ----------------------- | -------------------------------- |
| GET    | `/api/v1/user/profile`  | Get user profile                 |
| GET    | `/api/v1/user/stats`    | Get dashboard stats + chart data |
| PATCH  | `/api/v1/user/auto-fix` | Toggle auto-fix (Pro only)       |

### Repositories

| Method | Endpoint                | Description              |
| ------ | ----------------------- | ------------------------ |
| GET    | `/api/v1/repos`         | List connected repos     |
| GET    | `/api/v1/repos/github`  | List user's GitHub repos |
| POST   | `/api/v1/repos/connect` | Connect a repository     |
| DELETE | `/api/v1/repos/:id`     | Disconnect a repository  |

### Reviews

| Method | Endpoint              | Description         |
| ------ | --------------------- | ------------------- |
| GET    | `/api/v1/reviews`     | List review history |
| GET    | `/api/v1/reviews/:id` | Get review details  |

### Rules (Pro)

| Method | Endpoint                   | Description        |
| ------ | -------------------------- | ------------------ |
| GET    | `/api/v1/rules`            | List custom rules  |
| POST   | `/api/v1/rules`            | Create a rule      |
| PATCH  | `/api/v1/rules/:id/toggle` | Toggle rule on/off |
| DELETE | `/api/v1/rules/:id`        | Delete a rule      |

### Stripe

| Method | Endpoint                  | Description                   |
| ------ | ------------------------- | ----------------------------- |
| POST   | `/api/v1/stripe/checkout` | Create checkout session       |
| POST   | `/api/v1/stripe/portal`   | Create billing portal session |

### Webhooks

| Method | Endpoint                  | Description                |
| ------ | ------------------------- | -------------------------- |
| POST   | `/api/v1/webhooks/github` | GitHub PR event webhook    |
| POST   | `/api/v1/webhooks/stripe` | Stripe subscription events |

## 🔒 Security

- **HttpOnly Cookies** — JWTs stored in HttpOnly, Secure, SameSite=Strict cookies
- **HMAC Verification** — SHA-256 signature validation on all GitHub webhooks
- **Stripe Webhook Verification** — Event signature validation via Stripe SDK
- **Input Validation** — Zod schemas on all request bodies
- **CORS** — Restricted to `CLIENT_URL` origin only
- **Helmet** — Security headers via helmet middleware
