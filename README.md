# FoundryRooms

A community software platform for operating structured online communities.

## Overview

FoundryRooms v1 is a **community platform** for creators, educators, and membership businesses. It provides member identity and access control, spaces and channels, discussions, events, resources, memberships, notifications, and basic automation.

**This is not** a multiplayer coding room or developer sandbox - those features are planned for future phases.

## Architecture

FoundryRooms is built as a **modular monolith** with:
- **Domain-Driven Design** for bounded contexts
- **Hexagonal architecture** separating domain from infrastructure
- **Contract-first integration** for cross-context communication
- **Governed delivery** with three parallel teams

### Bounded Contexts

- **Identity & Access** - authentication, roles, permissions
- **Community Structure** - communities, spaces, channels
- **Engagement** - posts, threads, reactions, feeds
- **Resources** - documents and content management
- **Events** - event creation, RSVP, attendance
- **Commerce** - memberships, payments, entitlements
- **Notifications** - in-app and email notifications
- **Automation** - workflow rules and background jobs
- **Admin & Reporting** - moderation and analytics

## Team Structure

- **Team A (Community Core)** - Identity & Access + Community Structure
- **Team B (Experience Layer)** - Engagement + Resources + member-facing contracts
- **Team C (Operations & Monetization)** - Events + Commerce + Automation + Admin

## Documentation

- [Product & Architecture Spec](docs/spec/HIGH_LEVEL_SPEC.md)
- [Development Governance](docs/governance/DEVELOPMENT_GOVERNANCE.md)
- [Architecture Decision Records](docs/adr/)
- [Agent Operating Rules](AGENTS.md)

## Getting Started

1. Clone the repository
2. Set up your development environment
3. Review the bounded context ownership in CODEOWNERS
4. Read the development governance model
5. Check ADRs for architectural constraints

## Contributing

All contributions must follow:
- Bounded context ownership rules
- Contract-first development
- Required testing (unit, integration, contract, architecture)
- ADR compliance for architectural changes

See [Development Governance](docs/governance/DEVELOPMENT_GOVERNANCE.md) for detailed rules.

## License

[To be determined]
