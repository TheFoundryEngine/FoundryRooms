# Wave 0: Foundation & Contracts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Establish module scaffolds and define all external contracts so Teams B/C can begin parallel work immediately.

**Architecture:** Monorepo with modules/ for bounded contexts, contracts/ for shared TypeScript types. Each module follows hexagonal structure (domain/, application/, adapters/).

**Tech Stack:** TypeScript, NestJS, Zod for schema validation, Vitest for testing

---

## Task 1: Initialize Monorepo with TypeScript

**Files:** package.json, tsconfig.json, tsconfig.base.json, .nvmrc

- [ ] Create root package.json with workspaces for modules/* and contracts
- [ ] Create tsconfig.base.json with strict TypeScript settings
- [ ] Create tsconfig.json with path aliases (@foundry/contracts, etc.)
- [ ] Create .nvmrc with Node 20
- [ ] Run npm install
- [ ] Commit: "chore: initialize monorepo with TypeScript configuration"

---

## Task 2: Configure Vitest

**Files:** vitest.config.ts

- [ ] Create vitest.config.ts with path aliases
- [ ] Commit: "chore: configure vitest for testing"

---

## Task 3: Scaffold identity-access Module

**Files:** modules/identity-access/*

- [ ] Create directory structure: domain/, application/, adapters/inbound/, adapters/outbound/, contracts/
- [ ] Create package.json, tsconfig.json, index.ts
- [ ] Commit: "feat: scaffold identity-access module structure"

---

## Task 4: Scaffold community-structure Module

**Files:** modules/community-structure/*

- [ ] Create same structure as identity-access
- [ ] Commit: "feat: scaffold community-structure module structure"

---

## Task 5: Set Up Contracts Package

**Files:** contracts/*

- [ ] Create directories: api/, events/, fixtures/, mocks/
- [ ] Create package.json with zod dependency
- [ ] Create index.ts exporting all contracts
- [ ] Commit: "feat: set up contracts package structure"

---

## Task 6: Define Actor and User Contracts

**Files:** contracts/api/identity-access/actor.contract.ts, user.contract.ts

- [ ] Create ActorType enum (user, agent)
- [ ] Create ActorId, ActorBase, ActorSummary schemas
- [ ] Create User, UserSummary, UserProfile schemas
- [ ] Create CreateUserRequest schema
- [ ] Commit: "feat: define Actor and User API contracts"

---

## Task 7: Define Agent Contract

**Files:** contracts/api/identity-access/agent.contract.ts

- [ ] Create Agent, AgentSummary, AgentWithApiKey schemas
- [ ] Create CreateAgentRequest, RotateApiKeyResponse schemas
- [ ] Commit: "feat: define Agent API contract"

---

## Task 8: Define Session and Auth Contracts

**Files:** contracts/api/identity-access/session.contract.ts, auth.contract.ts

- [ ] Create Session, SessionToken schemas
- [ ] Create LoginRequest, LoginResponse schemas
- [ ] Create LogoutRequest, LogoutResponse schemas
- [ ] Create PasswordReset schemas
- [ ] Create AuthErrorCode enum
- [ ] Commit: "feat: define Session and Auth API contracts"

---

## Task 9: Define Role and Permission Contracts

**Files:** contracts/api/identity-access/role.contract.ts, permission.contract.ts

- [ ] Create PermissionKey enum with all permissions
- [ ] Create Role, RoleSummary, ActorRole schemas
- [ ] Create AssignRoleRequest/Response schemas
- [ ] Create PermissionCheckRequest/Response schemas
- [ ] Commit: "feat: define Role and Permission API contracts"

---

## Task 10: Define Access Group and Entitlement Contracts

**Files:** contracts/api/identity-access/access-group.contract.ts, entitlement.contract.ts

- [ ] Create AccessGroup, AccessGroupMembership schemas
- [ ] Create EntitlementType, EntitlementSource enums
- [ ] Create Entitlement, EntitlementSummary schemas
- [ ] Create GrantEntitlement, CheckEntitlement request/response
- [ ] Commit: "feat: define Access Group and Entitlement API contracts"

---

## Task 11: Define Community Structure Contracts

**Files:** contracts/api/community-structure/*.contract.ts

- [ ] Create Community, CommunitySlug, CommunityVisibility schemas
- [ ] Create Space, SpaceVisibility schemas
- [ ] Create Channel, ChannelType schemas
- [ ] Create Membership, MembershipStatus schemas
- [ ] Create CommunityNavigation for sidebar tree
- [ ] Commit: "feat: define Community Structure API contracts"

---

## Task 12: Define Identity & Access Event Contracts

**Files:** contracts/events/identity-access/*.events.ts

- [ ] Create base.event.ts with BaseEvent schema
- [ ] Create user.events.ts (UserRegistered, UserDeactivated, etc.)
- [ ] Create agent.events.ts (AgentCreated, AgentKeyRotated, etc.)
- [ ] Create auth.events.ts (UserLoggedIn, PasswordChanged, etc.)
- [ ] Create role.events.ts (RoleAssigned, RoleRevoked, etc.)
- [ ] Create entitlement.events.ts (EntitlementGranted, etc.)
- [ ] Commit: "feat: define Identity & Access event contracts"

---

## Task 13: Define Community Structure Event Contracts

**Files:** contracts/events/community-structure/*.events.ts

- [ ] Create community.events.ts (CommunityCreated, etc.)
- [ ] Create space.events.ts (SpaceCreated, etc.)
- [ ] Create channel.events.ts (ChannelCreated, etc.)
- [ ] Create membership.events.ts (MemberJoined, MemberBanned, etc.)
- [ ] Commit: "feat: define Community Structure event contracts"

---

## Task 14: Create Identity & Access Fixtures

**Files:** contracts/fixtures/identity-access/*.fixture.ts

- [ ] Create users.fixture.ts with testUser1, testUser2
- [ ] Create agents.fixture.ts with testAgent1, testAgent2
- [ ] Create roles.fixture.ts with owner, admin, moderator, member
- [ ] Commit: "feat: create Identity & Access test fixtures"

---

## Task 15: Create Community Structure Fixtures

**Files:** contracts/fixtures/community-structure/*.fixture.ts

- [ ] Create communities.fixture.ts
- [ ] Create spaces.fixture.ts
- [ ] Create channels.fixture.ts
- [ ] Commit: "feat: create Community Structure test fixtures"

---

## Task 16: Create Mock Adapters

**Files:** contracts/mocks/identity-access/*.mock.ts

- [ ] Create permission-checker.mock.ts with MockPermissionChecker
- [ ] Create actor-lookup.mock.ts with MockActorLookup
- [ ] Export createMockPermissionChecker, createMockActorLookup
- [ ] Commit: "feat: create mock adapters for Identity & Access"

---

## Task 17: Create Contract Tests

**Files:** tests/contract/**/contracts.test.ts

- [ ] Create identity-access/contracts.test.ts
- [ ] Create community-structure/contracts.test.ts
- [ ] Verify all fixtures pass schema validation
- [ ] Run: npm test
- [ ] Commit: "feat: add contract tests"

---

## Task 18: Final Verification

- [ ] Update contracts/README.md with usage docs
- [ ] Run: npm run typecheck
- [ ] Run: npm test
- [ ] Push: git push origin main

---

## Summary

Wave 0 delivers:
- 18 tasks total
- Monorepo with TypeScript + Vitest
- Module scaffolds for identity-access and community-structure
- Complete API contracts using Zod
- Event contracts for domain events
- Test fixtures for all entities
- Mock adapters for Teams B & C

After completion, Teams B & C can import @foundry/contracts and build against mocks.
