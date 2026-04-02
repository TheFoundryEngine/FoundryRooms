# ADR-003: Relational Data Architecture and Tenancy Model

- **Status:** Accepted
- **Date:** 2026-04-02
- **Owners:** Architecture lead, Governor Agent, Team A and Team C leads

## Context

FoundryRooms v1 requires strong relational modeling for:
- communities
- members
- roles and access groups
- spaces and channels
- posts and resources
- events and attendance
- offers, subscriptions, purchases, and entitlements

The system must support reliable transactions, reporting, auditability, and strict ownership of data by bounded context.

## Decision

FoundryRooms v1 will use a **relational database as the system of record**.

### Tenancy model
- the system will support multiple communities within one application
- tenancy will be modeled primarily at the application and data level using a `community_id` or equivalent ownership boundary where appropriate
- access control must never rely only on UI filtering; it must be enforced server-side

### Data ownership rule
Each bounded context owns its tables and migrations.

Cross-context reads should prefer:
1. approved application interfaces
2. read models
3. integration events or projections

Direct cross-context writes to private tables are forbidden.

### Schema change rule
Schema changes require:
- migration files
- ownership notes in the PR
- contract updates if exposed externally
- tests covering migration-sensitive behavior

## Consequences

### Positive
- strong support for joins, transactions, and reporting
- simpler reasoning about entitlements and membership state
- easier auditability for commerce and admin actions

### Negative
- internal discipline is needed to avoid turning the shared database into a shared free-for-all
- some projections or read models may be needed to avoid unsafe cross-context queries
