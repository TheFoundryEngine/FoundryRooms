# FoundryRooms — ADR Index

This index tracks all Architecture Decision Records across global and team scopes.
It prevents numbering clashes and provides a single view of all architectural decisions.

**Last updated:** 2026-08-05

---

## Linear ADR Tracking

All ADRs are tracked in Linear under the **TheFoundry** team (issue key: `THE`).
Each delivery team has its own ADR project. Each feature ADR becomes a **parent issue**
in its team's project, with **sub-issues** for the actual implementation work that
anyone on the team can pick up.

| Team | Linear Project | URL |
|------|---------------|-----|
| Team A — Community Core | Team A — Community Core ADRs | https://linear.app/thefoundryengine/project/team-a-community-core-adrs-3fae2d82bab2 |
| Team B — Experience | Team B — Experience ADRs | https://linear.app/thefoundryengine/project/team-b-experience-adrs-bbe1f8999a31 |
| Team C — Ops & Monetization | Team C — Ops & Monetization ADRs | https://linear.app/thefoundryengine/project/team-c-ops-and-monetization-adrs-8d88b427cbd3 |
| Team D — Design & UX | Team D — Design & UX ADRs | https://linear.app/thefoundryengine/project/team-d-design-and-ux-adrs-5006b13b87ec |
| Governor | Governor — Architecture & Governance ADRs | https://linear.app/thefoundryengine/project/governor-architecture-and-governance-adrs-57ff65c03c05 |

### Linear labels

| Label | Purpose |
|-------|---------|
| `adr` | Issue is an ADR parent or ADR-related work |
| `team-a` | Team A — Community Core |
| `team-b` | Team B — Experience |
| `team-c` | Team C — Ops & Monetization |
| `team-d` | Team D — Design & UX |
| `governor` | Governor Agent — global ADRs and governance |
| `wave-0` | Wave 0 — Foundation |
| `wave-1` | Wave 1 — Core viability |
| `wave-2` | Wave 2 — Monetization and operational readiness |
| `wave-3` | Wave 3 — Experience hardening |

---

## Global ADRs

Global ADRs are owned by the Governor Agent and architecture leadership.
They define system-wide architectural law. All teams consume them.

Location: `docs/adr/global/`

| ADR | Title | Status | Date | File |
|-----|-------|--------|------|------|
| ADR-001 | System Shape — Modular Monolith with DDD and Hexagonal Boundaries | Accepted | 2026-04-02 | `ADR-001-system-shape.md` |
| ADR-002 | Initial Bounded Context Map and Team Ownership | Accepted | 2026-04-02 | `ADR-002-bounded-context-map.md` |
| ADR-003 | Relational Data Architecture and Tenancy Model | Accepted | 2026-04-02 | `ADR-003-data-and-tenancy-model.md` |
| ADR-004 | Integration, Contracts, Events, and Parallel Delivery Model | Accepted | 2026-04-02 | `ADR-004-integration-and-contract-model.md` |
| ADR-005 | Identity, Roles, Access Groups, and Entitlements | Accepted | 2026-04-02 | `ADR-005-identity-and-authorization-model.md` |
| ADR-006 | Delivery Governance, Testing, and Anti-Drift Enforcement | Accepted | 2026-04-02 | `ADR-006-delivery-governance-and-testing.md` |
| ADR-007 | Frontend Application Architecture and Boundary Model | Accepted | 2026-04-02 | `ADR-007-frontend-application-architecture.md` |
| ADR-008 | Technology Stack and Hosting Model | Accepted | 2026-04-02 | `ADR-008-technology-stack-and-hosting-model.md` |
| ADR-009 | Deployment Model and Infrastructure Baseline | Accepted | 2026-04-02 | `ADR-009-deployment-model-and-infrastructure-baseline.md` |
| ADR-010 | Database Access Strategy and Model Synchronization | Accepted | 2026-04-02 | `ADR-010-database-access-strategy-and-model-synchronization.md` |
| ADR-011 | Background Jobs and Workflow Execution | Accepted | 2026-04-02 | `ADR-011-background-jobs-and-workflow-execution.md` |
| ADR-012 | Interaction Model and Delivery Semantics | Accepted | 2026-04-02 | `ADR-012-interaction-model-and-delivery-semantics.md` |

### Reserved (not yet created)

| ADR | Title | Status |
|-----|-------|--------|
| ADR-013 | Video rooms and conferencing subsystem boundary | Not started |
| ADR-014 | AI-assisted product capabilities and provider strategy | Not started |
| ADR-015 | API versioning and contract publication workflow | Not started |

---

## Team Feature ADRs

Feature ADRs are owned end-to-end by exactly one team.
Naming convention: `ADR-F-{team}-{number}-{slug}.md`

### Team A — Community Core

Location: `docs/adr/features/team-a-community-core/`

| ADR | Title | Status | Date | Linear | File |
|-----|-------|--------|------|--------|------|
| ADR-F-A-001 | Auth and Session Foundation | Proposed | 2026-08-05 | [THE-5](https://linear.app/thefoundryengine/issue/THE-5/adr-f-a-001-auth-and-session-foundation) | `ADR-F-A-001-auth-and-session-foundation.md` |

### Team B — Experience

Location: `docs/adr/features/team-b-experience/`

| ADR | Title | Status | Date | Linear | File |
|-----|-------|--------|------|--------|------|
| ADR-F-B-001 | Frontend Shell and Route Scaffolding | Proposed | 2026-08-05 | [THE-6](https://linear.app/thefoundryengine/issue/THE-6/adr-f-b-001-frontend-shell-and-route-scaffolding) | `ADR-F-B-001-frontend-shell-and-route-scaffolding.md` |

### Team C — Operations & Monetization

Location: `docs/adr/features/team-c-ops-monetization/`

| ADR | Title | Status | Date | Linear | File |
|-----|-------|--------|------|--------|------|
| ADR-F-C-001 | Worker and Job Runtime Baseline | Proposed | 2026-08-05 | [THE-7](https://linear.app/thefoundryengine/issue/THE-7/adr-f-c-001-worker-and-job-runtime-baseline) | `ADR-F-C-001-worker-and-job-runtime-baseline.md` |

### Team D — Design & UX

Location: `docs/adr/features/team-d-design-ux/`

| ADR | Title | Status | Date | Linear | File |
|-----|-------|--------|------|--------|------|
| ADR-F-D-001 | Design Token and Component Baseline | Proposed | 2026-08-05 | [THE-8](https://linear.app/thefoundryengine/issue/THE-8/adr-f-d-001-design-token-and-component-baseline) | `ADR-F-D-001-design-token-and-component-baseline.md` |

---

## Numbering Rules

1. **Global ADRs** use sequential numbers: `ADR-001`, `ADR-002`, ... `ADR-015`, etc.
   - Next available: **ADR-013**
   - Reserved numbers (013–015) must not be reused or skipped

2. **Team A feature ADRs** use: `ADR-F-A-001`, `ADR-F-A-002`, ...
   - Next available: **ADR-F-A-002**

3. **Team B feature ADRs** use: `ADR-F-B-001`, `ADR-F-B-002`, ...
   - Next available: **ADR-F-B-002**

4. **Team C feature ADRs** use: `ADR-F-C-001`, `ADR-F-C-002`, ...
   - Next available: **ADR-F-C-002**

5. **Team D feature ADRs** use: `ADR-F-D-001`, `ADR-F-D-002`, ...
   - Next available: **ADR-F-D-002**

6. **No number is ever reused**, even if an ADR is superseded or withdrawn.
   - Superseded ADRs keep their number and get `Status: Superseded by ADR-XXX`.

7. **When creating a new ADR:**
   - Check this index for the next available number
   - Create the file using the naming convention
   - Add a row to this index in the same PR
   - Reference the ADR number in the Linear issue description

---

## Workflow: ADR → Linear Parent Issue → Sub-Issues → Branch → PR → Merge

```
1. Team identifies a task or issue requiring an architectural decision
2. Team creates a feature ADR in their team folder
   - Copy docs/adr/features/_TEMPLATE.md
   - Use next available number from this index
   - Update this index in the same PR
3. ADR is reviewed by the team's human developer
4. Governor Agent reviews the ADR if it touches contracts, schema, or cross-context rules
5. ADR is accepted → create a parent issue in the team's Linear ADR project
   - Title: "ADR-F-{TEAM}-{NNN}: {ADR title}"
   - Description: link to ADR file + summary of decision
   - Labels: adr, team-{a/b/c/d}, wave-{N}
   - This parent issue represents the ADR itself
6. Break the ADR into sub-issues under the parent issue
   - Each sub-issue is a pick-up-able work item
   - Anyone on the team can claim a sub-issue
   - Sub-issues inherit the ADR's labels
7. For each sub-issue, create a feature branch:
   feat/<dev-name>/<linear-issue>-<description>
8. Development + tests
9. PR opened targeting main
   - PR references Linear sub-issue (e.g., "Closes THE-12")
   - Governor Agent reviews PR for ADR compliance
   - CI checks run (lint, tests, build, typecheck, arch:test)
10. Auto-merge: all checks pass + approval received → squash merge into main
11. Linear sub-issue auto-closes via PR reference
12. When all sub-issues under an ADR parent issue are closed,
    the parent issue (and ADR) is marked Done
```
