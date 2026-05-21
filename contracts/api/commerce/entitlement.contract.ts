import { z } from 'zod';
import { ActorId } from '../identity-access/actor.contract';

export const EntitlementId = z.string().uuid();
export type EntitlementId = z.infer<typeof EntitlementId>;

export const EntitlementType = z.enum([
  'paid_membership',
  'event_access',
  'resource_access',
  'gated_channel_access',
  'agent_capability',
]);
export type EntitlementType = z.infer<typeof EntitlementType>;

export const EntitlementSource = z.enum([
  'purchase',
  'subscription',
  'role',
  'system',
  'manual',
]);
export type EntitlementSource = z.infer<typeof EntitlementSource>;

export const Entitlement = z.object({
  id: EntitlementId,
  actorId: ActorId,
  type: EntitlementType,
  source: EntitlementSource,
  scopeType: z.string().nullable(),
  scopeId: z.string().uuid().nullable(),
  expiresAt: z.string().datetime().nullable(),
  grantedAt: z.string().datetime(),
  grantedByActorId: ActorId.nullable(),
});
export type Entitlement = z.infer<typeof Entitlement>;

export const EntitlementSummary = z.object({
  id: EntitlementId,
  actorId: ActorId,
  type: EntitlementType,
  source: EntitlementSource,
  expiresAt: z.string().datetime().nullable(),
});
export type EntitlementSummary = z.infer<typeof EntitlementSummary>;

export const GrantEntitlementRequest = z.object({
  actorId: ActorId,
  type: EntitlementType,
  source: EntitlementSource,
  scopeType: z.string().optional(),
  scopeId: z.string().uuid().optional(),
  expiresAt: z.string().datetime().optional(),
  grantedByActorId: ActorId.optional(),
});
export type GrantEntitlementRequest = z.infer<typeof GrantEntitlementRequest>;

export const RevokeEntitlementRequest = z.object({
  entitlementId: EntitlementId,
  revokedByActorId: ActorId,
  reason: z.string().optional(),
});
export type RevokeEntitlementRequest = z.infer<typeof RevokeEntitlementRequest>;

export const CheckEntitlementRequest = z.object({
  actorId: ActorId,
  type: EntitlementType,
  scopeType: z.string().optional(),
  scopeId: z.string().uuid().optional(),
});
export type CheckEntitlementRequest = z.infer<typeof CheckEntitlementRequest>;

export const CheckEntitlementResponse = z.object({
  actorId: ActorId,
  type: EntitlementType,
  granted: z.boolean(),
  entitlementId: EntitlementId.nullable(),
  expiresAt: z.string().datetime().nullable(),
});
export type CheckEntitlementResponse = z.infer<typeof CheckEntitlementResponse>;
