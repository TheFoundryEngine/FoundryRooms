# Testing Strategy

FoundryRooms uses a multi-layered testing approach to ensure quality and architectural compliance.

## Test Types

### Unit Tests
- **Purpose**: Test domain logic and pure application logic
- **Location**: `tests/unit/`
- **Coverage**: Domain rules, policies, use cases with deterministic outcomes

### Integration Tests  
- **Purpose**: Test interactions with external systems
- **Location**: `tests/integration/`
- **Coverage**: Repositories, adapters, event handlers, job handlers
- **Requires**: a live Postgres reachable via `DATABASE_URL`. The suite fails
  loudly (does not skip) if `DATABASE_URL` is unset.
- **Excluded from `npm test`**: `vitest.config.ts` excludes `tests/integration/**`
  so the unit-tests job and the pre-push hook never run it without a database.
  It has its own CI job (`integration-tests`) with a Postgres 16 service.

Run locally (no `docker-compose.yml` on `main` yet — start Postgres however you
normally would, e.g. a local install or a one-off container):

```bash
docker run --rm -d --name foundryrooms-pg \
  -e POSTGRES_USER=foundryrooms -e POSTGRES_PASSWORD=foundryrooms \
  -e POSTGRES_DB=foundryrooms_test -p 5432:5432 postgres:16-alpine

DATABASE_URL=postgres://foundryrooms:foundryrooms@localhost:5432/foundryrooms_test \
  npx vitest run tests/integration
```

### Contract Tests
- **Purpose**: Verify API contracts and cross-context interfaces
- **Location**: `tests/contracts/`
- **Coverage**: Frontend-backend APIs, event payloads, cross-context interfaces

### Architecture Tests
- **Purpose**: Enforce architectural rules and boundaries
- **Location**: `tests/architecture/`
- **Coverage**: Forbidden imports, layer enforcement, dependency rules
- **Tool**: dependency-cruiser (`.dependency-cruiser.js`)
- **Run**: `npm run arch:test`

### End-to-End Tests
- **Purpose**: Test critical user journeys
- **Location**: `tests/e2e/`
- **Coverage**: Core workflows like signup, community joining, purchasing

## Requirements

- All meaningful behavior changes must include appropriate tests
- CI enforces test coverage and quality gates
- Architecture tests prevent boundary violations
- Contract tests ensure API compatibility

See [Development Governance](../docs/governance/DEVELOPMENT_GOVERNANCE.md) for detailed rules.
