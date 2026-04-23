# Proposal: Wave 0 Backend Scaffold & Team Assignment

**From:** Matt (EckmanTechLLC)
**Date:** 2026-04-02
**For discussion at:** Next weekly meeting

---

## 1. Repo Status

Bryan laid down an excellent governance foundation today. The repo has:
- 12 global ADRs (system shape through interaction model)
- Full governance model, delivery plan, capability map
- Agent profiles, CODEOWNERS template, CI scaffold, PR template
- GitHub Projects plan with wave/epic/issue automation

What it doesn't have yet: **any code.** No package.json, no framework init, no apps/ or modules/ directories. CI jobs are all placeholders. Wave 0 hasn't started.

Every team is blocked until the application skeleton exists.

---

## 2. Proposal: I Take Wave 0 Backend Infrastructure

I'll deliver the backend scaffold that unblocks all three teams.

### What I'd build (one PR into main):

**Application skeleton**
- NestJS project init in `apps/api/`
- Worker process placeholder in `apps/worker/`
- Nuxt project init in `apps/web/` (bare shell only)
- Monorepo tooling (pnpm workspaces or similar)

**Database & infrastructure wiring**
- PostgreSQL connection via Drizzle
- Redis connection for BullMQ
- First empty migration to prove the pipeline works
- Docker Compose for local dev (postgres, redis, api, worker, web)

**Module template**
- One bounded context skeleton with full hexagonal structure:
  - `domain/`, `application/`, `adapters/inbound/`, `adapters/outbound/persistence/`, `contracts/`, `tests/`
- This becomes the copy-paste template for all teams

**CI pipeline (real, not placeholders)**
- lint, typecheck, unit-tests, integration-tests, contract-tests, architecture-tests, build
- Actual commands replacing the current echo stubs

**Test infrastructure**
- Vitest or Jest configured for unit + integration
- Architecture test scaffold (import boundary checks)
- Contract test scaffold

### What I would NOT touch:
- Any domain logic, business rules, or feature code
- ADRs (those remain Governor-owned)
- Frontend beyond a bare Nuxt init
- Any bounded context internals

### Exit criteria (matches Wave 0 definition):
- Teams can create feature branches against a common structure
- `npm run dev` starts api + web + worker locally
- `docker compose up` runs the full stack
- CI passes on a clean PR
- Module template exists for teams to copy

---

## 3. Team Assignment Suggestion

Based on the capability map and our backgrounds:

| Role | Person | Rationale |
|------|--------|-----------|
| **Governor / Architect** | Bryan | Already built the governance foundation, natural fit |
| **Team A — Community Core** | Nick | Identity, access, community hierarchy — core platform |
| **Team C — Ops & Monetization** | Matt | Infrastructure, worker/jobs, commerce, deployment, packaging |
| **Team B — Experience** | ? | Frontend, discussions, feeds, resources — needs discussion |

Team B is the open question. It's the most frontend-heavy role. Options:
- One of us doubles up
- A fourth contributor later
- We split Team B work across Nick and Matt after their primary contexts are scaffolded

---

## 4. Items for Discussion

### Gaps I found in the repo:

1. **ADR-007 is missing.** Frontend architecture boundary model is referenced by ADR-012 and the delivery plan but the file doesn't exist. Needs to be created before Team B can start.

2. **Notifications ownership is unassigned.** CODEOWNERS puts `notifications/` under governor/architecture, not any team. Someone needs to own it — probably Team C since it involves background jobs and email delivery.

3. **Governor Agent isn't real yet.** The agent profiles are GitHub Copilot instruction files, not an actual bot. PR review is manual for now. Is that OK for Wave 1, or do we want automation sooner?

4. **GitHub Projects not created.** The plan exists in docs but the actual boards, labels, and automation haven't been set up on GitHub. Should that happen before or alongside Wave 0?

5. **Team B is undefined.** Three people, three teams, but one of us has to cover the frontend-heavy Experience layer. How do we handle this?

### Process questions:

6. **Branch naming for Wave 0** — The governance doc says short-lived branches like `feat/wave-0/backend-scaffold`. That work for everyone?

7. **How are we using agents day-to-day?** Each of us has a paired agent profile. Are we literally running Claude/Copilot with those profiles loaded, or is that aspirational?

8. **Meeting cadence** — Weekly is fine for now but once Wave 1 starts with parallel work, do we need async coordination too? (Slack, Discord, issues?)

---

## 5. Suggested Immediate Next Steps

| Step | Owner | When |
|------|-------|------|
| Review this proposal | All | Before meeting |
| Decide team assignments | All | At meeting |
| Create ADR-007 (frontend boundaries) | Bryan/Governor | Before Wave 1 |
| Set up GitHub org teams + labels | Bryan | Before Wave 0 PR |
| Wave 0 backend scaffold PR | Matt | Week after meeting |
| Create GitHub Projects boards | TBD | Alongside Wave 0 |
