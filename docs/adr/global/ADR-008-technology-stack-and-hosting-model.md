# ADR-008: Technology Stack and Hosting Model

- **Status:** Proposed
- **Date:** 2026-04-02
- **Owners:** Architecture lead, Governor Agent, domain team leads

## Context

FoundryRooms v1 is a web-first, Heartbeat-like community platform with the following characteristics:

- relational data and strong consistency around memberships, roles, access, content, events, commerce, and entitlements
- a modular monolith backend with DDD and hexagonal boundaries
- a separate frontend application with room to ship as a PWA for mobile-first access
- an open-source distribution that must remain self-hostable
- a future managed hosted offering operated by the FoundryRooms team
- future support for video rooms and conferencing as part of the platform

The selected stack must support:

- clean frontend and backend separation in the repository
- strong contract discipline between frontend and backend
- container-friendly deployment for self-hosters
- a low-friction OSS contributor experience
- a clear path to a hosted SaaS edition without maintaining a separate core codebase
- adding video without forcing the main business application to become a realtime media server

## Decision

FoundryRooms will adopt the following default technology direction for v1:

### Frontend
- **Nuxt**
- **Vue**
- **TypeScript**
- responsive web-first UX with **PWA capability** as the initial mobile strategy

### Backend
- **NestJS**
- **TypeScript**
- modular monolith structure under `apps/backend/src/`
- DDD + hexagonal structure inside each bounded context

### Data and infrastructure
- **PostgreSQL** as the primary relational database
- **Redis** for caching, queue support, rate limiting, and ephemeral coordination where needed
- **S3-compatible object storage** for uploads, images, attachments, and media assets

### Database access approach
- default preference for a **low-magic, SQL-forward TypeScript data layer**
- implementation candidates may include Drizzle or another approach that keeps schema, queries, and migrations explicit
- the exact library choice may be finalized in a follow-on ADR if needed

### Video and realtime media
- **LiveKit-style external realtime media subsystem** rather than building conferencing directly into the core monolith
- the FoundryRooms backend remains the source of truth for permissions, room metadata, billing, moderation hooks, and entitlement checks
- media transport and conferencing runtime are treated as a specialized subsystem with a clean adapter boundary

### Product delivery model
- the product must support both:
  - **self-hosted open-source deployment**
  - **FoundryRooms-hosted managed deployment**
- the hosted offering must be based on the same core product architecture rather than a separate product rewrite

## Why this stack is selected

### 1. Cleanest fit for the current product shape

FoundryRooms v1 is primarily a structured community platform, not a browser-runtime-first collaboration system.

The dominant concerns are:
- community structure
- discussion and engagement
- events
- access groups and entitlements
- notifications and automation
- documents/resources
- commerce and memberships

This favors a boring, relational, server-backed architecture rather than an edge-first or realtime-first primary foundation.

### 2. Strong fit with the existing architecture decisions

The current ADRs already establish:
- modular monolith system shape
- bounded contexts
- contract-first integration
- strict testing and anti-drift governance
- frontend/backend separation

A Nuxt frontend and NestJS backend fit these constraints cleanly without collapsing frontend and backend into one blurred framework boundary.

### 3. Strong OSS contribution path

A TypeScript-first stack lowers context switching across frontend, backend, contracts, and automation for open-source contributors.

This is especially useful for a project that expects:
- PR-driven contributions
- architecture review by a governor agent
- contract discipline across teams
- a future mix of community contributors and core maintainers

### 4. Better self-hosting story

The selected direction stays close to common self-hosting expectations:
- containerized application services
- PostgreSQL
- Redis
- object storage
- reverse proxy / ingress
- optional video subsystem

This is much easier to document and support for self-hosters than a platform deeply coupled to a specialized managed runtime.

### 5. Video can be added without distorting the core architecture

Video rooms are important, but they should not dictate the entire primary application architecture.

The main monolith should own:
- room entitlement rules
- membership and access checks
- scheduling metadata
- moderation policy hooks
- event and notification orchestration

A specialized video subsystem should own:
- WebRTC/media transport
- session runtime
- media scaling concerns
- conferencing infrastructure

This keeps the main product architecture stable.

## Explicit non-decisions

This ADR does **not** yet finalize:
- the exact CSS/design-system stack
- the exact ORM or query library
- the exact auth provider implementation
- the exact cloud hosting vendor
- the exact email provider
- the exact observability vendor

Those may be decided in later ADRs.

## Alternatives considered

## Alternative A: React/Next.js frontend + NestJS backend

### Strengths
- strong ecosystem
- good SSR and preview-deploy story
- viable TypeScript end-to-end option

### Why not selected as the default
- increases the chance that frontend framework conventions influence backend architecture too early
- encourages a backend-for-frontend mental model that is less aligned with a deliberately separated frontend/backend repo structure
- offers less architectural distinction between the frontend app and the backend monolith than the chosen direction

This remains a valid fallback option if the team later decides React is materially better for contributors or product velocity.

## Alternative B: Nuxt frontend + Kotlin/Spring backend

### Strengths
- strong server-side ecosystem
- very solid backend runtime and tooling
- good choice if the core backend team is strongest in Kotlin/JVM

### Why not selected as the default
- raises contributor context-switching between frontend and backend
- introduces a sharper language/runtime split for an OSS-heavy workflow
- tends to increase operational and onboarding complexity earlier than needed

This remains the strongest non-TypeScript backend alternative.

## Alternative C: Single full-stack frontend-led framework as the primary backend

### Strengths
- fewer moving pieces initially
- simpler local development in some cases

### Why not selected
- weakens the explicit backend architecture boundaries required by the existing ADR set
- makes modular-monolith governance harder to enforce cleanly
- risks blending domain logic with framework-specific request handling patterns

## Alternative D: Realtime-first primary architecture

### Why not selected
- the first product goal is a community platform, not a realtime-first collaborative coding platform
- relational consistency and operational clarity matter more in v1 than specialized realtime infrastructure
- this would prematurely optimize for a future bounded context rather than the current product center of gravity

## Consequences

### Positive
- clear alignment with modular monolith + DDD + hexagonal backend design
- lower operational and onboarding complexity for v1
- strong path for OSS contributors
- self-hostable architecture with a straightforward managed-hosted path
- clean separation between core product logic and future video subsystem
- strong PWA-first mobile story without requiring native mobile immediately

### Negative
- video still requires a separate subsystem and operational planning
- self-hosting support increases documentation and release discipline requirements
- a split frontend/backend application model requires more explicit contract governance than a single-framework full-stack app

## Rules implied by this decision

- the repo must preserve explicit `frontend/` and `backend/` application boundaries
- every backend bounded context must preserve `domain/`, `application/`, `adapters/`, `contracts/`, and `tests/`
- frontend and backend contracts must be typed, versioned where needed, and tested
- video and conferencing concerns must enter through explicit subsystem boundaries, not as ad hoc framework plugins inside the core monolith
- self-hosting requirements must be considered in future ADRs involving infrastructure, storage, auth, and observability
- managed hosting features must not introduce irreversible architectural dependence on a vendor-specific runtime without ADR review

## Follow-on ADRs likely required

- ADR-009: Database access strategy and migration approach
- ADR-010: Auth provider and identity implementation
- ADR-011: Background jobs, queues, and workflow execution model
- ADR-012: Object storage, media, and file handling
- ADR-013: Video rooms and conferencing subsystem boundary
- ADR-014: Deployment model for self-hosted and managed editions
