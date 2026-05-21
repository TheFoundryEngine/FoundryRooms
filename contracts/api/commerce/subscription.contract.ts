import { z } from 'zod';
import { ActorId } from '../identity-access/actor.contract';
import { PlanId } from './plan.contract';
import { OfferId } from './offer.contract';

export const SubscriptionId = z.string().uuid();
export type SubscriptionId = z.infer<typeof SubscriptionId>;

export const SubscriptionStatus = z.enum(['active', 'cancelled', 'past_due', 'trialing']);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatus>;

export const Subscription = z.object({
  id: SubscriptionId,
  actorId: ActorId,
  planId: PlanId,
  offerId: OfferId.nullable(),
  status: SubscriptionStatus,
  currentPeriodStart: z.string().datetime(),
  currentPeriodEnd: z.string().datetime(),
  cancelledAt: z.string().datetime().nullable(),
  trialEndsAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Subscription = z.infer<typeof Subscription>;

export const SubscriptionSummary = z.object({
  id: SubscriptionId,
  actorId: ActorId,
  planId: PlanId,
  status: SubscriptionStatus,
  currentPeriodEnd: z.string().datetime(),
});
export type SubscriptionSummary = z.infer<typeof SubscriptionSummary>;
