# ADR-010: Database Access Strategy and Database/Backend Model Synchronization

**Status:** Proposed  
**Date:** 2026-04-02  
**Owners:** Governor Agent / Project Architecture Group  
**Related:** ADR-001, ADR-002, ADR-003, ADR-004, ADR-006, ADR-008, ADR-009

## 1. Context

FoundryRooms is being built as a modular monolith with:

- PostgreSQL as the primary system of record
- DDD + hexagonal boundaries in the backend
- explicit bounded contexts
- contract-first delivery across frontend, backend, jobs, and integrations
- a self-hostable OSS deployment model and a future managed hosted offering

A major source of architectural drift in systems like this is not only the database choice itself, but the loss of synchronization between:

1. the **domain model** in the backend
2. the **persistence schema** in the database
3. the **contracts** consumed by the frontend, workers, and integrations

When these drift apart, teams encounter:
- broken migrations
- stale fixtures and mocks
- controllers leaking persistence concerns
- database tables that no longer reflect business language
- silent contract mismatches between frontend and backend
- brittle abstractions and accidental coupling across contexts

This ADR therefore decides both:
- the **default database access strategy**, and
- the **synchronization rules** between backend modelling and relational schema evolution.

## 2. Decision

### 2.1 Primary database and access approach

FoundryRooms will use:

- **PostgreSQL** as the primary relational system of record
- a **SQL-forward, low-magic TypeScript data access layer**
- **Drizzle** as the default ORM/query/schema toolkit for v1
- explicit SQL migration files generated and reviewed as part of normal delivery

### 2.2 Model synchronization rule

FoundryRooms will treat data modelling as a **two-layer truth model with one contract boundary**, not as three unrelated modelling systems.

#### Layer A — Domain truth
Inside each backend bounded context, the **domain model** is the source of truth for:
- business language
- invariants
- aggregate boundaries
- policies
- domain events
- use-case intent

#### Layer B — Persistence truth
Inside each backend bounded context, the **Drizzle/PostgreSQL schema** is the source of truth for:
- tables
- columns
- foreign keys
- indexes
- nullability
- uniqueness
- migration history
- persistence-specific read models

#### Contract boundary
The **contracts layer** is the source of truth for:
- API payload shapes
- event schemas
- fixtures
- mocks
- consumer-facing compatibility expectations

### 2.3 Anti-drift policy

No change is complete unless all affected layers are updated together.

If a feature changes business behaviour and persistence shape, the same change stream must update:
- domain model
- persistence schema
- migration files
- repository/adapter mapping
- contracts
- fixtures/mocks
- tests

## 3. Rationale

### 3.1 Why PostgreSQL remains the foundation

PostgreSQL is the right fit for FoundryRooms because the product is primarily relational:
- memberships
- roles
- entitlements
- communities
- spaces/channels
- events
- documents/resources
- subscriptions and purchases

PostgreSQL foreign keys and constraints are important here because they enforce referential integrity between related data and keep relationships explicit in a way that matches the product’s consistency needs. citeturn636743search2turn636743search14

### 3.2 Why Drizzle is selected as the default data access layer

Drizzle is selected because it best supports the architectural style already chosen:
- it is SQL-like rather than heavily abstracting away SQL
- it works directly with PostgreSQL drivers
- it supports a codebase-first workflow where schema is expressed in TypeScript
- it can generate SQL migration files from schema changes

Drizzle’s own documentation explicitly describes a codebase-first approach where the TypeScript schema acts as the source of truth and Drizzle Kit generates SQL migration files from schema changes. It also documents native PostgreSQL support via standard drivers. citeturn636743search0turn636743search6turn636743search18turn636743search21

This is a strong fit for FoundryRooms because it reduces hidden ORM magic while still giving the team typed schemas and repeatable migrations.

### 3.3 Why Prisma is not the default

Prisma remains a valid alternative and has strong migration and type-safety tooling. Prisma documents that its Prisma schema is the main configuration method for the ORM and that Prisma Migrate keeps the database schema in sync with the Prisma schema while generating a history of SQL migration files. citeturn636743search1turn636743search13turn636743search19

However, for FoundryRooms, Prisma is not selected as the default because:
- it introduces a stronger framework-specific modelling layer centered around `schema.prisma`
- it is more likely to encourage an additional abstraction layer between domain concepts and relational design
- the project’s governance model prefers being closer to SQL and PostgreSQL semantics, not further away from them

Prisma is not rejected as “bad”; it is simply a weaker fit for the anti-drift and low-abstraction posture of this project.

## 4. Database and backend model synchronization rules

## 4.1 No triple-model drift

The project must avoid having three disconnected models for the same concept:

- a domain model that says one thing
- a database schema that says another
- DTOs/contracts that say a third thing

There must always be an explicit mapping path between:
- `domain/`
- `application/`
- `adapters/outbound/persistence/`
- `contracts/`

## 4.2 Domain does not equal database table

DDD is not “database-first entity design.”

The domain model should express business meaning and invariants.
The persistence model should express how that meaning is stored and queried efficiently.

This means:
- not every domain object maps one-to-one to a table
- not every table maps one-to-one to a public contract
- read models may differ from write-side aggregate structures
- denormalized query shapes are allowed where justified

But those differences must be **explicit** and **tested**.

## 4.3 Every bounded context owns its persistence model

Each backend bounded context owns:
- its schema definitions
- its repositories and persistence adapters
- its migrations for its tables and indexes
- its contract mappings

No other bounded context may write directly into another context’s tables without an explicit ADR-level exception.

## 4.4 Shared database does not mean shared ownership

FoundryRooms is a modular monolith using one primary PostgreSQL instance, but that does **not** make it a shared-data free-for-all.

Within a shared database:
- ownership is still by bounded context
- foreign keys across contexts must be deliberate, rare, and reviewed
- read access across contexts should prefer explicit application/service boundaries or projection/read models where possible

## 4.5 Schema evolution must be explicit

Every schema change must include:
- Drizzle schema update
- generated or hand-reviewed SQL migration
- backward/forward compatibility assessment where relevant
- fixture and mock updates if contract shapes or seeded data change
- integration and contract test updates

No direct schema mutation in production environments may bypass the migration history.

## 4.6 Domain, persistence, and contract changes must move together

The default rule is:

> one feature change, one coherent PR stream

If a feature changes both business logic and persistence, the same work item must carry:
- domain changes
- persistence schema changes
- repository/mapper changes
- contract changes
- test updates

This rule exists specifically to stop drift between backend modelling and database schema.

## 4.7 Fixtures and mocks are governed artifacts

Fixtures and mocks are not disposable conveniences.
They are part of the synchronization model.

When a contract or persistence shape changes, the associated:
- fixtures
- mock handlers
- seeded dev data
- test builders

must be updated in the same work stream.

## 5. Repository structure implications

The structure below is required in each backend bounded context:

```text
/apps/backend/src/<bounded-context>/
  domain/
  application/
  adapters/
    inbound/
    outbound/
      persistence/
  contracts/
  tests/
```

The persistence adapter layer is where Drizzle schema definitions, query code, repository implementations, and mapping logic belong.

The domain layer must not import:
- Drizzle schema objects
- SQL query code
- framework persistence decorators
- infrastructure concerns

## 6. Testing implications

The following testing rules apply.

### 6.1 Domain tests
Validate:
- invariants
- policies
- aggregate behaviour
- domain services

These tests must not require the database.

### 6.2 Persistence integration tests
Validate:
- schema correctness
- migrations
- repository implementations
- query behaviour
- transaction boundaries

These tests run against PostgreSQL, not mocks.

### 6.3 Contract tests
Validate:
- DTO and API compatibility
- event payload compatibility
- fixture accuracy
- mapping consistency between domain/application outputs and public contracts

### 6.4 Architecture tests
Validate:
- domain does not depend on persistence or framework code
- bounded contexts do not illegally cross-import persistence concerns
- contracts are updated when required artifacts change

## 7. Migration policy

### 7.1 Production migration rule

Production schema evolution must happen through reviewed migration files only.

### 7.2 Migration review rule

Every migration review must assess:
- locking risk
- data backfill needs
- reversibility or rollback posture
- effect on seeded data and fixtures
- effect on contracts and read models

### 7.3 Destructive change rule

Destructive changes require explicit phased rollout planning where necessary.
Examples include:
- dropping columns
- renaming columns used by multiple layers
- splitting tables
- changing nullability on populated columns
- changing key relationships

## 8. Consequences

### Positive
- lower risk of schema/application drift
- clearer database ownership by bounded context
- stronger alignment between DDD and persistence design
- lower abstraction burden than a heavier ORM stack
- easier review of relational changes through explicit SQL migrations
- better long-term maintainability for OSS contributors and self-hosters

### Negative
- more explicit mapping code than a more magical ORM may require
- more review discipline needed for schema changes
- developers must remain comfortable with SQL and relational design, not only ORM APIs

## 9. Explicit rules implied by this decision

1. PostgreSQL remains the only primary system of record unless superseded by ADR.
2. Drizzle is the default database access and schema toolkit for v1.
3. Every schema change must land with reviewed migration files.
4. Domain model changes and persistence changes must be synchronized in the same work stream when related.
5. Fixtures, mocks, and seeded dev data must be treated as governed artifacts.
6. No bounded context may write directly to another context’s tables without an approved exception.
7. The domain layer must remain persistence-agnostic.
8. SQL literacy is a project expectation for backend contributors.

## 10. Follow-on ADRs likely required

- ADR-011: Background jobs and workflow execution
- ADR-012: Object storage and media handling
- ADR-013: Video rooms and conferencing subsystem
- ADR-014: AI-assisted product capabilities and provider strategy
