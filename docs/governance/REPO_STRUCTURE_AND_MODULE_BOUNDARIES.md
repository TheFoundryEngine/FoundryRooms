# FoundryRooms — Repo Structure and Module Boundaries

## Purpose

This document clarifies the expected repository layout before the final technology stack is selected.

It answers two questions:
1. Should the repository have clearly separated backend and frontend areas?
2. How should a modular monolith be represented in the repository?

The answer to both is **yes**: the repository should have clear frontend and backend application areas, while the backend remains a single modular monolith with strong internal bounded contexts.

---

## Current Position

The stack is **not locked yet**.

What is already decided:
- the system shape is a **modular monolith**
- the backend will use **DDD + hexagonal boundaries**
- bounded contexts and team ownership are explicit
- contracts, testing, and governance are first-class concerns

What is **not** yet decided:
- frontend framework
- backend framework/runtime
- database implementation
- background job technology
- deployment platform
- exact testing toolchain

This means the repo structure should be **technology-neutral where possible**, but still opinionated enough to preserve boundaries.

---

## Recommended Top-Level Layout

```text
/
├── .github/
│   ├── agents/
│   ├── instructions/
│   ├── workflows/
│   ├── CODEOWNERS
│   └── pull_request_template.md
├── AGENTS.md
├── docs/
│   ├── spec/
│   ├── governance/
│   └── adr/
│       ├── global/
│       └── features/
├── apps/
│   ├── frontend/        # frontend application area
│   ├── backend/         # backend modular monolith
│   └── worker/          # optional async processing surface
├── contracts/           # shared contracts, fixtures, mocks
│   ├── api/
│   ├── events/
│   ├── fixtures/
│   └── mocks/
├── tests/
│   ├── architecture/
│   ├── contract/
│   ├── integration/
│   └── e2e/
├── scripts/
└── tools/
```

---

## Why this structure is recommended

### 1. Clear frontend and backend separation
Even though the system is a modular monolith, the **frontend is not the monolith**.

The backend monolith is the server-side application with bounded contexts and domain rules.
The frontend is a separate application surface that consumes approved contracts.

That means the repository should have a clear place for:
- the frontend app
- the backend app entrypoint
- optionally a worker or async processing entrypoint

### 2. Contexts should not be hidden inside the backend app only
If bounded contexts are buried too deeply inside one framework folder, they are easier to couple accidentally.

Keeping contexts visible at the repo level makes ownership clearer and helps humans, agents, tests, and reviewers see structure directly.

### 3. Contracts need their own home
To reduce frontend/backend drift and team blocking, shared contracts, fixtures, and mocks should have an explicit place in the repo.

This is especially important for:
- API request/response schemas
- domain/integration event payloads
- frontend mock data
- test fixtures shared across teams

---

## Backend structure inside each module

Each module should follow the same internal pattern.

```text
modules/engagement/
├── domain/
├── application/
├── adapters/
└── contracts/
```

### `domain/`
Contains:
- entities
- value objects
- invariants
- domain services when truly needed
- domain events

Must not contain:
- framework code
- ORM annotations that leak infrastructure concerns
- HTTP-specific logic
- email/payment/storage implementations

### `application/`
Contains:
- commands
- queries
- use cases
- orchestration
- transaction boundaries where applicable

### `adapters/`
Contains:
- persistence adapters
- HTTP handlers/controllers/routes
- messaging adapters
- email/payment integrations
- job handlers

### `contracts/`
Contains:
- external request/response contracts owned by the module
- event schemas owned by the module
- mapper boundaries to prevent internal model leakage

---

## Frontend structure

The frontend should live in `apps/web/` and should be feature-oriented, not forced into backend hexagonal ceremony.

A reasonable draft layout is:

```text
apps/web/
├── src/
│   ├── app/
│   ├── features/
│   ├── components/
│   ├── contracts/
│   ├── lib/
│   └── styles/
```

### Frontend rules
- frontend features should align to backend bounded contexts where practical
- frontend code must consume approved contracts only
- frontend must not depend on backend internal models
- mock data in the frontend must come from agreed fixtures or generated contract-safe mocks

---

## How the three teams should work in this structure

### Team A — Community Core
Primary ownership:
- `modules/identity-access/`
- `modules/community-structure/`
- related contracts and tests

### Team B — Experience Layer
Primary ownership:
- `modules/engagement/`
- `modules/resources/`
- major parts of `apps/web/` for member-facing experience

### Team C — Operations & Monetization
Primary ownership:
- `modules/events/`
- `modules/commerce/`
- `modules/automation/`
- `modules/admin-reporting/`
- worker/webhook/job surfaces where applicable

Cross-team work must happen through contracts, not hidden direct dependencies.

---

## Should frontend and backend be in separate folders?

**Yes.**

Recommended:
- `apps/web/` for the frontend
- `apps/api/` for the backend entrypoint
- `modules/` for the backend business modules

This keeps:
- application surfaces clear
- context ownership explicit
- testing cleaner
- CI easier to target later

It also leaves room to change the frontend stack or backend framework later without changing the business-module structure.

---

## Why not just use `/frontend` and `/backend`?

You can, but `apps/web` and `apps/api` age better if later you add:
- admin console
- worker process
- public marketing site
- docs site
- internal tooling

The `apps/` convention gives you more room without changing the mental model.

---

## Current recommendation

Until the technology stack is finalized, the repository should plan for:
- `apps/web`
- `apps/api`
- optional `apps/worker`
- `modules/*` for backend bounded contexts
- `contracts/*` for shared contracts, fixtures, and mocks
- `tests/*` for architecture, contract, integration, and e2e suites

This is the cleanest structure for a governed modular monolith with a separate frontend application.
