import { describe, it, expect, beforeAll } from 'vitest';
import { cruise } from 'dependency-cruiser';
import { writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

/* eslint-disable @typescript-eslint/no-explicit-any */

// @ts-expect-error — .dependency-cruiser.js is a JS config file with no type declarations
import config from '../../.dependency-cruiser.js';

/**
 * Architecture boundary tests (THE-60 / #21).
 *
 * One test per rule in .dependency-cruiser.js, so a failure names the exact
 * law that was broken instead of reporting "architecture violated" in
 * aggregate. The codebase is cruised once in beforeAll and shared.
 *
 * Two guards keep this suite honest:
 * - a lockstep test fails when a rule exists in the config without a test
 *   here (or vice versa), so adding a rule without coverage is impossible;
 * - a negative-fixture test writes a deliberately violating file, cruises
 *   it, and asserts the rules actually fire — a rule whose path regex
 *   silently matches nothing looks identical to a passing rule otherwise.
 *
 * If a per-rule test fails, fix the import — do not weaken the rule.
 * Rule changes require an ADR (see AGENTS.md).
 */

interface Violation {
  rule?: { name?: string };
  from: string;
  to: string;
}

const CRUISE_TARGETS = ['src/', 'modules/', 'contracts/'];

/**
 * Every rule in .dependency-cruiser.js gets an entry here, with a short
 * statement of the law it enforces. The lockstep test below fails if this
 * list and the config ever diverge.
 */
const TESTED_RULES: Record<string, string> = {
  'no-cross-context-internal-imports':
    'bounded contexts may only reach each other through contracts',
  'domain-must-not-depend-on-application': 'domain is the innermost layer',
  'domain-must-not-depend-on-adapters': 'domain never depends outward on adapters',
  'application-must-not-depend-on-adapters': 'adapters depend on application, never the reverse',
  'domain-must-not-import-frameworks': 'domain stays framework-independent',
  'contracts-must-not-import-adapters': 'contracts are external shapes, not infrastructure',
  'contracts-must-not-import-drizzle': 'contracts never leak persistence models',
  'shared-contracts-must-not-import-module-internals':
    'shared contracts never reach into module domain or adapters',
};

async function cruiseFor(targets: string[]): Promise<Violation[]> {
  // The API contract here is easy to get silently wrong, and was
  // (THE-60 / #21): spreading the config file into cruise() puts
  // `forbidden` at a level the API ignores — zero rules evaluated, empty
  // violations, green gate. Rules must go under `ruleSet` with
  // `validate: true`, and violations are read from output.summary.
  const result: any = await cruise(targets, {
    ...config.options,
    ruleSet: { forbidden: config.forbidden },
    validate: true,
    baseDir: process.cwd(),
  });
  const violationList: Violation[] = result.output?.summary?.violations ?? [];
  // Belt and braces: if the API shape drifts again and no rules load,
  // fail loudly instead of passing vacuously.
  const rulesLoaded: number = result.output?.summary?.ruleSetUsed?.forbidden?.length ?? 0;
  if (rulesLoaded === 0) {
    throw new Error(
      'dependency-cruiser evaluated zero rules — the cruise() invocation no longer matches the API. Fix cruiseFor(), do not trust this run.',
    );
  }
  return violationList;
}

let violations: Violation[] = [];

beforeAll(async () => {
  violations = await cruiseFor(CRUISE_TARGETS);
}, 60_000);

describe('architecture boundary rules', () => {
  for (const [rule, law] of Object.entries(TESTED_RULES)) {
    it(`${rule} — ${law}`, () => {
      const hits = violations
        .filter((v) => v.rule?.name === rule)
        .map((v) => `${v.from} → ${v.to}`);
      // Non-empty output lists the offending imports directly in the diff.
      expect(hits).toEqual([]);
    });
  }

  it('stays in lockstep with .dependency-cruiser.js (every rule has a test)', () => {
    const configured = (config.forbidden as Array<{ name: string }>).map((r) => r.name).sort();
    const tested = Object.keys(TESTED_RULES).sort();
    // Fails when a rule is added to the config without a test here, or a
    // test names a rule that no longer exists.
    expect(tested).toEqual(configured);
  });

  it('has no violations from rules this suite does not know about', () => {
    const known = new Set(Object.keys(TESTED_RULES));
    const unknown = violations
      .filter((v) => !known.has(v.rule?.name ?? ''))
      .map((v) => `[${v.rule?.name}] ${v.from} → ${v.to}`);
    expect(unknown).toEqual([]);
  });
});

describe('rule engine sanity', () => {
  it('flags a deliberately violating fixture — rules can actually fire', async () => {
    // A rule with a typo'd path regex that matches nothing is
    // indistinguishable from a passing rule. This writes a file that
    // violates three distinct rules, cruises it, and asserts each fires.
    const fixture = join(
      process.cwd(),
      'modules',
      'identity-access',
      'domain',
      '__arch-fixture-violation__.ts',
    );
    const content = [
      '// Deliberately violating fixture written by boundary.test.ts.',
      '// It exists only for the duration of one test run and is deleted in finally.',
      "import '@nestjs/common';", //                 domain-must-not-import-frameworks
      "import '../adapters/inbound';", //            domain-must-not-depend-on-adapters
      "import '../../community-structure/index';", // no-cross-context-internal-imports
      'export {};',
      '',
    ].join('\n');

    writeFileSync(fixture, content);
    try {
      const fixtureViolations = (await cruiseFor(CRUISE_TARGETS)).filter((v) =>
        v.from.includes('__arch-fixture-violation__'),
      );
      const fired = new Set(fixtureViolations.map((v) => v.rule?.name));

      expect(fired).toContain('domain-must-not-import-frameworks');
      expect(fired).toContain('domain-must-not-depend-on-adapters');
      expect(fired).toContain('no-cross-context-internal-imports');
    } finally {
      rmSync(fixture, { force: true });
    }
  }, 60_000);
});
