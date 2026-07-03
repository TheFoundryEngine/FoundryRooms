# FoundryRooms — Infrastructure Setup Guide

This guide covers the one-time setup needed to enable the fully automated CI/CD pipeline.

## Architecture

```
Dev pushes → PR → CI checks (lint, test, build) → merge to main → Render deploys → live in browser
```

### Hosting

| Service | Purpose | Free Tier |
|---|---|---|
| **Render** | NestJS API server (Docker) | Free plan (spins down after 15 min idle) |
| **Neon** | PostgreSQL database | 500MB, always-on, no expiry |

---

## Step 1: Create a Neon database

1. Go to [neon.tech](https://neon.tech) and sign up (free, no credit card)
2. Create a new project — call it `foundryrooms`
3. Copy the connection string (looks like `postgres://user:pass@ep-xxx.neon.tech/foundryrooms?sslmode=require`)
4. Save this — you'll need it for both Render and GitHub

## Step 2: Create a Render web service

1. Go to [render.com](https://render.com) and sign up (free)
2. New → Web Service → connect your GitHub repo `TheFoundryEngine/FoundryRooms`
3. Settings:
   - **Name**: `foundryrooms-api`
   - **Runtime**: Docker
   - **Dockerfile path**: `./Dockerfile`
   - **Plan**: Free
4. Environment variables:
   - `DATABASE_URL` = your Neon connection string
   - `NODE_ENV` = `production`
   - `PORT` = `3000`
   - `CORS_ORIGIN` = `*` (or your frontend URL when ready)
5. Create the service — Render will build and deploy

## Step 3: Get Render deploy hook URL

1. In Render: your service → Settings → Deploy Hook
2. Create a deploy hook and copy the URL
3. This URL triggers a redeploy when called via POST

## Step 4: Add GitHub repository secrets

Go to your GitHub repo → Settings → Secrets and variables → Actions → New repository secret:

| Secret name | Value |
|---|---|
| `RENDER_DEPLOY_HOOK_URL` | Your Render deploy hook URL |
| `ANTHROPIC_API_KEY` | Your Anthropic API key (for Governor Agent review) |

## Step 5: Run database migrations

After the first deploy, run the Drizzle migrations against your Neon database:

```bash
DATABASE_URL="your-neon-connection-string" npx drizzle-kit push
```

## Step 6: Verify the pipeline

1. Create a feature branch: `git checkout -b feat/test-pipeline`
2. Make a small change and push
3. Open a PR targeting `main`
4. Watch CI checks run:
   - `lint` — eslint (if configured)
   - `unit-tests` — vitest (433 tests)
   - `integration-tests` — vitest with PostgreSQL service
   - `contract-tests` — contract validation
   - `architecture-tests` — boundary checks (placeholder)
   - `build` — tsc compilation + typecheck
5. After merge to `main`, the Deploy workflow triggers Render
6. Visit your Render URL to see the API live:
   - `https://foundryrooms-api.onrender.com/api/v1/auth/health` → `{"status":"ok"}`

---

## Local development

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
