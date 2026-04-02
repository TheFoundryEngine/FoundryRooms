# ADR-012: Interaction Model and Delivery Semantics

**Status:** Proposed  
**Date:** 2026-04-02  
**Owners:** Governor Agent / Project Architecture Group  
**Related:** ADR-001, ADR-002, ADR-004, ADR-006, ADR-007, ADR-008, ADR-010, ADR-011

## 1. Context

FoundryRooms is a community platform that combines:

- relational CRUD flows for communities, channels, memberships, events, documents, and commerce
- user-facing realtime behaviors such as presence, live room activity, unread indicators, and notification streams
- asynchronous follow-up processing such as email delivery, reminder scheduling, and reconciliation
- a server-rendered frontend that must avoid hydration drift when realtime features are introduced

The project also requires:

- a modular monolith backend
- DDD + hexagonal boundaries in the backend
- a frontend that is SSR-capable and PWA-friendly
- strict contract governance between frontend and backend
- self-hostable deployment and a future managed offering

If CRUD, async work, and realtime delivery are not separated clearly, the system will drift toward:

- business logic hidden in websocket handlers
- duplicated write paths
- unstable frontend state handling
- hydration mismatches
- weak contract/versioning discipline
- unclear ownership between bounded contexts

## 2. Decision

FoundryRooms will use a **multi-lane interaction model**:

- **HTTP** is the authoritative path for CRUD, commands, and initial reads
- **in-process module calls** are the default synchronous integration mechanism inside the modular monolith
- **domain/integration events** are the default internal async trigger mechanism for side effects
- **SSE** is the default user-facing channel for one-way live updates
- **WebSockets** are reserved for genuinely bidirectional realtime behavior
- frontend realtime connections start **after hydration on the client**, not during SSR rendering

## 3. Delivery lanes

## 3.1 Lane A — HTTP for CRUD and commands

HTTP is the system-of-record interaction path for:

- create/update/delete operations
- commands such as RSVP, join space, moderate content, or update membership
- initial list/detail reads
- admin operations
- authenticated transactional flows

Rules:

- all authoritative writes go through backend application services exposed via HTTP endpoints
- initial page data should be obtainable through HTTP/SSR-safe fetches
- HTTP contracts are versioned and documented
- frontend mutations must not bypass this lane through websocket-only writes in v1

## 3.2 Lane B — in-process synchronous module calls

Because FoundryRooms is a modular monolith, most synchronous backend-to-backend collaboration should happen through in-process calls across explicit module APIs.

Rules:

- no internal HTTP between bounded contexts inside the monolith
- no direct persistence-table access across contexts
- synchronous cross-context behavior must go through explicit application services or published module interfaces

## 3.3 Lane C — internal async event-driven work

Domain and integration events are the default trigger mechanism for:

- notifications
- reminder scheduling
- workflow follow-up actions
- webhook reconciliation
- analytics side effects
- non-blocking downstream work

Rules:

- events are explicit contracts
- async work remains owned by bounded contexts
- queue handlers stay thin and call application services
- async work must not become a second hidden business-logic architecture

## 3.4 Lane D — SSE for one-way user-facing live updates

SSE is the default realtime channel when the server pushes updates and the client does not need a persistent low-latency write channel.

Use SSE for:

- notification stream updates
- unread count updates
- background job/progress updates
- lightweight feed invalidation signals
- admin dashboard live status panels
- event status or reminder stream updates

Why this is the default for one-way updates:

- simpler protocol shape over HTTP
- lower conceptual overhead than full bidirectional realtime
- easier to reason about for notification-style UI refreshes

## 3.5 Lane E — WebSockets for bidirectional realtime

WebSockets are reserved for features where the client must continuously send and receive low-latency state.

Use WebSockets for:

- chat and live discussion rooms
- typing indicators
- member presence
- live moderation controls
- collaborative room state later
- video-room signaling later

Rules:

- WebSockets are not the default write path for CRUD in v1
- websocket payloads are governed contracts, not ad hoc event blobs
- websocket handlers must call application services where authoritative state changes occur

## 4. Why SSE first for one-way updates

FoundryRooms should not make WebSockets the default solution for every kind of “live” UX.

Using SSE first for one-way updates keeps v1 simpler because:

- the client receives a push stream without the complexity of a fully bidirectional channel
- the write path remains concentrated in HTTP/application services
- many notification and status-update experiences do not need websocket complexity

This keeps realtime disciplined and reduces accidental coupling between UI state and transport behavior.

## 5. Frontend hydration rule

The frontend must treat SSR output as the initial truth of the page render.

Rules:

- initial render comes from SSR-safe HTTP data or SSR-safe shared state
- SSE and websocket connections start only on the client after hydration
- browser-only APIs must not affect SSR markup generation
- components that depend on browser-only state must isolate that logic from server render paths

This is a mandatory rule because hydration drift is treated as an architectural defect, not a cosmetic warning.

## 6. Versioning and contracts

## 6.1 HTTP contracts

HTTP contracts will be versioned explicitly.

Default approach:

- `/api/v1/...` for public/application HTTP routes
- OpenAPI-documented request/response contracts
- backwards-compatible additions allowed within major version
- breaking changes require contract version changes and coordinated migration planning

## 6.2 Realtime contracts

Realtime payloads are versioned independently from HTTP routes.

Rules:

- realtime schemas live in shared contracts folders
- event names remain stable where possible
- payload schemas may include explicit version markers where needed
- producers and consumers must be contract-tested together

## 6.3 Synchronization rule

A feature change is not complete unless these stay aligned:

- domain model
- application DTO/use-case boundary
- persistence mapping
- HTTP contract
- realtime contract
- fixtures and mocks
- frontend consuming types/state adapters

## 7. Ownership rules

## 7.1 Bounded-context ownership applies to transports too

Each bounded context owns:

- its HTTP entrypoints
- its synchronous module API
- its event payload contracts
- its SSE streams when relevant
- its websocket namespaces/rooms when relevant

## 7.2 No transport-driven architecture

Transport technology does not define the domain.

This means:

- no business logic invented in controllers, SSE streams, or websocket gateways
- no generic “realtime service” that bypasses bounded-context ownership
- no frontend-side contract invention outside governed schemas

## 8. Frontend integration model

The frontend will expose two distinct integration layers:

- an **API client/composable layer** for HTTP CRUD and commands
- a **realtime client/composable layer** for SSE and WebSocket subscriptions

Rules:

- UI components must not scatter raw fetch/socket usage across the codebase
- components consume composables/services that already encode contract and state rules
- server-rendered pages fetch initial state through SSR-safe data patterns
- realtime updates merge into client state only after hydration

## 9. Consequences

### Positive

- clear separation between authoritative writes and live UI updates
- easier testing and contract governance
- less realtime complexity in v1
- better fit for Nuxt SSR and hydration discipline
- easier future evolution toward richer room collaboration and video signaling

### Negative

- two user-facing transport models must be supported instead of one
- engineers must understand when to choose SSE vs WebSockets
- some teams may initially prefer to overuse websockets for convenience and will need governance pushback

## 10. Explicit non-decisions

This ADR does **not** yet choose:

- the exact notification/email provider stack
- the exact websocket library choice between Socket.IO and `ws`
- the exact OpenAPI generation pipeline

Those are downstream decisions.

## 11. Follow-on ADRs

This ADR enables the next decisions:

- ADR-013 Notification and email delivery strategy
- ADR-014 Authentication implementation strategy
- ADR-015 API versioning and contract publication workflow
