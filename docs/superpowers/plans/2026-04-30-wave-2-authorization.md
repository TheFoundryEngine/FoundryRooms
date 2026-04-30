# Wave 2: Authorization Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan.

**Goal:** Implement roles, permissions, access groups, and entitlements. Any actor (user or agent) can be assigned roles and checked for permissions.

**Architecture:** Role-based access control with entitlements overlay. Roles grant permissions, entitlements grant access to features/content. Both scoped to resources.

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
│   │   ├── migrations/005-009
│   │   └── repositories
│   └── inbound/
│       ├── authorization.controller.ts
│       └── access-group.controller.ts
```

---

## Task 1: Define Role Domain Model (Issue 35)
- [ ] Create Role entity with: id, name, scope (system/community), isBuiltIn
- [ ] Define built-in roles: owner, admin, moderator, member
- [ ] Commit: `feat(identity): define Role domain model`

## Task 2: Define Permission Domain Model (Issue 36)
- [ ] Create PermissionKey type-safe enum (not magic strings)
- [ ] Categories: community.*, space.*, channel.*, member.*, content.*, admin.*
- [ ] Commit: `feat(identity): define Permission domain model`

## Task 3: Define RolePermission Mapping (Issue 37)
- [ ] Map which permissions each role grants
- [ ] Owner: all, Admin: all except ownership, Moderator: content/members, Member: basic
- [ ] Commit: `feat(identity): define role-permission mapping`

## Task 4: Define AccessGroup Domain Model (Issue 38)
- [ ] AccessGroup entity for segmentation (e.g., "Beta Testers")
- [ ] Commit: `feat(identity): define AccessGroup domain model`

## Task 5: Define Entitlement Domain Model (Issue 39)
- [ ] Entitlement with: actorId, type, scope, grantedAt, expiresAt
- [ ] Commit: `feat(identity): define Entitlement domain model`

## Task 6: Define ActorRole Domain Model (Issue 40)
- [ ] ActorRole junction: actorId, roleId, scopeType, scopeId
- [ ] Supports "admin of community X"
- [ ] Commit: `feat(identity): define ActorRole domain model`

## Task 7-11: Create Database Migrations (Issues 41-45)
- [ ] 005_create_roles.ts - roles table
- [ ] 006_create_permissions.ts - permissions + role_permissions junction
- [ ] 007_create_access_groups.ts - access_groups + actor_access_groups
- [ ] 008_create_entitlements.ts - entitlements table
- [ ] 009_create_actor_roles.ts - actor_roles table
- [ ] Commit each migration

## Task 12-14: Implement Repositories (Issues 46-48)
- [ ] RoleRepository with findByActorAndScope
- [ ] AccessGroupRepository with membership management
- [ ] EntitlementRepository with active entitlement queries
- [ ] Integration tests, commit each

## Task 15-19: Implement Use Cases (Issues 49-53)
- [ ] AssignRole - assign with scope, emit RoleAssigned
- [ ] RevokeRole - remove, emit RoleRevoked
- [ ] GrantEntitlement - with optional expiration
- [ ] RevokeEntitlement - mark revoked
- [ ] AddToAccessGroup - add actor to group
- [ ] Unit tests, commit each

## Task 20: Permission Checking Service (Issue 54)
- [ ] `canActor(actorId, permission, scope?)` returns boolean
- [ ] Load roles, check permissions
- [ ] Commit: `feat(identity): implement permission checking service`

## Task 21: Entitlement Checking Service (Issue 55)
- [ ] `hasEntitlement(actorId, type, scope?)` returns boolean
- [ ] Check active (not expired) entitlements
- [ ] Commit: `feat(identity): implement entitlement checking service`

## Task 22-24: Create HTTP Endpoints (Issues 56-58)
- [ ] Authorization endpoints - /actors/:id/roles, /actors/:id/entitlements
- [ ] Access group endpoints - CRUD + membership
- [ ] Permission check endpoint - GET /auth/check?actor=X&permission=Y
- [ ] Controller tests, commit each

## Task 25: Seed Default Roles (Issue 59)
- [ ] Seed owner, admin, moderator, member roles
- [ ] Seed permissions and mappings
- [ ] Commit: `feat(identity): seed default roles and permissions`

## Task 26: Contract Tests (Issue 60)
- [ ] Test all authorization endpoints
- [ ] Commit: `test(identity): add contract tests for authorization`

---

## Summary

Wave 2: **26 tasks** covering Issues 35-60
- Role-based access control with scoped assignments
- Permission checking via central service
- Entitlements for feature/content gating
- Access groups for segmentation

**After Wave 2:** Teams B/C can check permissions, gate content by entitlements.
