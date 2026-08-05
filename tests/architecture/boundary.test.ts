import { describe, it, expect } from 'vitest';
import { cruise } from 'dependency-cruiser';

/* eslint-disable @typescript-eslint/no-explicit-any */

// @ts-expect-error — .dependency-cruiser.js is a JS config file with no type declarations
import config from '../../.dependency-cruiser.js';

/**
 * Architecture boundary tests.
 *
 * These tests run dependency-cruiser against the full codebase and assert
 * that no forbidden dependencies exist. They enforce:
 * - cross-context isolation (no module imports another module's internals)
 * - hexagonal layering (domain → application → adapters, never reversed)
 * - domain framework independence (no NestJS/Drizzle/Express in domain)
 * - contract purity (no adapter or ORM imports in contracts)
 *
 * If a test fails, it means someone added an import that violates the
 * architectural rules in .dependency-cruiser.js. Fix the import, do not
 * weaken the rule.
 */
describe('architecture boundary rules', () => {
  it('should have no violations', async () => {
    const result: any = await cruise(['src/', 'modules/', 'contracts/'], {
      ...config,
      baseDir: process.cwd(),
    });

    const violations: Array<{ rule?: { name?: string }; from: string; to: string }> =
      result.output?.violations ?? [];

    if (violations.length > 0) {
      const details = violations
        .map((v) => `  - [${v.rule?.name ?? 'unknown'}] ${v.from} → ${v.to}`)
        .join('\n');
      throw new Error(
        `Architecture boundary violations detected (${violations.length}):\n${details}\n\nFix the imports above. Do not weaken the rules in .dependency-cruiser.js.`,
      );
    }

    expect(violations).toHaveLength(0);
  });
});
