# ADR-006: Delivery Governance, Testing, and Anti-Drift Enforcement

- **Status:** Accepted
- **Date:** 2026-04-02
- **Owners:** Architecture lead, Governor Agent, all team leads

## Context

The project uses three human developers with paired agents and a governor-controlled `main` branch. Previous projects suffered from architecture drift, weak boundaries, mock divergence, and abstraction-heavy code that hid control flow and ownership.

## Decision

FoundryRooms will enforce a governed delivery model with mandatory testing and continuous anti-drift controls.

## Required controls

### Branch governance
- `main` is protected
- no direct pushes to `main`
- pull requests are required
- code owner review is required
- required checks must pass before merge

### Required test categories
- unit tests for domain and deterministic use cases
- integration tests for persistence, jobs, handlers, and infrastructure-backed behavior
- contract tests for frontend-backend and cross-context agreements
- architecture tests for layer and dependency rules
- end-to-end tests for critical user journeys

### Coding rules
- prefer composition over inheritance-heavy OOP designs
- do not introduce abstractions that obscure ownership or control flow
- do not place business rules in controllers, views, or adapters
- do not bypass contract updates when changing external behavior

### Drift control
- weekly lightweight codebase health review
- monthly architecture and dependency review
- quarterly ADR and boundary audit

## Consequences

### Positive
- better long-term cohesion and lower accidental coupling
- fewer broken integrations caused by stale contracts or mocks
- clearer review and merge standards for humans and agents

### Negative
- stricter delivery discipline increases short-term effort
- PRs may need more documentation and test work before merge
