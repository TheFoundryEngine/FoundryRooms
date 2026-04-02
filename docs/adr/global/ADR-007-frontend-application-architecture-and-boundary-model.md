# ADR-007: Frontend application architecture and boundary model

**Status:** Proposed  
**Date:** 2026-04-02  
**Owners:** Project architect, governor agent, Team B (experience) with review by Team A and Team C

## Context

FoundryRooms has chosen a **modular monolith** for v1 with **DDD + hexagonal architecture** enforced on the backend. We have not yet selected the exact frontend framework or backend runtime framework. We therefore need a frontend architecture decision that:

1. stays compatible with multiple modern web frameworks,
2. keeps the frontend clearly separated from the backend,
3. preserves strong contracts between frontend and backend,
4. avoids accidental leakage of backend domain and infrastructure concerns into UI code, and
5. fits the repository structure already agreed for the project.

There has also been a structural question about whether using DDD + hexagonal architecture on the backend removes the need for a root `src/` folder. It does not. The backend still needs a root source folder. The DDD + hexagonal structure applies **inside the backend modules and bounded contexts**, not instead of the backend application root.

## Decision

We will use the following application architecture split:

- **Frontend:** feature-based, component-driven application architecture.
- **Backend:** modular monolith with DDD + hexagonal architecture inside each bounded context.

We explicitly do **not** adopt classical MVC as the primary architectural model for the backend.
We also do **not** force classical MVC or MVVM terminology onto the frontend. Where useful, complex frontend screens may use a presenter or view-model style internally, but the repo-wide frontend architecture will be defined in terms of features, routes, components, services, and contracts.

## Frontend boundary model

The frontend is responsible for:

- rendering user interfaces,
- routing and page composition,
- client-side interaction state,
- form handling and validation at the UI boundary,
- calling backend APIs through typed clients,
- rendering backend-derived state,
- handling optimistic UI or local interaction concerns where appropriate.

The frontend is not responsible for:

- core business invariants,
- authorization decisions as the source of truth,
- persistence rules,
- payment authority,
- access entitlement authority,
- workflow execution authority,
- cross-context business orchestration.

Those concerns remain in the backend.

## Backend boundary model

The backend remains the system of record for:

- business rules,
- entitlements,
- access control enforcement,
- persistence,
- transactional consistency,
- domain events,
- workflow and automation execution,
- integration with external infrastructure.

Each bounded context in the backend will preserve a DDD + hexagonal structure.

## Repository structure decision

At the top level, the repository remains responsibility-based and framework-neutral:

```text
/apps
  /frontend
  /backend
  /worker
/contracts
/tests
/docs
/.github
```

The backend **does** keep a root `src/` folder because it is still an application entrypoint.

Example:

```text
/apps/backend
  /src
    /bootstrap
    /shared
    /identity-access
    /community-structure
    /engagement
    /events
    /resources
    /commerce
    /notifications
    /automation
    /admin-reporting
```

Inside each backend bounded context, the DDD + hexagonal structure is explicit:

```text
/apps/backend/src/engagement
  /domain
  /application
  /adapters
    /inbound
    /outbound
  /contracts
  /tests
```

This means:

- the backend root `src/` remains,
- each bounded context sits under that backend root,
- DDD + hexagonal structure exists **inside each bounded context**.

We will not add an extra redundant `src/` folder inside every bounded context unless a specific framework forces it.

## Frontend structure decision

The frontend will use a feature-based structure that is compatible with multiple frameworks.

Recommended shape:

```text
/apps/frontend
  /src
    /app
    /features
    /components
    /layouts
    /services
    /lib
    /contracts
    /styles
    /tests
```

### Folder intent

- `app/` — app shell, routing entrypoints, global bootstrapping
- `features/` — user-facing feature slices such as discussions, events, memberships, onboarding
- `components/` — reusable presentational UI building blocks
- `layouts/` — page/frame composition patterns
- `services/` — typed API clients and frontend orchestration helpers
- `lib/` — small framework-neutral client utilities
- `contracts/` — frontend-facing typed contracts derived from approved backend contracts
- `styles/` — theming and style-system resources
- `tests/` — frontend unit and feature tests

## Contract rule

Frontend and backend must integrate through explicit contracts.

The contract strategy is:

- canonical shared contracts live in `/contracts`,
- frontend consumes generated or curated typed contract packages/interfaces,
- backend owns contract publication and compatibility rules,
- contract changes must be versioned and reviewed,
- mock data and fixtures must be updated in the same change when contracts change.

The frontend must not depend directly on backend internals, domain entities, repositories, or persistence models.

## Team ownership impact

- **Team A** owns backend domains for identity/access and community structure.
- **Team B** owns the frontend application model and the user experience layer, plus backend engagement surfaces in coordination with Team A and Team C where contracts cross boundaries.
- **Team C** owns commerce, notifications, automation, and operational integration concerns.

Shared ownership is not allowed at the module level without explicit agreement. Cross-team dependency should happen through approved contracts, not through informal shared code.

## Testing implications

This decision requires:

### Frontend
- component/unit tests,
- feature-level tests,
- contract compatibility checks against backend-facing schemas,
- end-to-end tests for key journeys.

### Backend
- domain unit tests,
- application/use-case tests,
- adapter integration tests,
- contract tests,
- architecture tests enforcing bounded-context boundaries.

## Consequences

### Positive
- frontend remains flexible while the stack is still undecided,
- backend keeps strict DDD + hexagonal discipline,
- repository structure stays understandable to humans and agents,
- clear contracts reduce blocking between teams,
- future framework changes are less disruptive.

### Negative
- frontend architecture is less prescriptive than strict MVC/MVVM terminology,
- teams must actively maintain contract discipline,
- more thought is required to stop UI logic from absorbing business logic,
- some frameworks may encourage patterns that need to be constrained by repo governance.

## Rejected alternatives

### 1. MVC as the primary backend architecture
Rejected because MVC is too weak to enforce the domain boundaries, contract discipline, and infrastructure isolation required for this project.

### 2. Full layered naming only (`presentation`, `application`, `domain`, `infrastructure`)
Rejected as the primary expression because it is easier for teams to blur boundaries. We want the backend to think explicitly in terms of inbound and outbound adapters around a protected core.

### 3. Mirroring backend DDD/hexagonal structure directly in the frontend
Rejected because frontend concerns are different. The frontend should optimize for product development, page composition, user interaction, and typed integration, not copy backend architecture mechanically.

## Enforcement notes

The governor agent and required checks should flag:

- backend business logic leaking into controllers or adapters,
- frontend code importing backend internals,
- contract changes without fixture/mock/test updates,
- shared utility modules that bypass bounded-context ownership,
- framework-driven folder drift that weakens the agreed boundaries.

## Follow-on ADRs

This ADR should be followed by:

- technology selection ADRs for frontend and backend frameworks,
- content/editor ADR,
- API style ADR,
- testing toolchain ADR,
- CI enforcement ADR updates if required.
