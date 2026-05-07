import { z } from 'zod';
import { createEventSchema, InferEvent } from '../base.event';

const ActorId = z.string().uuid();
const PlanId = z.string().uuid();
const OfferId = z.string().uuid();
const PurchaseId = z.string().uuid();

export const PurchaseInitiated = createEventSchema(
  'commerce.purchase.initiated',
  'purchase',
  {
    purchaseId: PurchaseId,
    purchaserUserId: ActorId,
    granteeActorId: ActorId,
    planId: PlanId,
    offerId: OfferId.nullable(),
    priceAmount: z.number().int().nonnegative(),
    currency: z.string().length(3),
    idempotencyKey: z.string(),
  },
);
export type PurchaseInitiated = InferEvent<typeof PurchaseInitiated>;

export const PurchaseCompleted = createEventSchema(
  'commerce.purchase.completed',
  'purchase',
  {
    purchaseId: PurchaseId,
    purchaserUserId: ActorId,
    granteeActorId: ActorId,
    planId: PlanId,
    priceAmount: z.number().int().nonnegative(),
    currency: z.string().length(3),
    processedAt: z.string().datetime(),
  },
);
export type PurchaseCompleted = InferEvent<typeof PurchaseCompleted>;

export const PurchaseFailed = createEventSchema(
  'commerce.purchase.failed',
  'purchase',
  {
    purchaseId: PurchaseId,
    purchaserUserId: ActorId,
    granteeActorId: ActorId,
    planId: PlanId,
    reason: z.string(),
    failedAt: z.string().datetime(),
  },
);
export type PurchaseFailed = InferEvent<typeof PurchaseFailed>;

export const CommerceEventTypes = {
  PURCHASE_INITIATED: 'commerce.purchase.initiated',
  PURCHASE_COMPLETED: 'commerce.purchase.completed',
  PURCHASE_FAILED: 'commerce.purchase.failed',
} as const;
