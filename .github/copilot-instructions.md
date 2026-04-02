# FoundryRooms Optional GitHub Agent Platform Instructions

This file exists only for compatibility with GitHub's current agent platform features.

It is **not** the primary source of truth for architecture or governance.
The source of truth is:
1. `docs/spec/HIGH_LEVEL_SPEC.md`
2. `docs/adr/`
3. `docs/governance/DEVELOPMENT_GOVERNANCE.md`
4. `AGENTS.md`

## When acting through GitHub's agent platform
- keep code inside the correct bounded context
- prefer explicit composition and clear application services
- keep domain logic free of framework and transport concerns
- generate tests with behavior changes
- update contracts, fixtures, and mocks together
- preserve stable public API and event contracts
- document architecture-significant changes in ADRs

## Never do
- create cross-context imports without explicit interfaces
- read or write another context's private persistence structures
- introduce inheritance-heavy or magical abstractions that reduce clarity
- create shared utility dumping grounds
- leak ORM models into API contracts
- bypass tests or required documentation

## Review expectations
Assume code owner review, governor review, and required CI checks will examine:
- cohesion and coupling
- architecture boundaries
- contracts
- tests
- ADR alignment
