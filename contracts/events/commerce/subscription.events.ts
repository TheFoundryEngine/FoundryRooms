import { z } from 'zod';
import { createEventSchema, InferEvent } from '../base.event';

const ActorId = z.string().uuid();
const PlanId = z.string().uuid();
const SubscriptionId = z.string().uuid();

export const SubscriptionActivated = createEventSchema(
  'commerce.subscription.activated',
  'subscription',
  {
    subscriptionId: SubscriptionId,
    actorId: ActorId,
    planId: PlanId,
    currentPeriodStart: z.string().datetime(),
    currentPeriodEnd: z.string().datetime(),
  },
);
export type SubscriptionActivated = InferEvent<typeof SubscriptionActivated>;

export const SubscriptionRenewed = createEventSchema(
  'commerce.subscription.renewed',
  'subscription',
  {
    subscriptionId: SubscriptionId,
    actorId: ActorId,
    planId: PlanId,
    currentPeriodStart: z.string().datetime(),
    currentPeriodEnd: z.string().datetime(),
  },
);
export type SubscriptionRenewed = InferEvent<typeof SubscriptionRenewed>;

export const SubscriptionCancelled = createEventSchema(
  'commerce.subscription.cancelled',
  'subscription',
  {
    subscriptionId: SubscriptionId,
    actorId: ActorId,
    planId: PlanId,
    cancelledAt: z.string().datetime(),
    reason: z.string().optional(),
  },
);
export type SubscriptionCancelled = InferEvent<typeof SubscriptionCancelled>;

export const SubscriptionPastDue = createEventSchema(
  'commerce.subscription.past_due',
  'subscription',
  {
    subscriptionId: SubscriptionId,
    actorId: ActorId,
    planId: PlanId,
    overdueAt: z.string().datetime(),
  },
);
export type SubscriptionPastDue = InferEvent<typeof SubscriptionPastDue>;

export const SubscriptionEventTypes = {
  SUBSCRIPTION_ACTIVATED: 'commerce.subscription.activated',
  SUBSCRIPTION_RENEWED: 'commerce.subscription.renewed',
  SUBSCRIPTION_CANCELLED: 'commerce.subscription.cancelled',
  SUBSCRIPTION_PAST_DUE: 'commerce.subscription.past_due',
} as const;
