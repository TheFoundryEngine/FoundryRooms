# Session — THE-62: First real integration test against the CI Postgres

**Branch:** `feat/matt/THE-62-integration-test-harness`
**Base:** `main` @ `44fbdca`
**Session type:** odin-i (implementation)

## What this closes

CI's `integration-tests` job ran `npx vitest run tests/integration --passWithNoTests`
against a directory that didn't exist, so the job could never fail. This was the
last of the fake CI gates (lint/contract/architecture were made real on
2026-08-10 under THE-56/57/58/60). `tests/integration/` now exists with a real
harness and a real suite, and the job can fail.

## What was added

- `tests/integration/setup.ts` — harness module:
  - Reads `DATABASE_URL` at import time; throws immediately (with a message
    pointing at `tests/README.md`) if unset. No silent skip — that was the
    exact failure mode this task exists to kill.
  - Opens a `pg.Pool` + Drizzle handle typed as `Db` (same shape as
    `src/app.module.ts`'s composition root).
  - Exports `runMigrationsUp` / `runMigrationsDown` (runs `migration001`…`004`
    in order / reverse), `truncateAllTables` (single `TRUNCATE ... CASCADE`
    across `sessions, agents, users, actors`), and `closeDb` (ends the pool).
- `tests/integration/identity-access/session.repository.test.ts` — 7 cases
  against `SessionRepositoryDrizzle`, run through `beforeAll`/`afterEach`/`afterAll`
  wired to the harness:
  - `save()` + `findById()` round-trip, including token verification
  - `findByToken()` hit and miss
  - `findByActorId()` returns all sessions for an actor, `[]` for an unrelated one
  - `deleteByToken()` removes only the targeted session
  - `deleteByActorId()` removes all of one actor's sessions, leaves another actor's intact
  - a direct-insert FK violation (`sessions.actor_id` pointing at a
    non-existent actor rejects) — a mocked repository could never catch this
  - `ON DELETE CASCADE`: deleting the owning actor row deletes its sessions
  - Actor rows are inserted directly via the Drizzle `actors` table (no
    `ActorRepository` exists yet) to satisfy the FK before each session insert.

## Blocking issue found during verification (not in the original task framing)

The task instructed excluding `tests/integration` via `vitest.config.ts`'s
`test.exclude`. That looked right on paper but **breaks CI's own
`integration-tests` job**: vitest's CLI positional argument (`tests/integration`)
is a *filter* applied after the file list is built from `include`/`exclude` —
it does not bypass `exclude`. With `tests/integration/**` excluded at the
config level, `npx vitest run tests/integration` (the exact command CI runs)
collects zero files and exits 1 with "No test files found" — regardless of
whether Postgres is up or the tests are correct. I caught this by actually
running `npx vitest run tests/integration` against a live Postgres before
calling it done; it failed immediately, which is what pushed the
investigation.

**Fix:** left `vitest.config.ts` untouched. Instead, `npm test` and
`npm run test:watch` now pass `--exclude 'tests/integration/**'` as a CLI flag
(`package.json`). CLI `--exclude` is additive only for that invocation, so:
- `npm test` (bare `vitest run`) skips `tests/integration` — verified.
- `npx vitest run tests/integration` (CI's exact command, and the husky
  pre-push path indirectly) still resolves the directory normally against the
  unmodified config and runs the suite — verified against a live Postgres.

The glob also had to be quoted (`'tests/integration/**'`) in the npm script —
unquoted, the shell expands `**` itself before vitest sees it, which silently
turned the exclude pattern into two unrelated positional arguments. Caught the
same way, by running the actual script instead of trusting the diff.

## CI change

`.github/workflows/ci.yml` — `integration-tests` job: removed
`--passWithNoTests` and the handoff comment. The job now runs
`npx vitest run tests/integration` against the Postgres 16 service it already
provisions, and will fail if the suite fails or is emptied.

## Docs

`tests/README.md` — Integration Tests section now states the `DATABASE_URL`
requirement, the no-silent-skip behavior, that the suite is excluded from
`npm test`, and a one-liner (`docker run ... postgres:16-alpine`) to stand up
a local Postgres and run the suite. No dependency on `docker-compose.yml`
(unmerged, PR #14, not on `main`).

## Verification performed

All commands below were actually run, not assumed:

- `npm run lint` — clean (zero-warning budget)
- `npm run typecheck` — clean
- `npm test` — 640/640 passed, `tests/integration` not in the file list
- `npm run arch:test` — 11/11 passed
- `npx vitest run tests/contract` — 102/102 passed
- `npm run build` — clean
- Live Postgres (`postgres:16-alpine` in Docker, port 5434 — 5432 was already
  occupied locally by an unrelated container): `DATABASE_URL=... npx vitest run
  tests/integration` — 7/7 passed
- **Gate-is-real check:** temporarily changed one `expect(...).toBe(actorId)`
  to an obviously wrong literal, re-ran against the live Postgres — 1 failed /
  6 passed, exit code 1, then reverted and re-ran clean (7/7, exit 0).
- Unset `DATABASE_URL`, ran `npx vitest run tests/integration` — suite fails
  immediately with the harness's error message, exit code 1 (not a skip).

`node_modules` had to be materialized with `npm install` first (declared
devDependencies, including `eslint`, were not installed in the working tree at
session start) — no `package.json` dependency changes resulted from it,
confirmed via `git diff --stat`.

## Out of scope, confirmed untouched

User/agent repository integration suites, `modules/**` production code,
`worker/`, `apps/frontend/`, testcontainers/new infra deps, architecture
rules.

## Files changed

- `tests/integration/setup.ts` (new)
- `tests/integration/identity-access/session.repository.test.ts` (new)
- `package.json` (`test`, `test:watch` scripts)
- `.github/workflows/ci.yml` (`integration-tests` job)
- `tests/README.md`
- `docs/sessions/2026-08-12-the-62-integration-tests.md` (this file)
- `.odin/tasks/task-THE-62-integration-test-harness-summary.md`

`vitest.config.ts` has **no diff** — the originally-suggested approach (config-level
exclude) was tried and reverted after it was shown to break CI's own job; see
above.
