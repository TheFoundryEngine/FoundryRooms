# ADR-001: System Shape — Modular Monolith with DDD and Hexagonal Boundaries

- **Status:** Accepted
- **Date:** 2026-04-02
- **Owners:** Architecture lead, Governor Agent, domain team leads

## Context

FoundryRooms v1 is a Heartbeat-like community platform with strong relational requirements around members, access, content, events, commerce, notifications, and admin operations.

The team consists of three human developers working in parallel with paired agents. The delivery model needs strong internal boundaries, low operational overhead, and governance that can be enforced continuously.

A microservice-first approach would increase operational cost, contract coordination cost, and release complexity too early.

## Decision

FoundryRooms v1 will be built as a **modular monolith**.

The backend will use:
- **DDD** to define bounded contexts, domain language, and ownership
- **hexagonal architecture** to separate domain/application logic from infrastructure and frameworks
- **contract-first integration** for cross-context and frontend-backend interactions

### Required layering inside each bounded context
- `domain/` — entities, value objects, policies, invariants, domain services where necessary
- `application/` — use cases, commands, queries, orchestration
- `adapters/` — HTTP, persistence, messaging, email, payments, jobs, third-party integration
- `contracts/` — API/event/request-response contracts that must remain stable and testable

## Consequences

### Positive
- one deployable system for faster iteration
- lower operational complexity for a small team
- easier architecture enforcement by tests and governor review
- clearer ownership by bounded context
- easier transactional consistency across related features in early stages

### Negative
- must actively prevent internal coupling
- modules can decay into a big ball of mud without governance
- scale boundaries are logical at first, not physical

## Rules implied by this decision
- no direct cross-context persistence access without explicit approval
- no framework or ORM logic in domain code
- no shared utility dumping grounds used to bypass boundaries
- all architecture-significant deviations require a new ADR
