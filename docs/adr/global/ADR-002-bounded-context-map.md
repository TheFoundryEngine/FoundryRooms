# ADR-002: Initial Bounded Context Map and Team Ownership

- **Status:** Accepted
- **Date:** 2026-04-02
- **Owners:** Architecture lead, Governor Agent, domain team leads

## Context

FoundryRooms needs a context map that allows three delivery teams to work in parallel with minimal blocking while preserving strong cohesion and low coupling.

The product goal is a community platform first, not a collaborative coding runtime.

## Decision

The initial bounded contexts are:

1. **Identity & Access**
2. **Community Structure**
3. **Engagement**
4. **Resources**
5. **Events**
6. **Commerce**
7. **Notifications**
8. **Automation**
9. **Admin & Reporting**

## Ownership

### Team A — Community Core
Owns:
- Identity & Access
- Community Structure

### Team B — Experience Layer
Owns:
- Engagement
- Resources
- member-facing notification read models and UI contracts

### Team C — Operations & Monetization
Owns:
- Events
- Commerce
- Automation
- Admin & Reporting foundations

## Dependency rules

### Allowed dependency direction
- presentation layers may call application services through approved interfaces
- application logic may depend on domain logic in the same context
- adapters may depend on application and domain logic in the same context
- cross-context interaction must happen through explicit contracts, published events, or approved application interfaces

### Forbidden patterns
- direct access to another context's tables or repositories
- importing another context's internal persistence models
- leaking ORM entities into external contracts
- shared helper modules that hide cross-context dependencies

## Consequences

### Positive
- clearer ownership and review paths
- parallel delivery with mocks and contract tests
- simpler CODEOWNERS setup

### Negative
- some workflows will span multiple contexts and need explicit orchestration
- cross-context coordination requires discipline and documented contracts
