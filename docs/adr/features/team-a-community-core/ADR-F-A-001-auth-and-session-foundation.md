# ADR-F-A-001: Auth and Session Foundation

- **Status:** Accepted
- **Date:** 2026-08-05
- **Owners:** Team A lead, paired agent
- **Related:** ADR-001, ADR-002, ADR-003, ADR-005, ADR-010, ADR-012
- **Linear Project:** Team A — Community Core ADRs
- **Linear Issue:** [THE-5](https://linear.app/thefoundryengine/issue/THE-5/adr-f-a-001-auth-and-session-foundation)

## Context

FoundryRooms needs a foundational auth and session system before any member-facing feature can be built. Without auth, there is no identity, no membership, no access control, and no audit trail.

Global ADR-005 defines the identity model (User, Community Membership, Role, Access Group, Entitlement) and mandates that all authorization decisions are enforced server-side. This feature ADR defines how sessions are created, validated, refreshed, and destroyed in the identity-access bounded context.

The system is a modular monolith (ADR-001) with hexagonal boundaries. Auth must live inside the identity-access bounded context and expose contracts that other teams (especially Team B for frontend) consume.

## Decision

### Session model
- **Opaque session tokens** (cryptographically secure random bytes, base64url-encoded, 43 chars)
- Token stored as SHA-256 hash in DB (plaintext never persisted)
- **Session record** persisted in the database for audit and revocation
- Session durations: SHORT (1h), DEFAULT (24h), EXTENDED (7d)
- Session carries actorId + actorType (User or Agent)

> **Note:** The original draft of this ADR specified JWT-based access tokens.
> The implementation uses opaque session tokens instead because:
> (1) every request already requires a DB lookup for authorization checks,
>     so JWT's stateless advantage doesn't apply;
> (2) opaque tokens are simpler to revoke and rotate;
> (3) no cross-service token verification is needed in a modular monolith.
> The ADR was updated to match the working, tested implementation.

### Auth flows
- **Register**: email + password → create user → create session → return session token (cookie)
- **Login**: email + password → validate → create session → return session token (cookie)
- **Refresh**: session token → validate + rotate token → return new session token
- **Logout**: delete session record + clear cookie
- **Password reset**: email-triggered reset flow with time-limited reset tokens

### Adapter boundaries
- `domain/`: User entity, Session entity, Actor entity, Agent entity, auth policies
- `application/`: RegisterUseCase, LoginUseCase, RefreshSessionUseCase, LogoutUseCase, ResetPasswordUseCase
- `adapters/`: password hashing adapter (bcrypt), session repository (Drizzle), auth middleware (NestJS)
- `contracts/`: AuthRequest/AuthResponse DTOs, session contract, auth contract

### Rules
- passwords hashed with bcrypt, minimum cost factor 12
- session tokens are opaque (not JWT) — SHA-256 hashed at rest
- session records are auditable (created, last accessed, expires)
- all auth endpoints enforce rate limiting at the adapter layer
- no auth logic in frontend — frontend consumes auth contracts only

## Consequences

### Positive
- simple, well-understood opaque token model
- server-side session records enable revocation and audit
- token rotation on refresh limits replay attack window
- clean contract boundary for Team B to consume
- no JWT complexity (no key management, no algorithm selection, no stateless illusion)

### Negative
- every request requires DB lookup to validate token (acceptable — authz needs it anyway)
- rate limiting must be tuned to avoid blocking legitimate users

## Rules implied by this decision
- no auth logic outside the identity-access bounded context
- no direct password storage or comparison outside the domain layer
- token shape is a contract — changes require contract test updates
- session revocation must be testable

## Implementation work (Linear sub-issues)

- [ ] [THE-9](https://linear.app/thefoundryengine/issue/THE-9): User and Session domain entities + invariants
- [ ] [THE-10](https://linear.app/thefoundryengine/issue/THE-10): Password hashing adapter (bcrypt)
- [ ] [THE-11](https://linear.app/thefoundryengine/issue/THE-11): JWT adapter (sign, verify, decode)
- [ ] [THE-12](https://linear.app/thefoundryengine/issue/THE-12): Session repository (create, find, revoke, rotate)
- [ ] [THE-22](https://linear.app/thefoundryengine/issue/THE-22): Register use case + contract
- [ ] [THE-23](https://linear.app/thefoundryengine/issue/THE-23): Login use case + contract
- [ ] [THE-24](https://linear.app/thefoundryengine/issue/THE-24): Refresh session use case + contract
- [ ] [THE-25](https://linear.app/thefoundryengine/issue/THE-25): Logout use case + contract
- [ ] [THE-26](https://linear.app/thefoundryengine/issue/THE-26): Password reset flow + contract
- [ ] [THE-27](https://linear.app/thefoundryengine/issue/THE-27): Auth middleware (token validation, session check)
- [ ] [THE-28](https://linear.app/thefoundryengine/issue/THE-28): Rate limiting on auth endpoints
- [ ] [THE-29](https://linear.app/thefoundryengine/issue/THE-29): Auth contract tests + fixtures

## Dependencies

- ADR-005 (identity model) — accepted
- ADR-003 (data and tenancy) — accepted
- ADR-010 (database access strategy) — accepted
- Team B consumes auth contracts for frontend login/register flows
- Team C consumes session model for worker auth (if needed)
