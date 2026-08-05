# ADR-F-C-001: Worker and Job Runtime Baseline

- **Status:** Proposed
- **Date:** 2026-08-05
- **Owners:** Team C lead, paired agent
- **Related:** ADR-004, ADR-011, ADR-012
- **Linear Project:** Team C — Ops & Monetization ADRs
- **Linear Issue:** [THE-7](https://linear.app/thefoundryengine/issue/THE-7/adr-f-c-001-worker-and-job-runtime-baseline)

## Context

ADR-011 defines the background job and workflow execution model: Redis-backed BullMQ queues, a separate worker process, domain events as triggers, and bounded-context-owned job handlers. Before any async feature (notifications, email, reminders, billing reconciliation) can be built, the worker runtime itself must exist and be testable.

This feature ADR defines the concrete worker process scaffold, queue setup, and handler registration pattern that all Team C async work builds on.

## Decision

### Worker process
- Separate Node.js process (`worker/`) running alongside the API server
- Shared module imports from the backend bounded contexts (same codebase, different entrypoint)
- Graceful shutdown: drain queues on SIGTERM, finish in-flight jobs, then exit

### Queue setup
- **BullMQ** queues defined per bounded context:
  - `notifications` — email and in-app delivery
  - `commerce` — billing reconciliation, entitlement sync
  - `events` — reminder scheduling
  - `identity-access` — invitation expiration, access sync
- Redis connection configured via env (`REDIS_URL`)
- Queue names are constants, not magic strings

### Handler registration
- Each bounded context registers its own handlers in its module
- Handler interface: `{ name, schema, handle(payload) }`
- Payload validation via typed schema before processing
- Handlers call application-layer entrypoints, never persistence adapters directly

### Retry and failure
- Default retry: 3 attempts with exponential backoff
- Dead-letter queue for jobs that exhaust retries
- Failed jobs logged with: job name, payload, error, attempt count
- Critical jobs (billing, entitlements) have alerting on failure

### Monitoring
- Job metrics exposed: queue depth, processing time, failure rate
- Health check endpoint on worker process (`/health`)
- Worker status visible in admin reporting (later phase)

### Rules
- no business logic in job handlers — they call application services
- no cross-context queue access — each context owns its queues
- job payloads are typed contracts, not opaque objects
- all jobs must be idempotent (safe to retry)

## Consequences

### Positive
- clean foundation for all async features
- bounded-context ownership enforced at the queue level
- retry and failure handling built in, not bolted on
- testable in isolation with mock Redis

### Negative
- worker process adds operational complexity (separate process to run/monitor)
- Redis dependency for local dev (mitigated with Docker)
- idempotency requirement adds design cost per job type

## Rules implied by this decision
- no god-workers with cross-context logic
- no opaque payloads — all job payloads are typed contracts
- no direct persistence access from job handlers
- worker process must be included in Docker and deployment configs

## Implementation work (Linear sub-issues)

- [ ] [THE-16](https://linear.app/thefoundryengine/issue/THE-16): Worker process entrypoint + graceful shutdown
- [ ] [THE-17](https://linear.app/thefoundryengine/issue/THE-17): BullMQ queue definitions (per bounded context)
- [ ] [THE-18](https://linear.app/thefoundryengine/issue/THE-18): Job handler interface + registration pattern
- [ ] [THE-37](https://linear.app/thefoundryengine/issue/THE-37): Redis connection config + env setup
- [ ] [THE-38](https://linear.app/thefoundryengine/issue/THE-38): Payload validation (typed schema per job type)
- [ ] [THE-39](https://linear.app/thefoundryengine/issue/THE-39): Retry policy + exponential backoff config
- [ ] [THE-40](https://linear.app/thefoundryengine/issue/THE-40): Dead-letter queue setup
- [ ] [THE-41](https://linear.app/thefoundryengine/issue/THE-41): Job metrics + health check endpoint
- [ ] [THE-42](https://linear.app/thefoundryengine/issue/THE-42): Worker Docker config + docker-compose for local Redis
- [ ] [THE-43](https://linear.app/thefoundryengine/issue/THE-43): Worker integration tests (mock Redis, end-to-end job flow)
- [ ] [THE-44](https://linear.app/thefoundryengine/issue/THE-44): Sample handler per context (proves the pattern)

## Dependencies

- ADR-011 (background jobs) — accepted
- ADR-004 (integration and contract model) — accepted
- ADR-009 (deployment model) — accepted (for Docker config)
- Team A identity-access context — needed for access-sync job handlers
- All teams consume the worker runtime for their async work
