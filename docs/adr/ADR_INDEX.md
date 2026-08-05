# FoundryRooms — ADR Index

This index tracks all Architecture Decision Records across global and team scopes.
It prevents numbering clashes and provides a single view of all architectural decisions.

**Last updated:** 2026-08-05

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

| ADR | Title | Status | Date | File |
|-----|-------|--------|------|------|
| _(none yet)_ | | | | |

### Team B — Experience

Location: `docs/adr/features/team-b-experience/`

| ADR | Title | Status | Date | File |
|-----|-------|--------|------|------|
| _(none yet)_ | | | | |

### Team C — Operations & Monetization

Location: `docs/adr/features/team-c-ops-monetization/`

| ADR | Title | Status | Date | File |
|-----|-------|--------|------|------|
| _(none yet)_ | | | | |

### Team D — Design & UX

Location: `docs/adr/features/team-d-design-ux/`

| ADR | Title | Status | Date | File |
|-----|-------|--------|------|------|
| _(none yet)_ | | | | |

---

## Numbering Rules

1. **Global ADRs** use sequential numbers: `ADR-001`, `ADR-002`, ... `ADR-015`, etc.
   - Next available: **ADR-013**
   - Reserved numbers (013–015) must not be reused or skipped

2. **Team A feature ADRs** use: `ADR-F-A-001`, `ADR-F-A-002`, ...
   - Next available: **ADR-F-A-001**

3. **Team B feature ADRs** use: `ADR-F-B-001`, `ADR-F-B-002`, ...
   - Next available: **ADR-F-B-001**

4. **Team C feature ADRs** use: `ADR-F-C-001`, `ADR-F-C-002`, ...
   - Next available: **ADR-F-C-001**

5. **Team D feature ADRs** use: `ADR-F-D-001`, `ADR-F-D-002`, ...
   - Next available: **ADR-F-D-001**

6. **No number is ever reused**, even if an ADR is superseded or withdrawn.
   - Superseded ADRs keep their number and get `Status: Superseded by ADR-XXX`.

7. **When creating a new ADR:**
   - Check this index for the next available number
   - Create the file using the naming convention
   - Add a row to this index in the same PR
   - Reference the ADR number in the Linear issue description

---

## Workflow: ADR → Linear → Issue → Branch → PR → Merge

```
1. Team identifies a dev effort requiring an architectural decision
2. Team creates a feature ADR in their team folder
   - Uses next available number from this index
   - Updates this index in the same PR
3. ADR is reviewed by the team's human developer
4. Governor Agent reviews the ADR if it touches contracts, schema, or cross-context rules
5. ADR is accepted → Linear project created (or issue added to existing project)
   - ADR number referenced in Linear issue description
   - Issue assigned to a developer
   - Issue tagged with team label
6. Feature branch created: feat/<dev-name>/<linear-issue>-<description>
7. Development + tests
8. PR opened targeting main
   - PR references Linear issue (e.g., "Closes FRA-12")
   - Governor Agent reviews PR for ADR compliance
   - CI checks run (lint, tests, build, typecheck)
9. Auto-merge: all checks pass + approval received → squash merge into main
10. Linear issue auto-closes via PR reference
```
