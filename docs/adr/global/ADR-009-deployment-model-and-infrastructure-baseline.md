# ADR-009: Deployment Model and Infrastructure Baseline

**Status:** Proposed  
**Date:** 2026-04-02  
**Owners:** Governor Agent / Project Architecture Group  
**Supersedes:** None  
**Related:** ADR-001, ADR-003, ADR-006, ADR-008

## 1. Context

FoundryRooms will be developed as an open-source community platform with two supported operating models:

1. **Self-hosted OSS deployment** for community operators.
2. **Managed hosted deployment** operated by the FoundryRooms team.

The platform is expected to support:
- a modular-monolith application core
- relational data and transactional consistency
- background jobs and notifications
- file uploads and media storage
- optional video rooms/conferencing as a bounded subsystem
- future AI-assisted product capabilities

The infrastructure baseline must therefore:
- remain **portable** across vendors
- support **containerized deployment**
- avoid coupling the core application to a single cloud vendor
- preserve a credible self-host story
- allow low-cost or OSS-credit-assisted hosting for early public adoption

## 2. Decision

### 2.1 Packaging model

FoundryRooms will be packaged as **containerized services**.

The baseline deployable units are:
- `frontend`
- `backend`
- `worker`
- `postgres`
- `redis`

Object storage, email, analytics, and video infrastructure are treated as replaceable external dependencies.

### 2.2 Reference deployment model

The reference infrastructure model is:
- **Docker Compose** for local development and the simplest self-hosted deployment
- **Container-compatible cloud deployment** for managed hosting
- **PostgreSQL** as the system of record
- **Redis** for queueing, caching, and ephemeral coordination needs
- **S3-compatible object storage** for uploaded files and media

### 2.3 Vendor posture

FoundryRooms remains **vendor-neutral by default**.

The project will support these deployment paths:

#### Path A — AWS-oriented managed hosting
Use when the team wants a conventional cloud platform for the managed offering.

Typical fit:
- containers on ECS, EKS, EC2, or equivalent
- PostgreSQL on RDS/Aurora or self-managed PostgreSQL
- object storage on S3
- CDN/proxy via standard cloud edge services

#### Path B — Cloudflare-assisted edge/web delivery
Use when optimizing for low-cost public delivery, preview environments, object storage economics, and global edge distribution.

Typical fit:
- public frontend delivery on Workers/Pages-style deployment
- preview URLs for frontend changes
- object storage on R2
- selective edge functions where useful

Cloudflare is **not** the primary baseline for the entire backend monolith at this stage. It is an optional deployment accelerator for the web edge and storage layers.

#### Path C — Supabase-assisted managed services
Use when the team wants to reduce operational burden for database-adjacent platform concerns.

Typical fit:
- hosted PostgreSQL through Supabase
- optional selective use of Supabase platform capabilities
- self-hosted fallback remains possible because Supabase supports self-hosting with Docker

Supabase may be used as infrastructure, but **must not become the implicit application architecture**.

### 2.4 Self-hosting and paid hosted model

FoundryRooms will support a deployment model similar in spirit to other open-source community platforms:
- one main open-source codebase
- a documented self-hosting path
- a separately operated managed hosted service

The managed hosted offering may add operational services, support, and hosted defaults, but must avoid forcing a deep code fork between OSS and hosted editions.

## 3. Rationale

### 3.1 Why container-first

A container-first model:
- supports self-hosting
- supports managed SaaS
- keeps deployment portable
- avoids locking the architecture to one runtime vendor
- makes video, AI, background jobs, and media easier to bolt on as subsystems

### 3.2 Why not tie the architecture to one cloud

The project is open-source and should remain deployable by third parties.
A vendor-coupled architecture would weaken:
- self-hostability
- contributor confidence
- migration flexibility
- long-term cost control

### 3.3 Why Cloudflare is optional, not foundational

Cloudflare is attractive for:
- low-cost web delivery
- preview environments
- object storage economics
- edge acceleration

But the backend core is a DDD/hexagonal modular monolith with relational consistency requirements. That core should remain portable and container-friendly first.

### 3.4 Why Supabase is optional, not defining

Supabase is useful where it reduces operational burden, especially around managed PostgreSQL and adjacent platform capabilities.

However, business logic, authorization rules, entitlements, contracts, and bounded-context orchestration must remain inside the FoundryRooms backend application, not drift into vendor-specific platform features.

## 4. Consequences

### Positive
- Strong self-hosting story
- Clean path to paid hosted SaaS
- Portable architecture
- Easier contributor onboarding
- Easier migration between infrastructure vendors
- Better alignment with OSS credits and low-cost hosting opportunities

### Negative
- More explicit deployment design work up front
- Additional operational choices to document
- Less convenience than fully embracing a single platform vendor
- Need to define what is core and what is replaceable for each subsystem

## 5. Guardrails

The following rules apply:

1. **Core application logic must remain inside the backend monolith.**
2. **PostgreSQL remains the system of record.**
3. **All vendor services must be introduced behind ports/adapters where practical.**
4. **Object storage must remain S3-compatible at the application boundary.**
5. **No required production feature may depend exclusively on a hosted-only proprietary service without an approved ADR exception.**
6. **Self-host documentation is a first-class deliverable, not an afterthought.**
7. **Video infrastructure, AI infrastructure, and search infrastructure are subsystem choices, not reasons to break the modular-monolith core.**

## 6. Initial deployment baseline

### Local development baseline
- Docker Compose
- seeded local PostgreSQL
- seeded local Redis
- local object-storage-compatible dev path or stubbed adapter
- mock email/video integrations where needed

### Early OSS hosting baseline
- frontend/docs/public surfaces on a low-cost or OSS-friendly host
- backend and worker on container-compatible hosting
- PostgreSQL on a managed or self-managed host
- object storage on S3-compatible infrastructure

### Early managed SaaS baseline
- one production environment
- one staging environment
- isolated preview strategy for frontend and integration validation
- clear migration path for tenant/community growth

## 7. Deferred decisions

This ADR does not yet finalize:
- the exact frontend framework host
- the exact managed container platform
- the exact database provider
- the exact queue provider
- the exact video provider
- the exact AI model provider

Those remain subject to later ADRs so long as they honor this deployment baseline.

## 8. Follow-up ADRs required

- ADR-010: Database access strategy and migration approach
- ADR-011: Background jobs and workflow execution model
- ADR-012: Object storage and media strategy
- ADR-013: Video rooms and conferencing subsystem
- ADR-014: AI-assisted product capabilities and provider strategy
