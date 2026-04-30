# Wave 3: Community Structure Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan.

**Goal:** Implement the community hierarchy — communities contain spaces, spaces contain channels. Visibility rules, join rules, and actor-community relationships.

**Architecture:** Community → Space → Channel hierarchy. Membership links actors to communities. Visibility/join rules as policy objects.

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
│   └── policies/
│       ├── visibility.policy.ts
│       └── join.policy.ts
├── application/
│   ├── use-cases/
│   │   ├── create-community.use-case.ts
│   │   ├── create-space.use-case.ts
│   │   ├── create-channel.use-case.ts
│   │   ├── join-community.use-case.ts
│   │   └── leave-community.use-case.ts
│   ├── services/
│   │   └── visibility-checker.service.ts
│   └── queries/
│       └── community-navigation.query.ts
├── adapters/
│   ├── outbound/drizzle/
│   │   └── migrations/010-013
│   └── inbound/
│       ├── community.controller.ts
│       ├── space.controller.ts
│       ├── channel.controller.ts
│       └── membership.controller.ts
```

---

## Task 1-4: Define Domain Models (Issues 61-64)
- [ ] Community - id, name, slug, description, visibility, settings
- [ ] Space - id, communityId, name, slug, visibility, order
- [ ] Channel - id, spaceId, name, type, visibility, order
- [ ] Membership - actorId, communityId, status (active/suspended/banned)
- [ ] Unit tests, commit each

## Task 5: Define Visibility Rules (Issue 65)
- [ ] VisibilityPolicy interface
- [ ] PublicVisibility, MembersOnlyVisibility, AccessGroupRestricted, RoleRestricted
- [ ] Commit: `feat(community): define visibility rules`

## Task 6: Define Join Rules (Issue 66)
- [ ] JoinPolicy interface
- [ ] OpenJoin, InviteOnlyJoin, ApprovalRequiredJoin, EntitlementGatedJoin
- [ ] Commit: `feat(community): define join rules`

## Task 7-10: Create Database Migrations (Issues 67-70)
- [ ] 010_create_communities.ts - unique slug, visibility
- [ ] 011_create_spaces.ts - community_id FK, order
- [ ] 012_create_channels.ts - space_id FK, type, order
- [ ] 013_create_memberships.ts - actor_id, community_id, status
- [ ] Commit each migration

## Task 11-14: Implement Repositories (Issues 71-74)
- [ ] CommunityRepository - findBySlug, list paginated
- [ ] SpaceRepository - findByCommunity ordered
- [ ] ChannelRepository - findBySpace ordered
- [ ] MembershipRepository - findByActorAndCommunity
- [ ] Integration tests, commit each

## Task 15-22: Implement Use Cases (Issues 75-82)
- [ ] CreateCommunity - assign creator as owner
- [ ] UpdateCommunity - check admin permission
- [ ] CreateSpace - check admin permission
- [ ] CreateChannel - check admin permission
- [ ] ReorderSpaces - update order values
- [ ] ReorderChannels - update order values
- [ ] JoinCommunity - check join rules, create membership
- [ ] LeaveCommunity - remove membership (owner cannot leave if sole)
- [ ] Unit tests, commit each

## Task 23: Visibility Checking Service (Issue 83)
- [ ] `canActorSee(actorId, resource)` returns boolean
- [ ] Check visibility rules against roles/groups/entitlements
- [ ] Commit: `feat(community): implement visibility checking service`

## Task 24-27: Create HTTP Endpoints (Issues 84-87)
- [ ] Community CRUD - /communities
- [ ] Space CRUD + reorder - /communities/:id/spaces
- [ ] Channel CRUD + reorder - /spaces/:id/channels
- [ ] Membership - join, leave, list members
- [ ] Controller tests, commit each

## Task 28: Community Navigation Query (Issue 88)
- [ ] Returns community → spaces → channels tree
- [ ] Optimized single query, filtered by visibility
- [ ] Commit: `feat(community): implement community navigation query`

## Task 29: Contract Tests (Issue 89)
- [ ] Test all community structure endpoints
- [ ] Commit: `test(community): add contract tests`

---

## Summary

Wave 3: **29 tasks** covering Issues 61-89
- Community → Space → Channel hierarchy
- Memberships linking actors to communities
- Visibility rules (public, members, restricted)
- Join rules (open, invite, approval, entitlement-gated)

**After Wave 3:** Team B can build navigation UI, Team C can scope events to communities.
