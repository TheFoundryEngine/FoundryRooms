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
- Never bypass pre-commit or pre-push hooks with `--no-verify`. If a hook fails, fix the issue.

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

## Local hooks
This repo uses husky git hooks (installed automatically via `npm install`):
- **pre-commit**: `lint-staged` runs eslint on staged `.ts` files
- **pre-push**: unit tests + architecture boundary tests + contract tests + build

If a hook rejects your commit or push, fix the issue. Do not use `--no-verify` to bypass hooks. See `docs/governance/DEVELOPMENT_GOVERNANCE.md` §12.1 for full details.

## Architecture boundary tests
Architecture boundaries are enforced deterministically by dependency-cruiser:
- Config: `.dependency-cruiser.js`
- Tests: `tests/architecture/boundary.test.ts`
- Run: `npm run arch:test`

Rules enforced: cross-context isolation, hexagonal layering, domain framework independence, contract purity. If an architecture test fails, fix the import — do not weaken the rule. Rule changes require an ADR.
