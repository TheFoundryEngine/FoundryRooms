# ADR-007: Frontend Application Architecture and Boundary Model

- **Status:** Accepted
- **Date:** 2026-04-02
- **Owners:** Architecture lead, Governor Agent, Team B lead
- **Related:** ADR-001, ADR-002, ADR-004, ADR-006, ADR-008

## Context

FoundryRooms has a deliberate frontend/backend separation. The backend is a modular monolith with DDD and hexagonal boundaries. The frontend must respect those same contract boundaries and not become an ungoverned consumer that drifts from backend contracts.

The frontend is:
- SSR-capable (Nuxt)
- PWA-friendly for mobile-first access
- TypeScript-first for contract alignment with the backend
- owned primarily by Team B (Experience Layer)

Past projects suffered from:
- frontend components making raw API calls scattered across the codebase
- hydration mismatches from browser-only logic leaking into SSR paths
- contract drift between frontend types and backend DTOs
- no clear boundary between API consumption and UI rendering

## Decision

FoundryRooms will use a **layered frontend architecture** with explicit boundaries between UI, API consumption, and contract alignment.

### Required frontend layers

- `components/` — presentational UI components, no direct API calls
- `composables/` — reusable state and logic, may call API client
- `services/` or `api/` — API client layer, the only place HTTP requests are made
- `types/` — contract types shared with backend, sourced from the shared contracts layer
- `layouts/` — page-level layout shells
- `pages/` or `routes/` — route-level page components that compose components and composables
- `middleware/` — route guards and pre-render logic
- `plugins/` — framework-level initialization

### Boundary rules

1. **Components must not make direct API calls.** They consume composables or receive data as props.
2. **All HTTP calls go through the API client layer** (`services/` or `api/`), not scattered fetch calls.
3. **Contract types are imported from the shared contracts layer**, not redefined in the frontend.
4. **SSR-safe data fetching is mandatory.** Browser-only APIs must not affect server-rendered markup.
5. **Realtime connections (SSE, WebSocket) start only after client hydration**, not during SSR.
6. **Frontend state management must not duplicate backend domain logic.** The frontend manages UI state, not business rules.

### Frontend/backend contract alignment

- The frontend consumes the same contract types defined in `/contracts/`
- API client functions are typed against shared contract definitions
- When backend contracts change, frontend types and API clients must be updated in the same work stream
- Contract tests must cover frontend consumer expectations

### Ownership

- Team B owns the frontend application structure and experience layer
- Team B owns member-facing notification read models and UI contracts
- Cross-team frontend work requires coordination through the contract layer
- The Governor Agent enforces that frontend changes stay within contract boundaries

## Consequences

### Positive
- clear separation between UI rendering and data consumption
- contract alignment is enforceable through the API client layer
- SSR safety is built into the architecture, not bolted on
- easier onboarding for contributors who can find API calls in one place
- realtime discipline is built in from the start

### Negative
- more structure than a simple SPA, requiring discipline
- contributors must learn the layering rules
- contract changes require coordinated frontend updates

## Rules implied by this decision

- no raw `fetch` or `$fetch` calls inside components or pages
- all API consumption goes through the services/api layer
- frontend types must come from shared contracts, not be hand-written
- SSR output must not depend on browser-only APIs
- realtime subscriptions must initialize post-hydration
- frontend must not implement business rules that belong in the backend domain

## Follow-on ADRs likely required

- ADR-012: Interaction model and delivery semantics (SSE, WebSocket, hydration rules)
- ADR-013: Notification and email delivery strategy
- ADR-015: API versioning and contract publication workflow
