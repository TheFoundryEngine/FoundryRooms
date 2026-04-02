# ADR-011: Background Jobs and Workflow Execution

**Status:** Proposed  
**Date:** 2026-04-02  
**Owners:** Governor Agent / Project Architecture Group  
**Related:** ADR-001, ADR-002, ADR-004, ADR-006, ADR-008, ADR-009, ADR-010

## 1. Context

FoundryRooms requires reliable asynchronous execution for core product behavior, including:

- email delivery
- notification fan-out
- event reminders
- webhook ingestion and reconciliation
- membership and entitlement updates after billing events
- content processing tasks
- digest generation
- moderation follow-up actions
- simple operational automations

The platform is being built as:

- a modular monolith
- a DDD + hexagonal backend
- a self-hostable open-source product
- a future managed hosted offering

This means the job and workflow layer must be:

- self-hostable
- explicit and testable
- aligned with bounded-context ownership
- reliable under retry and failure conditions
- disciplined enough not to let automation logic leak across module boundaries

A major risk in systems like this is allowing background processing to become an ungoverned side-channel where business logic is duplicated, contracts drift, and hidden coupling grows between modules.

## 2. Decision

FoundryRooms will use the following default model for asynchronous execution in v1:

- **Redis-backed job queueing** for background task execution
- **BullMQ** as the default queue and worker toolkit
- a separate **worker process** for async execution
- **domain events** as the primary trigger mechanism for internal automation
- **application services** as the place where jobs are scheduled
- **bounded-context-owned job handlers** inside the backend
- **simple workflow orchestration** implemented in code, not a no-code workflow engine

## 3. Architectural position

## 3.1 What the async layer is for

The async layer exists to handle work that should not block the user-facing request path, including:

- external I/O
- retries
- delayed execution
- fan-out actions
- batch processing
- reconciliation
- long-running operations

## 3.2 What the async layer is not for

The async layer is **not** a second backend architecture.

It must not become:

- a dumping ground for business logic that should live in domain/application
- a cross-context shortcut that bypasses contracts
- an uncontrolled workflow platform
- a hidden integration layer with unversioned payloads

## 4. Default execution model

## 4.1 Request path

The normal rule is:

1. inbound adapter receives request/event/webhook
2. application use case executes business logic
3. domain events are raised where appropriate
4. application layer commits state changes
5. jobs are enqueued for follow-up async work

## 4.2 Worker path

The worker process:

1. reads jobs from BullMQ queues
2. validates payload shape
3. loads the appropriate bounded-context application service
4. executes the task through application-layer entrypoints
5. records outcome, retries, or dead-letter behavior as needed

## 4.3 Scheduling model

Delayed and scheduled work is allowed for:

- reminders
- digest generation
- cleanup tasks
- reconciliation tasks
- deferred notifications

Scheduling must still enter through bounded-context application services and must not call persistence adapters directly.

## 5. Why BullMQ + Redis is the default

BullMQ + Redis is chosen because it fits the project’s priorities:

- self-hostable
- mature in Node/TypeScript environments
- explicit queue semantics
- supports retries, delayed jobs, concurrency controls, and repeatable jobs
- easy to package with Docker in OSS deployments
- compatible with a modular monolith plus separate worker process

This is a better default fit than a managed-only workflow platform because FoundryRooms is intended to support both:

- self-hosted community instances
- a paid hosted version operated by FoundryRooms

## 5.1 Managed workflow tools remain optional later

Managed workflow/job platforms may be introduced later as replaceable infrastructure adapters for the hosted offering.

However, the open-source reference architecture must not depend on a managed workflow vendor in order to function.

## 6. Bounded-context ownership rules

## 6.1 Every queue consumer belongs to a bounded context

Each job handler must belong to a single bounded context.

Examples:

- `commerce` owns billing reconciliation jobs
- `notifications` owns email and in-app delivery jobs
- `events` owns reminder scheduling jobs
- `identity-access` owns invitation expiration or access-sync jobs

## 6.2 No shared god-workers

FoundryRooms will not use a single generic worker service with arbitrary cross-context logic.

A shared worker runtime is allowed, but the code inside it must remain organized by bounded context.

## 6.3 Cross-context automation goes through contracts

If one bounded context triggers async work in another, it must do so via:

- an explicit domain/integration event
- a defined payload contract
- versioned handlers where needed
- tests covering the producer/consumer contract

No context may enqueue opaque payloads directly into another context’s internal queue shape.

## 7. Workflow execution model

## 7.1 v1 workflow style

FoundryRooms v1 will use **code-defined workflows**, not a user-facing visual workflow engine.

Examples:

- member joins community -> enqueue welcome email
- member buys plan -> recompute entitlements -> send confirmation
- event starts tomorrow -> schedule reminder notifications
- flagged content -> notify moderators and create moderation work item

## 7.2 Where workflow logic lives

Workflow orchestration belongs in the **application layer** of the owning bounded context.

This means:

- domain decides business rules and invariants
- application coordinates use cases and side effects
- worker executes async follow-up via application entrypoints
- adapters handle queue/storage/provider integrations

## 7.3 No business rules hidden in queue handlers

Queue handlers should remain thin.

They may:

- validate payloads
- load context
- invoke application services
- handle retry/reporting concerns

They must not become the place where core business rules are invented.

## 8. Payload and contract rules

## 8.1 Job payloads are contracts

Every durable job payload is a governed contract.

That means job payloads must be:

- explicit
- typed
- versionable when necessary
- owned by a bounded context
- tested

## 8.2 Payload minimalism

Job payloads should contain only what is necessary.

Prefer:

- stable identifiers
- version markers when needed
- compact immutable facts

Avoid:

- serializing large mutable aggregates
- embedding ORM-shaped objects
- passing frontend DTOs into queue payloads

## 8.3 Database/backend model synchronization applies here too

Async payloads must stay synchronized with:

- domain model changes
- persistence changes where relevant
- contract changes
- fixtures/mocks
- test builders

A feature that changes queue payload shape is not complete until:

- producer code is updated
- consumer code is updated
- fixtures are updated
- contract tests are updated
- migration or read-model implications are reviewed

## 9. Reliability rules

## 9.1 Idempotency is required

All externally visible async jobs must be designed for safe retry.

This applies especially to:

- billing webhooks
- entitlement updates
- notification delivery
- reminder scheduling
- moderation escalations

## 9.2 Retries must be explicit

Each job type must define:

- retry policy
- backoff strategy
- terminal failure behavior
- alerting/logging expectations

## 9.3 Dead-letter behavior

Critical jobs must have a clear failure path.

At minimum, the system must support:

- failure visibility
- manual replay where appropriate
- dead-letter or equivalent failure isolation for repeated failures

## 9.4 At-least-once mindset

The system should assume at-least-once delivery semantics for background work and design handlers accordingly.

## 10. Webhooks and external integrations

## 10.1 Webhooks enter through inbound adapters

External webhook traffic must enter through backend inbound adapters.

The inbound adapter is responsible for:

- signature verification
- basic validation
- minimal translation into application commands/events
- enqueueing follow-up work where needed

## 10.2 Reconciliation jobs are first-class

For critical integrations such as payments, the system must support reconciliation jobs in addition to webhook-triggered updates.

This reduces the risk of permanent state drift when a webhook is delayed, duplicated, or missed.

## 11. Testing requirements

The following tests are required for async flows:

### 11.1 Unit tests

For:

- workflow/application orchestration
- retry rules
- idempotency decisions
- handler branching logic

### 11.2 Integration tests

For:

- queue producer -> worker -> application path
- Redis/BullMQ interaction where appropriate
- persistence side effects

### 11.3 Contract tests

For:

- job payload schemas
- producer/consumer compatibility
- webhook adapter translation contracts

### 11.4 End-to-end tests

For the highest-value flows, such as:

- purchase -> entitlement -> confirmation
- event creation -> reminder scheduling -> delivery
- member invitation -> acceptance -> welcome automation

## 12. Repository structure implications

FoundryRooms will keep a dedicated worker app/process, while job ownership remains with bounded contexts.

Example shape:

```text
/apps
  /backend
    /src
      /commerce
      /notifications
      /events
      ...
  /worker
    /src
      /bootstrap
      /runtime
      /queues
      /bindings
/contracts
  /events
  /fixtures
  /mocks
```

Within each bounded context under `apps/backend/src/<context>/`, async logic should remain aligned with DDD + hexagonal boundaries, for example:

```text
/notifications
  /domain
  /application
    /use-cases
    /workflows
    /ports
  /adapters
    /inbound
    /outbound
      /queue
      /email
  /contracts
  /tests
```

## 13. Consequences

### Positive

- self-hostable async infrastructure
- clean fit with Docker-based deployment
- explicit and testable background processing
- better boundary discipline than ad hoc async utilities
- strong fit for OSS and managed-hosted distribution models

### Negative

- Redis becomes additional operational infrastructure
- workers add deployment complexity compared to a request-only app
- poorly governed jobs could still create coupling if reviews are weak
- retry/idempotency discipline requires consistent engineering effort

## 14. Rules for the Governor Agent

The Governor Agent must reject or flag changes that:

- place core business logic only in queue handlers
- enqueue undocumented cross-context payloads
- bypass application services when processing jobs
- introduce async flows without idempotency/retry considerations
- change durable payload contracts without updating tests and fixtures
- tightly couple the open-source reference deployment to a managed-only workflow vendor

## 15. Follow-on ADRs

This ADR sets up the next decisions around:

- notification provider strategy
- email delivery strategy
- observability and operational monitoring
- search/indexing pipelines
- future visual workflow builder or automation UI

