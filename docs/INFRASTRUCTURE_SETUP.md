# FoundryRooms — Infrastructure & CI/CD Guide

This guide documents the hosting, CI/CD pipeline, and secrets management for the FoundryRooms project.

> **⚠️ This is a public repository.** Never commit secrets, API keys, or connection strings.
> All secrets are stored in GitHub Settings → Secrets → Actions and the Render dashboard.

## Architecture

```
Push to main (or PR → main)
    │
    ├──► CI workflow (.github/workflows/ci.yml)
    │      ├── lint
    │      ├── unit-tests (433 tests via vitest)
    │      ├── integration-tests (PostgreSQL service container)
    │      ├── contract-tests
    │      ├── architecture-tests
    │      └── build + typecheck (gated on all above passing)
    │
    └──► Render auto-deploys (builds Docker image from Dockerfile)
              ↓
         Deploy workflow (.github/workflows/deploy.yml)
         (ONLY runs after CI passes ✅)
              ├── drizzle-kit push → Neon (creates/updates DB tables)
              └── Render deploy hook (optional — Render auto-deploys without it)
```

### Hosting

| Service | Purpose | Plan | URL |
|---|---|---|---|
| **Render** | NestJS API server (Docker) | Free (spins down after 15 min idle) | https://foundryrooms-api.onrender.com |
| **Neon** | PostgreSQL database | Free (500MB, always-on, no expiry) | Neon dashboard |

### Render Service Configuration

- **Runtime**: Docker (`./Dockerfile`)
- **Branch**: `main` (auto-deploy on push)
- **Region**: Oregon
- **Plan**: Free

### Environment Variables (Render Dashboard)

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon connection string |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `CORS_ORIGIN` | `*` (update to frontend URL when ready) |

### GitHub Repository Secrets

Go to repo → Settings → Secrets and variables → Actions:

| Secret | Purpose | Required |
|---|---|---|
| `DATABASE_URL` | Neon connection string (migrations + deploy workflow) | Yes |
| `LLM_API_KEY` | OpenRouter API key for Governor Agent PR review (free tier) | Yes |
| `RENDER_DEPLOY_HOOK_URL` | Manual deploy trigger (optional — Render auto-deploys) | No |

---

## Setup (already completed)

The infrastructure is already set up and running. This section documents what was done for reference.

### 1. Neon Database

- Created a Neon project at [neon.tech](https://neon.tech)
- Connection string stored in GitHub secrets (`DATABASE_URL`) and Render env vars
- Tables created via `drizzle-kit push`

### 2. Render Web Service

- Created via Render MCP server
- Connected to GitHub repo `TheFoundryEngine/FoundryRooms`
- Docker runtime, free plan, Oregon region
- Auto-deploy enabled on `main` branch

### 3. Database Migrations

Migrations run automatically in the Deploy workflow after CI passes.

To run manually:

```bash
DATABASE_URL="your-neon-connection-string" npx drizzle-kit push
```

### 4. Verify the Pipeline

1. Create a feature branch: `git checkout -b feat/my-feature`
2. Make changes and push
3. Open a PR targeting `main`
4. CI checks run automatically (lint, tests, build)
5. After merge to `main`:
   - Render auto-builds and deploys
   - Deploy workflow runs migrations on Neon
6. Verify the API is live:
   - `https://foundryrooms-api.onrender.com/api/v1/auth/health` → `{"status":"ok"}`

---

## Local Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Type check
npm run typecheck

# Build
npm run build

# Start dev server (requires DATABASE_URL)
DATABASE_URL="postgres://..." npm run start:dev
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/auth/health` | Health check |
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Login with email/password |
| POST | `/api/v1/auth/logout` | Logout (requires auth) |
| POST | `/api/v1/agents` | Create a new agent (requires auth) |
| GET | `/api/v1/agents/:id` | Get agent details (requires auth) |
| POST | `/api/v1/agents/:id/rotate-key` | Rotate API key (requires auth) |
| DELETE | `/api/v1/agents/:id` | Deactivate agent (requires auth) |

## Governor Agent (PR Review)

The Governor Agent reviews every PR automatically using OpenRouter's free LLM models.

### How it works
1. PR opened → `governor-review.yml` workflow triggers
2. Script sends PR diff + governor prompt to OpenRouter (`openrouter/free` model)
3. Review posted as PR comment
4. If review says "REJECTED", the check fails and blocks merge
5. `auto-merge.yml` waits for all checks + approval, then squash-merges

### Setup (free, $0 cost)
1. Go to [openrouter.ai](https://openrouter.ai) and sign up
2. Generate an API key
3. Add it as a GitHub repository secret: `LLM_API_KEY`
4. That's it — the workflow uses `openrouter/free` which auto-selects free models

### Cost
- **OpenRouter free models**: $0 (rate-limited, models rotate)
- **GitHub Actions minutes**: $0 for public repos (unlimited)
- **Total**: $0

### Limitations
- Free models are less capable than paid models (e.g. Claude Opus)
- Rate limits may cause occasional review failures
- Model quality varies as OpenRouter rotates available free models

### Upgrading later
To use a better model, update the `model` field in `scripts/governor-review.sh`:
- `openrouter/free` → free (current)
- `anthropic/claude-3.5-sonnet` → paid, better reasoning
- `openai/gpt-4o` → paid, alternative

## Security Notes

- **Never commit secrets** — `.env` files are gitignored
- **All secrets** live in GitHub Secrets and Render dashboard env vars
- **MCP server configs** (Render, Neon) are stored in `~/.codeium/windsurf/mcp_config.json` — outside the repo
- **Rotate keys** if they are ever exposed in chat, screenshots, or logs
