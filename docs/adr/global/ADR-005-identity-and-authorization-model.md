# ADR-005: Identity, Roles, Access Groups, and Entitlements

- **Status:** Accepted
- **Date:** 2026-04-02
- **Owners:** Architecture lead, Governor Agent, Team A lead

## Context

FoundryRooms is a community platform where access to spaces, content, events, and paid features depends on identity, role, segmentation, and purchase state.

Authorization mistakes in this area would directly affect security, product correctness, and monetization.

## Decision

Identity and authorization will be treated as a first-class bounded context and system concern.

### Core concepts
- **User** — account identity
- **Community Membership** — relationship between a user and a community
- **Role** — owner, admin, moderator, member, or future approved roles
- **Access Group** — segmentation unit used to grant visibility or capability
- **Entitlement** — access granted by membership state, purchase, subscription, role, or system policy

### Rules
- all authorization decisions must be enforced server-side
- UI checks are convenience only, not security controls
- entitlements must be represented explicitly and not inferred ad hoc across the codebase
- paid access changes must be tied to commerce events and reconciled reliably
- membership, role, access group, and entitlement changes must be auditable

## Consequences

### Positive
- consistent access control model across the product
- easier reasoning about gated content and paid areas
- fewer ad hoc permission checks scattered through the codebase

### Negative
- requires careful design of policies and tests early
- adds up-front modeling cost
