# Response to Issue #1 — Mission Statement, AI Agent Framing, Preview Deploys, Governor Agent

**From:** Bryan  
**Date:** 2026-04-30  
**Re:** [Issue #1 — Define project mission statement](https://github.com/TheFoundryEngine/FoundryRooms/issues/1)

---

## 1. Proposed revision to the mission statement

The current draft is solid but undersells the two things that actually differentiate this product. Revised version for discussion:

> FoundryRooms is an open-source community platform for creators, educators, and teams who want a serious home for their people — structured, premium, and built to run anywhere. Communities organise into rooms, coordinate events, share resources, and grow together. AI agents participate as first-class members — visible, attributable, and useful — not invisible background bots. Self-hosted by default, managed-hosted as a service. The same product, both ways. Built by its community, for its community.

Key changes from the original draft:

- **"run anywhere"** — surfaces the self-hosted/portable story without getting technical in the mission statement
- **"visible, attributable, and useful"** — makes the AI-first-class claim concrete rather than abstract
- **"Self-hosted by default, managed-hosted as a service. The same product, both ways."** — this is a genuine differentiator and deserves to be explicit

This is a proposal, not a decision. Push back freely.

---

## 2. Clarification on "self-hostable" — this means Docker, not a desktop app

Worth being precise here. Self-hosted = **Docker Compose**. ADR-009 already defines this:

- `docker compose up` starts the full stack — frontend, backend, worker, Postgres, Redis
- No cloud account required, no vendor lock-in, no Kubernetes needed for the basic case
- Self-hosters get a compose file and a documented setup path — that's it

This is not an Electron-style desktop app. Electron (used by Notion, VS Code, Slack for their client apps) packages a web UI into a native desktop binary — it has no role in running a multi-user community platform server. Our stack (NestJS + Nuxt + Postgres + Redis) was designed container-first from day one.

The **PWA** path (ADR-008) is our mobile answer — no install required, works on any device.

---

## 3. On AI agents — no ADR exists yet, and that is intentional

**There is currently no agentic framework decision and no ADR covering how AI capabilities will be built into the application.** That is the correct state right now.

The goal for this phase is to **build the codebase and infrastructure to accommodate future AI capabilities** without prematurely coupling us to any specific framework, provider, or integration pattern. This means:

- bounded-context architecture stays clean — AI concerns will enter through explicit adapter boundaries when the time comes, not as ad hoc integrations
- no vendor lock-in to any model provider, orchestration framework, or agent runtime at this stage
- the infrastructure baseline (containers, Postgres, Redis, job queues, contract discipline) is intentionally designed to accommodate AI workers, background agents, and agentic workflows as a future bounded subsystem — without those decisions being made now

When we are ready, this will go through a proper ADR covering provider strategy, integration model, agent identity, and participation contracts. That ADR does not exist yet and should not be authored until the core platform scaffold is in place.

For the mission statement, "AI agents as first-class participants" is a **product vision and design intent**, not a current implementation commitment. We should be honest about that in our internal discussions even if the external product language is aspirational.

---

## 4. Can we see live updates per team member as they push?

Short answer: **yes, via preview deployments — not GitHub Pages**.

GitHub Pages is for static sites only and cannot serve our Nuxt SSR frontend or any backend. The right approach is **preview deploy URLs per PR**, which is standard and already referenced in ADR-009.

How it works:

- every PR triggers the CI pipeline (already wired in `.github/workflows/ci.yml`)
- a preview deploy step publishes the Nuxt frontend to a URL like `https://preview-pr-42.foundryrooms.dev` automatically on each push to that branch
- each team member's branch gets its own live URL as soon as their PR is open
- CI status checks (lint, unit tests, integration tests, contract tests, architecture tests, build) are all visible in the PR in real time as they run through GitHub Actions

This gives us exactly what we want: push a commit, Actions runs, preview URL updates, everyone can see the live state of that branch.

**Two things are not yet in place:**

1. **Wave 0 scaffold** — the Nuxt app needs to exist before there is anything to deploy (Matt's proposal covers this)
2. **Preview deploy workflow** — a step needs to be added to `.github/workflows/` pointing at a host. Cloudflare Pages is the natural fit given ADR-009's vendor posture — free tier, automatic PR preview URLs out of the box

I will raise a follow-up issue to track adding the preview deploy workflow once Wave 0 lands.

---

## 5. The Governor Agent needs to be wired up — it is not active yet

The agent profile exists at `.github/agents/governor.agent.md` and the instructions are well-defined. But as Matt noted, **it is not a real automated reviewer yet** — PR review is currently manual.

To make it active we need a GitHub Actions workflow that:

1. Triggers on `pull_request` (opened, synchronize, ready_for_review)
2. Runs the governor agent against the PR diff — checking ADR compliance, bounded-context boundaries, contract drift, and test coverage proportionality
3. Posts its review as a PR comment and requests changes where rules are violated

The mechanism is a workflow that sends the governor system prompt from `.github/agents/governor.agent.md` plus the PR diff as context to a model API, then posts the result back to the PR.

**This needs its own tracked issue.** I will create: *"Wire up Governor Agent as an automated PR reviewer in GitHub Actions"*. This is a prerequisite before parallel Wave 1 work starts — without it, architecture governance falls entirely on manual review which will not scale across three concurrent teams.

---

## 6. Questions for the group

1. Does the revised mission statement wording work, or does anyone want to rewrite it further?
2. Aligned that self-hosted = Docker Compose, PWA for mobile, no Electron?
3. Agreed that we have no AI/agentic ADR yet and that is correct — we are building to accommodate, not to couple?
4. Do we want the preview deploy workflow tracked as a Wave 0 exit criterion or a Wave 1 task?
5. Governor Agent automation — agree it needs a tracked issue before Wave 1 parallel work starts?
