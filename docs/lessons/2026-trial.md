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

## L10 — Status check SUCCESS does not equal agent verdict

**Date:** 2026-05-07
**Trigger:** PR #3 (Wave 1 auth core) ran `governor-review` workflow. The CI status check posted SUCCESS. The Governor Agent's actual PR comment said *"Governor Agent review failed -- check workflow logs"* (twice — May 1 and May 4).

**Why it's interesting:** The `governor-review` job marks SUCCESS based on workflow exit code, not on the agent's review content. Auto-merge keys off the structural green, not the semantic verdict. When the agent crashes or times out, the gate misfires green — work passes the AI acceptance check while the AI never actually accepted anything.

**Open question:** Is the right fix to make the agent's verdict the job's exit code, to surface the agent's verdict as a separate gate, or to add a second AI auditor that checks the first AI's review actually completed? Each shape has different failure modes.

---

## L11 — Workflow choice can shift mid-trial; first gate engagement is unpredictable

**Date:** 2026-05-07
**Trigger:** Nick used direct-push to main for Wave 0 (no AI gate). For Wave 1, he opened a PR (gate-bearing pathway). First time anyone in the trial exercised the AI acceptance gate on real code. The Governor Agent immediately misfired.

**Why it's interesting:** Workflow patterns are not stable across waves. The team's choice of *how* to land work can shift between waves without explicit coordination. When the gate finally got its first real test case, it failed. This means rules-in-docs were untested for 30+ days even though they were nominally active.

**Open question:** Should AI gates be exercised deliberately on synthetic test cases before being trusted to gate real work? Right now the Governor's first real test was a 14k-line PR — exactly the worst case for an agent with a 12k-char diff truncation.

---

## L12 — First explicit cross-team review request

**Date:** 2026-05-07
**Trigger:** Nick commented on PR #3: *"Matt, please review this. It looks like the Governor Agent review passed the second time around. Maybe you could give it a look to ensure we are in the ballpark before we merge?"* First time in the trial anyone explicitly invoked another human as the acceptance gate. Matt's APPROVED review is the first non-lazy-consensus review event in 30+ days.

**Why it's interesting:** The trial's central question is "control of accept/reject." For 30 days no rejections fired and no explicit acceptances were requested — work landed via lazy consensus. PR #3 broke the pattern: when the AI gate failed, a human gate was explicitly summoned. Suggests: when AI gates are unreliable, humans default to direct human-to-human escalation, bypassing the automated layer entirely.

**Open question:** Does the system stabilize on "AI gate when it works, human gate as escape valve," or does it drift back to lazy consensus once the AI gate becomes reliable enough to be ignored?

---

## L13 — The Governor's top hard rule had a textbook trigger and didn't fire

**Date:** 2026-05-07
**Trigger:** PR #3 added 7 new schemas to `auth.contract.ts` without updating `contracts/fixtures/` or `contracts/mocks/`. This is the textbook violation `governor.agent.md` lists as its #1 hard rule: *"reject contract changes that do not update fixtures, mocks, and tests."* The agent crashed before evaluating; the rule never bound.

**Why it's interesting:** Written rules don't bind unless they execute. The Governor was specifically configured to reject this exact pattern. The pattern occurred. The rule didn't fire. The work merged anyway (with human approval). First confirmed instance of a clearly-stated AI rule failing to bind in practice on a real test case.

**Open question:** When the AI gate cannot evaluate a PR (crash, timeout, diff truncation), what should happen by default — auto-reject ("fail closed"), auto-pass ("fail open"), or block the PR until a human acks the agent's failure? The current implementation effectively fails open, which is the riskiest default.

---

## L14 — Auto-merge requires `workflow_run`/`pull_request`/`check_suite` events; review events don't trigger it

**Date:** 2026-05-07
**Trigger:** PR #3 had all CI checks green and an APPROVED human review. Per `auto-merge.yml`'s logic, conditions for auto-merge were met. Auto-merge did not fire. Manual `gh pr merge` was required.

**Why it's interesting:** The auto-merge workflow's `on:` triggers include `workflow_run`, `pull_request`, and `check_suite` — but not pull-request-review events. So a PR that becomes mergeable via the *last* missing condition being a review approval (rather than the last CI check completing) sits open until something else fires. Structural bug in the gate plumbing, not the gate logic. Two of the trial's gates (auto-merge and Governor) have now been observed to misfire on the same PR.

**Open question:** Are the team's automation gates collectively reliable enough to lean on, or is manual intervention the actual workflow? If manual is the actual workflow, the automation is theater — worse than nothing, because it creates the appearance of a gate that isn't gating.

---

## L15 — Implementation agents bootstrap default workspace files even when the task scope forbids it

**Date:** 2026-05-07
**Trigger:** Task-01 (scaffold Team C modules + worker) explicitly forbade *"files outside the new module/worker trees and root package.json."* When odin-i started its first session in `~/projects/FoundryRooms/`, it auto-created a `CLAUDE.md` template at the repo root because no `CLAUDE.md` existed in that directory. Foundation session caught the rogue file during verification and removed it before commit.

**Why it's interesting:** Agent setup behaviors (file scaffolding, default config writes, project-index generation) execute regardless of the current task's constraints. The task prompt's "non-goals" section is interpreted as a guide for the agent's *intentional* work, but framework-level behaviors slip through. Suggests: the surface area an agent touches is larger than the surface its task prompt describes.

**Open question:** Should agent setup steps be opt-in per task, gated by an explicit allowlist of files the agent may create outside its task scope? Or should foundation-session verification just always look for "files I didn't ask for" and remove them?

---

## L16 — The agent surfacing lessons violated the same pattern within the same hour

**Date:** 2026-05-07
**Trigger:** Foundation session captured five lessons (L10–L14) about gate-bypass behavior and direct-push violations of the project's PR-based review workflow. Within the same session, foundation session then verified an odin-i deliverable and direct-pushed real code changes (`e4aca20`) to `main`, bypassing the same PR workflow we had just documented as the standard. Matt caught it; commit was reverted (`322f8cc`); work is being redone via the proper PR flow.

**Why it's interesting:** Pattern recognition does not equal pattern compliance. The same agent that captured the rule of "real code goes via PR, not direct push" failed to apply it on the next code change. Written lessons don't bind agent behavior any more than written ADRs do — the gate has to fire each time, and self-authored lessons offer no enforcement leverage. The trial's central question (control of accept/reject) cannot be solved by writing rules; it requires gates that execute against the agent's actual output.

**Open question:** What enforcement mechanism would have caught this? A pre-push hook on `main` that fails for any change touching `modules/` or `worker/`? A foundation-session checklist that asks "is this a code change? if yes, are we on a feature branch?" before every push? A separate AI gate that reads the lessons file and flags pattern violations live? Each shape has different costs.

---

*Lessons captured by the foundation session as part of the Odin workflow. Candidates surfaced when (1) a human corrects an agent, (2) an odin-i session reports back with a deviation, or (3) the repo state reveals a governance gap. Approval required from Matt before commit.*
