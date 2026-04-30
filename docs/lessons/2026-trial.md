# FoundryRooms Trial — Lessons Learned

**Trial question:** How do multiple high-skilled humans + multiple AI agents effectively collaborate to build tools and applications? Specifically: how is control over what is accepted vs rejected actually exercised?

**Status:** First-run trial. May be wiped and restarted with lessons carried forward. The build process IS the experiment.

This file captures generalizable patterns about multi-human + multi-AI collaboration. Anecdotes, project-management observations, and individual mistakes are out of scope — only patterns relevant to the trial question are recorded here.

Format per entry: **trigger → why it's interesting → open question** (where applicable).

---

## L1 — Without an active enforcement gate, lazy consensus is the default acceptance protocol

**Date:** 2026-04-30
**Trigger:** Four acceptance models exist on this repo — Governor Agent on PRs, auto-merge after checks, CODEOWNERS review, foundation-session verification. When none are active for a given pathway, work merges by default.

**Why it's interesting:** Governance documents bind only when one gate is wired and firing on the actual pathway being used. The repo has elaborate process docs (ADR ownership rules, branch protection setup, CODEOWNERS) that describe what *should* gate what. None of those bind direct-to-main pushes. Three of us have direct-pushed substantive architectural changes in the last 24 hours.

**Open question:** Where else is lazy consensus filling gaps that nominal gates were supposed to fill?

---

## L2 — Cross-AI context isolation makes the shared substrate the coordination channel

**Date:** 2026-04-30
**Trigger:** Three humans + three Claude instances with no shared context converged on substantive architectural decisions (Actor model, stack standards, repository layout, team scope) over 30 days, communicating only through commits to `main`.

**Why it's interesting:** Counter-evidence to the assumption that multi-human + multi-AI work needs synchronous coordination. The thinness of the channel is a feature — it forces decisions into a place where they can be inspected by every other human+AI pair. Anything not on `main` is invisible to the rest of the team.

**Open question:** What kinds of decisions *fail* to converge through this channel? When does the substrate stop being enough?

---

## L3 — Acceptance gates that only fire on PRs leave direct-push as an unguarded pathway

**Date:** 2026-04-30
**Trigger:** Bryan's Governor Agent workflow fires on `pull_request` events only. The most architecturally significant decisions on this repo — repository layout, Actor model, stack standards (Zod, Vitest, npm workspaces, Node 20), the introduction of `contracts/jobs/` directory — all landed direct-to-main. Zero AI review on any of them.

**Why it's interesting:** If accept/reject control is the trial's central question, direct-push is currently a bypass that no model is reasoning about. The acceptance system is implicitly assuming a pathway (PRs) that the team is not using.

**Open question:** What would an acceptance gate that fires on direct-to-main pushes actually do? Block? Annotate? Surface a comment-after-the-fact for retrospective review?

---

## L4 — Disagreements visible to multiple human+AI pairs persist silently when raising them is socially costly

**Date:** 2026-04-30
**Trigger:** The `apps/backend/src/<context>/` (per CODEOWNERS + ADRs 008/010/011) vs `modules/<context>/` (per Nick's Wave 0 plan and the actual codebase) layout conflict has been visible since Apr 2. Nobody has explicitly objected. Resolution requires picking a side; the social cost of confrontation appears to exceed the cost of contradiction.

**Why it's interesting:** AI agents could in principle surface contradictions like this neutrally — they have no social cost to raising them. None currently does. The Governor Agent could; it doesn't, because each PR's diff is reviewed in isolation, not against the cross-document state of the repo.

**Open question:** What would an AI gate that detects "the docs say X but the code says Y" look like? Is this a continuous-integration check, or a periodic audit?

---

## L5 — Different human↔AI tooling choices produce structurally different artifacts at different rates on the same project

**Date:** 2026-04-30
**Trigger:** Three teammates, three driving patterns, same repo:
- Bryan (plain Claude, governance-first) → ADRs, process docs, capability map, governance setup guides
- Nick (Superpowers skill, plan-sweep) → 119-issue scoped Team A spec + 18-task implementation plan, queued to execute in one session
- Matt (Odin foundation/implementation split with verification gates) → 123-issue scoped Team C spec with explicit Open Items, 7 task prompts each requiring foundation-session verification before commit

**Why it's interesting:** Same project, three structurally different output shapes. The *choice of how to drive your AI* determines what the team produces, not just how fast. Bryan's pattern produces governance; Nick's produces scoped execution units; Matt's produces verification-gated work.

**Open question:** Do these three artifact shapes compose, or do they produce friction? Will the codebase reflect the diversity of driving patterns, or will one dominate?

---

## L6 — Bryan's Governor Agent and Nick's Superpowers skill encode different theories of acceptance

**Date:** 2026-04-30
**Trigger:** Two acceptance philosophies running on the same repo at the same time:
- **Governor Agent (Bryan):** Post-hoc gate. Review after the work is complete, post a comment, return APPROVED / CHANGES REQUESTED / REJECTED. The gate is between "code written" and "code merged."
- **Superpowers skill (Nick):** Intra-session gate. The skill's prompt structure shapes what the agent does as it works. The gate is between "intent" and "code written."

**Why it's interesting:** The trial is naturally A/B testing two acceptance philosophies. Each catches different kinds of drift. Pre-work shaping (Nick) prevents whole categories of bad code from being written but is silent about decisions the prompt didn't anticipate. Post-work review (Bryan) catches anything that landed but is reactive and bandwidth-limited (governor-review.sh truncates the diff to 12000 chars).

**Open question:** Which catches more drift, and where does each fail systematically? Is the answer "use both" or "they undercut each other"?

---

## L7 — In 30 days across 4 acceptance models, zero rejections have fired

**Date:** 2026-04-30
**Trigger:** No PR review has rejected anything. No Governor Agent comment has said REJECTED. No CODEOWNERS reviewer has blocked. No foundation-session verification has refused a deliverable. Yet visible governance violations have occurred — the Actor model was added without an ADR despite ADR ownership rules requiring one; the layout disagreement persists despite ADR-008/010/011 mandating a specific layout.

**Why it's interesting:** Either the work is uniformly good (unlikely given the visible violations), or the gates aren't catching what they're nominally for. For a trial whose stated central question is accept/reject control, never observing a rejection is the most important data hole.

**Open question:** What happens if a deliberately flawed change is introduced — does any gate catch it? This may need to be an explicit experiment rather than waiting for an organic test.

---

## L8 — When humans + AI build a system *for* human + AI collaboration, the data model tends to mirror the team's coordination model

**Date:** 2026-04-30
**Trigger:** Nick's Actor model (User and Agent as first-class peers in identity, sharing the same permission and entitlement infrastructure) is the only artifact in the project that connects "what we're studying" (multi-human + multi-AI collaboration) to "what we're building" (a community platform with first-class agents).

**Why it's interesting:** Whether intentional or not, the substrate is becoming self-referential. The platform we're building treats humans and agents as peers in the same way the team building it does. This is rare — most systems built by mixed human+AI teams treat agents as tooling, not as participants. The Actor model encodes a different stance.

**Open question:** Will subsequent decisions reinforce or break this pattern? When the team gets to user authentication, role assignment, content moderation — do agents remain first-class, or does the lived complexity of v1 push them back into "tool" status?

---

## L9 — Known-broken automation accumulates tolerance faster than discipline to repair

**Date:** 2026-04-30
**Trigger:** The auto-merge workflow fails on every direct-to-main push (it tries to look up a PR that doesn't exist for direct pushes, errors out). Bryan, Nick, and Matt have all observed the failure across their commits. No issue has been filed. No fix attempted.

**Why it's interesting:** The collective ignore-pattern is itself a finding. Mature human+AI teams appear to develop tolerance for known broken automation faster than they develop the practice of repairing it. Hypothesis: AI assistance amplifies the tolerance because the human can route around the broken thing — the workflow fails, but the work proceeds, so the cost of the failure is low and gets normalized.

**Open question:** Is there a mechanism by which AI agents could surface accumulated technical-debt-from-tolerance to a team? "These three things have been broken for N days, none of you have raised them" — does the team want that pressure, or does it become noise?

---

*Lessons captured by the foundation session as part of the Odin workflow. Candidates surfaced when (1) a human corrects an agent, (2) an odin-i session reports back with a deviation, or (3) the repo state reveals a governance gap. Approval required from Matt before commit.*
