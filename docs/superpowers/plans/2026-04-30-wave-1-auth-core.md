# Wave 1: Auth Core Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan.

**Goal:** Implement working authentication for Users and Agents as first-class Actor types with distinct auth mechanisms but shared identity infrastructure.

**Architecture:** Actor base type with User/Agent subtypes. Session-based auth for users, API key auth for agents. Hexagonal structure with domain models, repositories, use cases, and HTTP adapters.

**Tech Stack:** TypeScript, NestJS, Drizzle, PostgreSQL, Zod, Vitest, bcrypt, crypto

---

## File Structure

```
modules/identity-access/
├── domain/
│   ├── actor.entity.ts
│   ├── user.entity.ts
│   ├── agent.entity.ts
│   └── session.entity.ts
├── application/
│   ├── ports/
│   │   ├── actor.repository.ts
│   │   ├── user.repository.ts
│   │   ├── agent.repository.ts
│   │   └── session.repository.ts
│   └── use-cases/
│       ├── register-user.use-case.ts
│       ├── create-agent.use-case.ts
│       ├── login.use-case.ts
│       ├── logout.use-case.ts
│       └── reset-password.use-case.ts
├── adapters/
│   ├── outbound/
│   │   ├── drizzle/
│   │   │   ├── migrations/
│   │   │   │   ├── 001_create_actors.ts
│   │   │   │   ├── 002_create_users.ts
│   │   │   │   ├── 003_create_agents.ts
│   │   │   │   └── 004_create_sessions.ts
│   │   │   ├── schema.ts
│   │   │   ├── user.repository.drizzle.ts
│   │   │   └── agent.repository.drizzle.ts
│   │   ├── password-hasher.adapter.ts
│   │   └── api-key-generator.adapter.ts
│   └── inbound/
│       ├── auth.controller.ts
│       ├── agent.controller.ts
│       └── auth.middleware.ts
```

---

## Task 1: Define Actor Base Domain Model (Issue 11)

**Files:** `modules/identity-access/domain/actor.entity.ts`

- [ ] Create `ActorId` value object (branded UUID type)
- [ ] Create `ActorType` enum: `'user' | 'agent'`
- [ ] Create `Actor` base entity with: id, type, displayName, avatarUrl, createdAt, updatedAt, isActive
- [ ] Write unit tests for Actor invariants
- [ ] Commit: `feat(identity): define Actor base domain model`

---

## Task 2: Define User Domain Model (Issue 12)

**Files:** `modules/identity-access/domain/user.entity.ts`

- [ ] Create `User` entity extending Actor with: email, passwordHash, emailVerified, lastLoginAt
- [ ] Add `Email` value object with validation
- [ ] Add factory method `User.create(props)` with validation
- [ ] Write unit tests
- [ ] Commit: `feat(identity): define User domain model`

---

## Task 3: Define Agent Domain Model (Issue 13)

**Files:** `modules/identity-access/domain/agent.entity.ts`

- [ ] Create `Agent` entity extending Actor with: apiKeyHash, ownerActorId (nullable), description, metadata
- [ ] Add `ApiKey` value object (prefix + random bytes)
- [ ] Add factory methods for creation and key rotation
- [ ] Write unit tests
- [ ] Commit: `feat(identity): define Agent domain model`

---

## Task 4: Define Session Domain Model (Issue 14)

**Files:** `modules/identity-access/domain/session.entity.ts`

- [ ] Create `Session` entity with: id, actorId, actorType, token, expiresAt, createdAt, lastAccessedAt
- [ ] Session works for any actor type (user or agent)
- [ ] Add `isExpired()` method
- [ ] Write unit tests
- [ ] Commit: `feat(identity): define Session domain model`

---

## Task 5: Implement Repository Interfaces (Issue 15)

**Files:** `modules/identity-access/application/ports/*.repository.ts`

- [ ] Create `ActorRepository` interface: findById, findByType, save
- [ ] Create `UserRepository` interface extending ActorRepository: findByEmail
- [ ] Create `AgentRepository` interface: findByApiKeyPrefix
- [ ] Create `SessionRepository` interface: findByToken, findByActorId, deleteByActorId
- [ ] Commit: `feat(identity): define repository port interfaces`

---

## Task 6: Create Actors Table Migration (Issue 16)

**Files:** `modules/identity-access/adapters/outbound/drizzle/migrations/001_create_actors.ts`

```sql
CREATE TABLE actors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(10) NOT NULL CHECK (type IN ('user', 'agent')),
  display_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_actors_type ON actors(type);
```

- [ ] Write migration
- [ ] Run migration, verify
- [ ] Commit: `feat(identity): create actors table migration`

---

## Task 7: Create Users Table Migration (Issue 17)

**Files:** `modules/identity-access/adapters/outbound/drizzle/migrations/002_create_users.ts`

```sql
CREATE TABLE users (
  actor_id UUID PRIMARY KEY REFERENCES actors(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMPTZ
);
CREATE INDEX idx_users_email ON users(email);
```

- [ ] Write migration
- [ ] Run migration, verify
- [ ] Commit: `feat(identity): create users table migration`

---

## Task 8: Create Agents Table Migration (Issue 18)

**Files:** `modules/identity-access/adapters/outbound/drizzle/migrations/003_create_agents.ts`

```sql
CREATE TABLE agents (
  actor_id UUID PRIMARY KEY REFERENCES actors(id) ON DELETE CASCADE,
  api_key_hash VARCHAR(255) NOT NULL,
  api_key_prefix VARCHAR(8) NOT NULL,
  owner_actor_id UUID REFERENCES actors(id),
  description TEXT,
  metadata JSONB DEFAULT '{}'
);
CREATE UNIQUE INDEX idx_agents_api_key_prefix ON agents(api_key_prefix);
```

- [ ] Write migration
- [ ] Run migration, verify
- [ ] Commit: `feat(identity): create agents table migration`

---

## Task 9: Create Sessions Table Migration

**Files:** `modules/identity-access/adapters/outbound/drizzle/migrations/004_create_sessions.ts`

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_sessions_actor ON sessions(actor_id);
CREATE INDEX idx_sessions_token ON sessions(token);
```

- [ ] Write migration
- [ ] Run migration, verify
- [ ] Commit: `feat(identity): create sessions table migration`

---

## Task 10: Implement User Repository (Issue 19)

**Files:** `modules/identity-access/adapters/outbound/drizzle/user.repository.drizzle.ts`

- [ ] Implement `UserRepositoryDrizzle` class
- [ ] Implement findById, findByEmail, save, update methods
- [ ] Map between domain User and database row
- [ ] Write integration tests with test database
- [ ] Commit: `feat(identity): implement User repository with Drizzle`

---

## Task 11: Implement Agent Repository (Issue 20)

**Files:** `modules/identity-access/adapters/outbound/drizzle/agent.repository.drizzle.ts`

- [ ] Implement `AgentRepositoryDrizzle` class
- [ ] Implement findById, findByApiKeyPrefix, save, update methods
- [ ] Write integration tests
- [ ] Commit: `feat(identity): implement Agent repository with Drizzle`

---

## Task 12: Implement RegisterUser Use Case (Issue 21)

**Files:** `modules/identity-access/application/use-cases/register-user.use-case.ts`

- [ ] Create `RegisterUserUseCase` class
- [ ] Validate email uniqueness
- [ ] Hash password using PasswordHasher port
- [ ] Create User entity, save via repository
- [ ] Emit `UserRegistered` domain event
- [ ] Write unit tests with mocked dependencies
- [ ] Commit: `feat(identity): implement RegisterUser use case`

---

## Task 13: Implement CreateAgent Use Case (Issue 22)

**Files:** `modules/identity-access/application/use-cases/create-agent.use-case.ts`

- [ ] Create `CreateAgentUseCase` class
- [ ] Generate API key using ApiKeyGenerator port
- [ ] Hash API key, store prefix for lookup
- [ ] Create Agent entity, save via repository
- [ ] Emit `AgentCreated` domain event
- [ ] Return API key (only time it's visible in plaintext)
- [ ] Write unit tests
- [ ] Commit: `feat(identity): implement CreateAgent use case`

---

## Task 14: Implement Login Use Case (Issue 23)

**Files:** `modules/identity-access/application/use-cases/login.use-case.ts`

- [ ] Create `LoginUseCase` class
- [ ] Find user by email
- [ ] Verify password hash
- [ ] Create session with expiration
- [ ] Update lastLoginAt
- [ ] Emit `UserLoggedIn` event
- [ ] Return session token
- [ ] Write unit tests
- [ ] Commit: `feat(identity): implement Login use case`

---

## Task 15: Implement API Key Auth (Issue 24)

**Files:** `modules/identity-access/application/use-cases/authenticate-api-key.use-case.ts`

- [ ] Create `AuthenticateApiKeyUseCase` class
- [ ] Extract prefix from API key
- [ ] Find agent by prefix
- [ ] Verify full API key hash
- [ ] Return agent context (no session needed, or create short-lived session)
- [ ] Write unit tests
- [ ] Commit: `feat(identity): implement API key authentication`

---

## Task 16: Implement Logout Use Case (Issue 25)

**Files:** `modules/identity-access/application/use-cases/logout.use-case.ts`

- [ ] Create `LogoutUseCase` class
- [ ] Delete session by token
- [ ] Works for any actor type
- [ ] Write unit tests
- [ ] Commit: `feat(identity): implement Logout use case`

---

## Task 17: Implement Password Hashing Adapter (Issue 26)

**Files:** `modules/identity-access/adapters/outbound/password-hasher.adapter.ts`

- [ ] Create `PasswordHasherPort` interface
- [ ] Implement `BcryptPasswordHasher` adapter
- [ ] Use bcrypt with configurable rounds (default 12)
- [ ] Write unit tests
- [ ] Commit: `feat(identity): implement password hashing adapter`

---

## Task 18: Implement API Key Generation Adapter (Issue 27)

**Files:** `modules/identity-access/adapters/outbound/api-key-generator.adapter.ts`

- [ ] Create `ApiKeyGeneratorPort` interface
- [ ] Implement `CryptoApiKeyGenerator` adapter
- [ ] Generate format: `fra_` prefix + 32 random bytes (base64)
- [ ] Write unit tests
- [ ] Commit: `feat(identity): implement API key generation adapter`

---

## Task 19: Create Auth HTTP Endpoints (Issue 28)

**Files:** `modules/identity-access/adapters/inbound/auth.controller.ts`

- [ ] POST `/auth/register` - RegisterUser
- [ ] POST `/auth/login` - Login
- [ ] POST `/auth/logout` - Logout (requires auth)
- [ ] Validate request bodies with Zod schemas from contracts
- [ ] Return responses matching contract DTOs
- [ ] Write controller tests
- [ ] Commit: `feat(identity): create auth HTTP endpoints`

---

## Task 20: Create Agent Management Endpoints (Issue 29)

**Files:** `modules/identity-access/adapters/inbound/agent.controller.ts`

- [ ] POST `/agents` - CreateAgent
- [ ] GET `/agents/:id` - GetAgent
- [ ] POST `/agents/:id/rotate-key` - RotateApiKey
- [ ] DELETE `/agents/:id` - DeactivateAgent
- [ ] Write controller tests
- [ ] Commit: `feat(identity): create agent management endpoints`

---

## Task 21: Implement Auth Middleware (Issue 30)

**Files:** `modules/identity-access/adapters/inbound/auth.middleware.ts`

- [ ] Create `AuthMiddleware` class
- [ ] Check for session cookie OR `Authorization: Bearer <api-key>` header
- [ ] Validate session token or API key
- [ ] Attach `ActorContext` to request (actorId, actorType, permissions)
- [ ] Write middleware tests
- [ ] Commit: `feat(identity): implement auth middleware`

---

## Task 22: Implement Password Reset Flow (Issue 31)

**Files:** `modules/identity-access/application/use-cases/reset-password.use-case.ts`

- [ ] Create `RequestPasswordResetUseCase` - generate reset token, emit event
- [ ] Create `CompletePasswordResetUseCase` - validate token, update password
- [ ] User-only flow (agents use key rotation)
- [ ] Write unit tests
- [ ] Commit: `feat(identity): implement password reset flow`

---

## Task 23: Update Contracts for Actor Model (Issue 32)

**Files:** `contracts/api/identity-access/*.contract.ts`

- [ ] Add `ActorSummary` DTO (id, type, displayName, avatarUrl)
- [ ] Add `AgentSummary` DTO
- [ ] Update `UserSummary` to extend ActorSummary pattern
- [ ] Add `CreateAgentRequest`, `CreateAgentResponse`
- [ ] Commit: `feat(contracts): update contracts for Actor model`

---

## Task 24: Contract Tests for Auth Endpoints (Issue 34)

**Files:** `tests/contract/identity-access/auth.contract.test.ts`

- [ ] Test POST /auth/register matches contract
- [ ] Test POST /auth/login matches contract
- [ ] Test POST /auth/logout matches contract
- [ ] Test agent endpoints match contracts
- [ ] Verify both user and agent auth paths
- [ ] Commit: `test(identity): add contract tests for auth endpoints`

---

## Summary

Wave 1 implements the complete authentication foundation:
- **24 tasks** covering Issues 11-34
- **Actor model** with User and Agent as first-class citizens
- **Dual auth mechanisms**: session-based for users, API key for agents
- **Domain-driven design** with clear boundaries
- **TDD approach**: write tests before implementation

**After Wave 1:** Users and agents can authenticate, protected routes work, Teams B/C can build against real auth.
