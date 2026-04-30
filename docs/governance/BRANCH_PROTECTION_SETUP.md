# Branch Protection and Merge Rules — Setup Guide

**Status:** Active  
**Owner:** @TheFoundryEngine  
**Last updated:** 2026-04-30

These settings must be applied manually in GitHub repository settings. They cannot be committed as code.

---

## 1. Protected branch: `main`

Go to: **Settings → Branches → Add branch protection rule** → branch name: `main`

### Required status checks (must all pass before merge)

Enable: **Require status checks to pass before merging**  
Enable: **Require branches to be up to date before merging**

Add all of the following as required checks:

| Check name | Workflow |
|------------|----------|
| `lint` | CI |
| `unit-tests` | CI |
| `integration-tests` | CI |
| `contract-tests` | CI |
| `architecture-tests` | CI |
| `build` | CI |
| `governor-review` | Governor Agent Review |
| `docs-validation` | CI |

### Required reviews

Enable: **Require a pull request before merging**  
Set: **Required number of approvals** = `1`  
Enable: **Dismiss stale pull request approvals when new commits are pushed**  
Enable: **Require review from Code Owners**

### Additional settings

Enable: **Require conversation resolution before merging**  
Enable: **Do not allow bypassing the above settings** (applies to admins too)  
Disable: **Allow force pushes**  
Disable: **Allow deletions**

---

## 2. Auto-merge

The `auto-merge.yml` workflow handles automatic merging when all conditions are met:

- All required status checks pass (see table above)
- At least one PR approval exists
- PR is not a draft
- Merge method: **squash** (keeps `main` history clean)

No additional GitHub settings are required for the workflow itself, but the Actions token needs write permissions — already configured in `auto-merge.yml`.

---

## 3. Governor Agent — Secret required

The `governor-review.yml` workflow calls the Anthropic API.

Add the following secret in **Settings → Secrets and variables → Actions**:

| Secret name | Value |
|-------------|-------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |

Without this secret, the `governor-review` job will fail and block merges.

---

## 4. How the full PR flow works

```
Developer opens PR
        │
        ▼
CI runs (lint, unit, integration, contract, architecture, build)
        │
        ▼
Governor Agent reviews diff against ADRs + AGENTS.md
Posts review comment on PR
Fails job if REJECTED
        │
        ▼
Human reviewer approves (CODEOWNERS enforces who must review)
        │
        ▼
auto-merge workflow detects all checks passed + approval
Squash merges into main automatically
```

---

## 5. Team ownership summary

| Area | Owner | GitHub username |
|------|-------|----------------|
| Governor / Architecture / ADRs | Bryan | @TheFoundryEngine |
| Team A — Community Core (identity, community structure) | Nick | @NickFlach |
| Team C — Ops & Monetization (events, commerce, worker) | Matt | @EckmanTechLLC |
| Team B — Experience (frontend, engagement, resources) | TBD | — |

CODEOWNERS enforces that every PR touching a context requires approval from the context owner plus the Governor.

---

## 6. When Wave 0 lands

Once Matt's Wave 0 scaffold PR lands, update `ci.yml` to replace all placeholder `echo` steps with real commands:

- `lint` → `pnpm lint`
- `unit-tests` → `pnpm test:unit`
- `integration-tests` → `pnpm test:integration` (with Docker Compose services)
- `contract-tests` → `pnpm test:contract`
- `architecture-tests` → `pnpm test:arch`
- `build` → `pnpm build`

Until then, placeholder steps pass by default and do not block merges.
