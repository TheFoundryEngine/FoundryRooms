# Pull Request

## Summary
<!-- What changed and why? -->

## Work Item / ADR References
- Related issue(s):
- ADR reference(s):
- Contract reference(s):

## Context Ownership
- [ ] Team A — Community Core
- [ ] Team B — Experience Layer
- [ ] Team C — Operations & Monetization
- [ ] Cross-context change

## Change Type
- [ ] Feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Contract change
- [ ] Schema change
- [ ] Test-only
- [ ] Documentation
- [ ] CI/CD / tooling

## Bounded Contexts Touched
- [ ] Identity & Access
- [ ] Community Structure
- [ ] Engagement
- [ ] Resources
- [ ] Events
- [ ] Commerce
- [ ] Notifications
- [ ] Automation
- [ ] Admin & Reporting
- [ ] Shared platform / repo governance

## Contract and Boundary Checklist
- [ ] This change stays within one bounded context, **or** all cross-context interactions use approved contracts
- [ ] No internal models from one context are imported into another context
- [ ] No direct table/repository access crosses bounded context boundaries
- [ ] API contracts are updated where required
- [ ] Event contracts are updated where required
- [ ] Mock data / fixtures are updated to match new contracts
- [ ] Backward compatibility impact has been documented

## Schema / Data Impact
- [ ] No schema change
- [ ] Schema change included in this PR
- [ ] Migration added
- [ ] Seed or fixture changes added
- [ ] Data backfill required

### Schema / migration notes
<!-- If schema changes exist, describe the impact and rollback approach -->

## Testing Checklist
- [ ] Unit tests added or updated
- [ ] Integration tests added or updated
- [ ] Contract tests added or updated
- [ ] Architecture boundary tests added or updated where required
- [ ] End-to-end tests added or updated where required
- [ ] All tests pass locally

### Test evidence
<!-- Paste commands, screenshots, or short results -->

## Frontend / Backend Coordination
- [ ] No frontend impact
- [ ] No backend impact
- [ ] Frontend contract updated
- [ ] Backend contract updated
- [ ] Mock server / fixtures updated
- [ ] UI states for loading / empty / error covered

## Risks
<!-- Call out coupling, drift, migration, performance, security, or rollout risk -->

## Rollout / Operational Notes
- [ ] No rollout steps required
- [ ] Feature flag needed
- [ ] Config or secret required
- [ ] Queue / job behavior changed
- [ ] Monitoring / alerting follow-up needed

## Reviewer Guidance
<!-- Where should reviewers focus? -->

## Governor Gate Declaration
- [ ] I confirm this PR follows the active ADRs
- [ ] I confirm this PR does not introduce unapproved architecture drift
- [ ] I confirm this PR does not hide cross-context coupling behind abstractions or utility code
