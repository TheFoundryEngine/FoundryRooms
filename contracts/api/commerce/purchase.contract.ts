import { z } from 'zod';
import { ActorId } from '../identity-access/actor.contract';
import { PlanId } from './plan.contract';
import { OfferId } from './offer.contract';
import { EntitlementId } from './entitlement.contract';

export const PurchaseId = z.string().uuid();
export type PurchaseId = z.infer<typeof PurchaseId>;

export const PurchaseStatus = z.enum(['pending', 'completed', 'failed', 'refunded']);
export type PurchaseStatus = z.infer<typeof PurchaseStatus>;

export const Purchase = z.object({
  id: PurchaseId,
  purchaserUserId: ActorId,
  granteeActorId: ActorId,
  planId: PlanId,
  offerId: OfferId.nullable(),
  idempotencyKey: z.string().min(1).max(255),
  priceAmount: z.number().int().nonnegative(),
  currency: z.string().length(3),
  status: PurchaseStatus,
  processedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Purchase = z.infer<typeof Purchase>;

export const PurchaseSummary = z.object({
  id: PurchaseId,
  purchaserUserId: ActorId,
  granteeActorId: ActorId,
  planId: PlanId,
  status: PurchaseStatus,
  priceAmount: z.number().int().nonnegative(),
  currency: z.string().length(3),
});
export type PurchaseSummary = z.infer<typeof PurchaseSummary>;

export const PurchasePlanRequest = z.object({
  planId: PlanId,
  offerId: OfferId.optional(),
  granteeActorId: ActorId,
  idempotencyKey: z.string().min(1).max(255),
});
export type PurchasePlanRequest = z.infer<typeof PurchasePlanRequest>;

export const PurchasePlanResponse = z.object({
  purchaseId: PurchaseId,
  status: PurchaseStatus,
  entitlementIds: z.array(EntitlementId),
});
export type PurchasePlanResponse = z.infer<typeof PurchasePlanResponse>;
