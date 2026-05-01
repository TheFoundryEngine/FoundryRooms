# Wave 2: Authorization Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan.

**Goal:** Implement roles, permissions, access groups, and entitlements. Any actor (user or agent) can be assigned roles and checked for permissions.

**Architecture:** Role-based access control with entitlements overlay. Roles grant permissions, entitlements grant access to features/content. Both scoped to resources (system-wide or community-specific).

**Tech Stack:** TypeScript, NestJS, Drizzle, PostgreSQL, Zod, Vitest

---

## File Structure

```
modules/identity-access/
├── domain/
│   ├── role.entity.ts
│   ├── permission.entity.ts
│   ├── access-group.entity.ts
│   ├── entitlement.entity.ts
│   └── actor-role.entity.ts
├── application/
│   ├── ports/
│   │   ├── role.repository.ts
│   │   ├── access-group.repository.ts
│   │   └── entitlement.repository.ts
│   ├── use-cases/
│   │   ├── assign-role.use-case.ts
│   │   ├── revoke-role.use-case.ts
│   │   ├── grant-entitlement.use-case.ts
│   │   ├── revoke-entitlement.use-case.ts
│   │   └── add-to-access-group.use-case.ts
│   └── services/
│       ├── permission-checker.service.ts
│       └── entitlement-checker.service.ts
├── adapters/
│   ├── outbound/drizzle/
│   │   ├── migrations/
│   │   │   ├── 005_create_roles.ts
│   │   │   ├── 006_create_permissions.ts
│   │   │   ├── 007_create_access_groups.ts
│   │   │   ├── 008_create_entitlements.ts
│   │   │   └── 009_create_actor_roles.ts
│   │   ├── role.repository.drizzle.ts
│   │   ├── access-group.repository.drizzle.ts
│   │   └── entitlement.repository.drizzle.ts
│   └── inbound/
│       ├── authorization.controller.ts
│       └── access-group.controller.ts
```

---

## Task 1: Define Role Domain Model (Issue 35)

**Files:** `modules/identity-access/domain/role.entity.ts`

- [ ] Create `RoleId` value object
- [ ] Create `RoleScope` enum: `'system' | 'community'`
- [ ] Create `Role` entity with: id, name, scope, isBuiltIn, description
- [ ] Define built-in roles: `owner`, `admin`, `moderator`, `member`
- [ ] Write unit tests
- [ ] Commit: `feat(identity): define Role domain model`

---

## Task 2: Define Permission Domain Model (Issue 36)

**Files:** `modules/identity-access/domain/permission.entity.ts`

- [ ] Create `PermissionKey` type-safe enum (not magic strings)
- [ ] Categories: `community.*`, `space.*`, `channel.*`, `member.*`, `content.*`, `admin.*`
- [ ] Create `Permission` value object with key and description
- [ ] Create `PermissionRegistry` for enumerating all permissions
- [ ] Write unit tests
- [ ] Commit: `feat(identity): define Permission domain model`

---

## Task 3: Define RolePermission Mapping (Issue 37)

**Files:** `modules/identity-access/domain/role-permissions.ts`

- [ ] Create `RolePermissionMap` defining which permissions each role grants
- [ ] Owner: all permissions
- [ ] Admin: all except ownership transfer
- [ ] Moderator: content moderation, member management
- [ ] Member: basic read/write
- [ ] Support custom role definitions
- [ ] Write unit tests
- [ ] Commit: `feat(identity): define role-permission mapping`

---

## Task 4: Define AccessGroup Domain Model (Issue 38)

**Files:** `modules/identity-access/domain/access-group.entity.ts`

- [ ] Create `AccessGroupId` value object
- [ ] Create `AccessGroup` entity with: id, name, description, communityId (optional)
- [ ] Used for content segmentation (e.g., "Beta Testers", "Premium Members")
- [ ] Write unit tests
- [ ] Commit: `feat(identity): define AccessGroup domain model`

---

## Task 5: Define Entitlement Domain Model (Issue 39)

**Files:** `modules/identity-access/domain/entitlement.entity.ts`

- [ ] Create `EntitlementId` value object
- [ ] Create `EntitlementType` enum (e.g., `'feature_access'`, `'content_access'`, `'api_access'`)
- [ ] Create `Entitlement` entity with: id, actorId, type, scope, grantedAt, expiresAt, grantedBy, metadata
- [ ] Entitlements are explicit and auditable
- [ ] Write unit tests
- [ ] Commit: `feat(identity): define Entitlement domain model`

---

## Task 6: Define ActorRole Domain Model (Issue 40)

**Files:** `modules/identity-access/domain/actor-role.entity.ts`

- [ ] Create `ActorRole` entity: actorId, roleId, scopeType, scopeId
- [ ] `scopeType`: `'system'` or `'community'`
- [ ] `scopeId`: null for system, communityId for community scope
- [ ] Supports "admin of community X" assignments
- [ ] Write unit tests
- [ ] Commit: `feat(identity): define ActorRole domain model`

---

## Task 7: Create Roles Table Migration (Issue 41)

**Files:** `modules/identity-access/adapters/outbound/drizzle/migrations/005_create_roles.ts`

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  scope VARCHAR(20) NOT NULL CHECK (scope IN ('system', 'community')),
  is_built_in BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

- [ ] Write and run migration
- [ ] Commit: `feat(identity): create roles table migration`

---

## Task 8: Create Permissions Table Migration (Issue 42)

**Files:** `modules/identity-access/adapters/outbound/drizzle/migrations/006_create_permissions.ts`

```sql
CREATE TABLE permissions (
  key VARCHAR(100) PRIMARY KEY,
  description TEXT
);

CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_key VARCHAR(100) REFERENCES permissions(key) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_key)
);
```

- [ ] Write and run migration
- [ ] Commit: `feat(identity): create permissions table migration`

---

## Task 9: Create Access Groups Table Migration (Issue 43)

**Files:** `modules/identity-access/adapters/outbound/drizzle/migrations/007_create_access_groups.ts`

```sql
CREATE TABLE access_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  community_id UUID, -- nullable for system-wide groups
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE actor_access_groups (
  actor_id UUID REFERENCES actors(id) ON DELETE CASCADE,
  access_group_id UUID REFERENCES access_groups(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (actor_id, access_group_id)
);
```

- [ ] Write and run migration
- [ ] Commit: `feat(identity): create access_groups table migration`

---

## Task 10: Create Entitlements Table Migration (Issue 44)

**Files:** `modules/identity-access/adapters/outbound/drizzle/migrations/008_create_entitlements.ts`

```sql
CREATE TABLE entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  scope_type VARCHAR(20),
  scope_id UUID,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  granted_by UUID REFERENCES actors(id),
  metadata JSONB DEFAULT '{}'
);
CREATE INDEX idx_entitlements_actor ON entitlements(actor_id);
CREATE INDEX idx_entitlements_type ON entitlements(type);
```

- [ ] Write and run migration
- [ ] Commit: `feat(identity): create entitlements table migration`

---

## Task 11: Create Actor Roles Table Migration (Issue 45)

**Files:** `modules/identity-access/adapters/outbound/drizzle/migrations/009_create_actor_roles.ts`

```sql
CREATE TABLE actor_roles (
  actor_id UUID REFERENCES actors(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  scope_type VARCHAR(20) NOT NULL,
  scope_id UUID,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES actors(id),
  PRIMARY KEY (actor_id, role_id, scope_type, COALESCE(scope_id, '00000000-0000-0000-0000-000000000000'))
);
```

- [ ] Write and run migration
- [ ] Commit: `feat(identity): create actor_roles table migration`

---

## Task 12: Implement Role Repository (Issue 46)

**Files:** `modules/identity-access/adapters/outbound/drizzle/role.repository.drizzle.ts`

- [ ] Implement `RoleRepositoryDrizzle` class
- [ ] Methods: findById, findByName, findAll, findByActorAndScope
- [ ] Include permission loading
- [ ] Write integration tests
- [ ] Commit: `feat(identity): implement Role repository`

---

## Task 13: Implement AccessGroup Repository (Issue 47)

**Files:** `modules/identity-access/adapters/outbound/drizzle/access-group.repository.drizzle.ts`

- [ ] Implement `AccessGroupRepositoryDrizzle` class
- [ ] Methods: findById, findByCommunity, addMember, removeMember, getMembers
- [ ] Write integration tests
- [ ] Commit: `feat(identity): implement AccessGroup repository`

---

## Task 14: Implement Entitlement Repository (Issue 48)

**Files:** `modules/identity-access/adapters/outbound/drizzle/entitlement.repository.drizzle.ts`

- [ ] Implement `EntitlementRepositoryDrizzle` class
- [ ] Methods: findById, findByActor, findActiveByActorAndType, save, revoke
- [ ] Filter expired entitlements
- [ ] Write integration tests
- [ ] Commit: `feat(identity): implement Entitlement repository`

---

## Task 15: Implement AssignRole Use Case (Issue 49)

**Files:** `modules/identity-access/application/use-cases/assign-role.use-case.ts`

- [ ] Create `AssignRoleUseCase` class
- [ ] Validate role exists and actor exists
- [ ] Create ActorRole with scope
- [ ] Emit `RoleAssigned` event
- [ ] Write unit tests
- [ ] Commit: `feat(identity): implement AssignRole use case`

---

## Task 16: Implement RevokeRole Use Case (Issue 50)

**Files:** `modules/identity-access/application/use-cases/revoke-role.use-case.ts`

- [ ] Create `RevokeRoleUseCase` class
- [ ] Remove ActorRole
- [ ] Emit `RoleRevoked` event
- [ ] Write unit tests
- [ ] Commit: `feat(identity): implement RevokeRole use case`

---

## Task 17: Implement GrantEntitlement Use Case (Issue 51)

**Files:** `modules/identity-access/application/use-cases/grant-entitlement.use-case.ts`

- [ ] Create `GrantEntitlementUseCase` class
- [ ] Create Entitlement with optional expiration
- [ ] Emit `EntitlementGranted` event
- [ ] Write unit tests
- [ ] Commit: `feat(identity): implement GrantEntitlement use case`

---

## Task 18: Implement RevokeEntitlement Use Case (Issue 52)

**Files:** `modules/identity-access/application/use-cases/revoke-entitlement.use-case.ts`

- [ ] Create `RevokeEntitlementUseCase` class
- [ ] Mark entitlement as revoked
- [ ] Emit `EntitlementRevoked` event
- [ ] Write unit tests
- [ ] Commit: `feat(identity): implement RevokeEntitlement use case`

---

## Task 19: Implement AddToAccessGroup Use Case (Issue 53)

**Files:** `modules/identity-access/application/use-cases/add-to-access-group.use-case.ts`

- [ ] Create `AddToAccessGroupUseCase` class
- [ ] Add actor to group
- [ ] Emit `ActorAddedToGroup` event
- [ ] Write unit tests
- [ ] Commit: `feat(identity): implement AddToAccessGroup use case`

---

## Task 20: Implement Permission Checking Service (Issue 54)

**Files:** `modules/identity-access/application/services/permission-checker.service.ts`

- [ ] Create `PermissionCheckerService` class
- [ ] Method: `canActor(actorId, permission, scope?)` returns boolean
- [ ] Load actor's roles for scope
- [ ] Check if any role grants the permission
- [ ] Cache role-permission mappings
- [ ] Write unit tests
- [ ] Commit: `feat(identity): implement permission checking service`

---

## Task 21: Implement Entitlement Checking Service (Issue 55)

**Files:** `modules/identity-access/application/services/entitlement-checker.service.ts`

- [ ] Create `EntitlementCheckerService` class
- [ ] Method: `hasEntitlement(actorId, type, scope?)` returns boolean
- [ ] Check active (not expired) entitlements
- [ ] Write unit tests
- [ ] Commit: `feat(identity): implement entitlement checking service`

---

## Task 22: Create Authorization HTTP Endpoints (Issue 56)

**Files:** `modules/identity-access/adapters/inbound/authorization.controller.ts`

- [ ] GET `/actors/:id/roles` - list actor's roles
- [ ] POST `/actors/:id/roles` - assign role
- [ ] DELETE `/actors/:id/roles/:roleId` - revoke role
- [ ] GET `/actors/:id/entitlements` - list entitlements
- [ ] POST `/actors/:id/entitlements` - grant entitlement
- [ ] DELETE `/actors/:id/entitlements/:id` - revoke entitlement
- [ ] Write controller tests
- [ ] Commit: `feat(identity): create authorization HTTP endpoints`

---

## Task 23: Create Access Group Endpoints (Issue 57)

**Files:** `modules/identity-access/adapters/inbound/access-group.controller.ts`

- [ ] POST `/access-groups` - create group
- [ ] GET `/access-groups/:id` - get group
- [ ] GET `/access-groups/:id/members` - list members
- [ ] POST `/access-groups/:id/members` - add member
- [ ] DELETE `/access-groups/:id/members/:actorId` - remove member
- [ ] Write controller tests
- [ ] Commit: `feat(identity): create access group endpoints`

---

## Task 24: Expose Permission Check Endpoint (Issue 58)

**Files:** Add to `authorization.controller.ts`

- [ ] GET `/auth/check?actor=X&permission=Y&scope=Z`
- [ ] Returns `{ allowed: boolean, reason?: string }`
- [ ] For other services/frontend to check permissions
- [ ] Write controller tests
- [ ] Commit: `feat(identity): expose permission check endpoint`

---

## Task 25: Seed Default Roles (Issue 59)

**Files:** `modules/identity-access/adapters/outbound/drizzle/seeds/roles.seed.ts`

- [ ] Seed built-in roles: owner, admin, moderator, member
- [ ] Seed all permissions from PermissionRegistry
- [ ] Seed role-permission mappings
- [ ] Run seed script
- [ ] Commit: `feat(identity): seed default roles and permissions`

---

## Task 26: Contract Tests for Authorization (Issue 60)

**Files:** `tests/contract/identity-access/authorization.contract.test.ts`

- [ ] Test role assignment endpoints match contracts
- [ ] Test entitlement endpoints match contracts
- [ ] Test permission check endpoint
- [ ] Test access group endpoints
- [ ] Commit: `test(identity): add contract tests for authorization`

---

## Summary

Wave 2 implements the complete authorization system:
- **26 tasks** covering Issues 35-60
- **Role-based access control** with scoped assignments
- **Permission checking** via central service
- **Entitlements** for feature/content gating
- **Access groups** for segmentation

**After Wave 2:** Teams B/C can check permissions before actions, gate content by entitlements. Commerce can grant entitlements on purchase.
