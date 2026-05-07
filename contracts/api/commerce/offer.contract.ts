import { z } from 'zod';
import { PlanId } from './plan.contract';

export const OfferId = z.string().uuid();
export type OfferId = z.infer<typeof OfferId>;

export const Offer = z.object({
  id: OfferId,
  planId: PlanId,
  name: z.string().min(1).max(100),
  discountPercent: z.number().min(0).max(100).nullable(),
  trialDays: z.number().int().nonnegative().nullable(),
  validFrom: z.string().datetime().nullable(),
  validUntil: z.string().datetime().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Offer = z.infer<typeof Offer>;

export const OfferSummary = z.object({
  id: OfferId,
  planId: PlanId,
  name: z.string(),
  discountPercent: z.number().min(0).max(100).nullable(),
  trialDays: z.number().int().nonnegative().nullable(),
});
export type OfferSummary = z.infer<typeof OfferSummary>;

export const CreateOfferRequest = z.object({
  planId: PlanId,
  name: z.string().min(1).max(100),
  discountPercent: z.number().min(0).max(100).optional(),
  trialDays: z.number().int().nonnegative().optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
});
export type CreateOfferRequest = z.infer<typeof CreateOfferRequest>;
