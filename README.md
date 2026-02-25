<div align="center">
  <img src="client/public/logo.png" alt="AutoReview AI" width="80" />
  <h1>AutoReview AI</h1>
  <p><strong>AI-powered code reviews for GitHub pull requests</strong></p>
  <p>
    <a href="https://auto-review-ai-saas.vercel.app">Live Demo</a> •
    <a href="./api/README.md">API Docs</a> •
    <a href="./client/README.md">Client Docs</a>
  </p>
</div>

---

AutoReview AI automatically reviews your GitHub pull requests using Google Gemini. Connect your repos, open a PR, and get instant AI-powered feedback — inline comments, security audits, and even auto-fix commits.

## ✨ Features

| Feature                           | Free | Pro |
| --------------------------------- | :--: | :-: |
| AI code reviews on every PR       |  ✅  | ✅  |
| Summary comments with issue table |  ✅  | ✅  |
| Reviews per month                 |  30  | 300 |
| Inline comments on specific lines |  —   | ✅  |
| Security & performance audits     |  —   | ✅  |
| Auto-fix commits                  |  —   | ✅  |
| Custom review rules               |  —   | ✅  |
| Priority processing queue         |  —   | ✅  |

### Dashboard

- **Stats cards** — Connected repos, monthly reviews, issues found, success rate
- **Charts** — Review activity over time, status breakdown
- **Repository management** — Searchable GitHub repo picker, one-click connect
- **Review history** — Filterable, searchable, with AI summary detail view
- **Settings** — Profile, billing, auto-fix toggle, custom rules (URL-synced tabs)

### Security

- HttpOnly JWT cookies with refresh token rotation
- HMAC-SHA256 webhook verification
- Rate limiting (100 req/15min general, 20 req/15min auth)
- Helmet security headers, CORS restricted to frontend origin

## 🛠️ Tech Stack

### Backend ([docs](./api/README.md))

| Layer         | Technology               |
| ------------- | ------------------------ |
| Runtime       | Node.js + TypeScript     |
| Framework     | Express 5                |
| Database      | PostgreSQL + Drizzle ORM |
| Vector Search | pgvector (RAG context)   |
| Queue         | BullMQ + Redis           |
| AI            | Google Gemini            |
| Payments      | Stripe                   |

### Frontend ([docs](./client/README.md))

| Layer     | Technology                 |
| --------- | -------------------------- |
| Framework | React 19 + TypeScript      |
| Build     | Vite 7                     |
| UI        | shadcn/ui + Tailwind CSS 3 |
| Data      | TanStack Query             |
| Charts    | Recharts                   |
| Routing   | React Router 6             |

## 🏗️ Architecture

```
GitHub PR Event
     │
     ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Webhook     │────▶│  BullMQ     │────▶│  Gemini AI   │
│  (HMAC)      │     │  Queue      │     │  Review      │
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                           │                    │
                    ┌──────▼──────┐      ┌──────▼──────┐
                    │  PostgreSQL  │      │  GitHub API  │
                    │  + pgvector  │      │  (Comments)  │
                    └─────────────┘      └─────────────┘
```

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/Hardik242/AutoReview-AI-Saas.git
cd AutoReview-AI-Saas

# API
cd api
npm install
cp .env.example .env  # fill in values
npx drizzle-kit push
npm run dev:all

# Client (new terminal)
cd client
npm install --legacy-peer-deps
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

See [API README](./api/README.md) for environment variables and [Client README](./client/README.md) for setup details.

## 🐳 Docker

```bash
docker-compose up --build
```

Starts PostgreSQL (pgvector), Redis, API, Worker, and Client.

## 📄 License

MIT
