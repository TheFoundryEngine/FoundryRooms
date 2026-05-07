import { z } from 'zod';
import { PurchaseId } from './purchase.contract';

export const RefundId = z.string().uuid();
export type RefundId = z.infer<typeof RefundId>;

export const RefundStatus = z.enum(['pending', 'processed', 'failed']);
export type RefundStatus = z.infer<typeof RefundStatus>;

export const Refund = z.object({
  id: RefundId,
  purchaseId: PurchaseId,
  amount: z.number().int().positive(),
  currency: z.string().length(3),
  reason: z.string().min(1).max(500),
  status: RefundStatus,
  processedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Refund = z.infer<typeof Refund>;

export const RefundSummary = z.object({
  id: RefundId,
  purchaseId: PurchaseId,
  amount: z.number().int().positive(),
  currency: z.string().length(3),
  status: RefundStatus,
});
export type RefundSummary = z.infer<typeof RefundSummary>;

export const RefundPurchaseRequest = z.object({
  purchaseId: PurchaseId,
  amount: z.number().int().positive(),
  reason: z.string().min(1).max(500),
});
export type RefundPurchaseRequest = z.infer<typeof RefundPurchaseRequest>;
