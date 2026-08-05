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
| `ANTHROPIC_API_KEY` | Governor Agent PR review |
| `RENDER_DEPLOY_HOOK_URL` | Optional — Render auto-deploys without it |

> **⚠️ This is a public repo.** Never commit secrets, API keys, or connection strings.
> All secrets are stored in GitHub Settings → Secrets → Actions and Render dashboard env vars.

See [Infrastructure Setup Guide](docs/INFRASTRUCTURE_SETUP.md) for full setup details.

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
