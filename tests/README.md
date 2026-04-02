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

### Contract Tests
- **Purpose**: Verify API contracts and cross-context interfaces
- **Location**: `tests/contracts/`
- **Coverage**: Frontend-backend APIs, event payloads, cross-context interfaces

### Architecture Tests
- **Purpose**: Enforce architectural rules and boundaries
- **Location**: `tests/architecture/`
- **Coverage**: Forbidden imports, layer enforcement, dependency rules

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
