# Wave 0: Foundation & Contracts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Establish module scaffolds and define all external contracts so Teams B/C can begin parallel work immediately.

**Architecture:** Monorepo with modules/ for bounded contexts, contracts/ for shared TypeScript types, apps/ for NestJS entrypoint. Each module follows hexagonal structure (domain/, application/, adapters/, contracts/).

**Tech Stack:** TypeScript, NestJS, Zod for schema validation, Vitest for testing

---

## File Structure Overview

### Directories to Create
- `modules/identity-access/` - Identity & Access bounded context
- `modules/community-structure/` - Community Structure bounded context
- `contracts/api/identity-access/` - API contracts for identity
- `contracts/api/community-structure/` - API contracts for community
- `contracts/events/identity-access/` - Event contracts for identity
- `contracts/events/community-structure/` - Event contracts for community
- `contracts/fixtures/` - Test fixtures
- `contracts/mocks/` - Mock implementations
- `tests/contract/` - Contract verification tests

---

## Task 1: Initialize Monorepo with TypeScript

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.base.json`
- Create: `.nvmrc`

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "foundry-rooms",
  "version": "0.0.1",
  "private": true,
  "description": "Community platform with modular monolith architecture",
  "scripts": {
    "build": "tsc --build",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint . --ext .ts",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "typescript": "^5.3.3",
    "vitest": "^1.2.0",
    "zod": "^3.22.4"
  },
  "engines": {
    "node": ">=20.0.0"
  },
  "workspaces": [
    "modules/*",
    "contracts"
  ]
}
```

- [ ] **Step 2: Create tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

- [ ] **Step 3: Create root tsconfig.json**

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@foundry/contracts": ["./contracts"],
      "@foundry/contracts/*": ["./contracts/*"],
      "@foundry/identity-access": ["./modules/identity-access"],
      "@foundry/community-structure": ["./modules/community-structure"]
    }
  },
  "include": ["modules/**/*", "contracts/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 4: Create .nvmrc**

```
20
```

- [ ] **Step 5: Install dependencies**

Run: `npm install`

- [ ] **Step 6: Commit**

```bash
git add package.json tsconfig.json tsconfig.base.json .nvmrc package-lock.json
git commit -m "chore: initialize monorepo with TypeScript configuration"
```

---

## Task 2: Configure Vitest

**Files:**
- Create: `vitest.config.ts`

- [ ] **Step 1: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'modules/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@foundry/contracts': path.resolve(__dirname, './contracts'),
      '@foundry/identity-access': path.resolve(__dirname, './modules/identity-access'),
      '@foundry/community-structure': path.resolve(__dirname, './modules/community-structure'),
    },
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add vitest.config.ts
git commit -m "chore: configure vitest for testing"
```

---

## Task 3: Scaffold identity-access Module

**Files:**
- Create: `modules/identity-access/package.json`
- Create: `modules/identity-access/tsconfig.json`
- Create: `modules/identity-access/index.ts`
- Create: `modules/identity-access/contracts/index.ts`
- Create: directory structure with .gitkeep files

- [ ] **Step 1: Create directory structure**

Run: `mkdir -p modules/identity-access/{domain,application,adapters/inbound,adapters/outbound,contracts}`

- [ ] **Step 2: Create package.json**

```json
{
  "name": "@foundry/identity-access",
  "version": "0.0.1",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts"
}
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./" },
  "include": ["./**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 4: Create index.ts**

```typescript
/**
 * Identity & Access Module
 * Owns: Users, Agents, Sessions, Roles, Permissions, Access Groups, Entitlements
 */
export * from './contracts';
```

- [ ] **Step 5: Create contracts/index.ts**

```typescript
// Module contracts - will be added as implemented
export {};
```

- [ ] **Step 6: Create .gitkeep files**

Run: `touch modules/identity-access/{domain,application,adapters/inbound,adapters/outbound}/.gitkeep`

- [ ] **Step 7: Commit**

```bash
git add modules/identity-access/
git commit -m "feat: scaffold identity-access module structure"
```

---

## Task 4: Scaffold community-structure Module

**Files:**
- Create: `modules/community-structure/package.json`
- Create: `modules/community-structure/tsconfig.json`
- Create: `modules/community-structure/index.ts`
- Create: `modules/community-structure/contracts/index.ts`

- [ ] **Step 1: Create directory structure**

Run: `mkdir -p modules/community-structure/{domain,application,adapters/inbound,adapters/outbound,contracts}`

- [ ] **Step 2: Create package.json**

```json
{
  "name": "@foundry/community-structure",
  "version": "0.0.1",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts"
}
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./" },
  "include": ["./**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 4: Create index.ts**

```typescript
/**
 * Community Structure Module
 * Owns: Communities, Spaces, Channels, Memberships
 */
export * from './contracts';
```

- [ ] **Step 5: Create contracts/index.ts**

```typescript
export {};
```

- [ ] **Step 6: Create .gitkeep files**

Run: `touch modules/community-structure/{domain,application,adapters/inbound,adapters/outbound}/.gitkeep`

- [ ] **Step 7: Commit**

```bash
git add modules/community-structure/
git commit -m "feat: scaffold community-structure module structure"
```

---

## Task 5: Set Up Contracts Package

**Files:**
- Create: `contracts/package.json`
- Create: `contracts/tsconfig.json`
- Create: `contracts/index.ts`
- Create: directory structure

- [ ] **Step 1: Create directories**

Run:
```bash
mkdir -p contracts/api/{identity-access,community-structure}
mkdir -p contracts/events/{identity-access,community-structure}
mkdir -p contracts/fixtures/{identity-access,community-structure}
mkdir -p contracts/mocks/identity-access
```

- [ ] **Step 2: Create package.json**

```json
{
  "name": "@foundry/contracts",
  "version": "0.0.1",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "dependencies": {
    "zod": "^3.22.4"
  }
}
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./" },
  "include": ["./**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 4: Create index.ts**

```typescript
// API Contracts
export * as IdentityAccessApi from './api/identity-access';
export * as CommunityStructureApi from './api/community-structure';
// Event Contracts
export * as IdentityAccessEvents from './events/identity-access';
export * as CommunityStructureEvents from './events/community-structure';
// Fixtures
export * as IdentityAccessFixtures from './fixtures/identity-access';
export * as CommunityStructureFixtures from './fixtures/community-structure';
// Mocks
export * as IdentityAccessMocks from './mocks/identity-access';
```

- [ ] **Step 5: Create placeholder index files**

Create empty index.ts in each subdirectory with `export {};`

- [ ] **Step 6: Commit**

```bash
git add contracts/
git commit -m "feat: set up contracts package structure"
```

---

## Task 6: Define Actor and User Contracts

**Files:**
- Create: `contracts/api/identity-access/actor.contract.ts`
- Create: `contracts/api/identity-access/user.contract.ts`

- [ ] **Step 1: Create actor.contract.ts**

```typescript
import { z } from 'zod';

export const ActorType = z.enum(['user', 'agent']);
export type ActorType = z.infer<typeof ActorType>;

export const ActorId = z.string().uuid();
export type ActorId = z.infer<typeof ActorId>;

export const ActorBase = z.object({
  id: ActorId,
  type: ActorType,
  displayName: z.string().min(1).max(100),
  avatarUrl: z.string().url().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  isActive: z.boolean(),
});
export type ActorBase = z.infer<typeof ActorBase>;

export const ActorSummary = z.object({
  id: ActorId,
  type: ActorType,
  displayName: z.string(),
  avatarUrl: z.string().url().nullable(),
});
export type ActorSummary = z.infer<typeof ActorSummary>;
```

- [ ] **Step 2: Create user.contract.ts**

```typescript
import { z } from 'zod';
import { ActorId, ActorBase, ActorSummary } from './actor.contract';

export const Email = z.string().email();
export type Email = z.infer<typeof Email>;

export const User = ActorBase.extend({
  type: z.literal('user'),
  email: Email,
  emailVerified: z.boolean(),
  lastLoginAt: z.string().datetime().nullable(),
});
export type User = z.infer<typeof User>;

export const UserSummary = ActorSummary.extend({
  type: z.literal('user'),
  email: Email,
});
export type UserSummary = z.infer<typeof UserSummary>;

export const UserProfile = User.extend({
  bio: z.string().max(500).nullable(),
  location: z.string().max(100).nullable(),
  website: z.string().url().nullable(),
  timezone: z.string().nullable(),
});
export type UserProfile = z.infer<typeof UserProfile>;

export const CreateUserRequest = z.object({
  email: Email,
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(100),
});
export type CreateUserRequest = z.infer<typeof CreateUserRequest>;
```

- [ ] **Step 3: Update index.ts**

```typescript
export * from './actor.contract';
export * from './user.contract';
```

- [ ] **Step 4: Commit**

```bash
git add contracts/api/identity-access/
git commit -m "feat: define Actor and User API contracts"
```

---

## Task 7-10: Define Remaining Identity Contracts

Tasks 7-10 follow the same pattern to create:
- `agent.contract.ts` - Agent schema, CreateAgentRequest/Response
- `session.contract.ts` - Session, SessionToken schemas
- `auth.contract.ts` - Login/Logout request/response, error codes
- `role.contract.ts` - Role, Permission, ActorRole schemas
- `permission.contract.ts` - PermissionKey enum, check request/response
- `access-group.contract.ts` - AccessGroup schemas
- `entitlement.contract.ts` - Entitlement schemas

Each task: create file, update index.ts, verify compile, commit.

---

## Task 11: Define Community Structure Contracts

Create in `contracts/api/community-structure/`:
- `community.contract.ts` - Community, CommunitySlug, visibility
- `space.contract.ts` - Space, SpaceVisibility
- `channel.contract.ts` - Channel, ChannelType
- `membership.contract.ts` - Membership, MembershipStatus, CommunityNavigation

---

## Task 12-13: Define Event Contracts

Create in `contracts/events/`:
- Base event schema in `base.event.ts`
- Identity events: UserRegistered, AgentCreated, RoleAssigned, etc.
- Community events: CommunityCreated, SpaceCreated, MemberJoined, etc.

---

## Task 14-15: Create Fixtures

Create test data in `contracts/fixtures/`:
- `identity-access/users.fixture.ts` - testUser1, testUser2
- `identity-access/agents.fixture.ts` - testAgent1, testAgent2
- `identity-access/roles.fixture.ts` - ownerRole, adminRole, etc.
- `community-structure/communities.fixture.ts`
- `community-structure/spaces.fixture.ts`
- `community-structure/channels.fixture.ts`

---

## Task 16: Create Mock Adapters

Create in `contracts/mocks/identity-access/`:
- `permission-checker.mock.ts` - MockPermissionChecker class
- `actor-lookup.mock.ts` - MockActorLookup class

These allow Teams B & C to check permissions without real implementation.

---

## Task 17: Create Contract Tests

Create in `tests/contract/`:
- `identity-access/contracts.test.ts` - Verify fixtures match schemas
- `community-structure/contracts.test.ts` - Verify fixtures match schemas

---

## Task 18: Final Verification

- [ ] Update contracts/README.md with usage examples
- [ ] Run full typecheck: `npm run typecheck`
- [ ] Run tests: `npm test`
- [ ] Push to GitHub: `git push origin main`

---

## Summary

Wave 0 creates the foundation for parallel development:
- **18 tasks** total
- **Monorepo structure** with TypeScript
- **Module scaffolds** for identity-access and community-structure
- **API contracts** using Zod schemas
- **Event contracts** for domain events
- **Fixtures** for testing
- **Mocks** for Teams B & C to use immediately
- **Contract tests** to verify everything works

After Wave 0, Teams B and C can import `@foundry/contracts` and build against mocks.
