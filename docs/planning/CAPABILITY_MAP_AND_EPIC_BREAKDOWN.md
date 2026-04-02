# FoundryRooms Capability Map and Epic Breakdown

## Status
Working planning document.

## Purpose
This document translates the high-level specification, governance model, and global ADRs into a build-oriented capability map that can be divided across the Governor Agent and the three dev + agent delivery teams.

It exists to answer five questions:

1. What major capabilities does FoundryRooms need?
2. Which team owns each capability?
3. Which capabilities are MVP versus later?
4. Which ADRs govern each capability?
5. What dependencies must be satisfied so teams can work in parallel without blocking each other?

This document is not a ticket backlog. It is the bridge between:

- `docs/spec/HIGH_LEVEL_SPEC.md`
- `docs/governance/INITIAL_DELIVERY_PLAN_AND_OWNERSHIP.md`
- `docs/governance/ADR_OWNERSHIP_AND_DELIVERY_BUCKETS.md`
- `docs/adr/global/*`

---

## Planning principles

### 1. End-to-end ownership by bounded context
Each major feature area should be owned end-to-end by one team.

### 2. Global rules, local delivery
Global ADRs define architectural law. Feature ADRs define local implementation decisions inside the owning team's boundary.

### 3. Contract-first parallel delivery
When a feature spans frontend, backend, async processing, and notifications, the owning team must define the contract, fixtures, and mocks early so other teams are not blocked.

### 4. One team owns the feature ADR
A feature ADR should not be co-owned by multiple teams. Cross-cutting concerns become global ADRs.

### 5. MVP first, not platform maximalism
The first release is a Heartbeat-like community platform. Richer collaborative and "Vibe Room" capabilities are deferred.

---

## Team ownership model

### Governor Agent on `main`
Owns:
- repo scaffold and structure
- global ADR sequence
- architecture guardrails
- contract/testing standards
- merge governance and health checks
- quality gates for cohesion, coupling, and anti-drift

### Team A — Community Core
Owns:
- identity and access
- community structure
- memberships and access groups
- foundational community administration surfaces

### Team B — Experience
Owns:
- discussions and feed experience
- events UX
- resources/document UX
- realtime client behavior
- frontend feature flows and interaction surfaces

### Team C — Ops, Monetization, and Platform
Owns:
- commerce and entitlements integration
- notification backend and email delivery
- automation, jobs, and workflow execution
- admin reporting and deployment/platform packaging

---

## Capability map overview

| Capability Area | Primary Owner | MVP | Primary Global ADRs |
|---|---|---:|---|
| Identity and Access | Team A | Yes | ADR-001, 002, 003, 005, 010, 012 |
| Community Structure | Team A | Yes | ADR-001, 002, 003, 004, 005, 010, 012 |
| Memberships and Access Groups | Team A | Yes | ADR-002, 003, 005, 008, 010 |
| Discussions and Feed | Team B | Yes | ADR-002, 004, 007, 010, 012 |
| Events | Team B | Yes | ADR-002, 004, 007, 010, 012 |
| Resources and Documents | Team B | Yes | ADR-002, 004, 007, 010, 012 |
| Realtime UX and Presence | Team B | Partial | ADR-007, 011, 012 |
| Commerce and Billing | Team C | Yes | ADR-002, 003, 004, 008, 010, 011 |
| Notifications and Email | Team C | Yes | ADR-011, 012 |
| Automation and Background Jobs | Team C | Yes | ADR-004, 011, 012 |
| Admin Reporting and Audit | Team C | Yes | ADR-002, 003, 004, 006, 010 |
| Deployment and Packaging | Team C | Yes | ADR-008, 009, 011 |
| AI Assist Features | Deferred / Shared later | Later | future ADR |
| Video Rooms / Conferencing | Deferred / Shared later | Later | ADR-008, 009, 012 + future ADR |

---

## Suggested first epic inventory

### Team A first epics
- EPIC-A-001 Auth and session foundation
- EPIC-A-002 Role and access group model
- EPIC-A-003 Community hierarchy and management
- EPIC-A-004 Member invitation and admin actions

### Team B first epics
- EPIC-B-001 Frontend shell and route scaffolding
- EPIC-B-002 Discussion list/detail/composer flows
- EPIC-B-003 Event list/detail/RSVP flows
- EPIC-B-004 Resource library and detail experience
- EPIC-B-005 Realtime client baseline

### Team C first epics
- EPIC-C-001 Worker and job runtime baseline
- EPIC-C-002 Notification backend baseline
- EPIC-C-003 Commerce and entitlement integration baseline
- EPIC-C-004 Audit/reporting baseline
- EPIC-C-005 Self-host packaging baseline

---

## MVP delivery waves

### Wave 0 — Foundation
Owner: Governor + support from all teams

Exit criteria:
- main branch protected
- folder structure agreed
- global ADR foundation accepted
- teams can start local ADRs and feature work

### Wave 1 — Core viability
Primary owners: Team A + Team B
Support: Team C

Exit criteria:
- members can authenticate
- members can enter communities/spaces/channels
- members can create and view core content
- admins can manage basic structure

### Wave 2 — Monetization and operational readiness
Primary owner: Team C
Support: Team A + Team B

Exit criteria:
- paid access works
- notification flows are operational
- async jobs are stable
- self-host baseline is documented

### Wave 3 — Experience hardening
Owners: Team B + Team C
Support: Team A

Exit criteria:
- UX is production-ready
- realtime behavior is stable and hydration-safe
- platform is releasable for OSS self-host evaluation

---

## Definition of "ready for team execution"
A capability area is ready for parallel team execution when:

- relevant global ADRs are accepted
- owning team is clear
- local feature ADR bucket exists
- contracts are identified
- dependency boundaries are explicit
- fixtures/mocks can be created without waiting on live implementation
- tests expected for the area are defined
