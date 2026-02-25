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
- **Repository Management** — Connect/disconnect repos, auto-register webhooks via Octokit

### AI Review Engine

- **Gemini-Powered Reviews** — Uses `@ai-sdk/google` (Vercel AI SDK) to analyze code diffs
- **RAG Context** — pgvector-based code embeddings for repository-aware context retrieval
- **Dual Review Tiers** — Basic (summary only, `gemini-2.0-flash-lite`) and Pro (structured output with inline comments, `gemini-2.0-flash`)
- **Inline Comments** — Posts line-by-line code review comments directly on PRs (Pro)

### Background Jobs

- **Dual Queue System** — BullMQ with priority queues: `review-free` (concurrency: 2) and `review-pro` (concurrency: 5)
- **Redis-Backed** — Persistent job queue with retry logic

### Monetization

- **Stripe Integration** — Checkout sessions, billing portal, subscription webhooks
- **Tiered Plans** — Free (30 reviews/mo, summary only) and Pro (300 reviews/mo, inline + custom rules)

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
| AI         | Vercel AI SDK (`ai` + `@ai-sdk/google`) |
| GitHub     | Octokit                                 |
| Payments   | Stripe                                  |
| Auth       | JWT (HttpOnly cookies)                  |
| Validation | Zod                                     |

## 📁 Project Structure

```
api/
├── src/
│   ├── config/
│   │   └── env.ts              # Environment validation
│   ├── controllers/
│   │   ├── auth.controller.ts   # GitHub OAuth callback
│   │   ├── repo.controller.ts   # Repo CRUD + GitHub repo listing
│   │   ├── review.controller.ts # Review history
│   │   ├── rules.controller.ts  # Custom review rules CRUD
│   │   ├── stripe.controller.ts # Checkout/portal sessions
│   │   ├── user.controller.ts   # Profile + stats
│   │   └── webhook.controller.ts# GitHub + Stripe webhooks
│   ├── db/
│   │   ├── index.ts             # Drizzle client
│   │   └── schema.ts            # Tables: users, repos, reviews, rules, embeddings
│   ├── middlewares/
│   │   ├── auth.middleware.ts    # JWT verification + refresh
│   │   ├── error.middleware.ts   # Global error handler
│   │   └── webhook.middleware.ts # HMAC-SHA256 signature verification
│   ├── queues/
│   │   └── review.queue.ts      # BullMQ queue definitions
│   ├── routes/                  # Express routers
│   ├── services/
│   │   ├── gemini.service.ts    # AI review generation + embeddings
│   │   ├── github.service.ts    # Octokit: PR diffs, comments, repo listing
│   │   ├── rag.service.ts       # pgvector similarity search
│   │   ├── repo.service.ts      # Repository CRUD + webhook registration
│   │   ├── review.processor.ts  # Full review pipeline orchestrator
│   │   ├── rules.service.ts     # Custom rules CRUD
│   │   ├── stripe.service.ts    # Stripe checkout, portal, subscription handlers
│   │   └── user.service.ts      # User profile + stats aggregation
│   ├── types/                   # TypeScript type declarations
│   ├── utils/
│   │   ├── jwt.ts               # Token generation + verification
│   │   └── cookies.ts           # Auth cookie management
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
| `npm run build`   | Compile TypeScript                   |
| `npm run start`   | Start production API server          |

## 🔐 Environment Variables

| Variable                       | Description                                      |
| ------------------------------ | ------------------------------------------------ |
| `PORT`                         | Server port (default: 8000)                      |
| `NODE_ENV`                     | `development` or `production`                    |
| `CLIENT_URL`                   | Frontend URL for CORS + redirects                |
| `API_URL`                      | API's own public URL (for webhook URLs)          |
| `DATABASE_URL`                 | PostgreSQL connection string                     |
| `GITHUB_CLIENT_ID`             | GitHub OAuth App client ID                       |
| `GITHUB_CLIENT_SECRET`         | GitHub OAuth App client secret                   |
| `GITHUB_REDIRECT_URI`          | OAuth callback URL                               |
| `GITHUB_WEBHOOK_SECRET`        | HMAC secret for webhook verification             |
| `JWT_ACCESS_SECRET`            | Access token signing secret                      |
| `JWT_REFRESH_SECRET`           | Refresh token signing secret                     |
| `REDIS_URL`                    | Redis connection URL                             |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Gemini API key (used by `@ai-sdk/google`) |
| `STRIPE_SECRET_KEY`            | Stripe secret key (`sk_test_...`)                |
| `STRIPE_WEBHOOK_SECRET`        | Stripe webhook signing secret (`whsec_...`)      |
| `STRIPE_PRO_PRICE_ID`          | Stripe Price ID for Pro plan (`price_...`)       |

## 📡 API Endpoints

### Auth

| Method | Endpoint                       | Description                   |
| ------ | ------------------------------ | ----------------------------- |
| GET    | `/api/v1/auth/github`          | Initiate GitHub OAuth         |
| GET    | `/api/v1/auth/github/callback` | OAuth callback (sets cookies) |
| POST   | `/api/v1/auth/logout`          | Clear auth cookies            |
| POST   | `/api/v1/auth/refresh`         | Refresh access token          |

### User

| Method | Endpoint               | Description                      |
| ------ | ---------------------- | -------------------------------- |
| GET    | `/api/v1/user/profile` | Get user profile                 |
| GET    | `/api/v1/user/stats`   | Get dashboard stats + chart data |

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

- **HttpOnly Cookies** — JWTs stored in HttpOnly, Secure, SameSite cookies (SameSite=None in production for cross-origin)
- **HMAC Verification** — SHA-256 signature validation on all GitHub webhooks
- **Stripe Webhook Verification** — Event signature validation via Stripe SDK
- **Input Validation** — Zod schemas on all request bodies
- **CORS** — Restricted to `CLIENT_URL` origin only
- **Helmet** — Security headers via helmet middleware
- **Rate Limiting** — 100 req/15min general, 20 req/15min for auth routes
