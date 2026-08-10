/**
 * Architecture boundary rules.
 *
 * NOTE on regex anchoring (THE-60 / #21): every path pattern here MUST be
 * anchored with `^`. Unanchored `modules/` also matches the *substring* in
 * `node_modules/`, which made the cross-context rule flag every npm import
 * as a violation (and, before the test invoked the rules correctly, nobody
 * noticed because no rule was evaluated at all).
 *
 * These rules are enforced by tests/architecture/boundary.test.ts, which
 * keeps a lockstep list of rule names — adding a rule here without a test
 * there fails the suite. Rule semantics changes require an ADR (AGENTS.md);
 * this file's history: anchoring fix only, semantics unchanged.
 */

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    // ── 1. Cross-context isolation ──────────────────────────────────────
    // No bounded context may import from another context's internal layers
    // (domain, application, adapters). Cross-context access is only allowed
    // through the target context's contracts/ or the shared contracts/.
    {
      name: 'no-cross-context-internal-imports',
      comment: 'Bounded contexts must not import from another context\'s domain, application, or adapters. Use contracts/ for cross-context communication.',
      severity: 'error',
      from: {
        path: '^modules/([^/]+)/',
        pathNot: '^modules/[^/]+/contracts/',
      },
      to: {
        path: '^modules/(?!$1/)[^/]+/',
        pathNot: '^modules/[^/]+/contracts/',
      },
    },

    // ── 2. Hexagonal layer enforcement ──────────────────────────────────
    // Domain must not depend on application, adapters, or infrastructure
    {
      name: 'domain-must-not-depend-on-application',
      comment: 'Domain layer must not import from application layer. Domain is the innermost layer.',
      severity: 'error',
      from: {
        path: '^modules/[^/]+/domain/',
      },
      to: {
        path: '^modules/[^/]+/application/',
      },
    },
    {
      name: 'domain-must-not-depend-on-adapters',
      comment: 'Domain layer must not import from adapters. Domain is the innermost layer.',
      severity: 'error',
      from: {
        path: '^modules/[^/]+/domain/',
      },
      to: {
        path: '^modules/[^/]+/adapters/',
      },
    },

    // Application must not depend on adapters (only adapters depend on application)
    {
      name: 'application-must-not-depend-on-adapters',
      comment: 'Application layer must not import from adapters. Adapters depend on application, not the reverse.',
      severity: 'error',
      from: {
        path: '^modules/[^/]+/application/',
      },
      to: {
        path: '^modules/[^/]+/adapters/',
      },
    },

    // ── 3. Domain must be framework-independent ─────────────────────────
    // Domain layer must not import infrastructure frameworks
    {
      name: 'domain-must-not-import-frameworks',
      comment: 'Domain layer must not import infrastructure frameworks (NestJS, Express, Drizzle, pg). Domain is framework-independent.',
      severity: 'error',
      from: {
        path: '^modules/[^/]+/domain/',
      },
      to: {
        // Each alternative is followed by the closing '/', so none may end
        // with its own slash: '@nestjs/' here would require the impossible
        // path 'node_modules/@nestjs//' and silently never match (this was
        // a live bug — see THE-60).
        path: '^node_modules/(drizzle-orm|@nestjs|express|pg|cookie-parser)/',
      },
    },

    // ── 4. Contracts must not leak internal models ──────────────────────
    // Contracts must not import from adapters or domain internals
    {
      name: 'contracts-must-not-import-adapters',
      comment: 'Contracts must not import from adapters. Contracts define external shapes, not infrastructure details.',
      severity: 'error',
      from: {
        path: '^modules/[^/]+/contracts/',
      },
      to: {
        path: '^modules/[^/]+/adapters/',
      },
    },
    {
      name: 'contracts-must-not-import-drizzle',
      comment: 'Contracts must not import Drizzle ORM. Contracts define external shapes, not persistence models.',
      severity: 'error',
      from: {
        path: '^modules/[^/]+/contracts/',
      },
      to: {
        path: '^node_modules/drizzle-orm/',
      },
    },

    // ── 5. No ORM entities in shared contracts ──────────────────────────
    // The shared contracts/ directory must not import from any module's
    // adapters or domain internals
    {
      name: 'shared-contracts-must-not-import-module-internals',
      comment: 'Shared contracts/ must not import from module domain or adapters. Contracts are external shapes only.',
      severity: 'error',
      from: {
        path: '^contracts/',
      },
      to: {
        path: '^modules/[^/]+/(domain|adapters)/',
      },
    },
  ],
  options: {
    doNotFollow: 'node_modules',
    tsPreCompilationDeps: true,
    // tsConfig lives at options level, not inside enhancedResolveOptions —
    // the schema rejects it there (silently, unless options are validated).
    tsConfig: {
      fileName: './tsconfig.json',
    },
    enhancedResolveOptions: {
      extensions: ['.ts', '.js', '.json'],
    },
    reporterOptions: {
      text: {
        summary: true,
        list: true,
        detail: false,
      },
    },
  },
};
