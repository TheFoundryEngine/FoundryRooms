# Team C Issue Breakdown — Events, Commerce, Automation, Admin/Reporting + Worker

**Date:** 2026-04-30
**Status:** Approved
**Owner:** Team C (Ops & Monetization)
**Bounded Contexts:** Events, Commerce, Automation, Admin & Reporting
**Worker:** `worker/` (cross-context job runtime)
**Depends on:** Team A Wave 0 implementation plan (`docs/superpowers/plans/2026-04-30-wave-0-foundation-contracts.md`) — establishes the monorepo, contracts package, Zod, Vitest, npm workspaces baseline that this spec builds on.

## Overview

This document defines the actionable issue breakdown for Team C v1 foundation work. Issues are organized in 5 waves using a contract-first approach so Teams A and B can begin parallel work against contracts and mocks immediately.

### Scope

All five Team C epics (per Capability Map, adjusted to CODEOWNERS):
- **EPIC-C-001** Worker and job runtime baseline
- **EPIC-C-002** Commerce and entitlement integration baseline
- **EPIC-C-003** Events and attendance baseline
- **EPIC-C-004** Automation and workflow execution
- **EPIC-C-005** Audit/reporting baseline

Notifications backend is **not** in scope — owned by Governor (`@TheFoundryEngine`) per CODEOWNERS, despite Capability Map suggesting otherwise. Self-host packaging (Capability Map's EPIC-C-005) is rolled into the W0 worker scaffold and W4 deployment hardening rather than a separate epic.

### Approach: Contract-First Waves

Issues are structured so that:
1. Wave 0 establishes module scaffolds, contracts, fixtures, and mocks — Teams A/B unblocked immediately
2. Wave 1 lands the worker runtime so any team can register job handlers
3. Each subsequent wave builds on the previous
4. Cross-team unlock points are explicit
5. Testing is embedded in each wave, not deferred

### Key Architectural Decisions

#### 1. Actor Model (extends Team A spec, 2026-04-30)

Team C adopts the Actor model defined by Team A. Specifically:

- **Entitlements are granted to an Actor**, not a User. Agents can hold entitlements (e.g. an automation agent granted "post on behalf of community" via role).
- **Audit log entries reference Actor**, not User — humans and agents are both auditable.
- **Automation triggers and workflow side effects are Actor-aware** — an Actor performed the action that triggered the automation.
- **Purchase flows remain User-only at the entry point** — humans pay, but the resulting entitlement may be granted to a User or to an Agent owned by that User. Subscription seat assignment is `Actor`-keyed.
- **RSVP and attendance are Actor-keyed** — agents can be marked present at events for moderation/automation purposes.

This removes the bolt-on-later risk and keeps entitlement infrastructure unified.

#### 2. Repository Layout

Team C uses the same layout Team A is actively building (per Nick's Wave 0 implementation plan):

```
modules/events/
modules/commerce/
modules/automation/
modules/admin-reporting/
worker/src/{bootstrap,runtime,queues,bindings}/
contracts/api/<context>/
contracts/events/<context>/
contracts/fixtures/<context>/
contracts/mocks/<context>/
tests/contract/<context>/
tests/integration/<context>/
```

Each module follows hexagonal structure: `domain/`, `application/`, `adapters/{inbound,outbound}/`, `contracts/`, `tests/`.

This layout differs from CODEOWNERS (`apps/backend/src/<context>/`, `apps/worker/`) and from ADR-008 §Backend / ADR-010 §5 / ADR-011 §12 (all of which mandate `apps/backend/src/`). The CODEOWNERS file and those ADRs are now stale relative to the actual codebase. Reconciling them is a Governor / ADR-amendment task that does not block this spec.

#### 3. Stack standards (inherited from Team A Wave 0 plan)

- **TypeScript** with strict settings, path aliases via `tsconfig.base.json`
- **NestJS** for backend application framework (per ADR-008)
- **Zod** for schema validation across contracts and runtime payload checking
- **Vitest** for unit, integration, and contract tests
- **npm workspaces** for monorepo (not pnpm)
- **Node 20** (per Team A `.nvmrc`)
- **`@foundry/contracts`** workspace package alias for cross-module contract import

These are de facto standards as of 2026-04-30. None are documented in an ADR yet — a follow-on ADR (ADR-013 candidate) should formalize them.

#### 4. Worker is Shared Infrastructure, Not a Bounded Context

`worker/` is owned by Team C operationally but is **not** a bounded context. Job handlers belong to the bounded context whose application service the handler invokes (per ADR-011 §6). The worker app is a thin runtime; business logic stays in `modules/<context>/`.

---

## Wave 0 — Foundation & Contracts

**Goal:** Scaffold all four Team C backend contexts and the worker app. Define every external contract, fixture, and mock so Teams A and B can build against them immediately.

**Unlocks:** Teams A/B can consume entitlement, purchase, event, automation, and audit contracts via mocks.

| # | Issue | Description | Exit Criteria |
|---|-------|-------------|---------------|
| 1 | Scaffold events module | Create `modules/events/` with `domain/`, `application/`, `adapters/{inbound,outbound}/`, `contracts/`, `tests/`, `package.json`, `tsconfig.json`, `index.ts` | Directory structure exists |
| 2 | Scaffold commerce module | Same hexagonal structure under `modules/commerce/` | Directory structure exists |
| 3 | Scaffold automation module | Same hexagonal structure under `modules/automation/` | Directory structure exists |
| 4 | Scaffold admin-reporting module | Same hexagonal structure under `modules/admin-reporting/` | Directory structure exists |
| 5 | Scaffold worker app | Create `worker/src/{bootstrap,runtime,queues,bindings}/` per ADR-011 §12 with `package.json`, `tsconfig.json`, `.nvmrc` consistency | Worker app boots |
| 6 | Define Plan, Offer, Subscription, Purchase contracts | DTOs and OpenAPI fragments for commerce surfaces | Schemas + fixtures committed |
| 7 | Define Entitlement contract | EntitlementSummary, EntitlementGrant, EntitlementRevoke (Actor-keyed) | Schema + fixtures committed |
| 8 | Define Event, Attendance, RSVP contracts | DTOs for events surfaces (Actor-keyed) | Schemas + fixtures committed |
| 9 | Define Automation contracts | Trigger, Action, Workflow definition shapes | Schemas + fixtures committed |
| 10 | Define AuditEntry contract | Append-only audit shape with Actor reference | Schema + fixtures committed |
| 11 | Define commerce event contracts | PurchaseInitiated, PurchaseCompleted, PurchaseFailed, RefundIssued, SubscriptionActivated, SubscriptionCancelled, EntitlementGranted, EntitlementRevoked | Event schemas committed |
| 12 | Define events event contracts | EventCreated, EventScheduled, EventCancelled, RSVPed, RSVPCancelled, AttendanceMarked, ReminderScheduled, ReminderSent | Event schemas committed |
| 13 | Define automation event contracts | AutomationTriggered, AutomationCompleted, AutomationFailed | Event schemas committed |
| 14 | Define admin/audit event contracts | AuditEntryRecorded | Event schemas committed |
| 15 | Define job payload contracts | Per-queue payload schemas (commerce.reconcile, events.reminder, automation.run, audit.record) per ADR-011 §8.1 | Job schemas committed |
| 16 | Create mock payment provider adapter | Mock Stripe-like provider for parallel work | Mock usable by other teams |
| 17 | Create mock entitlement service | hasEntitlement(actorId, type, scope) mock | Mock usable by other teams |
| 18 | Create mock event lookup service | getEvent, listEvents mocks | Mock usable by Team B |
| 19 | Create mock automation runner | Trigger fan-out mock | Mock usable for testing |
| 20 | Document Team C contracts in `docs/adr/features/team-c-ops-monetization/ADR-F-C-001-contract-surfaces.md` | Per ADR_OWNERSHIP rules — feature ADR for contract decisions | ADR committed |

---

## Wave 1 — Worker Runtime & Cross-Cutting Job Foundation

**Goal:** Land the BullMQ worker runtime so any team can register job handlers. Establish idempotency, retries, dead-letter, and reconciliation infrastructure as first-class.

**Unlocks:** Teams A, B, C can register job handlers in their own contexts. Notifications (Bryan) can register email delivery jobs.

| # | Issue | Description | Exit Criteria |
|---|-------|-------------|---------------|
| 21 | Worker bootstrap | NestJS app bootstrap for `worker/`, env config, graceful shutdown | Worker starts via `npm run dev:worker` |
| 22 | BullMQ runtime adapter | Redis connection, queue registry, worker registration | Queues observable in Redis |
| 23 | Implement queue port + BullMQ adapter | Port `JobQueue` in `contracts/` shared package, adapter in `worker/src/runtime/bullmq/` | Backend can enqueue, worker can consume |
| 24 | Implement idempotency key infrastructure | Per-job idempotency check using Redis | Same key processed once |
| 25 | Implement retry policy registry | Per-queue backoff strategy + max attempts | Retries observed in tests |
| 26 | Implement dead-letter queue | Failed jobs land on DLQ with original payload + failure trace | DLQ populated on terminal failure |
| 27 | Implement job payload validator | Zod or equivalent schema validation at queue entry | Invalid payloads rejected |
| 28 | Implement reconciliation job runner | Scheduled reconciliation per ADR-011 §10.2 | Cron-style scheduling works |
| 29 | Worker bindings layer | Maps queue name → bounded-context application service entrypoint | Queues bound to backend services |
| 30 | Worker integration tests with testcontainers | Real Redis, real Postgres, full producer→worker→backend path | Suite passes |
| 31 | Worker observability hooks | Structured logs, job duration, retry counts, DLQ counts | Logs emit per-job |
| 32 | Worker health check endpoint | `/healthz` returns queue connectivity status | Endpoint usable for orchestration |
| 33 | Domain event publisher port | In-process publish to subscribers (in-memory pub/sub for monolith per ADR-012 §3.2) | Publishers work in tests |
| 34 | Domain event registry | Each context registers its event handlers at bootstrap | Registry observable |
| 35 | Cross-context event subscription wire | Allow context X to subscribe to context Y's domain events through application services only | No direct cross-context persistence |
| 36 | Architecture test: no cross-context persistence | dependency-cruiser rule | CI rejects violations |

---

## Wave 2 — Commerce & Entitlements

**Goal:** Implement plans, offers, subscriptions, purchases, entitlements with idempotent webhook handling and reconciliation. Entitlements granted to Actor.

**Unlocks:** Team A can enforce paid access via entitlement checks. Team B can show paywalls and gated content. Bryan (notifications) can react to PurchaseCompleted.

| # | Issue | Description | Exit Criteria |
|---|-------|-------------|---------------|
| 37 | Plan domain model | Plan with PlanId, name, billingInterval, price tiers | Domain model + tests |
| 38 | Offer domain model | Offer references a Plan, optional discount, validity window | Domain model + tests |
| 39 | Subscription domain model | Subscription tied to Actor, status enum, lifecycle | Domain model + tests |
| 40 | Purchase domain model | Purchase tied to User (purchaser), grantee Actor | Domain model + tests |
| 41 | Entitlement domain model | Entitlement granted to Actor, type, scope, expires_at, source (purchase/role/system) | Domain model + tests |
| 42 | Refund domain model | Refund references a Purchase, partial/full | Domain model + tests |
| 43 | Create plans + offers tables migration | plans, offers, plan_tiers | Migration runs |
| 44 | Create subscriptions table migration | actor_id FK, status, period_start/end | Migration runs |
| 45 | Create purchases table migration | purchaser_user_id, grantee_actor_id, idempotency_key | Migration runs |
| 46 | Create entitlements table migration | actor_id, type, scope_type, scope_id, source, expires_at | Migration runs |
| 47 | Create refunds table migration | purchase_id, amount, reason, processed_at | Migration runs |
| 48 | Implement Plan/Offer repositories | Drizzle adapters | CRUD works |
| 49 | Implement Subscription repository | CRUD + active subscription lookup by Actor | Repository works |
| 50 | Implement Purchase repository | CRUD + idempotency-key lookup | Repository works |
| 51 | Implement Entitlement repository | CRUD + active entitlement queries by Actor | Repository works |
| 52 | Implement Refund repository | CRUD + lookup by purchase | Repository works |
| 53 | Define PaymentProvider port | Abstract port for charge, refund, signature verification | Port defined |
| 54 | Implement Stripe adapter behind PaymentProvider port | Stripe SDK wired to port (hosted only — self-hosters can swap) | Adapter isolated |
| 55 | Implement CreatePlan / UpdatePlan use cases | Owner-only operations, emit PlanCreated | Use cases + tests |
| 56 | Implement PurchasePlan use case | Idempotent: charge → record → emit PurchaseCompleted | Use case + test, idempotency verified |
| 57 | Implement ActivateSubscription use case | Triggered by PurchaseCompleted, emits SubscriptionActivated | Use case + test |
| 58 | Implement CancelSubscription use case | Soft-cancel at period end, emit SubscriptionCancelled | Use case + test |
| 59 | Implement RefundPurchase use case | Provider refund + state transition + emit RefundIssued | Use case + test |
| 60 | Implement GrantEntitlement use case | Grant to any Actor, source-tagged, emit EntitlementGranted | Use case + test |
| 61 | Implement RevokeEntitlement use case | Revoke + emit EntitlementRevoked | Use case + test |
| 62 | Implement HasEntitlement query service | Public service consumed by Team A authorization | Service usable cross-context |
| 63 | Webhook inbound adapter for Stripe | Signature verify, minimal translation, enqueue follow-up | Adapter rejects unsigned |
| 64 | Webhook reconciliation job | Periodic reconcile against provider state per ADR-011 §10.2 | Job catches missed webhooks in test |
| 65 | Commerce HTTP endpoints | `/api/v1/plans`, `/api/v1/offers`, `/api/v1/purchases`, `/api/v1/subscriptions`, `/api/v1/entitlements` per ADR-012 §6.1 | Endpoints match contracts |
| 66 | OpenAPI spec for commerce | Generated from controllers, committed to `contracts/api/commerce/` | OpenAPI YAML committed |
| 67 | Commerce contract tests | Verify endpoints + fixtures + webhook payloads | Tests pass |
| 68 | Commerce integration tests | Full purchase → entitlement flow against real Postgres | Suite passes |

---

## Wave 3 — Events & Attendance

**Goal:** Implement event lifecycle, RSVP, attendance, and reminder scheduling. Reminder scheduling uses Wave 1 worker.

**Unlocks:** Team B can build event UI against real backend. Team A can scope event visibility to communities. Notifications (Bryan) can react to ReminderScheduled.

| # | Issue | Description | Exit Criteria |
|---|-------|-------------|---------------|
| 69 | Event domain model | Event with id, community_id, host_actor_id, scheduled_at, timezone, visibility | Domain model + tests |
| 70 | RSVP domain model | RSVP tied to Actor, status enum (yes/no/maybe), responded_at | Domain model + tests |
| 71 | Attendance domain model | Attendance tied to Actor, marked_at, marked_by_actor_id | Domain model + tests |
| 72 | Reminder domain model | Scheduled reminder with target Actor list, fire_at, status | Domain model + tests |
| 73 | Create events table migration | events with community_id FK, scheduled_at index | Migration runs |
| 74 | Create rsvps table migration | event_id, actor_id, status, unique(event_id, actor_id) | Migration runs |
| 75 | Create attendance table migration | event_id, actor_id, marked_at | Migration runs |
| 76 | Create reminders table migration | event_id, actor_id, fire_at, status | Migration runs |
| 77 | Implement Event repository | CRUD + list by community + upcoming filter | Repository works |
| 78 | Implement RSVP repository | CRUD + lookup by event+actor | Repository works |
| 79 | Implement Attendance repository | Append + list by event | Repository works |
| 80 | Implement Reminder repository | CRUD + due-soon query for scheduler | Repository works |
| 81 | Implement CreateEvent use case | Validates community visibility, emits EventCreated | Use case + test |
| 82 | Implement UpdateEvent use case | Re-schedules reminders, emits EventScheduled | Use case + test |
| 83 | Implement CancelEvent use case | Cancels reminders, emits EventCancelled | Use case + test |
| 84 | Implement RSVP use case | Idempotent per (event,actor), emit RSVPed | Use case + test |
| 85 | Implement CancelRSVP use case | Reverses RSVP, emit RSVPCancelled | Use case + test |
| 86 | Implement MarkAttended use case | Permission-gated, emit AttendanceMarked | Use case + test |
| 87 | Implement ScheduleReminder use case | Enqueues worker job at fire_at, emit ReminderScheduled | Job appears in queue in test |
| 88 | Reminder fire job handler (worker) | Worker calls events application service, emits ReminderSent | Handler runs against test event |
| 89 | iCal export adapter | Outputs RFC5545 calendar feed for an Actor's RSVPs | Adapter isolated, contract-tested |
| 90 | Events HTTP endpoints | `/api/v1/events`, `/api/v1/events/:id/rsvps`, `/api/v1/events/:id/attendance` | Endpoints match contracts |
| 91 | OpenAPI spec for events | Committed to `contracts/api/events/` | OpenAPI YAML committed |
| 92 | Events contract tests | All endpoints + reminder job payload | Tests pass |
| 93 | Events integration tests | Create event → RSVP → schedule reminder → fire | Suite passes |

---

## Wave 4 — Automation, Admin & Reporting

**Goal:** Implement automation engine (domain-event-driven workflows), audit log infrastructure, admin read models, and architecture tests for the entire Team C surface.

**Unlocks:** Team C v1 foundation complete. Other teams can author automations against approved triggers and actions. Admin surfaces are queryable.

| # | Issue | Description | Exit Criteria |
|---|-------|-------------|---------------|
| 94 | Trigger domain model | Trigger references a domain event name + filter predicate | Domain model + tests |
| 95 | Action domain model | Action references an application use case + parameter mapping | Domain model + tests |
| 96 | Automation domain model | Automation = Trigger + Action(s) + enabled flag | Domain model + tests |
| 97 | AutomationRun domain model | Each fire records started_at, finished_at, outcome | Domain model + tests |
| 98 | Create automations table migration | automations with community scope | Migration runs |
| 99 | Create automation_runs table migration | append-only run log | Migration runs |
| 100 | Implement Automation repository | CRUD + list by community + list by trigger event | Repository works |
| 101 | Implement AutomationRun repository | Append + list by automation | Repository works |
| 102 | Implement CreateAutomation use case | Owner-only, emit AutomationCreated | Use case + test |
| 103 | Implement EnableAutomation / DisableAutomation use cases | Toggle enabled, emit events | Use cases + tests |
| 104 | Implement automation runner job (worker) | Subscribes to all domain events, fans out to matching automations | Runner fires in integration test |
| 105 | Pre-built automation: WelcomeOnMemberJoined | Triggered by Team A's MemberJoined event | Reference automation works |
| 106 | Pre-built automation: GrantEntitlementOnPurchase | Triggered by PurchaseCompleted | Entitlement granted automatically |
| 107 | Pre-built automation: NotifyOnEvent | Triggered by EventScheduled, emits notification request event for Bryan's notifications | Cross-team event verified |
| 108 | Automation HTTP endpoints | `/api/v1/automations`, `/api/v1/automations/:id/runs` | Endpoints match contracts |
| 109 | OpenAPI spec for automation | Committed to `contracts/api/automation/` | OpenAPI YAML committed |
| 110 | AuditEntry domain model | actor_id, action, target_type, target_id, occurred_at, metadata | Domain model + tests |
| 111 | Create audit_log table migration | append-only, indexed by actor_id and target | Migration runs |
| 112 | Implement AuditLog repository | Append + query by actor/target/range | Repository works |
| 113 | Implement audit logging service | Subscribes to sensitive domain events across all contexts, auto-records | Service captures events in test |
| 114 | Implement member status read model | Cross-context projection: identity + commerce + events | Read model query works |
| 115 | Implement purchase history read model | Per-Actor purchase + entitlement history | Read model query works |
| 116 | Implement attendance history read model | Per-Actor RSVP + attendance history | Read model query works |
| 117 | Admin HTTP endpoints | `/api/v1/admin/audit`, `/api/v1/admin/members/:id/status`, `/api/v1/admin/members/:id/purchases`, `/api/v1/admin/members/:id/attendance` | Permission-gated, contract-compliant |
| 118 | OpenAPI spec for admin-reporting | Committed to `contracts/api/admin-reporting/` | OpenAPI YAML committed |
| 119 | Architecture test: Team C boundary isolation | dependency-cruiser rules — events cannot import commerce internals, etc. | CI rejects violations |
| 120 | Architecture test: domain isolation | No domain layer imports framework / Drizzle / NestJS | CI rejects violations |
| 121 | Architecture test: no cross-context persistence | Reuses W1 rule — verify no Team C context reaches into Team A/B tables | CI rejects violations |
| 122 | E2E test: purchase → entitlement → gated event RSVP | Full cross-team flow once Teams A/B contracts are real | Suite passes |
| 123 | Self-host packaging baseline | docker-compose.yml service definitions for backend + worker + Postgres + Redis + MinIO | `docker compose up` runs full stack |

---

## Cross-Team Unlock Points

| After Wave | Teams A/B Can... |
|------------|------------------|
| 0 | Build against entitlement, purchase, event, automation, audit contracts via mocks |
| 1 | Register job handlers in their own contexts (welcome emails, post-process jobs, etc.) |
| 2 | Enforce paid access via real entitlement checks; show paywalls; react to PurchaseCompleted |
| 3 | Build event UI against real backend; receive ReminderScheduled events |
| 4 | Author automations against approved triggers; query admin read models |

---

## Cross-Team Dependencies (Inbound)

What Team C consumes from Team A:
- `Actor` base entity and `ActorRepository` (from Team A W1)
- `User`, `Agent`, `ActorType` enum
- `Community`, `Space`, `Channel` for event scoping (from Team A W3)
- `MemberJoined` domain event (from Team A W3) — triggers WelcomeOnMemberJoined automation
- `Membership` for entitlement grant target validation
- Permission checking service (from Team A W2)

What Team C consumes from Team B:
- Nothing required for backend. Team B consumes Team C's contracts, not the other way around.

What Team C consumes from Bryan / Notifications:
- Notification request event contract (Bryan owns) — automations emit notification requests, Bryan's context delivers.

---

## Testing Requirements

| Test Type | When | Purpose |
|-----------|------|---------|
| Unit tests | Every domain model, every use case | Validate invariants, idempotency rules, state transitions |
| Integration tests | Every repository, every job handler, every webhook adapter | Validate persistence, queue, provider interactions |
| Contract tests | End of each wave | Verify endpoints + job payloads match committed schemas |
| Architecture tests | Wave 4 | Enforce module boundaries, domain isolation, no cross-context persistence |
| E2E tests | Wave 4 | Full purchase-to-event-attendance flow (once Teams A/B contracts are real) |

---

## Dependencies on Global ADRs

- **ADR-001** System shape — modular monolith, hexagonal layout per context
- **ADR-002** Bounded context map — Team C owns events, commerce, automation, admin-reporting
- **ADR-003** Data and tenancy — community_id scoping for events; per-context table ownership
- **ADR-004** Integration and contract model — contract-first, fixtures, mocks; in-process events for cross-context reactions
- **ADR-005** Identity and authorization — entitlement model; extended here to Actor (User+Agent) per Team A W1
- **ADR-006** Delivery governance — branch protection, required CI checks
- **ADR-008** Technology stack — NestJS, Drizzle, PostgreSQL, Redis, S3
- **ADR-009** Deployment baseline — docker-compose, container-friendly worker
- **ADR-010** Database access strategy — Drizzle, explicit migrations, no domain dependence on persistence
- **ADR-011** Background jobs — BullMQ, idempotency, dead-letter, reconciliation jobs first-class, bounded-context-owned handlers
- **ADR-012** Interaction model — `/api/v1/...` HTTP for CRUD, in-process events for cross-context reactions, OpenAPI contracts

---

## Open Items

These do not block W0 but require resolution before later waves:

1. **Monorepo prerequisite.** Issues #1–#5 depend on Team A's Wave 0 implementation plan landing first (root `package.json`, `tsconfig.base.json`, npm workspace config, `contracts/` package, Vitest config). Sequence Team C W0 immediately after.
2. **CODEOWNERS is stale.** It references `apps/backend/src/<context>/` and `apps/worker/`, but the de facto codebase uses `modules/<context>/` and `worker/`. PR ownership routing will fail or be misassigned until CODEOWNERS is updated. Governor / Bryan task.
3. **CI workflow placeholders unchanged.** `.github/workflows/ci.yml` still uses `echo` placeholders for lint, unit, integration, contract, architecture, and build jobs. Every Team C exit criterion that says "tests pass" cannot be enforced by CI until placeholders are replaced. Governor / Bryan task.
4. **ADRs 008/010/011 are stale on layout.** They mandate `apps/backend/src/<context>/` and `apps/worker/`. The codebase now uses `modules/<context>/` and `worker/`. Either an ADR amendment or new ADR is needed to formalize the actual layout.
5. **No ADR for de facto stack standards.** Zod, Vitest, npm workspaces, Node 20, `@foundry/contracts` alias were chosen by Team A's plan without an ADR. A follow-on ADR (likely ADR-013) should formalize them.
6. **Notifications event contract** — Bryan owns notifications. Team C's automations emit notification-request events. The contract for that event needs to be agreed with Bryan before W4 #107.
7. **Self-host secrets management** — payment provider API keys, webhook signing secrets, S3 credentials. Not addressed in any ADR. Likely needs a feature ADR before W2 #54.
8. **Wave numbering collision.** This spec uses Team-C-internal Wave numbers (W0–W4). Capability Map uses project-wide Wave numbers (Wave 0–3). Team A spec also uses internal Wave numbers. Project-wide Wave naming should be reserved for the Capability Map; team specs should use a different label (e.g. "Phase").

---

## Summary

- **123 issues** across **5 waves**
- **Actor model adopted** from Team A — entitlements, audit, automation triggers, RSVP, attendance all Actor-keyed
- **`modules/<context>/` + `worker/` layout** — inherits Team A's Wave 0 implementation plan layout; CODEOWNERS and ADRs 008/010/011 are stale and need amendment
- **Contract-first** approach unblocks Teams A/B at end of W0
- **Worker runtime in W1** unblocks all teams to register job handlers
- **Idempotency, retries, dead-letter, reconciliation** treated as first-class per ADR-011
- **Cross-team unlocks** explicit at every wave boundary
- **Testing embedded** per wave; architecture tests in W4 enforce isolation
