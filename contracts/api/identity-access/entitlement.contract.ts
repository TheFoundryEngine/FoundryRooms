import { z } from 'zod';
import { ActorId } from './actor.contract';

export const EntitlementId = z.string().uuid();
export type EntitlementId = z.infer<typeof EntitlementId>;

export const EntitlementType = z.enum(['feature_access', 'content_access', 'api_access']);
export type EntitlementType = z.infer<typeof EntitlementType>;

export const Entitlement = z.object({
  id: EntitlementId,
  actorId: ActorId,
  type: EntitlementType,
  scopeType: z.string().nullable(),
  scopeId: z.string().uuid().nullable(),
  grantedAt: z.string().datetime(),
  expiresAt: z.string().datetime().nullable(),
  grantedBy: ActorId.nullable(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type Entitlement = z.infer<typeof Entitlement>;

export const GrantEntitlementRequest = z.object({
  actorId: ActorId,
  type: EntitlementType,
  scopeType: z.string().optional(),
  scopeId: z.string().uuid().optional(),
  expiresAt: z.string().datetime().optional(),
});
export type GrantEntitlementRequest = z.infer<typeof GrantEntitlementRequest>;
