# FoundryRooms — Initial Delivery Plan, Ownership & Separation Model v0.1

## 1. Purpose

This document defines how FoundryRooms work is separated across the Governor Agent and the three human-developer teams during the foundation and early feature stages.

It answers:
- who owns what
- what the Governor Agent sets up on `main`
- what each team can begin in parallel
- where contracts must be agreed first
- how to avoid blocking between teams
- how ADRs are introduced in a logical sequence

This document is an execution and delivery map. It should be read alongside:
- `docs/spec/HIGH_LEVEL_SPEC.md`
- `docs/governance/DEVELOPMENT_GOVERNANCE.md`
- `docs/governance/REPO_STRUCTURE_AND_MODULE_BOUNDARIES.md`
- `docs/adr/global/*`

---

## 2. Delivery Model Summary

FoundryRooms starts with:
- **1 Governor Agent** controlling architectural integrity on `main`
- **3 Human Developers**
- **3 Feature Agents**, one paired with each human developer

The Governor Agent is responsible for creating and protecting the shared foundation.

The three delivery teams are responsible for building within bounded contexts, using agreed contracts, fixtures, and ADR rules so that work can proceed in parallel without uncontrolled coupling.

---

## 3. Core Principle

The project must be organized so that no team waits for another team’s implementation when an approved contract, fixture, and acceptance boundary already exist.

This means:
- architecture and contracts are agreed before heavy implementation starts
- teams build against contracts, not assumptions
- mocks and fixtures stand in for unavailable downstream work
- the Governor Agent rejects work that leaks across boundaries

---

## 4. Role Separation

## 4.1 Governor Agent

### Owns
- `main` branch integrity
- repository scaffold and initial structure
- global governance rules
- global ADR sequence and enforcement
- codebase health checks
- cross-context dependency policing
- CI and required quality gates
- contract, schema, and mock drift detection

### Must set up first on `main`
- top-level repo structure
- `frontend`, `backend`, `worker`, `contracts`, `tests`, `docs` directories
- governance docs
- high-level spec
- global ADR series in logical order
- `CODEOWNERS`
- PR template
- CI workflow scaffold
- initial ruleset and branch protection guidance
- agent instructions and role definitions
- bounded-context skeletons in `backend/src`
- contract folders for API, events, fixtures, and mocks

### Does not own
- detailed feature implementation inside bounded contexts
- product behavior decisions that belong to the responsible team, unless they cross a global architecture boundary

---

## 4.2 Team A — Identity & Community Core

**Human Developer A + Agent A**

### Owns
- Identity & Access
- Community Structure

### Deliverables
- sign-in / sign-up / invite / membership lifecycle
- roles, permissions, access groups, entitlements foundations
- community, space, and channel structure
- policy checks and authorization hooks
- backend contracts for identity and community structure
- fixtures and mocks for these surfaces

### Critical boundary surfaces exposed to others
- member identity summary
- role and access lookups
- community / space / channel read contracts
- permission and entitlement checks

### Teams most affected by Team A
- Team B for member-facing experiences and visibility rules
- Team C for entitlements, billing, gated events, and admin controls

---

## 4.3 Team B — Experience Layer

**Human Developer B + Agent B**

### Owns
- Engagement
- Resources
- member-facing notification read models and UI contracts
- frontend composition for member experience in owned domains

### Deliverables
- posts, comments, reactions, feed surfaces
- channel and discussion experience
- documents/resources experience
- unread state projections for owned surfaces
- frontend pages, feature modules, composables, and services for owned domains
- contracts, mocks, and fixtures for experience-layer work

### Critical boundary surfaces exposed to others
- engagement event payloads
- feed and discussion DTOs
- unread and member-facing notification projections
- UI contract requirements for shared identity and community navigation surfaces

### Teams most affected by Team B
- Team A for identity and visibility dependencies
- Team C where event/activity feeds and automated notices intersect

---

## 4.4 Team C — Operations, Monetization & Automation

**Human Developer C + Agent C**

### Owns
- Events
- Commerce
- Automation
- Admin & Reporting foundations
- worker process feature logic for owned bounded contexts

### Deliverables
- events, RSVP, attendance, reminders
- plans, subscriptions, purchases, entitlements integration
- automation handlers and workflow execution in owned domains
- audit log foundations and operational read models
- backend contracts, fixtures, and mocks for owned domains

### Critical boundary surfaces exposed to others
- purchase and subscription state
- event lifecycle state
- entitlement changes
- automation-triggered domain events
- reporting read model requirements

### Teams most affected by Team C
- Team A for identity and entitlement enforcement
- Team B for event display, engagement tie-ins, and notification/read model consumption

---

## 5. Ownership Map

| Area | Primary Owner | Secondary/Consumers | Notes |
|---|---|---|---|
| Identity & Access | Team A | Team B, Team C | Core dependency area; contract-first required |
| Community Structure | Team A | Team B, Team C | Defines visibility, hierarchy, and navigation anchors |
| Engagement | Team B | Team A, Team C | Must not bypass Team A policy/visibility rules |
| Resources | Team B | Team A | Access rules depend on Team A surfaces |
| Events | Team C | Team A, Team B | Permissions and community placement still depend on Team A |
| Commerce | Team C | Team A | Entitlements exposed to Team A auth/policy layer |
| Automation | Team C | Team A, Team B | Trigger and side-effect rules must follow global integration ADRs |
| Notification read models | Team B | Team C | Delivery mechanics later may span Team C handlers |
| Admin & Reporting foundations | Team C | Team A, Team B | Cross-domain read models must not create domain write coupling |
| Global contracts / shared rules | Governor Agent | All teams | Enforced through ADRs and PR checks |

---


## 5.1 ADR ownership rule

### Global ADRs
- remain under `docs/adr/global/`
- are owned by the Governor Agent and architecture leadership
- define system-wide law

### Feature ADRs
- must be owned end-to-end by exactly one delivery team
- must live in that team's ADR bucket under `docs/adr/features/`
- must not be co-owned by multiple teams

### Delivery rule
If a feature touches multiple teams, one team still owns the feature ADR.
Other teams provide approved contracts or local ADR updates in their own buckets when required.
If the change is truly cross-cutting, it must be elevated to a global ADR instead of becoming a shared feature ADR.

## 6. Foundation-First Sequence

Before major feature work begins, the Governor Agent should establish the foundation on `main` in this order.

## Phase 0 — Repository foundation

### Governor outputs
- repository folder structure
- governance and spec documents
- team and agent ownership docs
- initial branch and PR standards
- initial CI scaffold
- contract and fixture folder structure
- backend bounded-context skeletons
- frontend framework-neutral structure guidance

### Exit criteria
- repo shape is stable enough for team bootstrapping
- everyone can create feature branches against a common structure

## Phase 1 — Global architectural law

### Governor outputs
- ADR-001 through ADR-012 drafted and accepted in sequence
- unresolved technology decisions explicitly marked
- open decision backlog for next ADRs

### Exit criteria
- system shape, context boundaries, testing rules, async model, and frontend/backend interaction rules are documented

## Phase 2 — Team bootstrap templates

### Governor outputs
- example module template in `backend/src/<context>`
- example frontend feature template
- contract template for API/events/fixtures/mocks
- example test layout for unit, contract, integration, and architecture checks

### Exit criteria
- teams can begin parallel feature work without inventing local patterns

---

## 7. Initial Team Startup Sequence

Once Phases 0–2 are complete, the teams should start in the following order.

## 7.1 Team A starts first on foundational contracts

Team A should first establish:
- auth/session contract direction
- identity read models used by other contexts
- community / space / channel contracts
- permission and visibility interfaces
- mock fixtures for identity and community structure

This work is foundational because other teams depend on these surfaces conceptually, even if they do not wait for full implementation.

## 7.2 Team B and Team C start in parallel once Team A contracts are agreed

### Team B can proceed with
- discussion and feed UI skeletons
- engagement DTOs and mock fixtures
- route shells and frontend features against agreed contracts
- resource surfaces and placeholders

### Team C can proceed with
- events domain skeletons
- commerce domain skeletons
- worker process setup for owned job flows
- automation triggers and internal event contracts

Important: Team B and Team C should not wait for Team A runtime completion once contracts and fixtures are approved.

---

## 8. No-Blocking Rules

The following rules exist to prevent teams blocking one another unnecessarily.

### Rule 1
A team must not wait for another team’s implementation if:
- the contract is approved
- fixture examples exist
- mock behavior is defined
- acceptance criteria are documented

### Rule 2
If a dependency is not yet implemented, the consuming team builds against:
- shared contracts
- shared fixtures
- agreed mock adapters

### Rule 3
If a team needs a new cross-context field or behavior, it must raise:
- a contract change
- fixture/mocks update
- ADR or feature decision note if boundary rules are affected

### Rule 4
No team may directly read or write another team’s persistence model just to move faster.

---

## 9. Contract Synchronization Rules

Every externally consumed feature surface must stay synchronized across:
- backend domain model
- backend application DTOs
- persistence schema where relevant
- API contracts
- realtime event contracts
- fixtures
- mocks
- frontend consuming types

A PR is incomplete if one of these changed and the others were left stale.

This is especially important for:
- identity summaries
- permission and visibility checks
- community structure responses
- engagement payloads
- event state payloads
- commerce and entitlement payloads
- notification and realtime event models

---

## 10. What the Governor Agent Builds on `main`

The Governor Agent should be responsible for building or drafting the following on `main` before the teams spread into feature work:

### Repository and process foundation
- repo scaffold
- folder structure
- branch naming conventions
- PR template
- CODEOWNERS
- required quality gate list

### Documentation foundation
- product spec
- governance docs
- repo structure doc
- ownership and delivery map
- ADR index and logical sequence

### Architecture foundation
- bounded-context skeletons
- shared contract directories
- test directory structure
- worker process placeholder
- example adapters/inbound and adapters/outbound layout in backend modules

### Quality foundation
- CI workflow placeholders
- architecture test placeholders
- contract test placeholders
- linting / formatting placeholders
- dependency review expectations

The Governor Agent does **not** own ongoing feature velocity; it owns the shared base that allows safe velocity.

---

## 11. Initial Logical ADR Sequence

The following ADR order should be treated as the logical foundation sequence.

### Already laid down
1. ADR-001 — System shape
2. ADR-002 — Bounded context map
3. ADR-003 — Data and tenancy model
4. ADR-004 — Integration and contract model
5. ADR-005 — Identity and authorization model
6. ADR-006 — Delivery governance and testing
7. ADR-007 — Frontend application architecture and boundary model
8. ADR-008 — Technology stack and hosting model
9. ADR-009 — Deployment model and infrastructure baseline
10. ADR-010 — Database access strategy and model synchronization
11. ADR-011 — Background jobs and workflow execution
12. ADR-012 — Interaction model and delivery semantics

### Next logical ADRs
13. ADR-013 — Notification and email delivery strategy
14. ADR-014 — Authentication implementation strategy
15. ADR-015 — API and realtime contract versioning strategy
16. ADR-016 — Video rooms and conferencing subsystem boundary
17. ADR-017 — Search and discovery strategy
18. ADR-018 — File, document, and media storage strategy
19. ADR-019 — Frontend framework finalization and SSR/PWA rules
20. ADR-020 — Managed hosting vs self-hosted distribution packaging

The Governor Agent should ensure that later ADRs do not contradict earlier accepted foundation ADRs without an explicit superseding decision.

---

## 12. Suggested Initial Work Breakdown

## Governor Agent
- finalize scaffold on `main`
- finalize remaining foundational governance docs
- seed module templates
- seed contract templates
- seed architecture and contract tests
- maintain ADR sequence and open decisions log

## Team A
- establish identity and community core contracts
- draft initial auth/session integration assumptions
- create membership and permission fixtures
- build initial community hierarchy model

## Team B
- build frontend route shells and feature layout for engagement/resources
- consume Team A contracts via mocks and fixtures
- define engagement read/write contracts in owned domains
- establish frontend state and composable patterns

## Team C
- establish events and commerce bounded-context skeletons
- define worker-owned job boundaries
- define automation trigger/event contracts
- create entitlement and event fixtures for downstream consumption

---

## 13. Readiness Gate Before Wide Parallel Build-Out

Parallel feature implementation should only begin once all of the following are true:
- global foundation ADRs are accepted for the first slice of work
- repo structure is stable
- team ownership is documented
- contract folders exist
- fixture and mock rules exist
- CI placeholder checks exist
- module template examples exist
- no unresolved argument remains over top-level architecture or boundaries

---

## 14. Rule for Future Revisions

If team count changes, if additional bounded contexts are introduced, or if the frontend/backend structure changes materially, this document must be revised before ownership assumptions spread through new code.

This document is not optional process overhead. It is part of the delivery architecture.
