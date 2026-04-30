# Team A Issue Breakdown — Identity & Access + Community Structure

**Date:** 2026-04-30
**Status:** Approved
**Owner:** Team A (Community Core)
**Bounded Contexts:** Identity & Access, Community Structure

## Overview

This document defines the actionable issue breakdown for Team A v1 foundation work. Issues are organized in 5 waves using a contract-first approach to maximize parallel work across all three teams.

### Scope

All four Team A epics:
- **EPIC-A-001** Auth and session foundation
- **EPIC-A-002** Role and access group model
- **EPIC-A-003** Community hierarchy and management
- **EPIC-A-004** Member invitation and admin actions

### Approach: Contract-First Waves

Issues are structured so that:
1. Wave 0 establishes contracts, fixtures, and mocks — Teams B/C can start immediately
2. Each subsequent wave builds on the previous
3. Cross-team unlock points are explicit
4. Testing is embedded in each wave, not deferred

### Key Architectural Decision: Actor Model

Users and Agents are both first-class citizens via an Actor base type. This ensures agents are not second-class citizens bolted on later. Both actor types share the same permission and entitlement infrastructure.

---

## Wave 0 — Foundation & Contracts

**Goal:** Establish module scaffolds, define all external contracts, create fixtures/mocks so Teams B and C can begin parallel work immediately.

**Unlocks:** Teams B/C can start building against contracts and mocks.

| # | Issue | Description | Exit Criteria |
|---|-------|-------------|---------------|
| 1 | Scaffold identity-access module | Create modules/identity-access/ with domain/, application/, adapters/, contracts/ structure | Directory structure exists |
| 2 | Scaffold community-structure module | Create modules/community-structure/ with same structure | Directory structure exists |
| 3 | Define User contract | Define UserSummary, UserProfile DTOs | Schema + fixtures committed |
| 4 | Define Session/Auth contracts | Define login request/response, session token shape | Schema + fixtures committed |
| 5 | Define Role & Permission contracts | Define Role, Permission, AccessGroup, Entitlement shapes | Schema + fixtures committed |
| 6 | Define Community contracts | Define Community, Space, Channel DTOs | Schema + fixtures committed |
| 7 | Define Membership contract | Define Membership, MembershipStatus, join/leave contracts | Schema + fixtures committed |
| 8 | Create identity-access event contracts | UserRegistered, UserLoggedIn, RoleAssigned, EntitlementGranted | Event schemas committed |
| 9 | Create community-structure event contracts | CommunityCreated, SpaceCreated, ChannelCreated, MemberJoined | Event schemas committed |
| 10 | Create mock adapters for identity-access | Mock permission checker, mock user lookup | Mocks usable by other teams |

---

## Wave 1 — Auth Core with Actor Model

**Goal:** Implement authentication for both Users and Agents as first-class Actor types.

**Unlocks:** Users and Agents can authenticate, protected routes are possible.

| # | Issue | Description | Exit Criteria |
|---|-------|-------------|---------------|
| 11 | Define Actor base domain model | Actor entity with ActorId, ActorType enum (User/Agent) | Base model works |
| 12 | Define User domain model | User extends Actor — email, password, human attributes | Domain model + tests |
| 13 | Define Agent domain model | Agent extends Actor — name, API key hash, owner reference | Domain model + tests |
| 14 | Define Session domain model | Session tied to Actor (not just User) | Session works for any actor |
| 15 | Implement Actor repository interface | Base port for actor lookup by ID | Clean repository hierarchy |
| 16 | Create actors table migration | Base actors table with discriminator | Migration runs |
| 17 | Create users table migration | Users table extending actors | Migration runs |
| 18 | Create agents table migration | Agents table with api_key_hash, owner_actor_id | Migration runs |
| 19 | Implement User repository | Drizzle adapter for user operations | CRUD works |
| 20 | Implement Agent repository | Drizzle adapter for agent operations | CRUD works |
| 21 | Implement RegisterUser use case | Create user, hash password, emit UserRegistered | Use case + test |
| 22 | Implement CreateAgent use case | Create agent, generate API key, emit AgentCreated | Use case + test |
| 23 | Implement Login use case (User) | Session-based auth for humans | Use case + test |
| 24 | Implement API key auth (Agent) | Validate API key, return auth context | Agent auth works |
| 25 | Implement Logout use case | Works for any actor type | Use case + test |
| 26 | Implement password hashing adapter | For user passwords | Adapter isolated |
| 27 | Implement API key generation adapter | Secure key generation + hashing | Adapter isolated |
| 28 | Create auth HTTP endpoints | /auth/register, /auth/login, /auth/logout | Endpoints match contracts |
| 29 | Create agent management endpoints | POST /agents, GET /agents/:id, POST rotate-key | Agent lifecycle API |
| 30 | Implement auth middleware | Extracts actor from session OR API key | Handles both auth types |
| 31 | Implement password reset flow | User-only flow | Use case + tests |
| 32 | Update contracts for Actor model | Add ActorSummary, AgentSummary DTOs | Contracts updated |
| 33 | Add agent domain events | AgentCreated, AgentKeyRotated, AgentDeactivated | Event schemas committed |
| 34 | Contract tests for auth endpoints | Cover user and agent auth paths | Tests pass |

---

## Wave 2 — Authorization

**Goal:** Implement roles, permissions, access groups, and entitlements for any actor.

**Unlocks:** Teams B/C can check permissions and entitlements. Commerce can grant entitlements.

| # | Issue | Description | Exit Criteria |
|---|-------|-------------|---------------|
| 35 | Define Role domain model | Role with RoleId, name, scope (system/community) | Domain model + tests |
| 36 | Define Permission domain model | Permission value object, type-safe registry | Permissions enumerable |
| 37 | Define RolePermission mapping | Which permissions each role grants | Mapping works |
| 38 | Define AccessGroup domain model | AccessGroup for segmentation | Domain model + tests |
| 39 | Define Entitlement domain model | Access granted by role, purchase, subscription | Entitlements auditable |
| 40 | Define ActorRole domain model | Actor + Role + Scope junction | Scoped assignments work |
| 41 | Create roles table migration | roles with system/custom distinction | Migration runs |
| 42 | Create permissions table migration | permissions + role_permissions | Migration runs |
| 43 | Create access_groups table migration | access_groups + actor_access_groups | Migration runs |
| 44 | Create entitlements table migration | entitlements with scope, expires_at | Migration runs |
| 45 | Create actor_roles table migration | actor_id, role_id, scope_type, scope_id | Migration runs |
| 46 | Implement Role repository | CRUD + lookup by actor and scope | Repository works |
| 47 | Implement AccessGroup repository | CRUD + membership management | Repository works |
| 48 | Implement Entitlement repository | CRUD + active entitlement queries | Repository works |
| 49 | Implement AssignRole use case | Assign role with scope, emit RoleAssigned | Use case + test |
| 50 | Implement RevokeRole use case | Remove role, emit RoleRevoked | Use case + test |
| 51 | Implement GrantEntitlement use case | Grant with expiration, emit EntitlementGranted | Use case + test |
| 52 | Implement RevokeEntitlement use case | Revoke, emit EntitlementRevoked | Use case + test |
| 53 | Implement AddToAccessGroup use case | Add actor to group, emit event | Use case + test |
| 54 | Implement permission checking service | canActor(actorId, permission, scope) | Service usable by all |
| 55 | Implement entitlement checking service | hasEntitlement(actorId, type, scope) | Service usable by all |
| 56 | Create authorization HTTP endpoints | /actors/:id/roles, entitlements CRUD | Endpoints match contracts |
| 57 | Create access group endpoints | CRUD for groups, membership | Endpoints work |
| 58 | Expose permission check endpoint | GET /auth/check | Contract-compliant |
| 59 | Seed default roles | owner, admin, moderator, member | Default roles exist |
| 60 | Contract tests for authorization | All endpoints verified | Tests pass |

---

## Wave 3 — Community Structure

**Goal:** Implement community hierarchy — communities, spaces, channels with visibility and join rules.

**Unlocks:** Team B can build navigation UI. Team C can scope events to communities.

| # | Issue | Description | Exit Criteria |
|---|-------|-------------|---------------|
| 61 | Define Community domain model | Community with name, slug, visibility, settings | Domain model + tests |
| 62 | Define Space domain model | Space belongs to Community, has ordering | Domain model + tests |
| 63 | Define Channel domain model | Channel belongs to Space, has type | Domain model + tests |
| 64 | Define Membership domain model | Actor + Community, status, joined_at | Domain model + tests |
| 65 | Define visibility rules | public, members-only, access-group, role-restricted | Logic encapsulated |
| 66 | Define join rules | open, invite-only, approval, entitlement-gated | Logic encapsulated |
| 67 | Create communities table migration | communities with unique slug | Migration runs |
| 68 | Create spaces table migration | spaces with community_id FK | Migration runs |
| 69 | Create channels table migration | channels with space_id FK | Migration runs |
| 70 | Create memberships table migration | memberships with actor_id, community_id | Migration runs |
| 71 | Implement Community repository | CRUD + slug lookup + pagination | Repository works |
| 72 | Implement Space repository | CRUD + list by community + ordering | Repository works |
| 73 | Implement Channel repository | CRUD + list by space | Repository works |
| 74 | Implement Membership repository | CRUD + actor+community lookup | Repository works |
| 75 | Implement CreateCommunity use case | Create, assign owner, emit CommunityCreated | Use case + test |
| 76 | Implement UpdateCommunity use case | Update settings, emit CommunityUpdated | Use case + test |
| 77 | Implement CreateSpace use case | Create in community, emit SpaceCreated | Use case + test |
| 78 | Implement CreateChannel use case | Create in space, emit ChannelCreated | Use case + test |
| 79 | Implement ReorderSpaces use case | Change ordering within community | Use case + test |
| 80 | Implement ReorderChannels use case | Change ordering within space | Use case + test |
| 81 | Implement JoinCommunity use case | Check rules, create membership, emit MemberJoined | Use case + test |
| 82 | Implement LeaveCommunity use case | Remove membership, emit MemberLeft | Use case + test |
| 83 | Implement visibility checking service | canActorSee(actorId, resource) | Service works |
| 84 | Create community HTTP endpoints | CRUD, list with filters | Endpoints match contracts |
| 85 | Create space HTTP endpoints | CRUD, reorder | Endpoints match contracts |
| 86 | Create channel HTTP endpoints | CRUD, reorder | Endpoints match contracts |
| 87 | Create membership HTTP endpoints | /communities/:id/members, join, leave | Endpoints work |
| 88 | Implement community navigation query | community-spaces-channels tree | Optimized query |
| 89 | Contract tests for community structure | All endpoints verified | Tests pass |

---

## Wave 4 — Operations & Admin

**Goal:** Complete membership lifecycle with invitations, moderation, and audit trails.

**Unlocks:** Team A v1 foundation complete. Full operational lifecycle available.

| # | Issue | Description | Exit Criteria |
|---|-------|-------------|---------------|
| 90 | Define Invitation domain model | Invitation with token, status, expires_at | Domain model + tests |
| 91 | Define InvitationPolicy | Who can invite, limits, expiration | Policy encapsulated |
| 92 | Create invitations table migration | invitations with token index | Migration runs |
| 93 | Implement Invitation repository | CRUD + token lookup | Repository works |
| 94 | Implement CreateInvitation use case | Generate invite, emit InvitationCreated | Use case + test |
| 95 | Implement AcceptInvitation use case | Validate, create membership, emit event | Use case + test |
| 96 | Implement RevokeInvitation use case | Cancel invite, emit InvitationRevoked | Use case + test |
| 97 | Implement BulkInvite use case | Multiple invitations from list | Use case + test |
| 98 | Create invitation HTTP endpoints | CRUD for invitations | Endpoints match contracts |
| 99 | Define ModerationAction domain model | Action type, target, reason, performed_by | Domain model + tests |
| 100 | Create moderation_actions migration | Append-only audit table | Migration runs |
| 101 | Implement ModerationAction repository | Create + list by target | Repository works |
| 102 | Implement SuspendMember use case | Suspend, record, emit MemberSuspended | Use case + test |
| 103 | Implement BanMember use case | Ban, record, emit MemberBanned | Use case + test |
| 104 | Implement UnbanMember use case | Unban, record, emit MemberUnbanned | Use case + test |
| 105 | Implement WarnMember use case | Record warning, emit MemberWarned | Use case + test |
| 106 | Create moderation HTTP endpoints | /suspend, /ban, /unban, /warn | Endpoints work |
| 107 | Define AuditEntry domain model | Generic audit log, append-only | Domain model |
| 108 | Create audit_log table migration | Immutable, indexed | Migration runs |
| 109 | Implement AuditLog repository | Append + query | Repository works |
| 110 | Implement audit logging service | Auto-capture for sensitive ops | Service works |
| 111 | Create audit HTTP endpoints | /audit (admin only) | Permission-gated |
| 112 | Implement TransferOwnership use case | Transfer community ownership | Use case + test |
| 113 | Implement DeleteCommunity use case | Soft-delete with cascading | Use case + test |
| 114 | Implement UpdateMemberRole use case | Change role within community | Use case + test |
| 115 | Implement profile management endpoints | GET/PATCH /actors/:id/profile | Endpoints work |
| 116 | Implement deactivate actor use case | Self or admin deactivation | Use case + test |
| 117 | Contract tests for Wave 4 | All endpoints verified | Tests pass |
| 118 | Integration tests for full flows | register-join-role-moderate-audit | Suite passes |
| 119 | Architecture tests for Team A | No forbidden imports, isolation | Tests in CI |

---

## Cross-Team Unlock Points

| After Wave | Teams B/C Can... |
|------------|------------------|
| 0 | Start building against contracts and mocks |
| 1 | Authenticate users/agents, protect routes |
| 2 | Check permissions, gate content by entitlements |
| 3 | Scope content to communities/spaces/channels |
| 4 | Rely on complete lifecycle, moderation, audit |

---

## Testing Requirements

| Test Type | When | Purpose |
|-----------|------|---------|
| Unit tests | Every domain model | Validate invariants, business rules |
| Integration tests | Every repository/use case | Validate persistence, adapters |
| Contract tests | End of each wave | Verify endpoints match schemas |
| Architecture tests | Wave 4 | Enforce module boundaries |

---

## Dependencies on Global ADRs

- **ADR-001** System shape (modular monolith, hexagonal)
- **ADR-002** Bounded context map (Team A owns identity-access, community-structure)
- **ADR-003** Data and tenancy model (PostgreSQL, community_id scoping)
- **ADR-004** Integration and contract model (contract-first, fixtures, mocks)
- **ADR-005** Identity and authorization model (roles, entitlements)
- **ADR-008** Technology stack (NestJS, Drizzle, PostgreSQL)
- **ADR-010** Database access strategy (Drizzle, explicit migrations)
- **ADR-012** Interaction model (HTTP for CRUD, events for async)

---

## Summary

- **119 issues** across **5 waves**
- **Actor model** with Users and Agents as first-class citizens
- **Contract-first** approach enabling parallel team work
- **Explicit unlock points** for Teams B and C
- **Testing embedded** in each wave, not deferred
