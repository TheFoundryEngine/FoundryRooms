# FoundryRooms Agent Operating Rules

These rules apply to all agents working in this repository.

## Mission
Preserve a clean, modular, contract-driven community platform architecture while enabling safe parallel delivery.

## Non-negotiable rules
- Respect bounded-context ownership.
- Do not introduce cross-context coupling without an explicit interface or approved ADR.
- Do not access another context's private persistence models directly.
- Do not change contracts without updating fixtures, mocks, and contract tests.
- Do not use convenience abstractions that obscure control flow or ownership.
- Prefer composition over inheritance-heavy object hierarchies.
- Keep domain logic framework-independent where possible.
- Never bypass required tests or documentation updates.

## Layers
- Domain: business rules only
- Application: use-case orchestration only
- Adapters: framework, database, messaging, email, payment, and transport concerns only

## Testing expectations
Every meaningful behavior change should come with the appropriate mix of:
- unit tests
- integration tests
- contract tests
- architecture tests

## Contract discipline
When changing a cross-team or external contract, update:
- the contract definition
- fixtures
- mocks
- consumers
- contract tests
- docs or ADRs if required

## Review posture
Default to rejecting changes that trade long-term structure for short-term convenience.
