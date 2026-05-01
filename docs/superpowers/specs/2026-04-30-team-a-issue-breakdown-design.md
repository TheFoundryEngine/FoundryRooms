# Team A Issue Breakdown — Identity & Access + Community Structure

**Date:** 2026-04-30
**Status:** Approved
**Owner:** Team A (Community Core)
**Bounded Contexts:** Identity & Access, Community Structure

## Overview

This document defines the actionable issue breakdown for Team A's v1 foundation work. Issues are organized in 5 waves using a contract-first approach to maximize parallel work across all three teams.

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

Users and Agents are both first-class citizens via an Actor base type:

```
Actor (base)
├── User (human, session-based auth)
└── Agent (programmatic, API key auth)
```

This ensures agents are not second-class citizens bolted on later. Both actor types share the same permission and entitlement infrastructure.

---

## Wave 0 — Foundation & Contracts

**Goal:** Establish module scaffolds, define all external contracts, create fixtures/mocks so Teams B and C can begin parallel work immediately.

**Unlocks:** Teams B/C can start building against contracts and mocks.

| # | Issue | Description | Exit Criteria |
|---|-------|-------------|---------------|
| 1 | Scaffold identity-access module | Create `modules/identity-access/` with domain/, application/, adapters/, contracts/ structure per ADR-001 | Directory structure exists, follows hexagonal template |
| 2 | Scaffold community-structure module | Create `modules/community-structure/` with same structure | Directory structure exists |
| 3 | Define User contract | Define `UserSummary`, `UserProfile` DTOs in contracts/api/identity-access/ | Schema files committed, fixtures created |
| 4 | Define Session/Auth contracts | Define login request/response, session token shape, auth error contracts | Schema + fixtures committed |
| 5 | Define Role & Permission contracts | Define `Role`, `Permission`, `AccessGroup`, `Entitlement` contract shapes | Schema + fixtures, Teams B/C can mock permission checks |
| 6 | Define Community contracts | Define `Community`, `Space`, `Channel` DTOs and list/detail contracts | Schema + fixtures committed |
| 7 | Define Membership contract | Define `Membership`, `MembershipStatus`, join/leave contracts | Schema + fixtures committed |
| 8 | Create identity-access event contracts | Define domain events: `UserRegistered`, `UserLoggedIn`, `RoleAssigned`, `EntitlementGranted` | Event schemas in contracts/events/identity-access/ |
| 9 | Create community-structure event contracts | Define: `CommunityCreated`, `SpaceCreated`, `ChannelCreated`, `MemberJoined` | Event schemas in contracts/events/community-structure/ |
| 10 | Create mock adapters for identity-access | Implement mock permission checker, mock user lookup for Teams B/C | Mocks usable by other teams |

---

## Wave 1 — Auth Core with Actor Model

**Goal:** Implement working authentication for both Users and Agents as first-class Actor types with distinct auth mechanisms but shared identity infrastructure.

**Unlocks:** Users and Agents can authenticate, protected routes are possible.

| # | Issue | Description | Exit Criteria |
|---|-------|-------------|---------------|
| 11 | Define Actor base domain model | Create Actor entity with ActorId, ActorType enum (User/Agent), common identity traits | Base model supports polymorphic identity |
| 12 | Define User domain model | User extends Actor — email, password, human-specific attributes | Domain model + unit tests |
| 13 | Define Agent domain model | Agent extends Actor — name, description, API key hash, owner reference (optional), agent-specific attributes | Domain model + unit tests |
| 14 | Define Session domain model | Session tied to Actor (not just User) — supports both types | Session works for any actor type |
| 15 | Implement Actor repository interface | Base port for actor lookup by ID, type-specific repos extend it | Clean repository hierarchy |
| 16 | Create actors table migration | Base actors table with shared fields + discriminator | Migration runs |
| 17 | Create users table migration | Users table extending/referencing actors | Migration runs |
| 18 | Create agents table migration | Agents table with api_key_hash, owner_actor_id (nullable), metadata | Migration runs |
| 19 | Implement User repository | Drizzle adapter for user-specific operations | CRUD works |
| 20 | Implement Agent repository | Drizzle adapter for agent-specific operations | CRUD works |
| 21 | Implement RegisterUser use case | Create user actor, hash password, emit UserRegistered | Use case + integration test |
| 22 | Implement CreateAgent use case | Create agent actor, generate API key, emit AgentCreated | Use case + integration test |
| 23 | Implement Login use case (User) | Session-based auth for humans | Use case + test |
| 24 | Implement API key auth (Agent) | Validate API key, create/return session or stateless auth context | Agent auth works |
| 25 | Implement Logout use case | Works for any actor type | Use case + test |
| 26 | Implement password hashing adapter | For user passwords | Adapter isolated |
| 27 | Implement API key generation adapter | Secure key generation + hashing for agents | Adapter isolated |
| 28 | Create auth HTTP endpoints | /auth/register, /auth/login, /auth/logout (users) | Endpoints match contracts |
| 29 | Create agent management endpoints | POST /agents, GET /agents/:id, POST /agents/:id/rotate-key | Agent lifecycle API |
| 30 | Implement auth middleware | Extracts actor context from session OR API key header | Middleware handles both auth types |
| 31 | Implement password reset flow | User-only flow | Use case + tests |
| 32 | Update contracts for Actor model | Add ActorSummary, AgentSummary DTOs, update UserSummary | Contracts reflect actor model |
| 33 | Add agent domain events | AgentCreated, AgentKeyRotated, AgentDeactivated | Event schemas committed |
| 34 | Contract tests for auth endpoints | Cover both user and agent auth paths | Contract tests pass |

---

## Wave 2 — Authorization

**Goal:** Implement roles, permissions, access groups, and entitlements. Any actor (user or agent) can be assigned roles and checked for permissions.

**Unlocks:** Teams B/C can check permissions and entitlements. Commerce can grant entitlements on purchase.

| # | Issue | Description | Exit Criteria |
|---|-------|-------------|---------------|
| 35 | Define Role domain model | Role entity with RoleId, name, scope (system/community), built-in roles: owner, admin, moderator, member | Domain model + unit tests |
| 36 | Define Permission domain model | Permission value object, permission registry pattern for type-safe permission keys | Permissions are enumerable, not magic strings |
| 37 | Define RolePermission mapping | Which permissions each role grants, support for custom role definitions | Role→Permission mapping works |
| 38 | Define AccessGroup domain model | AccessGroup entity for segmentation — named groups actors can belong to | Domain model + tests |
| 39 | Define Entitlement domain model | Entitlement entity — access granted by role, purchase, subscription, or policy | Entitlements are explicit, auditable |
| 40 | Define ActorRole domain model | Junction: Actor + Role + Scope (e.g., "admin of community X") | Supports scoped role assignments |
| 41 | Create roles table migration | roles table with system/custom distinction | Migration runs |
| 42 | Create permissions table migration | permissions + role_permissions junction | Migration runs |
| 43 | Create access_groups table migration | access_groups + actor_access_groups junction | Migration runs |
| 44 | Create entitlements table migration | entitlements table with actor_id, type, scope, granted_at, expires_at | Migration runs |
| 45 | Create actor_roles table migration | actor_id, role_id, scope_type, scope_id | Migration runs |
| 46 | Implement Role repository | CRUD + lookup by actor and scope | Repository works |
| 47 | Implement AccessGroup repository | CRUD + membership management | Repository works |
| 48 | Implement Entitlement repository | CRUD + active entitlement queries | Repository works |
| 49 | Implement AssignRole use case | Assign role to actor with scope, emit RoleAssigned event | Use case + test |
| 50 | Implement RevokeRole use case | Remove role, emit RoleRevoked | Use case + test |
| 51 | Implement GrantEntitlement use case | Grant entitlement with optional expiration, emit EntitlementGranted | Use case + test |
| 52 | Implement RevokeEntitlement use case | Revoke entitlement, emit EntitlementRevoked | Use case + test |
| 53 | Implement AddToAccessGroup use case | Add actor to group, emit ActorAddedToGroup | Use case + test |
| 54 | Implement permission checking service | `canActor(actorId, permission, scope)` — central authorization check | Service usable by all contexts |
| 55 | Implement entitlement checking service | `hasEntitlement(actorId, entitlementType, scope)` | Service usable by all contexts |
| 56 | Create authorization HTTP endpoints | GET /actors/:id/roles, POST /actors/:id/roles, DELETE, similar for entitlements | Endpoints match contracts |
| 57 | Create access group endpoints | CRUD for access groups, membership management | Endpoints work |
| 58 | Expose permission check endpoint | GET /auth/check?actor=X&permission=Y&scope=Z — for other services/frontend | Contract-compliant check endpoint |
| 59 | Seed default roles | Migration/seed for owner, admin, moderator, member roles | Default roles exist |
| 60 | Contract tests for authorization | All authorization endpoints verified against contracts | Tests pass |

---

## Wave 3 — Community Structure

**Goal:** Implement the community hierarchy — communities contain spaces, spaces contain channels. Visibility rules, join rules, and actor-community relationships.

**Unlocks:** Team B can build community navigation UI and channel-scoped content. Team C can scope events to communities.

| # | Issue | Description | Exit Criteria |
|---|-------|-------------|---------------|
| 61 | Define Community domain model | Community entity with CommunityId, name, slug, description, visibility (public/private), settings | Domain model + unit tests |
| 62 | Define Space domain model | Space entity — belongs to Community, has name, slug, visibility, ordering | Domain model + tests |
| 63 | Define Channel domain model | Channel entity — belongs to Space, type (discussion/announcements/etc), visibility | Domain model + tests |
| 64 | Define Membership domain model | Membership entity — Actor + Community relationship, status (active/suspended/banned), joined_at | Domain model + tests |
| 65 | Define visibility rules | Value objects/policies for visibility: public, members-only, access-group-restricted, role-restricted | Visibility logic encapsulated |
| 66 | Define join rules | Policies for joining: open, invite-only, approval-required, entitlement-gated | Join logic encapsulated |
| 67 | Create communities table migration | communities table with all fields, unique slug constraint | Migration runs |
| 68 | Create spaces table migration | spaces table with community_id FK, ordering | Migration runs |
| 69 | Create channels table migration | channels table with space_id FK, type, settings | Migration runs |
| 70 | Create memberships table migration | memberships table with actor_id, community_id, status, role refs | Migration runs |
| 71 | Implement Community repository | CRUD + slug lookup + list with pagination | Repository works |
| 72 | Implement Space repository | CRUD + list by community + ordering | Repository works |
| 73 | Implement Channel repository | CRUD + list by space | Repository works |
| 74 | Implement Membership repository | CRUD + lookup by actor+community + list members | Repository works |
| 75 | Implement CreateCommunity use case | Create community, assign creator as owner, emit CommunityCreated | Use case + test |
| 76 | Implement UpdateCommunity use case | Update settings, emit CommunityUpdated | Use case + test |
| 77 | Implement CreateSpace use case | Create space in community, emit SpaceCreated | Use case + test |
| 78 | Implement CreateChannel use case | Create channel in space, emit ChannelCreated | Use case + test |
| 79 | Implement ReorderSpaces use case | Change space ordering within community | Use case + test |
| 80 | Implement ReorderChannels use case | Change channel ordering within space | Use case + test |
| 81 | Implement JoinCommunity use case | Check join rules, create membership, assign member role, emit MemberJoined | Use case + test |
| 82 | Implement LeaveCommunity use case | Remove membership, emit MemberLeft | Use case + test |
| 83 | Implement visibility checking service | `canActorSee(actorId, resource)` — checks visibility rules against roles/groups/entitlements | Service works for community/space/channel |
| 84 | Create community HTTP endpoints | CRUD for communities, list with filters | Endpoints match contracts |
| 85 | Create space HTTP endpoints | CRUD for spaces, reorder | Endpoints match contracts |
| 86 | Create channel HTTP endpoints | CRUD for channels, reorder | Endpoints match contracts |
| 87 | Create membership HTTP endpoints | GET /communities/:id/members, POST /communities/:id/join, POST /communities/:id/leave | Endpoints work |
| 88 | Implement community navigation query | Efficient query returning community → spaces → channels tree for sidebar | Query optimized, single round-trip |
| 89 | Contract tests for community structure | All endpoints verified | Tests pass |

---

## Wave 4 — Operations & Admin

**Goal:** Complete the membership lifecycle with invitations, admin actions, moderation capabilities, and audit trails.

**Unlocks:** Team A's v1 foundation is complete. Full operational lifecycle available.

| # | Issue | Description | Exit Criteria |
|---|-------|-------------|---------------|
| 90 | Define Invitation domain model | Invitation entity — inviter, invitee (email or actor), community, role to grant, token, status, expires_at | Domain model + tests |
| 91 | Define InvitationPolicy | Rules: who can invite, invitation limits, expiration defaults | Policy encapsulated |
| 92 | Create invitations table migration | invitations table with all fields, token index | Migration runs |
| 93 | Implement Invitation repository | CRUD + lookup by token + list by community | Repository works |
| 94 | Implement CreateInvitation use case | Generate invite, emit InvitationCreated | Use case + test |
| 95 | Implement AcceptInvitation use case | Validate token, create membership, assign role, emit InvitationAccepted | Use case + test |
| 96 | Implement RevokeInvitation use case | Cancel pending invite, emit InvitationRevoked | Use case + test |
| 97 | Implement BulkInvite use case | Create multiple invitations from list, emit events | Use case + test |
| 98 | Create invitation HTTP endpoints | POST /communities/:id/invitations, GET list, POST accept, DELETE revoke | Endpoints match contracts |
| 99 | Define ModerationAction domain model | ModerationAction entity — action type (warn/suspend/ban/unban), actor, target, reason, performed_by | Domain model + tests |
| 100 | Create moderation_actions table migration | Append-only audit table | Migration runs |
| 101 | Implement ModerationAction repository | Create + list by target/community | Repository works |
| 102 | Implement SuspendMember use case | Suspend membership, record action, emit MemberSuspended | Use case + test |
| 103 | Implement BanMember use case | Ban from community, record action, emit MemberBanned | Use case + test |
| 104 | Implement UnbanMember use case | Remove ban, record action, emit MemberUnbanned | Use case + test |
| 105 | Implement WarnMember use case | Record warning without status change, emit MemberWarned | Use case + test |
| 106 | Create moderation HTTP endpoints | POST /communities/:id/members/:actorId/suspend, /ban, /unban, /warn | Endpoints work |
| 107 | Define AuditEntry domain model | Generic audit log — action, actor, target, metadata, timestamp | Append-only model |
| 108 | Create audit_log table migration | Immutable audit table, indexed for queries | Migration runs |
| 109 | Implement AuditLog repository | Append + query by actor/target/time range | Repository works |
| 110 | Implement audit logging service | Automatic audit capture for sensitive operations | Service hooks into use cases |
| 111 | Create audit HTTP endpoints | GET /communities/:id/audit, GET /actors/:id/audit (admin only) | Endpoints work, permission-gated |
| 112 | Implement TransferOwnership use case | Transfer community ownership to another actor | Use case + test |
| 113 | Implement DeleteCommunity use case | Soft-delete or archive community, cascading rules | Use case + test |
| 114 | Implement UpdateMemberRole use case | Change member's role within community | Use case + test |
| 115 | Implement profile management endpoints | GET/PATCH /actors/:id/profile — actors can update their own profile | Endpoints work |
| 116 | Implement deactivate actor use case | Self-deactivation or admin deactivation | Use case + test |
| 117 | Contract tests for Wave 4 | All invitation, moderation, audit endpoints verified | Tests pass |
| 118 | Integration tests for full flows | End-to-end: register → join → get role → moderate → audit | Integration suite passes |
| 119 | Architecture tests for Team A modules | No forbidden imports, domain isolation verified | Architecture tests in CI |

---

## Cross-Team Unlock Points

| After Wave | Teams B/C Can... |
|------------|------------------|
| 0 | Start building against contracts and mocks |
| 1 | Authenticate users/agents, protect routes |
| 2 | Check permissions before actions, gate content by entitlements |
| 3 | Scope content to communities/spaces/channels, build navigation |
| 4 | Rely on complete membership lifecycle, moderation hooks, audit |

---

## Testing Requirements

Each wave includes embedded testing:

| Test Type | When | Purpose |
|-----------|------|---------|
| Unit tests | Every domain model issue | Validate invariants, policies, business rules |
| Integration tests | Every repository/use case issue | Validate persistence, transactions, adapters |
| Contract tests | End of each wave | Verify endpoints match defined schemas |
| Architecture tests | Wave 4 | Enforce module boundaries, forbidden imports |

---

## Dependencies on Global ADRs

This design follows:
- **ADR-001** System shape (modular monolith, hexagonal)
- **ADR-002** Bounded context map (Team A owns identity-access, community-structure)
- **ADR-003** Data and tenancy model (PostgreSQL, community_id scoping)
- **ADR-004** Integration and contract model (contract-first, fixtures, mocks)
- **ADR-005** Identity and authorization model (roles, entitlements, server-side enforcement)
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
