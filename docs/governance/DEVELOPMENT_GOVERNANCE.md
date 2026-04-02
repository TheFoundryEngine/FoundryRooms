# FoundryRooms — Development, Governance & Repository Setup v0.3

## 1. Purpose

This document defines how FoundryRooms development will be organized from the beginning.

It describes:
- repository governance
- branch strategy
- human and agent delivery model
- ADR ownership
- CI and CD expectations
- code and contract rules
- optional GitHub-hosted agent integration

This document should be read alongside the high-level product spec.

The source of truth for behavior is:
1. the product spec
2. the ADRs
3. this governance document
4. repository instruction files such as `AGENTS.md`

GitHub-specific agent files are implementation adapters for this governance model. They are not the source of truth.

---

## 2. Delivery Model

FoundryRooms uses a **governed human-agent model**.

### Core structure
- **1 Governor Agent** oversees conformance into `main`
- **3 Human Developers** each own major bounded contexts
- **3 Feature Agents** pair with the three human developers

The governor is not a replacement for architecture or human judgment. The governor exists to enforce rules, preserve coherence, and stop drift.

---

## 3. Main Roles

## 3.1 Governor Agent

### Primary responsibility
Protect the integrity of `main`.

### Duties
- enforce architecture and ADR compliance
- validate pull request alignment with approved boundaries
- reject changes that break dependency rules or standards
- ensure required checks pass before merge
- ensure material architectural changes are documented
- verify CI and CD quality gates are satisfied
- flag contract drift, mock drift, and schema drift
- monitor growing coupling or weak cohesion

### Governor principles
- architecture over convenience
- boundaries over speed
- consistency over novelty
- documented decisions over ad hoc changes
- tests and contracts over assumption

## 3.2 Team A — Community Core

**Human Developer A + Agent A**

Owns:
- Identity & Access
- Community Structure

Responsible for:
- membership, roles, permissions, access groups
- invitation and onboarding flows
- community, space, and channel hierarchy
- policy and authorization boundaries
- ADRs within these contexts

## 3.3 Team B — Experience Layer

**Human Developer B + Agent B**

Owns:
- Engagement
- Resources
- member-facing notification read models and UI contracts

Responsible for:
- posts, comments, reactions, feed experience
- resource and document surfaces
- unread states
- member-facing API contracts and fixtures in owned areas
- ADRs within these contexts

## 3.4 Team C — Operations & Monetization

**Human Developer C + Agent C**

Owns:
- Events
- Commerce
- Automation
- Admin & Reporting foundations

Responsible for:
- events and attendance
- purchases, subscriptions, entitlements
- automation handlers and jobs
- audit and admin reporting foundations
- ADRs within these contexts

---

## 4. Branching Strategy

## 4.1 Protected `main`
`main` is the only authoritative integration branch.

Rules:
- no direct pushes
- merges only by pull request
- required status checks must pass
- required reviews must pass
- code owner review should be required
- merge queue should be enabled when PR volume warrants it

## 4.2 No long-lived personal branches
Do not keep branches such as:
- `dev/person-a`
- `dev/person-b`
- `dev/person-c`

These drift too easily and become shadow codebases.

## 4.3 Use short-lived work branches
Examples:
- `feat/identity/invitation-flow`
- `feat/community/channel-permissions`
- `feat/engagement/thread-replies`
- `fix/commerce/webhook-retry`

Each branch should map to:
- one bounded context where possible
- one deliverable
- one ADR or feature note when architecture is affected

---

## 5. ADR Governance Model

## 5.1 Global ADRs
Location:
- `docs/adr/global/`

Purpose:
- architecture laws
- major stack decisions
- system-wide delivery rules
- cross-context dependency rules

### Ownership
- authored or approved through architecture leadership
- enforced by the Governor Agent

## 5.2 Feature ADRs
Location:
- `docs/adr/features/`

Purpose:
- bounded-context decisions
- implementation choices within approved architecture
- local changes requiring explicit justification

### Ownership
- drafted by the responsible domain team
- reviewed by the human owner
- checked by the Governor Agent when they affect wider boundaries

## 5.3 ADR rule
Any material architecture decision must be documented before or alongside the code that depends on it.

---

## 6. Pull Request Workflow

## 6.1 Before work starts
A team must identify:
- bounded context affected
- deliverable
- whether an ADR is required
- acceptance criteria
- contract changes required
- test expectations

## 6.2 During work
A feature agent may be used to:
- scaffold code
- create tests
- draft documentation
- propose refactors
- prepare PR summaries
- prepare fixtures and contract examples

Human review is still required before PR submission.

## 6.3 PR requirements
Every PR should include:
- clear scope
- linked work item or issue
- affected bounded context(s)
- testing summary
- ADR reference where needed
- notes on migration, jobs, contract changes, or schema changes where relevant
- confirmation that mocks and fixtures were updated when contracts changed

## 6.4 Governor review focus
The Governor Agent should check:
- architecture boundary compliance
- dependency rule compliance
- ADR alignment
- CI and CD status
- missing tests for critical behavior
- dangerous cross-context coupling
- undocumented schema or contract changes
- drift between mocks, fixtures, DTOs, and actual implementations

---

## 7. Repository Structure

A starting structure like this is recommended:

```text
/
├── .github/
│   ├── workflows/
│   ├── CODEOWNERS
│   ├── agents/
│   └── instructions/
├── AGENTS.md
├── docs/
│   ├── spec/
│   ├── governance/
│   ├── architecture/
│   └── adr/
│       ├── global/
│       └── features/
├── src/
│   ├── identity-access/
│   ├── community-structure/
│   ├── engagement/
│   ├── events/
│   ├── resources/
│   ├── commerce/
│   ├── notifications/
│   ├── automation/
│   └── admin-reporting/
├── contracts/
│   ├── api/
│   ├── events/
│   └── fixtures/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── contracts/
│   ├── architecture/
│   └── e2e/
└── tools/
```

---

## 8. Contract-First Delivery Rules

To reduce blocking and integration failures:

### 8.1 Every shared contract must live in the repo
This includes:
- API request and response shapes
- event payloads
- test fixtures
- mock payloads
- frontend DTO expectations

### 8.2 A contract owner must be named
Every contract must have one owning team.

### 8.3 Contract changes are not local-only
If a contract changes, the PR must update:
- schema or type definition
- fixtures
- mocks
- contract tests
- consuming integration points

### 8.4 Parallel delivery rule
If one team is blocked by a not-yet-implemented dependency, it proceeds using:
- the approved contract
- mocks generated from that contract
- failing or pending contract tests where appropriate

### 8.5 No ungoverned mock drift
Mock data that diverges from agreed contracts is a defect, not a convenience.

---

## 9. Code Ownership & Boundaries

Use `CODEOWNERS` to reflect bounded-context ownership.

Examples:
- `/src/identity-access/` → Team A
- `/src/community-structure/` → Team A
- `/src/engagement/` → Team B
- `/src/resources/` → Team B
- `/src/events/` → Team C
- `/src/commerce/` → Team C
- `/src/automation/` → Team C

### Boundary rules
- no cross-context imports without an approved interface
- no direct DB table access across contexts unless explicitly allowed
- no hidden coupling through shared utility dumping grounds
- no architecture-significant changes without ADR updates
- no leaking ORM entities into external contracts
- no UI dependence on internal persistence models

---

## 10. Coding Standards

### 10.1 Core principles
- readable code over clever code
- explicit boundaries over magical abstractions
- composition over inheritance-heavy designs
- pure domain logic where possible
- application services orchestrate use cases
- adapters isolate infrastructure and framework concerns

### 10.2 OOP caution
Object-oriented abstractions are allowed only when they simplify. They must not create:
- inheritance chains with hidden behavior
- broad base classes that couple unrelated modules
- framework-centric service god objects
- difficult-to-trace side effects

### 10.3 Definition of done for code
A change is not done until:
- tests pass
- architecture rules pass
- contracts are updated
- docs or ADRs are updated where needed
- ownership and boundaries remain intact

---

## 11. Testing Strategy

Testing is mandatory and enforced in CI.

## 11.1 Unit tests
Required for:
- domain logic
- policies
- use-case logic with deterministic outcomes

## 11.2 Integration tests
Required for:
- repositories and database interactions
- payment and email adapters
- event handlers
- job handlers
- permission checks spanning persistence and application services

## 11.3 Contract tests
Required for:
- frontend-backend APIs
- event payload schemas
- cross-context interfaces
- mocks used for parallel development

## 11.4 Architecture tests
Required for:
- forbidden import detection
- layer enforcement
- no domain dependence on infrastructure or framework code
- no direct persistence coupling across bounded contexts

## 11.5 End-to-end tests
Required for core user journeys.

## 11.6 CI rule
A PR that changes behavior without corresponding tests should normally fail review.

---

## 12. CI/CD Expectations

CI/CD must protect `main` from architectural and quality regression.

### Minimum initial checks
- formatting or lint
- type checking
- unit tests
- integration tests where relevant
- contract tests
- architecture rule tests
- migration validation if schema changes exist
- build verification

### Later checks
- end-to-end tests
- security scanning
- dependency and license checks
- performance smoke checks
- coverage trend reporting

### Principle
A passing branch is not enough. A PR must be safe to merge into current `main`.

---

## 13. Drift Prevention & Codebase Health

Architecture drift is expected unless actively controlled.

### Governor and team responsibilities
- review dependency growth
- detect repeated boundary leaks
- identify stale abstractions
- challenge convenience libraries that increase coupling
- clean obsolete fixtures and dead code
- reconcile ADRs with the real codebase

### Review cadence
- weekly lightweight health review
- monthly deeper architecture and dependency review
- quarterly ADR and boundary audit

---

## 14. Optional GitHub Agent Integration

GitHub-hosted agent capabilities may be used as one implementation layer for repository automation and review.

This is optional. FoundryRooms does **not** require developers to use GitHub Copilot or any other coding assistant for everyday development.

### Governance stance
- `AGENTS.md`, the product spec, the ADRs, and this document are the source of truth
- GitHub agent files are adapters for that governance model
- if the GitHub agent implementation changes in the future, the governance model remains the same

### Suitable uses
- repository-aware scaffolding
- issue-to-branch assistance
- PR preparation
- standards-aware review assistance
- bounded-context-specific agent profiles

### Not suitable as sole control
- final architectural judgment
- unsupervised schema design
- direct control of `main` without branch protection and required checks
- replacing human responsibility for domain decisions

---

## 15. Initial Agent and Instruction Files

The repo should begin with:
- `AGENTS.md` — vendor-neutral operating rules for all agents
- `.github/agents/governor.agent.md` — governor profile for GitHub-hosted agent flows if used
- `.github/agents/team-a-community-core.agent.md`
- `.github/agents/team-b-experience.agent.md`
- `.github/agents/team-c-ops-monetization.agent.md`
- `.github/instructions/github-agent-platform.instructions.md` — optional GitHub-platform-specific guidance

If GitHub’s agent platform requires repository instruction files such as `.github/copilot-instructions.md`, treat them as platform adapters rather than the governing source of truth.

---

## 16. Recommended Initial Ruleset

### Branch protection
- require pull request before merge
- require code owner review
- require passing status checks
- block force pushes
- block deletion of protected branch

### Required checks
- lint
- typecheck
- unit
- integration
- contracts
- architecture
- build

### Merge discipline
- squash or rebase only
- conventional PR titles if you want release automation later
- no bypass except for explicitly designated maintainers in emergencies

---

## 17. Initial Artifacts to Create Next

1. ADR-001 system shape
2. ADR-002 bounded context map
3. ADR-003 data and tenancy model
4. ADR-004 integration and contract model
5. ADR-005 identity and authorization model
6. ADR-006 delivery governance and testing rules
7. CODEOWNERS draft
8. branch protection and ruleset checklist
9. starter agent profiles and instruction files
