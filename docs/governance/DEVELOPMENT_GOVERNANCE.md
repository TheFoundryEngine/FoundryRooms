# FoundryRooms — Development, Governance & Repository Setup v0.4

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

FoundryRooms uses a **governed flow model**.

### Core structure
- **1 Governor Agent** oversees conformance into `main`
- **4 Human Developers** can work on any bounded context
- **Feature Agents** pair with developers as needed

### Flow principles
- Any developer can pick up any Linear issue, regardless of bounded context
- Architectural safety comes from automated enforcement, not team silos:
  1. **Governor Agent** — automated ADR compliance and boundary checking on every PR
  2. **CI pipeline** — contract tests, architecture tests, lint, typecheck, build
  3. **Human review** — at least 1 approval from any developer
  4. **Bounded contexts in code** — modular monolith with architecture tests preventing cross-context imports
- Bounded contexts are **code boundaries**, not **team boundaries**
- Developers are encouraged to work across contexts to maximize flow and reduce bottlenecks
- The governor is not a replacement for architecture or human judgment. The governor exists to enforce rules, preserve coherence, and stop drift.

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

## 3.2 Developers

All developers can work on any bounded context. There are no team silos.

**Bryan McKeon** (@TheFoundryEngine) — Governor / Architect
- Final authority on ADRs and architectural decisions
- Maintains governance docs, global ADRs, and shared infrastructure
- Can approve any PR

**Nick Flach** (@NickFlach) — Developer
- Can pick up any Linear issue across any bounded context

**Matt Eckman** (@EckmanTechLLC) — Developer
- Can pick up any Linear issue across any bounded context

**Neel** (@TBD-Neel) — Developer (Design & UX focus)
- Can pick up any Linear issue across any bounded context
- Primary focus: design system, UX flows, design tokens, accessibility
- Owns `design/` and design handoff contracts consumed by frontend implementation

### Delivery team focus areas (for ADR ownership)

While any developer can work on any context, ADR ownership and accountability use delivery team buckets. This keeps feature ADRs singly owned without creating team silos for everyday work.

- **Team A (Community Core)** — Identity & Access + Community Structure
- **Team B (Experience Layer)** — Engagement + Resources + frontend implementation
- **Team C (Operations & Monetization)** — Events + Commerce + Automation + Admin
- **Team D (Design & UX)** — Design system + UX flows + design tokens + accessibility; hands off design contracts to Team B for frontend implementation

Team D produces design artifacts as consumable contracts in `design/`, not production app code. Team B implements frontend in `apps/frontend/` against approved design contracts the same way it implements against approved API contracts.

### Bounded contexts (code boundaries, not team boundaries)

| Context | Purpose |
|---|---|
| Identity & Access | authentication, roles, permissions |
| Community Structure | communities, spaces, channels |
| Engagement | posts, threads, reactions, feeds |
| Resources | documents and content management |
| Events | event creation, RSVP, attendance |
| Commerce | memberships, payments, entitlements |
| Notifications | in-app and email notifications |
| Automation | workflow rules and background jobs |
| Admin & Reporting | moderation and analytics |

Any developer may work in any context. The Governor Agent and architecture tests enforce boundaries — not team assignments.

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

### Branch granularity

Branches are created **per ADR** (not per sub-issue). An ADR is the unit of
architectural review — its sub-issues are implementation tasks within a single
decision, not independent deliverables. Grouping them into one branch:

- gives the Governor Agent a coherent diff to review against the ADR
- avoids cross-dependency churn between tightly-coupled sub-issues
- keeps PR count manageable (one PR per ADR, not one per task)

When work does not belong to an ADR (standalone bug fix, small feature), use a
per-issue branch.

### Branch naming convention

**Per-ADR (default):** `feat/adr-<adr-id>-<short-description>`

**Per-issue (standalone work):** `feat/<dev-name>/<linear-issue>-<short-description>`

Examples:
- `feat/adr-f-a-001-auth-foundation` — all sub-issues of ADR-F-A-001
- `feat/adr-f-b-001-frontend-shell` — all sub-issues of ADR-F-B-001
- `feat/bryan/THE-31-auth-bug` — standalone fix, no ADR
- `fix/nick/THE-45-invite-expiration` — standalone bug fix

Each branch should map to:
- one bounded context where possible
- one ADR (with all its sub-issues) **or** one standalone Linear issue
- one PR targeting `main`

---

## 5. Linear Integration

Linear is the source of truth for product management and issue tracking.

### Workflow

```
Dev effort identified
    │
    ├──► ADR created (docs/adr/features/ or docs/adr/global/)
    │      Documents the architectural decision and rationale
    │
    ├──► Linear issue created under the appropriate project
    │      - Linked to the ADR
    │      - Assigned to a developer
    │      - Tagged with team label (Team A / B / C / D)
    │
    ├──► Feature branch created: feat/<dev-name>/<linear-issue>-<description>
    │
    ├──► Development + tests (unit, integration, contract, architecture)
    │
    ├──► PR opened targeting main
    │      - PR description references the Linear issue (e.g., "Closes FRA-12")
    │      - Governor Agent reviews for ADR compliance and architecture rules
    │      - CI checks run (lint, tests, build, typecheck)
    │
    └──► Governor Agent merges PR into main
           - Render auto-deploys
           - Deploy workflow runs Neon migrations (after CI passes)
           - Linear issue auto-closes via PR reference
```

### Linear Project Structure

- Each major initiative gets its own Linear project
- Issues are tagged by bounded context (not by team)
- Issues are assigned to any available developer — not by team
- ADRs are referenced in issue descriptions
- GitHub PRs auto-link to Linear issues via `FRA-XX` references in PR titles/descriptions
- When the Governor Agent rejects a PR, the linked Linear issue gets a `blocked` label and a comment with the rejection reason

### MCP Integration

Linear is connected via MCP server (`https://mcp.linear.app/mcp`) to the IDE, allowing:
- Creating and updating issues from chat
- Linking ADRs to issues
- Tracking issue status
- Managing project milestones

---

## 6. ADR Governance Model

All ADRs are tracked in a single index: [`docs/adr/ADR_INDEX.md`](../adr/ADR_INDEX.md).
When creating a new ADR, check the index for the next available number and add a row in the same PR.

## 6.1 Global ADRs
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

## 6.2 Feature ADRs
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

## 6.3 ADR rule
Any material architecture decision must be documented before or alongside the code that depends on it.

---

## 7. Pull Request Workflow

## 7.1 Before work starts
A developer must identify:
- bounded context affected
- deliverable
- whether an ADR is required
- acceptance criteria
- contract changes required
- test expectations

## 7.2 During work
A feature agent may be used to:
- scaffold code
- create tests
- draft documentation
- propose refactors
- prepare PR summaries
- prepare fixtures and contract examples

Human review is still required before PR submission.

## 7.3 PR requirements
Every PR should include:
- clear scope
- linked work item or issue
- affected bounded context(s)
- testing summary
- ADR reference where needed
- notes on migration, jobs, contract changes, or schema changes where relevant
- confirmation that mocks and fixtures were updated when contracts changed

## 7.4 Governor review focus
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
Every contract must have one owning context (not team). The context that produces the data owns the contract.

### 8.3 Contract changes are not local-only
If a contract changes, the PR must update:
- schema or type definition
- fixtures
- mocks
- contract tests
- consuming integration points

### 8.4 Parallel delivery rule
If a developer is blocked by a not-yet-implemented dependency, they proceed using:
- the approved contract
- mocks generated from that contract
- failing or pending contract tests where appropriate

### 8.5 No ungoverned mock drift
Mock data that diverges from agreed contracts is a defect, not a convenience.

### 8.6 Mock ownership
When a contract is new or changing, the **consuming developer** produces mocks and fixtures from the approved contract.
The owning context owns the contract definition; the consuming developer owns the mock that lets them proceed without waiting.
If the two diverge, the contract test fails and the owner updates the contract or the consumer updates the mock — but neither blocks the other from proceeding against the approved shape.

### 8.7 Design contract parallel delivery
Frontend implementation consumes approved Team D design contracts (tokens, component specs, UX flows) the same way it consumes approved API contracts.
If a design contract is not yet final, the developer proceeds using placeholder/mock UI against the approved token and layout baseline.
Frontend implementation does not block on Team D detailed design completion once the baseline design contract is approved.

### 8.8 Contested contract escalation
If two developers or teams disagree on what a shared contract should be, the disagreement must be raised as a Linear issue immediately, not stalled in PR comments.
The Governor Agent is the named decider for contract disputes.
SLA: the Governor must triage the dispute within 2 business days and either rule, request an ADR, or escalate to architecture leadership.
No one may silently block another by leaving a contract dispute unresolved in review.

---

## 9. Code Ownership & Boundaries

`CODEOWNERS` is **advisory** — it suggests reviewers but does not gate PRs by team. All developers are notified on all changes by default. Governance and shared infrastructure paths require the architect's review.

### Boundary enforcement (automated)
Architectural boundaries are enforced by:
1. **Governor Agent** — two-category review model:
   - **REJECTED** (hard block) — cross-context coupling, missing ADRs, contract drift, missing tests, undocumented architecture changes. Fails the `governor-review` check and blocks merge.
   - **CHANGES REQUESTED** (advisory flag) — cohesion concerns, design/code alignment gaps, non-blocking suggestions, contract disputes. Posts a comment, labels the PR, and notifies Linear, but does **not** block merge. The team tracks the follow-up via Linear.
2. **Architecture tests** (dependency-cruiser) — deterministic, automated checks that fail CI on forbidden imports, layer violations, or cross-context persistence access. See §9.1 below.
3. **Contract tests** — fail on schema/payload drift between contexts
4. **Human review** — any developer can flag concerns during review

### Boundary rules
- no cross-context imports without an approved interface
- no direct DB table access across contexts unless explicitly allowed
- no hidden coupling through shared utility dumping grounds
- no architecture-significant changes without ADR updates
- no leaking ORM entities into external contracts
- no UI dependence on internal persistence models

### 9.1 Architecture boundary tests (dependency-cruiser)

Architecture boundary rules are enforced deterministically by **dependency-cruiser**, configured in `.dependency-cruiser.js` and run via `tests/architecture/boundary.test.ts`.

**Enforced rules:**
1. **Cross-context isolation** — no bounded context may import from another context's `domain/`, `application/`, or `adapters/`. Cross-context access is only allowed through `contracts/`.
2. **Hexagonal layering** — `domain/` must not depend on `application/` or `adapters/`. `application/` must not depend on `adapters/`. Adapters depend on application and domain, never the reverse.
3. **Domain framework independence** — `domain/` must not import NestJS, Express, Drizzle, pg, or other infrastructure frameworks.
4. **Contract purity** — `contracts/` must not import from `adapters/` or Drizzle ORM. Contracts define external shapes, not persistence models.
5. **Shared contracts isolation** — the shared `contracts/` directory must not import from any module's `domain/` or `adapters/`.

**Where they run:**
- **CI** — the `architecture-tests` job in `ci.yml` runs `npm run arch:test` on every PR and push to `main`
- **Pre-push hook** — `.husky/pre-push` runs architecture tests before every `git push`
- **Manual** — `npm run arch:test` runs them locally at any time

**When a test fails:**
- The test output names the rule violated and the import that caused it
- Fix the import — do not weaken the rule in `.dependency-cruiser.js`
- If a rule genuinely needs to change, it requires an ADR (it is an architecture decision)

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

Implemented with dependency-cruiser (`.dependency-cruiser.js`) and run via `tests/architecture/boundary.test.ts`. See §9.1 for the full rule set. Run locally with `npm run arch:test`.
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

## 12.1 Local Pre-Commit and Pre-Push Hooks

All developers must run `npm install` after cloning the repo or pulling changes that update `package.json`. The `prepare` script automatically installs husky git hooks. These hooks are **mandatory governance gates** — they are not optional.

### Pre-commit hook (runs on every `git commit`)
Runs `lint-staged` on staged files only:
- `eslint --fix` on staged `.ts` files (auto-fixes lint issues)

Purpose: catch lint errors before they enter a commit. Fast (~5 seconds).

If the pre-commit hook fails:
- eslint auto-fixes what it can; remaining errors must be fixed manually
- use `git commit --no-verify` only in emergencies (the Governor Agent will catch issues in PR review)

### Pre-push hook (runs on every `git push`)
Runs full local quality checks:
- `npm test` (unit tests)
- `npm run arch:test` (architecture boundary tests via dependency-cruiser)
- `npx vitest run tests/contract --passWithNoTests` (contract tests)
- `npm run build` (build + typecheck across project references)

Purpose: catch test failures, boundary violations, and build errors before they reach CI. Slower (~30-60 seconds) but prevents pushing code that will fail CI.

If the pre-push hook fails:
- fix the failing tests, boundary violation, or build errors, then push again
- use `git push --no-verify` only in emergencies — CI will still fail and the Governor Agent will flag the PR

### What the hooks do NOT replace
- CI still runs the full suite including integration tests (Postgres) and architecture tests
- The Governor Agent still does architectural review on the PR
- Integration tests are excluded from pre-push because they require a running Postgres instance

### Manual runs
Developers can run the checks manually at any time:
- `npm run precommit` — lint-staged on all files
- `npm run prepush` — unit tests + contract tests + build
- `npm run arch:test` — architecture boundary tests only
- `npm run lint` — eslint on the whole repo
- `npm run typecheck` — tsc on the whole repo
- `npm test` — all unit tests

### Agent guidance
Feature agents and AI assistants working in this repo must also respect these hooks. If an agent's commit or push is rejected by a hook, the agent must fix the issue, not bypass the hook with `--no-verify`.

---

## 13. Drift Prevention & Codebase Health

Architecture drift is expected unless actively controlled.

### Governor and developer responsibilities
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
- `.github/agents/governor.agent.md` — governor profile for automated PR review
- `.github/instructions/github-agent-platform.instructions.md` — optional GitHub-platform-specific guidance

If GitHub’s agent platform requires repository instruction files such as `.github/copilot-instructions.md`, treat them as platform adapters rather than the governing source of truth.

---

## 16. Recommended Initial Ruleset

### Branch protection
- require pull request before merge
- require at least 1 human approval (from any developer)
- require passing status checks (CI + Governor Agent Review)
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
- governor-review (fails on REJECTED only; CHANGES REQUESTED passes and is advisory)

### Merge discipline
- squash or rebase only
- conventional PR titles if you want release automation later
- no bypass except for explicitly designated maintainers in emergencies
- Governor Agent REJECTED blocks merge; CHANGES REQUESTED does not — the team is notified via Linear and tracks follow-up separately

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
