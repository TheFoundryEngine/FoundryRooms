# Wave 4: Operations & Admin Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan.

**Goal:** Complete the membership lifecycle with invitations, admin actions, moderation capabilities, and audit trails.

**Architecture:** Invitation flow for controlled onboarding. Moderation actions for community management. Audit logging for compliance.

**Tech Stack:** TypeScript, NestJS, Drizzle, PostgreSQL, Zod, Vitest

---

## File Structure

```
modules/identity-access/
├── domain/
│   ├── invitation.entity.ts
│   ├── moderation-action.entity.ts
│   └── audit-entry.entity.ts
├── application/
│   ├── use-cases/
│   │   ├── create-invitation.use-case.ts
│   │   ├── accept-invitation.use-case.ts
│   │   ├── suspend-member.use-case.ts
│   │   ├── ban-member.use-case.ts
│   │   └── transfer-ownership.use-case.ts
│   └── services/
│       └── audit-logger.service.ts
├── adapters/
│   ├── outbound/drizzle/
│   │   └── migrations/014-016
│   └── inbound/
│       ├── invitation.controller.ts
│       ├── moderation.controller.ts
│       └── audit.controller.ts
```

---

## Task 1-2: Define Invitation Model (Issues 90-91)
- [ ] Invitation entity - inviter, invitee, community, token, status, expiresAt
- [ ] InvitationPolicy - who can invite, limits, expiration defaults
- [ ] Unit tests, commit each

## Task 3-4: Invitation Infrastructure (Issues 92-93)
- [ ] 014_create_invitations.ts migration
- [ ] InvitationRepository - findByToken, findByCommunity
- [ ] Commit each

## Task 5-8: Invitation Use Cases (Issues 94-97)
- [ ] CreateInvitation - check permission, generate token
- [ ] AcceptInvitation - validate token, create membership
- [ ] RevokeInvitation - mark as revoked
- [ ] BulkInvite - batch create with limits
- [ ] Unit tests, commit each

## Task 9: Invitation HTTP Endpoints (Issue 98)
- [ ] POST /communities/:id/invitations, /bulk
- [ ] POST /invitations/:token/accept
- [ ] DELETE /invitations/:id
- [ ] Commit: `feat(identity): create invitation endpoints`

## Task 10-12: Moderation Model (Issues 99-101)
- [ ] ModerationAction entity - type, target, reason, performedBy
- [ ] 015_create_moderation_actions.ts migration
- [ ] ModerationActionRepository - append-only
- [ ] Commit each

## Task 13-16: Moderation Use Cases (Issues 102-105)
- [ ] SuspendMember - update status, record action
- [ ] BanMember - update status, record action
- [ ] UnbanMember - restore status, record action
- [ ] WarnMember - record action only
- [ ] Unit tests, commit each

## Task 17: Moderation HTTP Endpoints (Issue 106)
- [ ] POST /communities/:id/members/:actorId/suspend, ban, unban, warn
- [ ] GET /communities/:id/moderation-log
- [ ] Commit: `feat(identity): create moderation endpoints`

## Task 18-21: Audit System (Issues 107-110)
- [ ] AuditEntry entity - action, actorId, targetType, targetId, metadata
- [ ] 016_create_audit_log.ts migration
- [ ] AuditLogRepository - append, query by actor/target/time
- [ ] AuditLoggerService - hook into use cases
- [ ] Commit each

## Task 22: Audit HTTP Endpoints (Issue 111)
- [ ] GET /communities/:id/audit (admin only)
- [ ] GET /actors/:id/audit (admin only)
- [ ] Commit: `feat(identity): create audit endpoints`

## Task 23-25: Admin Operations (Issues 112-114)
- [ ] TransferOwnership - revoke/assign owner role
- [ ] DeleteCommunity - soft-delete, cascading
- [ ] UpdateMemberRole - change role within community
- [ ] Unit tests, commit each

## Task 26: Profile Management Endpoints (Issue 115)
- [ ] GET/PATCH /actors/:id/profile
- [ ] Commit: `feat(identity): create profile endpoints`

## Task 27: DeactivateActor Use Case (Issue 116)
- [ ] Self or admin deactivation, invalidate sessions
- [ ] Commit: `feat(identity): implement DeactivateActor`

## Task 28: Contract Tests (Issue 117)
- [ ] Test invitation, moderation, audit endpoints
- [ ] Commit: `test(identity): add contract tests for Wave 4`

## Task 29: Integration Tests (Issue 118)
- [ ] Full flows: register → join → role → moderate → audit
- [ ] Commit: `test: add integration tests for full flows`

## Task 30: Architecture Tests (Issue 119)
- [ ] No forbidden imports, domain isolation
- [ ] Add to CI pipeline
- [ ] Commit: `test: add architecture tests`

---

## Summary

Wave 4: **30 tasks** covering Issues 90-119
- Invitation system for controlled onboarding
- Moderation (warn, suspend, ban)
- Audit logging for compliance
- Admin operations (transfer ownership, delete community)
- Full integration and architecture tests

**After Wave 4:** Team A's v1 foundation is complete.
