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
- [ ] Create `ActorId` value object, `ActorType` enum, `Actor` base entity
- [ ] Write unit tests for Actor invariants
- [ ] Commit: `feat(identity): define Actor base domain model`

## Task 2: Define User Domain Model (Issue 12)
**Files:** `modules/identity-access/domain/user.entity.ts`
- [ ] Create `User` entity extending Actor with: email, passwordHash, emailVerified, lastLoginAt
- [ ] Write unit tests
- [ ] Commit: `feat(identity): define User domain model`

## Task 3: Define Agent Domain Model (Issue 13)
**Files:** `modules/identity-access/domain/agent.entity.ts`
- [ ] Create `Agent` entity with: apiKeyHash, ownerActorId, description, metadata
- [ ] Write unit tests
- [ ] Commit: `feat(identity): define Agent domain model`

## Task 4: Define Session Domain Model (Issue 14)
**Files:** `modules/identity-access/domain/session.entity.ts`
- [ ] Create `Session` entity for any actor type
- [ ] Write unit tests
- [ ] Commit: `feat(identity): define Session domain model`

## Task 5: Implement Repository Interfaces (Issue 15)
**Files:** `modules/identity-access/application/ports/*.repository.ts`
- [ ] Create ActorRepository, UserRepository, AgentRepository, SessionRepository interfaces
- [ ] Commit: `feat(identity): define repository port interfaces`

## Task 6-9: Create Database Migrations (Issues 16-18)
- [ ] 001_create_actors.ts - actors table with id, type, display_name, is_active
- [ ] 002_create_users.ts - users table with actor_id FK, email, password_hash
- [ ] 003_create_agents.ts - agents table with api_key_hash, api_key_prefix
- [ ] 004_create_sessions.ts - sessions table with actor_id, token, expires_at
- [ ] Run migrations, commit each

## Task 10-11: Implement Repositories (Issues 19-20)
- [ ] UserRepositoryDrizzle with findById, findByEmail, save
- [ ] AgentRepositoryDrizzle with findByApiKeyPrefix
- [ ] Write integration tests, commit each

## Task 12-16: Implement Use Cases (Issues 21-25)
- [ ] RegisterUser - validate, hash password, save, emit event
- [ ] CreateAgent - generate API key, hash, save, return key
- [ ] Login - verify password, create session
- [ ] AuthenticateApiKey - verify key hash, return context
- [ ] Logout - delete session
- [ ] Write unit tests, commit each

## Task 17-18: Implement Adapters (Issues 26-27)
- [ ] BcryptPasswordHasher - hash/verify passwords
- [ ] CryptoApiKeyGenerator - generate `fra_` prefixed keys
- [ ] Write unit tests, commit each

## Task 19-21: Create HTTP Layer (Issues 28-30)
- [ ] AuthController - /auth/register, /auth/login, /auth/logout
- [ ] AgentController - /agents CRUD, /agents/:id/rotate-key
- [ ] AuthMiddleware - session cookie OR API key header
- [ ] Write controller tests, commit each

## Task 22: Password Reset Flow (Issue 31)
- [ ] RequestPasswordReset and CompletePasswordReset use cases
- [ ] Write unit tests
- [ ] Commit: `feat(identity): implement password reset flow`

## Task 23: Update Contracts (Issue 32)
- [ ] Add ActorSummary, AgentSummary DTOs
- [ ] Add CreateAgentRequest/Response
- [ ] Commit: `feat(contracts): update contracts for Actor model`

## Task 24: Contract Tests (Issue 34)
- [ ] Test all auth endpoints match contracts
- [ ] Commit: `test(identity): add contract tests for auth endpoints`

---

## Summary

Wave 1: **24 tasks** covering Issues 11-34
- Actor model with User/Agent as first-class citizens
- Dual auth: session-based (users) + API key (agents)
- Domain-driven design with hexagonal architecture

**After Wave 1:** Users and agents can authenticate, protected routes work.
