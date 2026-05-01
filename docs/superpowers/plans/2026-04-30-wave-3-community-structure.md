# Wave 3: Community Structure Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan.

**Goal:** Implement the community hierarchy — communities contain spaces, spaces contain channels. Visibility rules, join rules, and actor-community relationships.

**Architecture:** Community → Space → Channel hierarchy. Membership links actors to communities with status and roles. Visibility/join rules as policy objects.

**Tech Stack:** TypeScript, NestJS, Drizzle, PostgreSQL, Zod, Vitest

---

## File Structure

```
modules/community-structure/
├── domain/
│   ├── community.entity.ts
│   ├── space.entity.ts
│   ├── channel.entity.ts
│   ├── membership.entity.ts
│   ├── policies/
│   │   ├── visibility.policy.ts
│   │   └── join.policy.ts
├── application/
│   ├── ports/
│   │   ├── community.repository.ts
│   │   ├── space.repository.ts
│   │   ├── channel.repository.ts
│   │   └── membership.repository.ts
│   ├── use-cases/
│   │   ├── create-community.use-case.ts
│   │   ├── update-community.use-case.ts
│   │   ├── create-space.use-case.ts
│   │   ├── create-channel.use-case.ts
│   │   ├── reorder-spaces.use-case.ts
│   │   ├── reorder-channels.use-case.ts
│   │   ├── join-community.use-case.ts
│   │   └── leave-community.use-case.ts
│   ├── services/
│   │   └── visibility-checker.service.ts
│   └── queries/
│       └── community-navigation.query.ts
├── adapters/
│   ├── outbound/drizzle/
│   │   ├── migrations/
│   │   │   ├── 010_create_communities.ts
│   │   │   ├── 011_create_spaces.ts
│   │   │   ├── 012_create_channels.ts
│   │   │   └── 013_create_memberships.ts
│   │   └── *.repository.drizzle.ts
│   └── inbound/
│       ├── community.controller.ts
│       ├── space.controller.ts
│       ├── channel.controller.ts
│       └── membership.controller.ts
```

---

## Task 1: Define Community Domain Model (Issue 61)

**Files:** `modules/community-structure/domain/community.entity.ts`

- [ ] Create `CommunityId` value object
- [ ] Create `CommunitySlug` value object (URL-safe, unique)
- [ ] Create `CommunityVisibility` enum: `'public' | 'private'`
- [ ] Create `Community` entity with: id, name, slug, description, visibility, iconUrl, settings, createdAt, updatedAt
- [ ] Add factory method with validation
- [ ] Write unit tests
- [ ] Commit: `feat(community): define Community domain model`

---

## Task 2: Define Space Domain Model (Issue 62)

**Files:** `modules/community-structure/domain/space.entity.ts`

- [ ] Create `SpaceId` value object
- [ ] Create `SpaceVisibility` enum: `'public' | 'members' | 'restricted'`
- [ ] Create `Space` entity with: id, communityId, name, slug, description, visibility, order, iconEmoji
- [ ] Write unit tests
- [ ] Commit: `feat(community): define Space domain model`

---

## Task 3: Define Channel Domain Model (Issue 63)

**Files:** `modules/community-structure/domain/channel.entity.ts`

- [ ] Create `ChannelId` value object
- [ ] Create `ChannelType` enum: `'discussion' | 'announcements' | 'events' | 'resources'`
- [ ] Create `Channel` entity with: id, spaceId, name, type, description, visibility, order, settings
- [ ] Write unit tests
- [ ] Commit: `feat(community): define Channel domain model`

---

## Task 4: Define Membership Domain Model (Issue 64)

**Files:** `modules/community-structure/domain/membership.entity.ts`

- [ ] Create `MembershipId` value object
- [ ] Create `MembershipStatus` enum: `'active' | 'suspended' | 'banned'`
- [ ] Create `Membership` entity with: id, actorId, communityId, status, joinedAt, roleId
- [ ] Write unit tests
- [ ] Commit: `feat(community): define Membership domain model`

---

## Task 5: Define Visibility Rules (Issue 65)

**Files:** `modules/community-structure/domain/policies/visibility.policy.ts`

- [ ] Create `VisibilityPolicy` interface
- [ ] Implement `PublicVisibility` - anyone can see
- [ ] Implement `MembersOnlyVisibility` - community members only
- [ ] Implement `AccessGroupRestrictedVisibility` - specific access groups
- [ ] Implement `RoleRestrictedVisibility` - specific roles
- [ ] Write unit tests
- [ ] Commit: `feat(community): define visibility rules`

---

## Task 6: Define Join Rules (Issue 66)

**Files:** `modules/community-structure/domain/policies/join.policy.ts`

- [ ] Create `JoinPolicy` interface
- [ ] Implement `OpenJoin` - anyone can join
- [ ] Implement `InviteOnlyJoin` - requires invitation
- [ ] Implement `ApprovalRequiredJoin` - requires admin approval
- [ ] Implement `EntitlementGatedJoin` - requires specific entitlement
- [ ] Write unit tests
- [ ] Commit: `feat(community): define join rules`

---

## Task 7: Create Communities Table Migration (Issue 67)

**Files:** `modules/community-structure/adapters/outbound/drizzle/migrations/010_create_communities.ts`

```sql
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  visibility VARCHAR(20) NOT NULL DEFAULT 'public',
  icon_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_communities_slug ON communities(slug);
```

- [ ] Write and run migration
- [ ] Commit: `feat(community): create communities table migration`

---

## Task 8: Create Spaces Table Migration (Issue 68)

**Files:** `modules/community-structure/adapters/outbound/drizzle/migrations/011_create_spaces.ts`

```sql
CREATE TABLE spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  visibility VARCHAR(20) NOT NULL DEFAULT 'members',
  icon_emoji VARCHAR(10),
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, slug)
);
CREATE INDEX idx_spaces_community ON spaces(community_id);
```

- [ ] Write and run migration
- [ ] Commit: `feat(community): create spaces table migration`

---

## Task 9: Create Channels Table Migration (Issue 69)

**Files:** `modules/community-structure/adapters/outbound/drizzle/migrations/012_create_channels.ts`

```sql
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'discussion',
  description TEXT,
  visibility VARCHAR(20) NOT NULL DEFAULT 'members',
  "order" INTEGER NOT NULL DEFAULT 0,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_channels_space ON channels(space_id);
```

- [ ] Write and run migration
- [ ] Commit: `feat(community): create channels table migration`

---

## Task 10: Create Memberships Table Migration (Issue 70)

**Files:** `modules/community-structure/adapters/outbound/drizzle/migrations/013_create_memberships.ts`

```sql
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(actor_id, community_id)
);
CREATE INDEX idx_memberships_actor ON memberships(actor_id);
CREATE INDEX idx_memberships_community ON memberships(community_id);
```

- [ ] Write and run migration
- [ ] Commit: `feat(community): create memberships table migration`

---

## Task 11: Implement Community Repository (Issue 71)

**Files:** `modules/community-structure/adapters/outbound/drizzle/community.repository.drizzle.ts`

- [ ] Implement `CommunityRepositoryDrizzle` class
- [ ] Methods: findById, findBySlug, findAll (paginated), save, update, delete
- [ ] Write integration tests
- [ ] Commit: `feat(community): implement Community repository`

---

## Task 12: Implement Space Repository (Issue 72)

**Files:** `modules/community-structure/adapters/outbound/drizzle/space.repository.drizzle.ts`

- [ ] Implement `SpaceRepositoryDrizzle` class
- [ ] Methods: findById, findByCommunity (ordered), save, update, delete, updateOrder
- [ ] Write integration tests
- [ ] Commit: `feat(community): implement Space repository`

---

## Task 13: Implement Channel Repository (Issue 73)

**Files:** `modules/community-structure/adapters/outbound/drizzle/channel.repository.drizzle.ts`

- [ ] Implement `ChannelRepositoryDrizzle` class
- [ ] Methods: findById, findBySpace (ordered), save, update, delete, updateOrder
- [ ] Write integration tests
- [ ] Commit: `feat(community): implement Channel repository`

---

## Task 14: Implement Membership Repository (Issue 74)

**Files:** `modules/community-structure/adapters/outbound/drizzle/membership.repository.drizzle.ts`

- [ ] Implement `MembershipRepositoryDrizzle` class
- [ ] Methods: findByActorAndCommunity, findByCommunity (paginated), findByActor, save, update
- [ ] Write integration tests
- [ ] Commit: `feat(community): implement Membership repository`

---

## Task 15: Implement CreateCommunity Use Case (Issue 75)

**Files:** `modules/community-structure/application/use-cases/create-community.use-case.ts`

- [ ] Create `CreateCommunityUseCase` class
- [ ] Validate slug uniqueness
- [ ] Create community
- [ ] Create membership for creator with owner role
- [ ] Emit `CommunityCreated` event
- [ ] Write unit tests
- [ ] Commit: `feat(community): implement CreateCommunity use case`

---

## Task 16: Implement UpdateCommunity Use Case (Issue 76)

**Files:** `modules/community-structure/application/use-cases/update-community.use-case.ts`

- [ ] Create `UpdateCommunityUseCase` class
- [ ] Check permission (admin or owner)
- [ ] Update community settings
- [ ] Emit `CommunityUpdated` event
- [ ] Write unit tests
- [ ] Commit: `feat(community): implement UpdateCommunity use case`

---

## Task 17: Implement CreateSpace Use Case (Issue 77)

**Files:** `modules/community-structure/application/use-cases/create-space.use-case.ts`

- [ ] Create `CreateSpaceUseCase` class
- [ ] Check permission (admin of community)
- [ ] Validate slug uniqueness within community
- [ ] Create space with order
- [ ] Emit `SpaceCreated` event
- [ ] Write unit tests
- [ ] Commit: `feat(community): implement CreateSpace use case`

---

## Task 18: Implement CreateChannel Use Case (Issue 78)

**Files:** `modules/community-structure/application/use-cases/create-channel.use-case.ts`

- [ ] Create `CreateChannelUseCase` class
- [ ] Check permission (admin of community)
- [ ] Create channel with order
- [ ] Emit `ChannelCreated` event
- [ ] Write unit tests
- [ ] Commit: `feat(community): implement CreateChannel use case`

---

## Task 19: Implement ReorderSpaces Use Case (Issue 79)

**Files:** `modules/community-structure/application/use-cases/reorder-spaces.use-case.ts`

- [ ] Create `ReorderSpacesUseCase` class
- [ ] Accept ordered list of space IDs
- [ ] Update order values
- [ ] Write unit tests
- [ ] Commit: `feat(community): implement ReorderSpaces use case`

---

## Task 20: Implement ReorderChannels Use Case (Issue 80)

**Files:** `modules/community-structure/application/use-cases/reorder-channels.use-case.ts`

- [ ] Create `ReorderChannelsUseCase` class
- [ ] Accept ordered list of channel IDs
- [ ] Update order values
- [ ] Write unit tests
- [ ] Commit: `feat(community): implement ReorderChannels use case`

---

## Task 21: Implement JoinCommunity Use Case (Issue 81)

**Files:** `modules/community-structure/application/use-cases/join-community.use-case.ts`

- [ ] Create `JoinCommunityUseCase` class
- [ ] Check join rules (open, invite, approval, entitlement)
- [ ] Create membership with member role
- [ ] Emit `MemberJoined` event
- [ ] Write unit tests
- [ ] Commit: `feat(community): implement JoinCommunity use case`

---

## Task 22: Implement LeaveCommunity Use Case (Issue 82)

**Files:** `modules/community-structure/application/use-cases/leave-community.use-case.ts`

- [ ] Create `LeaveCommunityUseCase` class
- [ ] Check if owner (cannot leave if sole owner)
- [ ] Remove membership
- [ ] Emit `MemberLeft` event
- [ ] Write unit tests
- [ ] Commit: `feat(community): implement LeaveCommunity use case`

---

## Task 23: Implement Visibility Checking Service (Issue 83)

**Files:** `modules/community-structure/application/services/visibility-checker.service.ts`

- [ ] Create `VisibilityCheckerService` class
- [ ] Method: `canActorSee(actorId, resource)` returns boolean
- [ ] Check visibility rules against actor's roles/groups/entitlements
- [ ] Works for community, space, and channel
- [ ] Write unit tests
- [ ] Commit: `feat(community): implement visibility checking service`

---

## Task 24: Create Community HTTP Endpoints (Issue 84)

**Files:** `modules/community-structure/adapters/inbound/community.controller.ts`

- [ ] POST `/communities` - create
- [ ] GET `/communities` - list (paginated, filtered)
- [ ] GET `/communities/:slug` - get by slug
- [ ] PATCH `/communities/:id` - update
- [ ] DELETE `/communities/:id` - delete (soft)
- [ ] Write controller tests
- [ ] Commit: `feat(community): create community HTTP endpoints`

---

## Task 25: Create Space HTTP Endpoints (Issue 85)

**Files:** `modules/community-structure/adapters/inbound/space.controller.ts`

- [ ] POST `/communities/:id/spaces` - create
- [ ] GET `/communities/:id/spaces` - list
- [ ] GET `/spaces/:id` - get
- [ ] PATCH `/spaces/:id` - update
- [ ] DELETE `/spaces/:id` - delete
- [ ] PUT `/communities/:id/spaces/order` - reorder
- [ ] Write controller tests
- [ ] Commit: `feat(community): create space HTTP endpoints`

---

## Task 26: Create Channel HTTP Endpoints (Issue 86)

**Files:** `modules/community-structure/adapters/inbound/channel.controller.ts`

- [ ] POST `/spaces/:id/channels` - create
- [ ] GET `/spaces/:id/channels` - list
- [ ] GET `/channels/:id` - get
- [ ] PATCH `/channels/:id` - update
- [ ] DELETE `/channels/:id` - delete
- [ ] PUT `/spaces/:id/channels/order` - reorder
- [ ] Write controller tests
- [ ] Commit: `feat(community): create channel HTTP endpoints`

---

## Task 27: Create Membership HTTP Endpoints (Issue 87)

**Files:** `modules/community-structure/adapters/inbound/membership.controller.ts`

- [ ] GET `/communities/:id/members` - list members (paginated)
- [ ] POST `/communities/:id/join` - join
- [ ] POST `/communities/:id/leave` - leave
- [ ] GET `/actors/:id/memberships` - list actor's memberships
- [ ] Write controller tests
- [ ] Commit: `feat(community): create membership HTTP endpoints`

---

## Task 28: Implement Community Navigation Query (Issue 88)

**Files:** `modules/community-structure/application/queries/community-navigation.query.ts`

- [ ] Create `CommunityNavigationQuery` class
- [ ] Returns community → spaces → channels tree structure
- [ ] Optimized single database query (or minimal queries)
- [ ] Filters by visibility for requesting actor
- [ ] Format: `{ community, spaces: [{ space, channels: [...] }] }`
- [ ] Write integration tests
- [ ] Commit: `feat(community): implement community navigation query`

---

## Task 29: Contract Tests for Community Structure (Issue 89)

**Files:** `tests/contract/community-structure/community.contract.test.ts`

- [ ] Test community endpoints match contracts
- [ ] Test space endpoints match contracts
- [ ] Test channel endpoints match contracts
- [ ] Test membership endpoints match contracts
- [ ] Test navigation query response format
- [ ] Commit: `test(community): add contract tests for community structure`

---

## Summary

Wave 3 implements the complete community hierarchy:
- **29 tasks** covering Issues 61-89
- **Community → Space → Channel** hierarchy
- **Memberships** linking actors to communities
- **Visibility rules** (public, members, restricted)
- **Join rules** (open, invite, approval, entitlement-gated)
- **Navigation query** for efficient sidebar loading

**After Wave 3:** Team B can build community navigation UI and channel-scoped content. Team C can scope events to communities.
