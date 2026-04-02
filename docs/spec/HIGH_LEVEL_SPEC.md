# FoundryRooms — High-Level Product & Architecture Spec v0.2

## 1. Purpose

This document defines the initial high-level product and architecture spec for **FoundryRooms**.

It is the parent document from which future ADRs will be derived. It intentionally stays above implementation detail: it defines product scope, architectural direction, operating constraints, and technology-selection criteria without prematurely locking the final stack.

This document exists to align:
- product direction
- bounded-context design
- human and agent team responsibilities
- governance expectations
- later ADR creation

---

## 2. Working Product Name

**Primary working name:** `FoundryRooms`

### Why this name works
- **Foundry** suggests making, shaping, and building with discipline.
- **Rooms** suggests community spaces, interaction, and belonging.
- The name leaves space for later collaborative-builder experiences without forcing them into v1.

### Alternate names worth keeping in reserve
- **Foundry**
- **Foundry Commons**
- **Foundry Hub**
- **Foundry Circle**
- **Foundry Community**

**Recommendation:** use **FoundryRooms** for the repository and internal documents until branding is finalized.

---

## 3. Product Goal

FoundryRooms v1 is a **community software platform** for operating structured online communities.

The first product goal is **not** to build multiplayer coding rooms or a developer sandbox. The first goal is to build a strong, relational, operationally-simple community platform with:
- member identity and access control
- spaces, channels, and discussions
- events
- resources and documents
- memberships and gated access
- notifications
- basic automation
- moderation and admin operations

### Positioning
FoundryRooms v1 should feel like a modern, structured community operating system for:
- creators
- educators
- paid communities
- cohorts and membership groups
- private professional communities

### Explicit product direction
- Build a **community product first**
- Build **real-time collaborative rooms later** as a future bounded context

---

## 4. Product Principles

### 4.1 Community first
Solve real community operations before experimental collaborative-building features.

### 4.2 Relational truth
Membership, entitlements, access rules, purchases, and content relationships must be modeled with strong consistency.

### 4.3 Operational simplicity
The initial system should be simple to deploy, understand, test, and govern.

### 4.4 Clear bounded contexts
The codebase must be separated into explicit business areas with clear responsibilities.

### 4.5 Governed delivery
The development model must support multiple human-agent teams working in parallel while preserving coherence in `main`.

### 4.6 Architecture before convenience
Avoid introducing libraries or patterns that weaken boundaries or make the codebase harder to govern.

### 4.7 Contract-first change
Changes that cross team or context boundaries must be agreed via explicit contracts before implementation begins.

---

## 5. Users

### 5.1 Primary customers
- community owners
- creators
- educators
- membership businesses
- cohort operators
- private professional groups

### 5.2 End users
- members
- moderators
- admins
- paid subscribers
- event attendees
- content consumers

---

## 6. Scope

## 6.1 In scope for v1

### Identity and access
- sign up and sign in
- invitations
- profile management
- password reset and recovery
- roles: owner, admin, moderator, member
- access groups and permission segmentation
- entitlements for gated areas and paid content

### Community structure
- community creation
- spaces or groups
- channels within spaces
- visibility rules
- join rules
- pinned content

### Discussions and engagement
- posts
- comments and threads
- reactions
- mentions
- moderation actions
- unread states
- feed or timeline views

### Events
- create events
- RSVP
- attendance tracking
- reminders
- basic calendar support

### Resources and documents
- create resources and documents
- organize content by area or topic
- surface resources inside community areas
- access-controlled visibility

### Monetization
- free and paid memberships
- one-time and recurring offers
- gated access linked to roles or purchases
- entitlement updates following purchase

### Notifications
- in-app notifications
- email notifications for important actions
- notification preferences

### Basic automation
- welcome flows
- role or access changes based on key actions
- simple event-driven operational rules

### Admin and moderation
- member management
- moderation tools
- audit visibility for important actions
- baseline analytics and reporting

## 6.2 Explicitly out of scope for v1
- live collaborative coding rooms
- multiplayer code editor
- browser runtime execution
- AI agent orchestration for app building
- artifact marketplace or forking ecosystem
- advanced workflow builder
- deep LMS functionality
- plugin marketplace
- advanced recommendation engine

## 6.3 Phase 2 candidates
- richer courses and cohorts
- visual workflow builder
- advanced personalization
- real-time voice and video rooms
- collaborative creation rooms
- AI-assisted community setup and moderation

---

## 7. Functional Requirements by Domain

## 7.1 Identity & Access

### Must support
- authentication
- invitations
- user profiles
- roles and permissions
- access groups and segmentation
- entitlement checks

### Architecture implications
- strong transactional consistency
- explicit authorization boundaries
- separation between authentication and authorization
- auditable membership and access changes

## 7.2 Community Structure

### Must support
- community hierarchy
- spaces
- channels
- visibility settings
- join and access rules
- content placement

### Architecture implications
- relational hierarchy
- careful parent-child modeling
- stable identity, slugs, and URLs
- permission inheritance rules

## 7.3 Engagement

### Must support
- posts
- comments and threads
- reactions
- mentions
- unread markers
- moderation workflow
- feed views

### Architecture implications
- query complexity for feed and timeline
- moderation audit trail
- notifications from domain events
- eventual search indexing support

## 7.4 Events

### Must support
- event creation and editing
- RSVP handling
- attendance tracking
- reminders
- timezone-aware scheduling

### Architecture implications
- background jobs
- time-zone correctness
- optional integrations later

## 7.5 Resources

### Must support
- create documents and resources
- organize by topic or area
- access-controlled visibility
- rich content rendering
- attachments

### Architecture implications
- content storage strategy
- attachment and object storage
- editor format
- indexing later

## 7.6 Commerce

### Must support
- plans and offers
- one-time and recurring payments
- purchase handling
- entitlement updates
- refunds and cancellations at an operational level
- payment reconciliation

### Architecture implications
- webhook processing
- idempotency
- auditable state transitions
- entitlements as a first-class concept

## 7.7 Notifications

### Must support
- in-app delivery
- email delivery
- preference management
- event-triggered messages

### Architecture implications
- async processing
- retry rules
- delivery state tracking

## 7.8 Automation

### Must support in v1
- welcome sequences
- triggered access changes
- triggered notifications
- simple operational rules

### Architecture implications
- domain events
- small rules layer
- async handlers

## 7.9 Admin & Reporting

### Must support
- admin dashboard basics
- moderation visibility
- member status visibility
- purchase and attendance visibility
- audit trails for privileged actions

### Architecture implications
- immutable or append-only audit records where appropriate
- safe admin permission boundaries
- reporting read models or reporting queries without leaking business logic everywhere

---

## 8. Non-Functional Requirements

## 8.1 Reliability
- membership and access checks must be correct
- payment events must be idempotent
- important background actions must be retryable
- privileged operations must be auditable

## 8.2 Performance
- common page loads should feel immediate
- community navigation and discussion flows must remain responsive under moderate concurrency
- feed queries must not degrade sharply as data grows

## 8.3 Security
- secure auth flows
- server-side authorization enforcement
- webhook verification
- secret management
- community or tenant data isolation

## 8.4 Maintainability
- explicit bounded contexts
- minimal cross-context coupling
- testable application services
- adapters isolated from domain logic

## 8.5 Operability
- predictable deployments
- required CI checks before merge
- observable failures
- simple local development setup

---

## 9. Bounded Contexts for v1

The modular monolith should start with these bounded contexts:
- **Identity & Access**
- **Community Structure**
- **Engagement**
- **Events**
- **Resources**
- **Commerce**
- **Notifications**
- **Automation**
- **Admin & Reporting**

These contexts are the basis of ownership, code layout, contract design, and ADR assignment.

---

## 10. Team Split for Parallel Delivery

The system must be split so that three human-agent teams can work without serial dependency as far as possible.

## 10.1 Team A — Community Core
Owns:
- Identity & Access
- Community Structure

Primary deliverables:
- authentication and invitation flows
- roles, permissions, access groups
- community, space, and channel hierarchy
- policy enforcement at the application layer

## 10.2 Team B — Experience Layer
Owns:
- Engagement
- Resources
- Notifications UI and read models

Primary deliverables:
- posts, threads, reactions, feed views
- documents and resources surfaces
- unread state and member-facing notification experience
- frontend-facing contract stabilization for member activity surfaces

## 10.3 Team C — Operations & Monetization
Owns:
- Events
- Commerce
- Automation
- Admin & Reporting foundations

Primary deliverables:
- events and attendance
- purchase and subscription flows
- entitlements arising from commerce
- async jobs, automation handlers, admin reporting foundations

## 10.4 Cross-team rule
Each team owns contexts, contracts, tests, and ADRs for its area. Teams do not own personal branches or private architecture patterns.

---

## 11. Dependency-Minimizing Design Rules

To avoid teams blocking each other:

### 11.1 Contracts first
Every cross-context dependency must be expressed as one of:
- an application-level interface
- a published event contract
- a read-model contract
- a frontend-backend API contract

### 11.2 No direct table reach-through
One context must not directly read or mutate another context's private tables unless explicitly approved by ADR.

### 11.3 Stable DTOs and schemas
Shared payloads must be versioned and intentionally managed.

### 11.4 Mock-first parallel work
When a downstream dependency is not ready, the consuming team must proceed using:
- approved contract definitions
- shared fixtures
- mock adapters
- contract tests

### 11.5 Backend-frontend contract ownership
Every externally-consumed API must have:
- an owner
- a schema or DTO definition
- example fixtures
- contract tests
- change notes when modified

---

## 12. Architecture Constraints

## 12.1 System shape
- modular monolith first
- one deployable system to start
- clear internal module boundaries
- no microservices unless forced by proven operational need

## 12.2 Data model
- relational database first
- explicit schema and constraints
- strong support for transactions, joins, and reporting

## 12.3 Application architecture
- DDD for domain boundaries
- hexagonal principles for backend modules
- ports and adapters around storage, auth, payments, email, search, and queueing

## 12.4 Integration model
- synchronous calls only through explicit interfaces
- domain events for cross-context reactions
- no direct cross-context persistence coupling
- async job handlers for side effects

## 12.5 Frontend structure
- feature-oriented frontend organization
- typed API contracts
- no business-rule duplication in the UI when avoidable
- UI should consume stable contracts rather than internal implementation details

---

## 13. Coding and Design Guardrails

## 13.1 Cohesion and coupling
Every module should have one clear reason to change. Shared utilities must not become hidden dependency channels.

## 13.2 OOP caution
Object-oriented abstractions are allowed only when they reduce complexity. Abstraction layers that hide control flow, couple unrelated contexts, or create inheritance-heavy designs should be rejected.

## 13.3 Prefer explicit composition
Prefer explicit composition, pure domain logic, and clear application services over deep inheritance or framework-driven magic.

## 13.4 No convenience shortcuts that break boundaries
Avoid:
- shared god services
- global utility dumping grounds
- direct DB access from controllers or UI
- leaking ORM entities across layers

---

## 14. Testing Requirements

Testing is mandatory and must be enforced in CI.

## 14.1 Unit tests
Required for:
- domain rules
- policies
- pure application logic
- transformation and mapping logic where correctness matters

## 14.2 Integration tests
Required for:
- repository and database integration
- external adapters
- event handlers
- workflow and entitlement transitions

## 14.3 Contract tests
Required for:
- frontend-backend APIs
- event payloads
- cross-context interfaces
- mocks used by parallel teams

## 14.4 Architecture tests
Required for:
- no forbidden imports across contexts
- no adapter-to-adapter leakage
- no domain dependence on frameworks
- no direct cross-context persistence access

## 14.5 End-to-end tests
Required for the critical journeys:
- sign up and invitation acceptance
- joining and navigating a community
- posting and replying
- purchasing and gaining entitlement
- RSVP and attendance basics

---

## 15. Data Contracts, Fixtures, and Mocking Policy

To reduce rework and integration bugs:

### 15.1 Shared schemas
Every API contract, event schema, and important fixture must be committed to the repository.

### 15.2 Approved mock data
Mock data must be based on the agreed contract, not invented ad hoc in each team.

### 15.3 Synchronization rule
When a contract changes, all of the following must be updated together:
- schema or DTO
- fixtures and examples
- mocks
- contract tests
- consuming adapters or clients

### 15.4 Backward compatibility rule
A breaking contract change must either:
- be coordinated and merged atomically, or
- be introduced via versioning and compatibility handling

---

## 16. Codebase Health & Drift Prevention

Architecture drift must be treated as a recurring operational risk.

### Required recurring checks
- dependency review
- architecture boundary review
- test health review
- dead code and stale abstraction review
- ownership and CODEOWNERS review
- outdated ADR review

### Minimum cadence
- lightweight weekly review of PR patterns and drift indicators
- deeper monthly review of dependencies, boundaries, and code health

---

## 17. Technology Selection Criteria

This document does not lock the stack yet. It defines what the chosen stack must support.

## 17.1 Backend/core
Choose technology that supports:
- modular monolith structure
- strong typing where possible
- testability
- explicit composition or disciplined dependency injection
- clean separation between domain, application, and adapters
- mature ecosystem for auth, email, payments, and background jobs

## 17.2 Database
Choose a relational database with:
- excellent transactional support
- strong indexing
- mature migration tooling
- good support for community-style multi-tenant data models

## 17.3 Frontend
Choose a frontend stack that supports:
- fast product iteration
- authenticated application flows
- admin surfaces
- content-heavy UI plus interactive discussion areas
- design-system consistency
- typed client-server contracts

## 17.4 Background processing
Need support for:
- retries
- scheduled jobs
- webhook handling
- notification processing
- event-driven automation

## 17.5 Storage
Need support for:
- attachments
- images and files
- secure access
- future lifecycle policies

## 17.6 Observability
Need:
- structured logs
- error monitoring
- deployment traceability
- visibility into job failures and contract failures

---

## 18. What This Spec Suggests Before Stack Lock-In

This spec points strongly toward:
- a web-first application
- a relational database
- a server-side application layer
- background job infrastructure
- object storage
- email and payment integrations
- modular domain-oriented code structure
- strong CI and architecture tests

This spec does **not** point toward:
- microservices first
- event-sourcing first
- browser-only runtime architecture
- real-time-first database as the primary foundation for v1
- heavy WASM or runtime complexity in the initial release

---

## 19. ADRs This Spec Should Generate Next

1. **ADR-001: system shape** — modular monolith with DDD and hexagonal backend boundaries
2. **ADR-002: bounded context map** — module boundaries, ownership, dependency rules
3. **ADR-003: data architecture** — relational strategy, tenancy model, migration approach
4. **ADR-004: integration model** — domain events, jobs, webhook handling, cross-context rules
5. **ADR-005: identity and authorization** — auth approach, roles, access groups, entitlements
6. **ADR-006: delivery governance** — protected `main`, short-lived branches, governor-agent rules, CI gates
7. **ADR-007: frontend application model**
8. **ADR-008: payments and entitlement model**
9. **ADR-009: notifications and background jobs**
10. **ADR-010: content and document approach**

