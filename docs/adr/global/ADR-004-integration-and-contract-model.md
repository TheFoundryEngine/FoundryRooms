# ADR-004: Integration, Contracts, Events, and Parallel Delivery Model

- **Status:** Accepted
- **Date:** 2026-04-02
- **Owners:** Architecture lead, Governor Agent, all team leads

## Context

Three teams need to deliver in parallel without waiting on each other unnecessarily. Past projects suffered from drift between backend contracts, frontend expectations, mocks, fixtures, and database-backed implementations.

## Decision

FoundryRooms will use a **contract-first integration model**.

## Rules

### Shared contracts must live in the repository
This includes:
- API request and response shapes
- event payload definitions
- shared fixtures
- mock payloads
- frontend DTO expectations where relevant

### Every shared contract has an owner
A bounded context owner must be named for each shared contract.

### Contract changes are not local-only
A PR that changes a contract must also update:
- contract definitions
- fixtures
- mocks
- contract tests
- consumers or compatibility handling

### Parallel development rule
If a downstream implementation is not ready, teams proceed using:
- the approved contract
- generated or maintained mocks from that contract
- contract tests to keep both sides aligned

### Integration style
- use synchronous application interfaces for tightly coupled local workflows where approved
- use events for cross-context reactions and asynchronous workflows
- use jobs for retries, notifications, webhooks, and deferred side effects

## Consequences

### Positive
- lowers blocking between teams
- surfaces drift earlier in CI
- keeps frontend and backend aligned

### Negative
- requires deliberate contract ownership and discipline
- adds up-front work for fixtures, mocks, and tests
