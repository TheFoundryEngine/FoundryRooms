# Contracts Directory

This directory contains all shared contracts that must be versioned and maintained together.

## Structure

- `api/` - Frontend-backend API contracts (request/response schemas)
- `events/` - Domain event contracts for cross-context communication  
- `fixtures/` - Test fixtures and mock data based on approved contracts

## Contract Discipline

When changing any contract:
1. Update the schema/definition
2. Update corresponding fixtures
3. Update mocks
4. Update contract tests
5. Update consuming adapters/clients
6. Update documentation if required

See [Development Governance](../docs/governance/DEVELOPMENT_GOVERNANCE.md) for detailed rules.
