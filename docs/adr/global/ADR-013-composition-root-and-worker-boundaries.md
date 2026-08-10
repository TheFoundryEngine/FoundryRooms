# ADR-013: Composition Root and Worker Boundary Rules

- **Status:** Proposed
- **Date:** 2026-08-10
- **Owners:** Governor Agent / Project Architecture Group
- **Related:** ADR-001, ADR-002, ADR-006, ADR-011
- **Linear Issue:** THE-61 (GitHub #22)

## 1. Context

`.dependency-cruiser.js` polices the layers *inside* `modules/` and the purity
of `contracts/`, but two whole compilation roots sit outside every rule:

- **`src/` is unconstrained.** No rule states what the composition root may
  import. It legitimately reaches into module adapters and use cases to wire
  them — but "unconstrained" and "deliberately permitted" are different
  things, and `src/` is where cross-context coupling will accumulate first as
  community-structure, commerce, and events gain implementations.
- **`worker/` is not cruised at all.** `boundary.test.ts` cruised only
  `src/`, `modules/`, `contracts/` — so the worker runtime (which ADR-011
  commits to growing into a real job processor, and PR #14 already expands)
  could import another context's `domain/` with no gate objecting.

## 2. Decision

Boundary rules now state the composition roots' contracts explicitly, and
`worker/` joins the cruise targets.

**`src/` (HTTP composition root):**

- MAY import module `adapters/`, `application/` (use cases and ports), and
  `contracts/` — wiring adapters to ports is its job.
- MUST NOT import module `domain/`. Domain objects never surface at the
  composition root; they stay behind use cases and ports.

**`worker/` (job runtime):**

- MAY import shared `contracts/` and module `contracts/`.
- MUST NOT import module `domain/`, `application/`, or `adapters/`. The
  worker is a separate runtime: it talks to contexts through contracts (and,
  per ADR-011/ADR-012, through queues and events), never through their
  internals. When a job needs a use case, the context exposes it via a
  contract-level surface first.

**Nothing imports a runtime:**

- `modules/**` and `contracts/**` MUST NOT import `src/**` or `worker/**`.
  The dependency arrow points from runtimes to modules, never back.

## 3. Consequences

### Positive

- The composition root's broad reach is now a stated permission with one
  stated exception, instead of an absence of rules.
- PR #14's worker expansion lands under the same deterministic gate as
  everything else — a worker job importing `session.repository.drizzle`
  fails CI, not just review.
- The per-rule architecture suite (THE-60) names the exact law broken.

### Negative

- The worker currently has no contract-level surface to consume, so real job
  implementations are forced to define contracts first (this is the point,
  but it is extra ceremony for the first job).
- `src/` wiring of five adapters per context remains permitted — this ADR
  bounds the composition root, it does not shrink it (see #63 for the
  injection-token cleanup).

## 4. Rules implied by this decision

- `src-must-not-import-domain` — composition root wires adapters and use
  cases, never domain objects
- `worker-must-not-import-module-internals` — the worker consumes contracts,
  not context internals
- `no-module-or-contract-imports-of-runtimes` — modules and contracts never
  depend on `src/` or `worker/`
- `worker/` is a cruise target in `tests/architecture/boundary.test.ts`
