import { z } from 'zod';
import { createEventSchema, InferEvent } from '../base.event';

const ActorId = z.string().uuid();
const EntitlementId = z.string().uuid();
const EntitlementType = z.enum([
  'paid_membership',
  'event_access',
  'resource_access',
  'gated_channel_access',
  'agent_capability',
]);
const EntitlementSource = z.enum([
  'purchase',
  'subscription',
  'role',
  'system',
  'manual',
]);

export const EntitlementGranted = createEventSchema(
  'commerce.entitlement.granted',
  'entitlement',
  {
    entitlementId: EntitlementId,
    actorId: ActorId,
    type: EntitlementType,
    source: EntitlementSource,
    scopeType: z.string().nullable(),
    scopeId: z.string().uuid().nullable(),
    expiresAt: z.string().datetime().nullable(),
    grantedByActorId: ActorId.nullable(),
  },
);
export type EntitlementGranted = InferEvent<typeof EntitlementGranted>;

export const EntitlementRevoked = createEventSchema(
  'commerce.entitlement.revoked',
  'entitlement',
  {
    entitlementId: EntitlementId,
    actorId: ActorId,
    type: EntitlementType,
    revokedByActorId: ActorId.nullable(),
    reason: z.string().optional(),
  },
);
export type EntitlementRevoked = InferEvent<typeof EntitlementRevoked>;

export const EntitlementExpired = createEventSchema(
  'commerce.entitlement.expired',
  'entitlement',
  {
    entitlementId: EntitlementId,
    actorId: ActorId,
    type: EntitlementType,
    expiredAt: z.string().datetime(),
  },
);
export type EntitlementExpired = InferEvent<typeof EntitlementExpired>;

export const EntitlementEventTypes = {
  ENTITLEMENT_GRANTED: 'commerce.entitlement.granted',
  ENTITLEMENT_REVOKED: 'commerce.entitlement.revoked',
  ENTITLEMENT_EXPIRED: 'commerce.entitlement.expired',
} as const;
