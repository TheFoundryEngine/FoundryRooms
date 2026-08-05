# FoundryRooms

A community software platform for operating structured online communities.

## Overview

FoundryRooms is a **community platform** for creators, educators, and membership businesses. It provides member identity and access control, spaces and channels, discussions, events, resources, memberships, notifications, and basic automation.

**This is not** a multiplayer coding room or developer sandbox - those features are planned for future phases.

## Repository Structure

```
FoundryRooms/
├── apps/
│   ├── frontend/         # Frontend application (feature-based)
│   ├── backend/          # Backend modular monolith (DDD + hexagonal)
│   └── worker/           # Async jobs and webhooks
├── contracts/            # Shared API contracts and fixtures
├── tests/                # Architecture, contract, integration, e2e tests
├── docs/                 # Specs, governance, and ADRs
└── scripts/              # Development and deployment scripts
```

Backend bounded contexts are under `apps/backend/src/` with full hexagonal architecture (domain/application/adapters/contracts/tests). Frontend uses feature-based structure with components, layouts, and services.

## Architecture

FoundryRooms is built as a **modular monolith** with:
- **Domain-Driven Design** for bounded contexts
- **Hexagonal architecture** separating domain from infrastructure
- **Contract-first integration** for cross-context communication
- **Governed delivery** with three parallel teams

### Bounded Contexts

- **Identity & Access** - authentication, roles, permissions
- **Community Structure** - communities, spaces, channels
- **Engagement** - posts, threads, reactions, feeds
- **Resources** - documents and content management
- **Events** - event creation, RSVP, attendance
- **Commerce** - memberships, payments, entitlements
- **Notifications** - in-app and email notifications
- **Automation** - workflow rules and background jobs
- **Admin & Reporting** - moderation and analytics

## Team Structure

- **Team A (Community Core)** - Identity & Access + Community Structure
- **Team B (Experience Layer)** - Engagement + Resources + member-facing contracts
- **Team C (Operations & Monetization)** - Events + Commerce + Automation + Admin

## CI/CD Pipeline

The repository uses GitHub Actions for continuous integration and deployment.

### Flow

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
              └── Render deploy hook (optional)
```

### Hosting

| Service | Purpose | Plan |
|---|---|---|
| **Render** | NestJS API server (Docker) | Free (spins down after 15 min idle) |
| **Neon** | PostgreSQL database | Free (500MB, always-on) |

- **API URL**: https://foundryrooms-api.onrender.com
- **Health check**: `/api/v1/auth/health`

### Required GitHub Secrets

| Secret | Purpose |
|---|---|
| `DATABASE_URL` | Neon connection string (migrations + integration tests) |
| `LLM_API_KEY` | OpenRouter API key for Governor Agent PR review (free tier) |
| `LINEAR_API_KEY` | Linear API key for rejection notifications to Linear issues |
| `RENDER_DEPLOY_HOOK_URL` | Optional — Render auto-deploys without it |

> **⚠️ This is a public repo.** Never commit secrets, API keys, or connection strings.
> All secrets are stored in GitHub Settings → Secrets → Actions and Render dashboard env vars.

See [Infrastructure Setup Guide](docs/INFRASTRUCTURE_SETUP.md) for full setup details.

## Governor Agent

The Governor Agent is an automated PR reviewer powered by OpenRouter's free LLM models. It enforces ADR compliance, bounded context rules, and contract discipline on every PR targeting `main`.

### How it works

1. A PR is opened or updated targeting `main`
2. The Governor Agent calls OpenRouter free models (fallback chain: Gemma, Nemotron, GPT-OSS, Cohere) to review the diff
3. The review is posted as a GitHub PR review with one of three verdicts:
   - **APPROVED** — safe to merge, no blocking issues (green `governor-approved` label)
   - **CHANGES REQUESTED** — lists what must change before merge (red `governor-rejected` label)
   - **REJECTED** — explains rule violations (red `governor-rejected` label)
4. If rejected, the linked Linear issue gets a `blocked` label and a comment with the rejection reason
5. Auto-merge only fires when all CI checks pass, the Governor approves, and a human approves

### PR labels

| Label | Color | Meaning |
|---|---|---|
| `governor-approved` | Green | Governor Agent approved the PR |
| `governor-rejected` | Red | Governor Agent rejected the PR — see review comment |
| `governor-review-failed` | Yellow | All free models exhausted — manual review required |

### Free model notes

OpenRouter's free model pool rotates availability. The script tries 6 models in order and uses the first that returns a valid verdict. If all are rate-limited, the PR gets a `governor-review-failed` label and a human review is needed. To check currently available free models:
```bash
curl -s https://openrouter.ai/api/v1/models | jq -r '.data[] | select(.id | test(":free$")) | .id'
```

See [Infrastructure Setup Guide](docs/INFRASTRUCTURE_SETUP.md) for setup details.

## Development Workflow (Linear + ADRs)

Linear is the source of truth for product management and issue tracking.

```
Dev effort identified
    ├──► ADR created (docs/adr/features/ or docs/adr/global/)
    ├──► Linear issue created under the appropriate project, assigned to a developer
    ├──► Feature branch: feat/<dev-name>/<linear-issue>-<description>
    ├──► Development + tests (unit, integration, contract, architecture)
    ├──► PR opened targeting main (references Linear issue, e.g. "Closes FRA-12")
    │      ├── Governor Agent reviews for ADR compliance
    │      └── CI checks run (lint, tests, build, typecheck)
    └──► Governor Agent merges PR into main
           ├── Render auto-deploys
           ├── Deploy workflow runs Neon migrations (after CI passes)
           └── Linear issue auto-closes via PR reference
```

**Branch naming**: `feat/<dev-name>/<linear-issue>-<short-description>`
- Example: `feat/nick/FRA-12-invitation-flow`

See [Development Governance](docs/governance/DEVELOPMENT_GOVERNANCE.md) for full rules.

## Documentation

- [Product & Architecture Spec](docs/spec/HIGH_LEVEL_SPEC.md)
- [Development Governance](docs/governance/DEVELOPMENT_GOVERNANCE.md)
- [ADR Index](docs/adr/ADR_INDEX.md) — all ADRs with numbering rules
- [Agent Operating Rules](AGENTS.md)
- [Infrastructure & CI/CD Setup](docs/INFRASTRUCTURE_SETUP.md)

## Getting Started

1. Clone the repository
2. Set up your development environment
3. Review the bounded context ownership in CODEOWNERS
4. Read the development governance model
5. Check ADRs for architectural constraints

## Contributing

All contributions must follow:
- Bounded context ownership rules
- Contract-first development
- Required testing (unit, integration, contract, architecture)
- ADR compliance for architectural changes

See [Development Governance](docs/governance/DEVELOPMENT_GOVERNANCE.md) for detailed rules.

## License

[To be determined]
