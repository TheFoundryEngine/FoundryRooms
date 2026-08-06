# FoundryRooms

A community software platform for operating structured online communities.

## Overview

FoundryRooms is a **community platform** for creators, educators, and membership businesses. It provides member identity and access control, spaces and channels, discussions, events, resources, memberships, notifications, and basic automation.

**This is not** a multiplayer coding room or developer sandbox - those features are planned for future phases.

## Repository Structure

```
FoundryRooms/
├── .github/
│   ├── agents/            # Governor + team agent profiles
│   ├── workflows/         # CI, governor review, auto-merge
│   └── CODEOWNERS         # Advisory reviewer suggestions
├── .husky/                # Git hooks (pre-commit, pre-push)
├── src/                   # Backend app entrypoint (NestJS bootstrap)
├── modules/               # Backend bounded contexts (modular monolith)
│   ├── identity-access/   #   Domain → Application → Adapters → Contracts
│   ├── community-structure/
│   ├── engagement/
│   ├── resources/
│   ├── events/
│   ├── commerce/
│   ├── automation/
│   ├── admin-reporting/
│   └── .../
├── contracts/             # Shared API contracts, events, fixtures, mocks
├── design/                # Design system, tokens, UX specs (Team D)
├── tests/                 # Architecture, contract, integration, e2e tests
├── docs/                  # Specs, governance, and ADRs
└── scripts/               # Dev and deployment scripts
```

Each bounded context in `modules/` follows hexagonal architecture:
- `domain/` — entities, value objects, domain events (framework-independent)
- `application/` — use cases, ports, orchestration
- `adapters/` — inbound (controllers), outbound (persistence, external APIs)
- `contracts/` — external request/response shapes and event schemas

## Architecture

FoundryRooms is built as a **modular monolith** with:
- **Domain-Driven Design** for bounded contexts
- **Hexagonal architecture** separating domain from infrastructure
- **Contract-first integration** for cross-context communication
- **Governed delivery** with four delivery teams

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

### Boundary enforcement

Architectural boundaries are enforced **deterministically**, not just by review:

- **Architecture tests** (dependency-cruiser) — enforce cross-context isolation, hexagonal layering, domain framework independence, and contract purity. Run via `npm run arch:test`. Config in `.dependency-cruiser.js`.
- **Pre-commit hook** — eslint + typecheck on staged files (runs automatically on every `git commit`)
- **Pre-push hook** — unit tests + architecture tests + contract tests + build (runs automatically on every `git push`)
- **CI pipeline** — full suite including integration tests (Postgres) and architecture tests
- **Governor Agent** — LLM-based PR review for ADR compliance and boundary drift

See [Development Governance](docs/governance/DEVELOPMENT_GOVERNANCE.md) §9.1 for the full rule set.

## Team Structure

FoundryRooms uses a **flow model** — any developer can work on any bounded context. Architectural safety comes from the Governor Agent, CI checks, and architecture tests, not team silos.

- **Bryan McKeon** (@TheFoundryEngine) — Governor / Architect
- **Nick Flach** (@NickFlach) — Developer
- **Matt Eckman** (@EckmanTechLLC) — Developer
- **Neel** (@TBD-Neel) — Developer (Design & UX focus)

Bounded contexts are **code boundaries** (enforced by architecture tests), not **team boundaries**. Any developer can pick up any Linear issue.

### Delivery Team Focus Areas

While any developer can work on any context, each team has a primary focus for ownership and ADR accountability:

- **Team A (Community Core)** - Identity & Access + Community Structure
- **Team B (Experience Layer)** - Engagement + Resources + frontend implementation
- **Team C (Operations & Monetization)** - Events + Commerce + Automation + Admin
- **Team D (Design & UX)** - Design system + UX flows + design tokens + accessibility; hands off design contracts to Team B for frontend implementation

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

## Versioning & Releases

FoundryRooms uses **semantic versioning** with automated releases driven by conventional commits.

### Current phase: 0.x (pre-1.0)

The project is in active development. Version numbers follow `0.minor.patch`:
- `feat:` commits → **minor** bump (e.g. `0.1.0` → `0.2.0`)
- `fix:` commits → **patch** bump (e.g. `0.1.0` → `0.1.1`)
- `BREAKING CHANGE` → **minor** bump (not major — standard for 0.x)
- `docs:`, `test:`, `chore:`, `ci:` → no release

Once the API stabilizes, the project will move to `1.0.0` where breaking changes require major version bumps.

### How releases work

Releases are **automatic** — no manual tagging required:

1. A PR is merged to `main` (squash merge, conventional commit title)
2. The release workflow analyzes commits since the last tag
3. If there are releasable changes, it automatically:
   - Bumps the version in `package.json`
   - Creates a git tag (e.g. `v0.1.0`)
   - Updates `CHANGELOG.md`
   - Creates a GitHub Release with auto-generated notes

### Conventional commit format

Commit messages (and PR titles for squash merges) must use conventional prefixes:

| Prefix | Triggers release? | Version bump |
|---|---|---|
| `feat:` | Yes | minor |
| `fix:` | Yes | patch |
| `BREAKING CHANGE:` | Yes | minor (0.x) / major (1.x) |
| `docs:` | No | — |
| `test:` | No | — |
| `chore:` | No | — |
| `ci:` | No | — |
| `refactor:` | No | — |

See [Development Governance](docs/governance/DEVELOPMENT_GOVERNANCE.md) for full rules.

## Governor Agent

The Governor Agent is an automated PR reviewer powered by OpenRouter's free LLM models. It enforces ADR compliance, bounded context rules, and contract discipline on every PR targeting `main`.

### How it works

1. A PR is opened or updated targeting `main`
2. The Governor Agent calls OpenRouter free models (fallback chain) to review the diff
3. The review is posted as a GitHub PR review with one of three verdicts:
   - **APPROVED** — safe to merge, no blocking issues (`governor-approved` label)
   - **CHANGES REQUESTED** — advisory concerns (cohesion, design alignment, non-blocking suggestions). Does **not** block merge. The team is notified via Linear. (`governor-changes-requested` label)
   - **REJECTED** — hard rule violation (boundary breach, contract drift, missing tests). **Blocks merge.** (`governor-rejected` label)
4. On REJECTED or CHANGES REQUESTED, the linked Linear issue gets a comment. REJECTED adds a `blocked` label; CHANGES REQUESTED adds a `governor-review` label.
5. Auto-merge fires when all CI checks pass (including governor-review, which fails on REJECTED only) and a human approves

### PR labels

| Label | Color | Meaning |
|---|---|---|
| `governor-approved` | Green | Governor Agent approved the PR |
| `governor-changes-requested` | Yellow | Advisory concerns — PR can still merge, team notified via Linear |
| `governor-rejected` | Red | Hard rule violation — PR is blocked from merge |
| `governor-review-failed` | Gray | All free models exhausted — manual review required |

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
    ├──► Linear parent issue created under the appropriate project
    ├──► Linear sub-issues created and linked to parent ADR issue
    ├──► Feature branch: feat/adr-<adr-id>-<description> (one branch per ADR)
    ├──► Development + tests (unit, integration, contract, architecture)
    ├──► PR opened targeting main (references Linear parent issue, e.g. "Closes THE-5")
    │      ├── Governor Agent reviews for ADR compliance
    │      └── CI checks run (lint, tests, build, typecheck)
    └──► Governor Agent merges PR into main
           ├── Render auto-deploys
           ├── Deploy workflow runs Neon migrations (after CI passes)
           └── Linear sub-issues auto-close via PR reference
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
2. Run `npm install` — this also installs git hooks (husky) automatically
3. Review the bounded context structure in `modules/` and the architecture rules in `.dependency-cruiser.js`
4. Read the [development governance model](docs/governance/DEVELOPMENT_GOVERNANCE.md)
5. Check [ADRs](docs/adr/ADR_INDEX.md) for architectural constraints

### Local checks (run automatically by git hooks)

| When | What runs | Command |
|---|---|---|
| `git commit` | eslint on staged files | `npx lint-staged` |
| `git push` | unit tests + architecture tests + contract tests + build | `.husky/pre-push` |
| Manual | architecture boundary tests only | `npm run arch:test` |
| Manual | all unit tests | `npm test` |
| Manual | lint the whole repo | `npm run lint` |
| Manual | typecheck the whole repo | `npm run typecheck` |

Do not bypass hooks with `--no-verify` — fix the issue instead. See [governance §12.1](docs/governance/DEVELOPMENT_GOVERNANCE.md) for details.

## Contributing

All contributions must follow:
- Bounded context boundary rules (enforced by architecture tests)
- Contract-first development
- Required testing (unit, integration, contract, architecture)
- ADR compliance for architectural changes
- Pre-commit and pre-push hooks (do not bypass with `--no-verify`)

See [Development Governance](docs/governance/DEVELOPMENT_GOVERNANCE.md) for detailed rules.

## License

[To be determined]
