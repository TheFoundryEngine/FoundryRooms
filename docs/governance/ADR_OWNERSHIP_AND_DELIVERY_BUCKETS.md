# FoundryRooms — ADR Ownership and Delivery Buckets v0.1

## 1. Purpose

This document defines how ADR ownership is split across the Governor Agent and the three delivery teams.

Its goal is to prevent ADR dependency chains that block feature delivery.

This document answers:
- who owns global ADRs
- who owns feature ADRs
- whether one team should own an ADR end-to-end
- where team ADRs live in the repository
- how cross-team changes are handled without creating shared ownership confusion

---

## 2. Core rule

**Yes — one team should own a feature ADR end-to-end.**

A feature ADR should have:
- one primary bounded-context owner
- one responsible human developer
- one paired feature agent
- one merge path into `main`

This avoids the most common delivery failure mode:
- one ADR written by several teams
- no clear accountability
- partial implementation across boundaries
- review deadlock
- hidden coupling between teams

A feature may consume other teams' approved contracts, but it should not require another team to co-own the same ADR in order to move.

---

## 3. Two ADR classes

## 3.1 Global ADRs

Location:
- `docs/adr/global/`

Owned by:
- Governor Agent
- architecture leadership / project lead approval

Purpose:
- system shape
- stack direction
- boundary rules
- integration model
- testing rules
- deployment model
- frontend/backend interaction model
- other decisions that affect more than one bounded context

### Rule
Global ADRs are the architectural laws of the system.

They are not feature-delivery work items.

Teams consume them. They do not fragment them.

---

## 3.2 Feature ADRs

Location:
- `docs/adr/features/team-a-community-core/`
- `docs/adr/features/team-b-experience/`
- `docs/adr/features/team-c-ops-monetization/`

Owned by:
- exactly one delivery team

Purpose:
- local decisions inside one bounded context or one tightly related feature slice
- implementation choices allowed by the global ADRs
- local tradeoffs, adapter choices, read models, screen flows, handler behavior, and bounded-context refinements

### Rule
Each feature ADR must have one clear owner.

No feature ADR should require joint authorship across teams.

If the decision is truly cross-cutting, it is not a feature ADR — it must be elevated to a global ADR or a governor-approved amendment.

---

## 4. Delivery buckets

FoundryRooms work is split into three delivery buckets.

## 4.1 Bucket A — Community Core

Folder:
- `docs/adr/features/team-a-community-core/`

Primary owner:
- Team A

Contains feature ADRs for:
- Identity & Access
- Community Structure
- membership lifecycle
- invites and onboarding rules
- roles and access groups
- permissions and policy application
- community, space, and channel hierarchy
- navigation and visibility surfaces exposed to other teams

### Team A rule
Team A owns the full ADR for any feature whose main risk is:
- identity
- permissions
- access
- hierarchy
- visibility

Other teams consume Team A contracts. They do not co-own Team A ADRs.

---

## 4.2 Bucket B — Experience Layer

Folder:
- `docs/adr/features/team-b-experience/`

Primary owner:
- Team B

Contains feature ADRs for:
- Engagement
- Resources
- feed and discussion projections
- member-facing experience flows
- resource display and organization in the UI
- unread and notification read models exposed to the frontend
- frontend feature structure in owned areas

### Team B rule
Team B owns the full ADR for any feature whose main risk is:
- user interaction flow
- rendering/read model choice
- discussion/feed behavior
- resource experience
- client-side state composition inside approved contracts

Other teams provide contracts and constraints, but do not co-own Team B ADRs.

---

## 4.3 Bucket C — Operations, Monetization & Automation

Folder:
- `docs/adr/features/team-c-ops-monetization/`

Primary owner:
- Team C

Contains feature ADRs for:
- Events
- Commerce
- Automation
- Admin & Reporting foundations
- worker handlers and retry rules in owned domains
- entitlement-triggered behavior
- scheduling/reminders
- operational read models in owned areas

### Team C rule
Team C owns the full ADR for any feature whose main risk is:
- billing
- entitlements
- event lifecycle
- async processing
- automation rules
- operational/admin behavior

Other teams consume Team C contracts, but do not co-own Team C ADRs.

---

## 5. What happens when a feature touches more than one team?

This is expected.

But the answer is **not** shared ADR ownership.

Use this decision order:

### Case 1 — One team owns the feature, others provide contracts
Example:
- Team B builds a discussion page that needs Team A visibility checks

Result:
- Team B owns the feature ADR
- Team A contract is referenced as a dependency
- Team A does not co-own the ADR

### Case 2 — Existing contracts are insufficient
Example:
- Team C needs a new entitlement read contract from Team A

Result:
- Team A creates or updates its own feature ADR or contract note
- Team C continues owning its own feature ADR
- the Governor ensures both changes align

### Case 3 — The change alters cross-system architectural law
Example:
- event versioning model changes for all teams

Result:
- this becomes a new global ADR or an amendment to an existing global ADR
- no team feature ADR should carry that system-wide burden

---

## 6. Non-blocking rule

A feature is considered safe for parallel delivery when these are approved:
- owning team identified
- acceptance boundary identified
- contracts agreed
- fixtures/mocks agreed
- any required global ADR dependency already accepted

Once those conditions are true, other teams should not block the owning team by demanding runtime completion before progress can continue.

---

## 7. Current global ADRs vs team feature ADRs

## 7.1 Global ADRs remain governor-owned

The current accepted global ADRs remain in:
- `docs/adr/global/`

These include:
- system shape
- bounded contexts
- data and tenancy
- integration and contract model
- identity and authorization model
- governance and testing
- frontend/backend boundary model
- stack and hosting direction
- deployment baseline
- database/model synchronization
- async job execution
- interaction and delivery semantics

These are shared laws, not team buckets.

## 7.2 Future feature ADRs move into team buckets

From this point onward, feature-level ADRs should be created under the owning team's folder.

Examples:

- `docs/adr/features/team-a-community-core/ADR-F-A-001-invite-flow-and-membership-activation.md`
- `docs/adr/features/team-b-experience/ADR-F-B-001-threaded-discussion-read-model.md`
- `docs/adr/features/team-c-ops-monetization/ADR-F-C-001-event-rsvp-reminder-scheduling.md`

---

## 8. Naming rule

Use this naming scheme:

- Team A: `ADR-F-A-###-<slug>.md`
- Team B: `ADR-F-B-###-<slug>.md`
- Team C: `ADR-F-C-###-<slug>.md`

This makes ownership visible immediately.

---

## 9. Review rule

Every feature ADR must be reviewed by:
- the owning human developer
- the owning team's feature agent workflow
- the Governor Agent if the change touches contracts, schema, events, shared frontend surfaces, or cross-context dependency rules

The Governor Agent is the architectural gate.

The Governor Agent is **not** the feature owner.

---

## 10. Final rule

The safest delivery shape for FoundryRooms is:
- **global ADRs are central and governor-owned**
- **feature ADRs are local and singly owned**
- **contracts are shared**
- **feature ownership is not shared**

This is what keeps the project parallelizable.
