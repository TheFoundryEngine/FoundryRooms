/**
 * Entitlement Sync handler (commerce context).
 *
 * Syncs entitlement state for an actor. Delegates to the
 * EntitlementSyncService port. Idempotent: syncing the same entitlement
 * twice converges to the same state.
 */
import { z } from 'zod';
import type { JobHandler } from '../../runtime/handler';

export const entitlementSyncSchema = z.object({
  entitlementId: z.string().uuid(),
  actorId: z.string().uuid(),
  type: z.enum([
    'paid_membership',
    'event_access',
    'resource_access',
    'gated_channel_access',
    'agent_capability',
  ]),
  source: z.enum(['purchase', 'subscription', 'role', 'system', 'manual']),
});

export type EntitlementSyncPayload = z.infer<typeof entitlementSyncSchema>;

export interface EntitlementSyncService {
  syncEntitlement(input: EntitlementSyncPayload): Promise<{ synced: boolean }>;
}

export interface EntitlementSyncHandlerDeps {
  service: EntitlementSyncService;
}

export function createEntitlementSyncHandler(
  deps: EntitlementSyncHandlerDeps,
): JobHandler<EntitlementSyncPayload, { synced: boolean }> {
  return {
    name: 'commerce.entitlement-sync',
    schema: entitlementSyncSchema,
    async handle(payload) {
      return deps.service.syncEntitlement(payload);
    },
  };
}
