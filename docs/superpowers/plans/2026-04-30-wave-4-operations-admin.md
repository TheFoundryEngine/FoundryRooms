# Wave 4: Operations & Admin Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan.

**Goal:** Complete the membership lifecycle with invitations, admin actions, moderation capabilities, and audit trails.

**Architecture:** Invitation flow for controlled member onboarding. Moderation actions for community management. Audit logging for compliance and debugging.

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
│   ├── ports/
│   │   ├── invitation.repository.ts
│   │   ├── moderation-action.repository.ts
│   │   └── audit-log.repository.ts
│   ├── use-cases/
│   │   ├── create-invitation.use-case.ts
│   │   ├── accept-invitation.use-case.ts
│   │   ├── revoke-invitation.use-case.ts
│   │   ├── bulk-invite.use-case.ts
│   │   ├── suspend-member.use-case.ts
│   │   ├── ban-member.use-case.ts
│   │   ├── unban-member.use-case.ts
│   │   ├── warn-member.use-case.ts
│   │   ├── transfer-ownership.use-case.ts
│   │   ├── delete-community.use-case.ts
│   │   ├── update-member-role.use-case.ts
│   │   └── deactivate-actor.use-case.ts
│   └── services/
│       └── audit-logger.service.ts
├── adapters/
│   ├── outbound/drizzle/
│   │   ├── migrations/
│   │   │   ├── 014_create_invitations.ts
│   │   │   ├── 015_create_moderation_actions.ts
│   │   │   └── 016_create_audit_log.ts
│   │   └── *.repository.drizzle.ts
│   └── inbound/
│       ├── invitation.controller.ts
│       ├── moderation.controller.ts
│       ├── audit.controller.ts
│       └── profile.controller.ts
```

---

## Task 1: Define Invitation Domain Model (Issue 90)

**Files:** `modules/identity-access/domain/invitation.entity.ts`

- [ ] Create `InvitationId` value object
- [ ] Create `InvitationStatus` enum: `'pending' | 'accepted' | 'revoked' | 'expired'`
- [ ] Create `Invitation` entity with: id, inviterActorId, inviteeEmail (or inviteeActorId), communityId, roleToGrant, token, status, expiresAt, createdAt
- [ ] Add `isExpired()` method
- [ ] Write unit tests
- [ ] Commit: `feat(identity): define Invitation domain model`

---

## Task 2: Define InvitationPolicy (Issue 91)

**Files:** `modules/identity-access/domain/policies/invitation.policy.ts`

- [ ] Create `InvitationPolicy` class
- [ ] Define who can invite (role-based)
- [ ] Define invitation limits per actor
- [ ] Define default expiration (7 days)
- [ ] Write unit tests
- [ ] Commit: `feat(identity): define InvitationPolicy`

---

## Task 3: Create Invitations Table Migration (Issue 92)

**Files:** `modules/identity-access/adapters/outbound/drizzle/migrations/014_create_invitations.ts`

```sql
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_actor_id UUID NOT NULL REFERENCES actors(id),
  invitee_email VARCHAR(255),
  invitee_actor_id UUID REFERENCES actors(id),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  role_to_grant UUID REFERENCES roles(id),
  token VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_community ON invitations(community_id);
```

- [ ] Write and run migration
- [ ] Commit: `feat(identity): create invitations table migration`

---

## Task 4: Implement Invitation Repository (Issue 93)

**Files:** `modules/identity-access/adapters/outbound/drizzle/invitation.repository.drizzle.ts`

- [ ] Implement `InvitationRepositoryDrizzle` class
- [ ] Methods: findById, findByToken, findByCommunity (paginated), findByInviter, save, update
- [ ] Write integration tests
- [ ] Commit: `feat(identity): implement Invitation repository`

---

## Task 5: Implement CreateInvitation Use Case (Issue 94)

**Files:** `modules/identity-access/application/use-cases/create-invitation.use-case.ts`

- [ ] Create `CreateInvitationUseCase` class
- [ ] Check inviter has permission to invite
- [ ] Check invitation limits
- [ ] Generate secure token
- [ ] Create invitation with expiration
- [ ] Emit `InvitationCreated` event
- [ ] Write unit tests
- [ ] Commit: `feat(identity): implement CreateInvitation use case`

---

## Task 6: Implement AcceptInvitation Use Case (Issue 95)

**Files:** `modules/identity-access/application/use-cases/accept-invitation.use-case.ts`

- [ ] Create `AcceptInvitationUseCase` class
- [ ] Validate token exists and not expired
- [ ] Create membership with specified role
- [ ] Mark invitation as accepted
- [ ] Emit `InvitationAccepted` event
- [ ] Write unit tests
- [ ] Commit: `feat(identity): implement AcceptInvitation use case`

---

## Task 7: Implement RevokeInvitation Use Case (Issue 96)

**Files:** `modules/identity-access/application/use-cases/revoke-invitation.use-case.ts`

- [ ] Create `RevokeInvitationUseCase` class
- [ ] Check permission (inviter or admin)
- [ ] Mark invitation as revoked
- [ ] Emit `InvitationRevoked` event
- [ ] Write unit tests
- [ ] Commit: `feat(identity): implement RevokeInvitation use case`

---

## Task 8: Implement BulkInvite Use Case (Issue 97)

**Files:** `modules/identity-access/application/use-cases/bulk-invite.use-case.ts`

- [ ] Create `BulkInviteUseCase` class
- [ ] Accept list of emails
- [ ] Check total invitation limits
- [ ] Create invitations in batch
- [ ] Emit events for each
- [ ] Return created invitations and any errors
- [ ] Write unit tests
- [ ] Commit: `feat(identity): implement BulkInvite use case`

---

## Task 9: Create Invitation HTTP Endpoints (Issue 98)

**Files:** `modules/identity-access/adapters/inbound/invitation.controller.ts`

- [ ] POST `/communities/:id/invitations` - create invitation
- [ ] POST `/communities/:id/invitations/bulk` - bulk invite
- [ ] GET `/communities/:id/invitations` - list invitations
- [ ] POST `/invitations/:token/accept` - accept invitation
- [ ] DELETE `/invitations/:id` - revoke invitation
- [ ] Write controller tests
- [ ] Commit: `feat(identity): create invitation HTTP endpoints`

---

## Task 10: Define ModerationAction Domain Model (Issue 99)

**Files:** `modules/identity-access/domain/moderation-action.entity.ts`

- [ ] Create `ModerationActionId` value object
- [ ] Create `ModerationActionType` enum: `'warn' | 'suspend' | 'ban' | 'unban'`
- [ ] Create `ModerationAction` entity with: id, type, targetActorId, communityId, reason, performedByActorId, createdAt
- [ ] Append-only audit record
- [ ] Write unit tests
- [ ] Commit: `feat(identity): define ModerationAction domain model`

---

## Task 11: Create Moderation Actions Table Migration (Issue 100)

**Files:** `modules/identity-access/adapters/outbound/drizzle/migrations/015_create_moderation_actions.ts`

```sql
CREATE TABLE moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL,
  target_actor_id UUID NOT NULL REFERENCES actors(id),
  community_id UUID NOT NULL REFERENCES communities(id),
  reason TEXT,
  performed_by_actor_id UUID NOT NULL REFERENCES actors(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_moderation_target ON moderation_actions(target_actor_id);
CREATE INDEX idx_moderation_community ON moderation_actions(community_id);
```

- [ ] Write and run migration
- [ ] Commit: `feat(identity): create moderation_actions table migration`

---

## Task 12: Implement ModerationAction Repository (Issue 101)

**Files:** `modules/identity-access/adapters/outbound/drizzle/moderation-action.repository.drizzle.ts`

- [ ] Implement `ModerationActionRepositoryDrizzle` class
- [ ] Methods: create (append-only), findByTarget, findByCommunity (paginated)
- [ ] Write integration tests
- [ ] Commit: `feat(identity): implement ModerationAction repository`

---

## Task 13: Implement SuspendMember Use Case (Issue 102)

**Files:** `modules/identity-access/application/use-cases/suspend-member.use-case.ts`

- [ ] Create `SuspendMemberUseCase` class
- [ ] Check permission (moderator or higher)
- [ ] Update membership status to suspended
- [ ] Record moderation action
- [ ] Emit `MemberSuspended` event
- [ ] Write unit tests
- [ ] Commit: `feat(identity): implement SuspendMember use case`

---

## Task 14: Implement BanMember Use Case (Issue 103)

**Files:** `modules/identity-access/application/use-cases/ban-member.use-case.ts`

- [ ] Create `BanMemberUseCase` class
- [ ] Check permission (admin or higher)
- [ ] Update membership status to banned
- [ ] Record moderation action
- [ ] Emit `MemberBanned` event
- [ ] Write unit tests
- [ ] Commit: `feat(identity): implement BanMember use case`

---

## Task 15: Implement UnbanMember Use Case (Issue 104)

**Files:** `modules/identity-access/application/use-cases/unban-member.use-case.ts`

- [ ] Create `UnbanMemberUseCase` class
- [ ] Check permission (admin or higher)
- [ ] Update membership status to active
- [ ] Record moderation action
- [ ] Emit `MemberUnbanned` event
- [ ] Write unit tests
- [ ] Commit: `feat(identity): implement UnbanMember use case`

---

## Task 16: Implement WarnMember Use Case (Issue 105)

**Files:** `modules/identity-access/application/use-cases/warn-member.use-case.ts`

- [ ] Create `WarnMemberUseCase` class
- [ ] Check permission (moderator or higher)
- [ ] Record moderation action (no status change)
- [ ] Emit `MemberWarned` event
- [ ] Write unit tests
- [ ] Commit: `feat(identity): implement WarnMember use case`

---

## Task 17: Create Moderation HTTP Endpoints (Issue 106)

**Files:** `modules/identity-access/adapters/inbound/moderation.controller.ts`

- [ ] POST `/communities/:id/members/:actorId/suspend` - suspend
- [ ] POST `/communities/:id/members/:actorId/ban` - ban
- [ ] POST `/communities/:id/members/:actorId/unban` - unban
- [ ] POST `/communities/:id/members/:actorId/warn` - warn
- [ ] GET `/communities/:id/moderation-log` - list actions
- [ ] Write controller tests
- [ ] Commit: `feat(identity): create moderation HTTP endpoints`

---

## Task 18: Define AuditEntry Domain Model (Issue 107)

**Files:** `modules/identity-access/domain/audit-entry.entity.ts`

- [ ] Create `AuditEntryId` value object
- [ ] Create `AuditEntry` entity with: id, action, actorId, targetType, targetId, metadata, timestamp
- [ ] Generic audit log for all sensitive operations
- [ ] Immutable/append-only
- [ ] Write unit tests
- [ ] Commit: `feat(identity): define AuditEntry domain model`

---

## Task 19: Create Audit Log Table Migration (Issue 108)

**Files:** `modules/identity-access/adapters/outbound/drizzle/migrations/016_create_audit_log.ts`

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(100) NOT NULL,
  actor_id UUID REFERENCES actors(id),
  target_type VARCHAR(50),
  target_id UUID,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_audit_actor ON audit_log(actor_id);
CREATE INDEX idx_audit_target ON audit_log(target_type, target_id);
CREATE INDEX idx_audit_timestamp ON audit_log(timestamp);
```

- [ ] Write and run migration
- [ ] Commit: `feat(identity): create audit_log table migration`

---

## Task 20: Implement AuditLog Repository (Issue 109)

**Files:** `modules/identity-access/adapters/outbound/drizzle/audit-log.repository.drizzle.ts`

- [ ] Implement `AuditLogRepositoryDrizzle` class
- [ ] Methods: append, queryByActor, queryByTarget, queryByTimeRange (paginated)
- [ ] Write integration tests
- [ ] Commit: `feat(identity): implement AuditLog repository`

---

## Task 21: Implement Audit Logging Service (Issue 110)

**Files:** `modules/identity-access/application/services/audit-logger.service.ts`

- [ ] Create `AuditLoggerService` class
- [ ] Method: `log(action, actorId, target, metadata)`
- [ ] Hook into use cases for automatic audit capture
- [ ] Write unit tests
- [ ] Commit: `feat(identity): implement audit logging service`

---

## Task 22: Create Audit HTTP Endpoints (Issue 111)

**Files:** `modules/identity-access/adapters/inbound/audit.controller.ts`

- [ ] GET `/communities/:id/audit` - community audit log (admin only)
- [ ] GET `/actors/:id/audit` - actor audit log (admin only)
- [ ] Permission-gated
- [ ] Paginated
- [ ] Write controller tests
- [ ] Commit: `feat(identity): create audit HTTP endpoints`

---

## Task 23: Implement TransferOwnership Use Case (Issue 112)

**Files:** `modules/community-structure/application/use-cases/transfer-ownership.use-case.ts`

- [ ] Create `TransferOwnershipUseCase` class
- [ ] Only current owner can transfer
- [ ] Revoke owner role from current owner
- [ ] Assign owner role to new owner
- [ ] Emit `OwnershipTransferred` event
- [ ] Log to audit
- [ ] Write unit tests
- [ ] Commit: `feat(community): implement TransferOwnership use case`

---

## Task 24: Implement DeleteCommunity Use Case (Issue 113)

**Files:** `modules/community-structure/application/use-cases/delete-community.use-case.ts`

- [ ] Create `DeleteCommunityUseCase` class
- [ ] Only owner can delete
- [ ] Soft-delete or archive community
- [ ] Handle cascading rules (memberships, content)
- [ ] Emit `CommunityDeleted` event
- [ ] Log to audit
- [ ] Write unit tests
- [ ] Commit: `feat(community): implement DeleteCommunity use case`

---

## Task 25: Implement UpdateMemberRole Use Case (Issue 114)

**Files:** `modules/community-structure/application/use-cases/update-member-role.use-case.ts`

- [ ] Create `UpdateMemberRoleUseCase` class
- [ ] Check permission (admin or owner)
- [ ] Cannot demote owner
- [ ] Update actor's role for community scope
- [ ] Emit `MemberRoleUpdated` event
- [ ] Write unit tests
- [ ] Commit: `feat(community): implement UpdateMemberRole use case`

---

## Task 26: Create Profile Management Endpoints (Issue 115)

**Files:** `modules/identity-access/adapters/inbound/profile.controller.ts`

- [ ] GET `/actors/:id/profile` - get profile
- [ ] PATCH `/actors/:id/profile` - update own profile
- [ ] Actors can only update their own profile
- [ ] Write controller tests
- [ ] Commit: `feat(identity): create profile management endpoints`

---

## Task 27: Implement DeactivateActor Use Case (Issue 116)

**Files:** `modules/identity-access/application/use-cases/deactivate-actor.use-case.ts`

- [ ] Create `DeactivateActorUseCase` class
- [ ] Self-deactivation or admin deactivation
- [ ] Set isActive = false
- [ ] Invalidate all sessions
- [ ] Emit `ActorDeactivated` event
- [ ] Log to audit
- [ ] Write unit tests
- [ ] Commit: `feat(identity): implement DeactivateActor use case`

---

## Task 28: Contract Tests for Wave 4 (Issue 117)

**Files:** `tests/contract/identity-access/wave4.contract.test.ts`

- [ ] Test invitation endpoints match contracts
- [ ] Test moderation endpoints match contracts
- [ ] Test audit endpoints match contracts
- [ ] Test profile endpoints match contracts
- [ ] Write comprehensive contract tests
- [ ] Commit: `test(identity): add contract tests for Wave 4`

---

## Task 29: Integration Tests for Full Flows (Issue 118)

**Files:** `tests/integration/full-flows.test.ts`

- [ ] Test: register → join community → get role → perform action
- [ ] Test: invite → accept → get role → leave
- [ ] Test: create community → invite members → moderate → audit
- [ ] Test: agent creation → API auth → permission check
- [ ] End-to-end flow verification
- [ ] Commit: `test: add integration tests for full flows`

---

## Task 30: Architecture Tests for Team A Modules (Issue 119)

**Files:** `tests/architecture/team-a.architecture.test.ts`

- [ ] No forbidden imports (domain cannot import adapters)
- [ ] Domain isolation verified
- [ ] Module boundaries enforced
- [ ] No circular dependencies
- [ ] Add to CI pipeline
- [ ] Commit: `test: add architecture tests for Team A modules`

---

## Summary

Wave 4 completes Team A's v1 foundation:
- **30 tasks** covering Issues 90-119
- **Invitation system** for controlled member onboarding
- **Moderation capabilities** (warn, suspend, ban)
- **Audit logging** for compliance and debugging
- **Admin operations** (transfer ownership, delete community)
- **Full integration tests** validating end-to-end flows
- **Architecture tests** ensuring clean boundaries

**After Wave 4:** Team A's v1 foundation is complete. Full operational lifecycle available for Teams B/C to build upon.
