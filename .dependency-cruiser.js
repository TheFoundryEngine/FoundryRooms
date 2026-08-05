/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    // ── 1. Cross-context isolation ──────────────────────────────────────
    // No bounded context may import from another context's internal layers
    // (domain, application, adapters). Cross-context access is only allowed
    // through contracts/ or the shared contracts/ directory.
    {
      name: 'no-cross-context-internal-imports',
      comment: 'Bounded contexts must not import from another context\'s domain, application, or adapters. Use contracts/ for cross-context communication.',
      severity: 'error',
      from: {
        path: 'modules/([^/]+)/',
        pathNot: 'modules/[^/]+/contracts/',
      },
      to: {
        path: 'modules/(?!$1/contracts/|$1/)',
        pathNot: 'modules/[^/]+/contracts/',
      },
    },

    // ── 2. Hexagonal layer enforcement ──────────────────────────────────
    // Domain must not depend on application, adapters, or infrastructure
    {
      name: 'domain-must-not-depend-on-application',
      comment: 'Domain layer must not import from application layer. Domain is the innermost layer.',
      severity: 'error',
      from: {
        path: 'modules/[^/]+/domain/',
      },
      to: {
        path: 'modules/[^/]+/application/',
      },
    },
    {
      name: 'domain-must-not-depend-on-adapters',
      comment: 'Domain layer must not import from adapters. Domain is the innermost layer.',
      severity: 'error',
      from: {
        path: 'modules/[^/]+/domain/',
      },
      to: {
        path: 'modules/[^/]+/adapters/',
      },
    },

    // Application must not depend on adapters (only adapters depend on application)
    {
      name: 'application-must-not-depend-on-adapters',
      comment: 'Application layer must not import from adapters. Adapters depend on application, not the reverse.',
      severity: 'error',
      from: {
        path: 'modules/[^/]+/application/',
      },
      to: {
        path: 'modules/[^/]+/adapters/',
      },
    },

    // ── 3. Domain must be framework-independent ─────────────────────────
    // Domain layer must not import infrastructure frameworks
    {
      name: 'domain-must-not-import-frameworks',
      comment: 'Domain layer must not import infrastructure frameworks (NestJS, Express, Drizzle, pg). Domain is framework-independent.',
      severity: 'error',
      from: {
        path: 'modules/[^/]+/domain/',
      },
      to: {
        path: 'node_modules/(drizzle-orm|@nestjs/|express|pg|cookie-parser)/',
      },
    },

    // ── 4. Contracts must not leak internal models ──────────────────────
    // Contracts must not import from adapters or domain internals
    {
      name: 'contracts-must-not-import-adapters',
      comment: 'Contracts must not import from adapters. Contracts define external shapes, not infrastructure details.',
      severity: 'error',
      from: {
        path: 'modules/[^/]+/contracts/',
      },
      to: {
        path: 'modules/[^/]+/adapters/',
      },
    },
    {
      name: 'contracts-must-not-import-drizzle',
      comment: 'Contracts must not import Drizzle ORM. Contracts define external shapes, not persistence models.',
      severity: 'error',
      from: {
        path: 'modules/[^/]+/contracts/',
      },
      to: {
        path: 'node_modules/drizzle-orm/',
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
        path: 'contracts/',
      },
      to: {
        path: 'modules/[^/]+/(domain|adapters)/',
      },
    },
  ],
  options: {
    doNotFollow: 'node_modules',
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      extensions: ['.ts', '.js', '.json'],
      tsConfig: './tsconfig.json',
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
