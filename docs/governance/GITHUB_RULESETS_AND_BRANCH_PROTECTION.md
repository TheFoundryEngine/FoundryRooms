# FoundryRooms — GitHub Rulesets, Branch Protection, and CODEOWNERS Checklist

## 1. Purpose

This document turns the FoundryRooms governance model into concrete GitHub repository controls.

It is designed to enforce:
- protected `main`
- bounded-context ownership
- governor review and code-owner review
- mandatory testing and contract discipline
- low-coupling, high-cohesion delivery
- safe parallel work across the three dev+agent teams

This document is implementation guidance for GitHub. The architecture source of truth remains the spec, the ADRs, and `AGENTS.md`.

---

## 2. Recommended ownership model

Create these GitHub teams in your organization:

- `governor`
- `architecture`
- `platform`
- `team-a-community-core`
- `team-b-experience`
- `team-c-ops-monetization`

Recommended meaning:
- **governor**: merge gate / architecture enforcement reviewers
- **architecture**: human architects or senior maintainers for global design
- **platform**: CI/CD, repo health, tooling, workflows
- **team-a-community-core**: Identity & Access, Community Structure
- **team-b-experience**: Engagement, Resources, member-facing notification read models
- **team-c-ops-monetization**: Events, Commerce, Automation, Admin foundations

---

## 3. CODEOWNERS setup

Use `.github/CODEOWNERS` as the canonical location.

Why this matters:
- GitHub automatically requests review from code owners when a pull request touches owned paths.
- Code owner approval can be made mandatory through branch protection or rulesets.
- The CODEOWNERS file is taken from the **base branch** of the pull request, so it must live on `main` to control merges into `main`.

Checklist:
- [ ] Place CODEOWNERS at `.github/CODEOWNERS`
- [ ] Replace placeholder team names with actual org/team slugs
- [ ] Ensure every referenced team is **visible**
- [ ] Ensure every referenced team has **write access**
- [ ] Keep paths case-correct
- [ ] Add ownership for docs, ADRs, workflows, contracts, schema, fixtures, and tests

---

## 4. Repository ruleset strategy

Prefer **rulesets** for repository-wide governance and branch targeting. Keep classic branch protection only where needed during transition or where a single exact-branch control is simpler.

Why:
- Multiple rulesets can apply at the same time.
- Rulesets layer together, and the most restrictive rule wins when rules overlap.
- Rulesets can coexist with existing branch protection while you migrate.

### Recommended rule layout

#### Ruleset A — `main-governance`
**Target:** exact branch `main`

Use this for all non-negotiable merge controls.

Recommended settings:
- [ ] Require pull request before merging
- [ ] Require **2 approvals** minimum
- [ ] Require review from **Code Owners**
- [ ] Dismiss stale approvals when new commits are pushed
- [ ] Require approval of the most recent reviewable push
- [ ] Require conversation resolution before merge
- [ ] Require status checks before merge
- [ ] Require branch to be up to date before merge, unless merge queue is used as the strict integration path
- [ ] Block force pushes
- [ ] Block branch deletion
- [ ] Require linear history
- [ ] Require signed commits if your org already enforces signing reliably
- [ ] Restrict bypass permissions to a tiny set, ideally only platform/governor admins

#### Ruleset B — `feature-branch-safety`
**Target:** `feat/*`, `fix/*`, `refactor/*`, `chore/*`

Use this for push hygiene without over-constraining local delivery.

Recommended settings:
- [ ] Block force pushes except for trusted maintainers if needed
- [ ] Block branch deletion only if you want retention while PR is open
- [ ] Require branch naming convention if supported by your policy tooling
- [ ] Require signed commits if your team already uses them consistently
- [ ] Do **not** require pull requests for every feature branch push

#### Ruleset C — `release-and-hotfix-governance`
**Target:** `release/*`, `hotfix/*`

Use stricter rules here if release branches are introduced later.

---

## 5. Merge queue recommendation

Enable **merge queue** on `main` once the team starts merging frequently enough for rebase churn and stale CI to become a problem.

Recommended settings:
- [ ] Enable merge queue on `main`
- [ ] Use squash or rebase merge consistently with your history policy
- [ ] Set build concurrency conservatively at first, then increase after CI timings are known
- [ ] Decide whether to allow only non-failing pull requests into the queue

Important operational note:
- If you use GitHub Actions for required checks, workflows must also trigger on `merge_group`, not just `pull_request`, or required checks will not report for queued merges.

Starter example:

```yaml
on:
  pull_request:
  merge_group:
```

Recommended policy for FoundryRooms:
- start **without** merge queue if volume is low
- enable it once `main` starts seeing enough parallel PR traffic that update-before-merge churn becomes expensive

---

## 6. Required status checks

Keep job names stable once selected as required checks.
Use unique job names across workflows.

Recommended required checks for `main`:
- [ ] `lint`
- [ ] `typecheck`
- [ ] `unit-tests`
- [ ] `contract-tests`
- [ ] `integration-tests`
- [ ] `architecture-tests`
- [ ] `build`
- [ ] `schema-drift-check`
- [ ] `fixture-and-mock-consistency`

Optional checks if you add them later:
- [ ] `e2e-smoke`
- [ ] `security-scan`
- [ ] `dependency-review`
- [ ] `license-check`
- [ ] `docs-and-adr-validation`

### Check intent

#### `unit-tests`
Verifies local domain and application behavior.

#### `contract-tests`
Verifies provider/consumer compatibility and catches DTO/event drift.

#### `integration-tests`
Verifies modules working with infrastructure and realistic persistence or messaging behavior.

#### `architecture-tests`
Verifies import rules, layering, dependency direction, and bounded-context isolation.

#### `schema-drift-check`
Verifies schema, migrations, and agreed contracts remain aligned.

#### `fixture-and-mock-consistency`
Verifies shared test fixtures and mock payloads still match real contracts.

---

## 7. Review policy for pull requests into `main`

Recommended merge requirements:
- [ ] At least **2 approvals**
- [ ] One approval must come from the relevant **code owner team**
- [ ] One approval must come from **governor** or **architecture** for cross-context or shared-surface changes
- [ ] PR author may not self-approve
- [ ] Stale approvals dismissed on new commits
- [ ] All review conversations resolved

### Special-case escalations

Require governor/architecture approval when a PR changes any of these:
- `docs/adr/global/`
- `AGENTS.md`
- `.github/workflows/`
- `.github/agents/`
- `.github/instructions/`
- shared contracts
- schema or migrations
- shared fixtures or shared mocks
- cross-context interfaces
- authentication or authorization logic

---

## 8. Branching and PR naming conventions

Recommended branch prefixes:
- `feat/`
- `fix/`
- `refactor/`
- `chore/`
- `docs/`
- `test/`

Recommended PR title prefixes:
- `feat:`
- `fix:`
- `refactor:`
- `chore:`
- `docs:`
- `test:`

Recommended PR template fields:
- bounded context(s)
- contract changes
- fixture/mock updates
- migration/schema impact
- ADR required? yes/no
- tests added/updated
- cross-team dependency introduced? yes/no

---

## 9. Anti-drift controls

These controls specifically address the failure modes already identified in the FoundryRooms discussion.

### Architecture drift
- [ ] Run `architecture-tests` on every PR
- [ ] Reject cross-context imports that violate ADR-002 or ADR-004
- [ ] Reject direct database access across bounded contexts
- [ ] Reject framework leakage into domain layer

### Contract drift
- [ ] Require contract test changes with contract changes
- [ ] Require fixture and mock updates in the same PR
- [ ] Reject “consumer will catch up later” delivery

### Schema drift
- [ ] Require migration and schema review under governor/architecture ownership
- [ ] Reject undocumented persistence model changes
- [ ] Require integration tests for persistence changes

### Dependency drift
- [ ] Run dependency review on PRs
- [ ] Require justification for new top-level runtime dependencies
- [ ] Flag cross-context utility packages that centralize the wrong abstractions

### OOP / abstraction drift
- [ ] Reject inheritance-heavy convenience frameworks inside business modules
- [ ] Prefer explicit composition
- [ ] Prefer simple interfaces over speculative base classes
- [ ] Reject abstractions that hide ownership, side effects, or control flow

---

## 10. Suggested initial repository configuration order

1. Add `.github/CODEOWNERS`
2. Create org teams and grant write access appropriately
3. Create `main-governance` ruleset
4. Add required status checks after CI job names are stable
5. Add pull request template
6. Add dependency review and architecture tests
7. Enable merge queue when PR volume justifies it
8. Periodically review bypass permissions and required checks

---

## 11. Minimal initial GitHub setup for day one

If you want the leanest useful starting point, do this first:

- [ ] Protected `main`
- [ ] Pull request required
- [ ] 2 required approvals
- [ ] Require Code Owner review
- [ ] Dismiss stale approvals
- [ ] Require conversation resolution
- [ ] Required checks: `lint`, `typecheck`, `unit-tests`, `contract-tests`, `integration-tests`, `architecture-tests`, `build`
- [ ] No force push
- [ ] No delete
- [ ] `.github/CODEOWNERS` merged into `main`

This is enough to start safely before the rest of the automation is added.

---

## 12. Review cadence for governance health

Recommended cadence:
- weekly: dependency review and flaky test review
- fortnightly: architecture drift review
- monthly: ruleset and bypass audit
- monthly: code ownership review
- monthly: contract and fixture health review

---

## 13. Final note

These GitHub controls are enforcement tools. They do not replace discipline.

The real protection for FoundryRooms is:
- good bounded contexts
- strong contracts
- synchronized fixtures and mocks
- architecture tests
- strict ownership
- small, reviewable pull requests
- continuous governor attention to cohesion and coupling
